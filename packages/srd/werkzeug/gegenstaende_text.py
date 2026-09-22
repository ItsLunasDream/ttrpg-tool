"""
Baut den Text der magischen Gegenstaende in Bloecke: Absaetze, Unterpunkte,
Tabellen und Listen — dieselbe Form wie das Glossar, damit das
Nachschlagewerk beides gleich anzeigt.

WAS HIER ANDERS IST ALS IM GLOSSAR
==================================
- Viele Tabellen stehen im Satz zweimal nebeneinander („1d10 Damage Type
  1d10 Damage Type"): eine lange, schmale Tabelle, in zwei Haelften
  gesetzt. Sie wird wieder zu einer.
- Tabellen haben nicht immer einen Titel. Ob eine Kopfzeile der Titel ist
  oder schon der Tabellenkopf, entscheidet die Wortlage: ein Titel ist
  eine einzelne Zelle, der Kopf hat Spalten.
- Manche Tabellen stehen nicht bei ihrem Gegenstand, sondern irgendwo auf
  der Seite (die Hebel des Apparats der Krabbe stehen mitten in „Armor of
  Resistance"). Sie werden per Liste VERSCHIEBUNGEN umgehaengt, die genau
  einmal greifen muss — geraten wird nicht.

Aufruf (aus packages/srd):
  python3 werkzeug/gegenstaende_text.py <zeilen_en.pkl> <zeilen_de.pkl> <paare.json> <ausgabe.json>
"""
import json
import pickle
import re
import sys

import pdfplumber

import glossar_tabellen
from glossar_lesen import QUELLEN, zusammensetzen
from gegenstaende_lesen import lies

# Frei stehende Tabellen: (Sprache, Titel der Tabelle, Name des Gegenstands,
# zu dem sie gehoert). Jede Zeile muss genau einmal greifen.
VERSCHIEBUNGEN = [
    ('en', 'Apparatus of the Crab Levers', 'Apparatus of the Crab'),
    ('de', 'Hebel des Apparats der Krabbe', 'Apparat der Krabbe'),
]

WEICH_ZAEHLER = {'en': 0, 'de': 0}

WUERFEL_KOPF = re.compile(r'^\d*[dDwW]\d+\b')


def _einzelzelle(datei, z):
    """Ob eine Kopfzeile im PDF eine einzige Zelle ist (dann ist sie ein Titel)."""
    p = glossar_tabellen._pdf(datei).pages[z['seite']]
    y = z['y']
    links, rechts = (0, 300) if z['x'] < 300 else (300, p.width)
    woerter = sorted(
        (w for w in p.extract_words(extra_attrs=['fontname'])
         if 'GillSans' in w['fontname'] and abs((p.height - w['bottom']) - y) <= 2.5
         and links <= w['x0'] < rechts),
        key=lambda w: w['x0'])
    if not woerter:
        return True
    for a, b in zip(woerter, woerter[1:]):
        if b['x0'] - a['x1'] >= glossar_tabellen.ZELLABSTAND:
            return False
    return True


def _breit(datei, roh, i):
    """Ob die Tabelle ab Zeile i ueber beide Satzspalten geht.

    Entscheidend ist die Kopfzeile unter dem Titel: steht sie links UND
    rechts der Mitte („Lever … Up … Down"), ist die Tabelle seitenbreit.
    Eine Tabelle, die nur in die rechte Spalte umbricht, hat ihren Kopf
    links.
    """
    kopf = next((z for z in roh[i + 1:i + 3] if z['art'] == 'kopf'), None)
    if kopf is None or roh[i]['x'] >= 300:
        return False
    p = glossar_tabellen._pdf(datei).pages[kopf['seite']]
    woerter = [w for w in p.extract_words(extra_attrs=['fontname'])
               if 'SemiBold' in w['fontname'] and abs((p.height - w['bottom']) - kopf['y']) <= 2.5]
    return any(w['x0'] < 300 for w in woerter) and any(w['x0'] >= 300 for w in woerter)


def _neue_tabelle(tabelle, x):
    if tabelle is None or not tabelle['roh'] or tabelle['roh'][-1]['art'] != 'zelle':
        return False
    gleiche_spalte = [z['x'] for z in tabelle['roh']
                      if z['seite'] == x['seite'] and (z['x'] < 300) == (x['x'] < 300)]
    if not gleiche_spalte:
        return True
    return x['x'] <= min(gleiche_spalte) + 3


SATZENDE = re.compile(r'[.:!?)”"]\s*$')
# Die erste Zeile eines Wertekastens unter seinem Namen.
WERTEKASTEN = re.compile(r'^(AC|RK) \d')


def bloecke(datei, roh):
    """Die Zeilen eines Gegenstands als Bloecke; Tabellen noch roh."""
    heraus = []
    tabelle = None
    kasten = None
    for i, x in enumerate(roh):
        art = x['art']
        t = x['text'].rstrip()
        if not t.strip():
            continue
        # WERTEKASTEN („Giant Fly", „Avatar of Death"): ein Name, darunter
        # „AC 14". Er steht bis zum Ende des Gegenstands, und seine Zeilen
        # werden als Zeilen genommen — Tabellenbau und Absatzlogik passen
        # auf diese Form nicht. Eine neue Zeile beginnt, wo das PDF eine
        # Auszeichnung setzt (Kopf, fett, fett-kursiv); sonst geht die
        # Zeile weiter.
        if kasten is None and art == 'kopf' and any(
                WERTEKASTEN.match(z['text'].strip()) for z in roh[i + 1:i + 3]):
            kasten = {'typ': 'wertekasten', 'titel': t.strip(), 'eintraege': []}
            heraus_kasten = kasten
            kasten_arten = []
            heraus.append(kasten)
            tabelle = None
            continue
        if kasten is not None:
            if art == 'text':
                # Cambria-Fliesstext: der Kasten (GillSans) ist zu Ende. Ein
                # Unterpunkt, der eben erst begonnen hat („Golden Lions
                # (Rare)."), gehoert schon zum Text danach.
                kasten = None
                if kasten_arten and kasten_arten[-1] in ('punkt', 'stichpunkt'):
                    eintrag = heraus_kasten['eintraege'].pop()
                    kasten_arten.pop()
                    heraus.append({'typ': 'punkt', 'text': eintrag})
                    heraus[-1]['text'] += '\n' + t
                    continue
            else:
                neu = art in ('kopf', 'punkt', 'stichpunkt') or not kasten['eintraege']
                if neu:
                    kasten['eintraege'].append(t.strip())
                    kasten_arten.append(art)
                else:
                    kasten['eintraege'][-1] += '\n' + t.strip()
                continue
        if art == 'sonst':
            # Kursiv oder anders gesetzt, etwa „Large Beast, Unaligned":
            # Fliesstext wie jeder andere.
            art = 'text'
        # Ein fetter Zeilenanfang nach einem unvollstaendigen Satz ist die
        # Fortsetzung („Water Ele- / mental)"), kein neuer Unterpunkt.
        if (art in ('punkt', 'stichpunkt') and heraus and heraus[-1]['typ'] in ('absatz', 'punkt', 'stichpunkt')
                and not SATZENDE.search(heraus[-1]['text'])):
            heraus[-1]['text'] += '\n' + t
            tabelle = None
            continue
        if art in ('kopf', 'zelle'):
            # Eine Kopfzeile nach Zellen beginnt eine neue Tabelle — wenn sie
            # am linken Rand der Tabelle steht. Weiter rechts ist sie ein fett
            # gesetzter Name mitten in einer Zelle („Mumienfürsten").
            if art == 'kopf' and _neue_tabelle(tabelle, x):
                tabelle = None
            if tabelle is None:
                tabelle = {'typ': 'tabelle', 'titel': '', 'zeilen': [], 'roh': [], 'feine_spalten': True}
                heraus.append(tabelle)
                # Die erste Kopfzeile ist der Titel, wenn sie eine einzelne
                # Zelle ist, nicht mit einem Wuerfel anfaengt und danach
                # noch etwas Tabellenartiges kommt.
                naechste = roh[i + 1] if i + 1 < len(roh) else None
                if (art == 'kopf' and naechste and naechste['art'] in ('kopf', 'zelle')
                        and not WUERFEL_KOPF.match(t.strip()) and _einzelzelle(datei, x)):
                    tabelle['titel'] = t.strip()
                    tabelle['breit'] = _breit(datei, roh, i)
                    continue
            tabelle['zeilen'].append(t.strip())
            tabelle['roh'].append(x)
            continue
        tabelle = None
        if art in ('punkt', 'stichpunkt'):
            heraus.append({'typ': art, 'text': t})
        elif heraus and heraus[-1]['typ'] in ('absatz', 'punkt', 'stichpunkt'):
            heraus[-1]['text'] += '\n' + t
        else:
            heraus.append({'typ': 'absatz', 'text': t})
    return heraus


def halbiere(b):
    """Eine nebeneinander gesetzte Tabelle wieder zu einer."""
    if b['typ'] != 'tabelle':
        return b
    kopf = b['kopf']
    n = len(kopf) // 2
    if len(kopf) % 2 == 0 and n >= 1 and kopf[:n] == kopf[n:]:
        links = [r[:n] for r in b['reihen']]
        rechts = [r[n:] for r in b['reihen'] if any(c.strip() for c in r[n:])]
        return {**b, 'kopf': kopf[:n], 'reihen': links + rechts}
    return b


# WEICHE TRENNZEICHEN MITTEN IN DER ZEILE
# Das deutsche PDF setzt manche echten Bindestriche als weiches Trennzeichen
# (U+00AD): „SG\u00ad20\u00adKonstitutionsrettungswurf", „Vergrößern\u00adEffekt".
# Am Zeilenende ist es eine Silbentrennung (das regelt zusammensetzen);
# mitten in der Zeile entscheidet das Folgezeichen:
#   Grossbuchstabe, Ziffer  ->  Bindestrich       „Vergrößern-Effekt"
#   „und", „oder"           ->  Ergaenzungsstrich „Nah- oder Fernkampf"
#   klein                   ->  nichts            „Dreiviertel"
MITTE = re.compile(r'(\w)[ \t]*\u00ad[ \t]*(?=\S)')


def weich_mitten(text):
    def ersetze(m):
        rest = text[m.end():]
        if re.match(r'(und|oder)\b', rest):
            return m.group(1) + '- '
        if rest[:1].isupper() or rest[:1].isdigit():
            return m.group(1) + '-'
        return m.group(1)
    return MITTE.sub(ersetze, text)


def belegte_paare(roh):
    """Wortpaare mit weichem Trennzeichen mitten in der Zeile, fuer die
    Tabellenzellen: deren Wortauslese verliert das Zeichen ganz."""
    paare = set()
    for z in roh:
        for m in re.finditer(r'(\w+)[ \t]*\u00ad[ \t]*(\w+)', z['text']):
            paare.add((m.group(1), m.group(2)))
    return paare


def zellen_glaetten(b, paare):
    if b['typ'] != 'tabelle':
        return b, 0
    n = 0

    def fix(t):
        nonlocal n
        for a, z in paare:
            ziel = weich_mitten(f'{a}\u00ad{z}')
            neu, k = re.subn(rf'\b{re.escape(a)} ?{re.escape(z)}\b', ziel, t)
            if neu != t:
                n += k
                t = neu
        return t
    return {**b, 'reihen': [[fix(c) for c in r] for r in b['reihen']], 'kopf': [fix(c) for c in b['kopf']]}, n


BEREICH = re.compile(r'^(\d+(?:[–-]\d+)?)\s+(.*)$', re.S)


def verbinde(bloecke_):
    """Eine Tabelle, die umbricht und ihren Kopf dabei wiederholt (so setzt
    es das englische Dokument), ist eine Tabelle: gleicher Kopf, direkt
    hintereinander, die zweite ohne eigenen Titel.

    Ist die Fortsetzung einer Wuerfeltabelle einspaltig gelesen (die Luecke
    zwischen „98–100" und dem Text ist dort zu schmal), wird sie am
    Wurfbereich getrennt — nur wenn das fuer JEDE Reihe aufgeht."""
    heraus = []
    for b in bloecke_:
        v = heraus[-1] if heraus else None
        if (v and b['typ'] == 'tabelle' and v['typ'] == 'tabelle' and len(b['kopf']) == 1
                and len(v['kopf']) == 2 and b['kopf'][0] == ' '.join(v['kopf'])
                and WUERFEL_KOPF.match(v['kopf'][0])
                and all(BEREICH.match(r[0]) for r in b['reihen'])):
            b = {**b, 'kopf': v['kopf'],
                 'reihen': [list(BEREICH.match(r[0]).groups()) for r in b['reihen']]}
        if (v and b['typ'] == 'tabelle' and v['typ'] == 'tabelle' and b['kopf'] == v['kopf']
                and (not b['titel'] or b['titel'] == v['titel'])):
            heraus[-1] = {**v, 'reihen': v['reihen'] + b['reihen']}
        else:
            heraus.append(b)
    return heraus


def baue(sprache, gegenstaende):
    datei = QUELLEN[sprache][0]
    nach_name = {g['name']: g for g in gegenstaende}
    fehler = []
    for g in gegenstaende:
        roh_bloecke = bloecke(datei, g['_roh'])
        fertig = []
        for b in roh_bloecke:
            if b['typ'] == 'tabelle':
                try:
                    fertig.append(halbiere(glossar_tabellen.baue(datei, b, zusammensetzen)))
                except ValueError as e:
                    fehler.append(f'{g["name"]}: {e}')
                    fertig.append({'typ': 'absatz', 'text': zusammensetzen('\n'.join(b['zeilen']))})
            elif b['typ'] == 'wertekasten':
                fertig.append({'typ': 'liste', 'titel': b['titel'],
                               'eintraege': [zusammensetzen(weich_mitten(e)) for e in b['eintraege']]})
            else:
                fertig.append({**b, 'text': zusammensetzen(weich_mitten(b['text']))})
        geglaettet = []
        paare = belegte_paare(g['_roh'])
        for b in verbinde(fertig):
            b, n = zellen_glaetten(b, paare)
            WEICH_ZAEHLER[sprache] += n
            geglaettet.append(b)
        g['bloecke'] = geglaettet

    for sp, titel, ziel in VERSCHIEBUNGEN:
        if sp != sprache:
            continue
        treffer = [(g, b) for g in gegenstaende for b in g['bloecke']
                   if b.get('titel') == titel and g['name'] != ziel]
        if len(treffer) != 1 or ziel not in nach_name:
            raise SystemExit(f'Verschiebung {titel!r} greift {len(treffer)}-mal')
        g, b = treffer[0]
        g['bloecke'].remove(b)
        nach_name[ziel]['bloecke'].append(b)
    return fehler


if __name__ == '__main__':
    zeilen_en = pickle.load(open(sys.argv[1], 'rb'))
    zeilen_de = pickle.load(open(sys.argv[2], 'rb'))
    paare = json.load(open(sys.argv[3], encoding='utf8'))['paare']
    en, de = lies('en', zeilen_en), lies('de', zeilen_de)
    fehler = baue('en', en) + baue('de', de)
    for g in en + de:
        g.pop('_roh', None)
    json.dump({'en': en, 'de': de, 'paare': paare}, open(sys.argv[4], 'w', encoding='utf8'),
              ensure_ascii=False, indent=1)
    print(len(en), len(de), 'Gegenstaende;', len(fehler), 'Tabellen nicht gebaut')
    for f in fehler:
        print('  ', f)
