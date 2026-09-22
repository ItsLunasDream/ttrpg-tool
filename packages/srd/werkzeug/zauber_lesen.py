"""
Liest die Zauber beider Sprachfassungen des SRD 5.2.1.

WIE EIN ZAUBER ERKANNT WIRD
===========================
Eine Ueberschrift (der Name), direkt darunter die Zeile mit Grad, Schule
und Klassen:

  en  „Level 3 Evocation (Sorcerer, Wizard)"   „Evocation Cantrip (…)"
  de  „Hervorrufungszauber 3. Grades (…)"      „Zaubertrick der Hervorrufung (…)"

Danach vier Eigenschaftszeilen (Zeitaufwand, Reichweite, Komponenten,
Wirkungsdauer), die umbrechen koennen, und der Text. Der Text wird mit
demselben Baustein in Bloecke gelegt wie bei den magischen Gegenstaenden.

GEPAART wird ueber das, was eine Uebersetzung nicht aendert: Grad, Schule,
Klassen, Ritual, Konzentration, Komponenten, Wuerfel und SG. Was danach
nicht eindeutig ist, steht in zauber_paare.json, von Hand, und wird gegen
diesen Rahmen geprueft.

Aufruf (aus packages/srd):
  python3 werkzeug/zauber_lesen.py <zeilen_en.pkl> <zeilen_de.pkl> <ausgabe.json>
"""
import collections
import json
import os
import pickle
import re
import sys

import glossar_tabellen
from glossar_lesen import QUELLEN, zusammensetzen
from gegenstaende_text import bloecke, halbiere, verbinde, weich_mitten, belegte_paare, zellen_glaetten, reihen_ordnen
from gegenstaende_lesen import zahlen

GRAD_EN = re.compile(r'^(?:Level (?P<grad>\d) (?P<schule>\w+)|(?P<schule0>\w+) Cantrip)\s*\((?P<klassen>[^)]*)\)?')
GRAD_DE = re.compile(r'^(?:Zaubertrick de[rs] (?P<schule0>\w+)|(?P<schule>\w+?)zauber (?P<grad>\d)\. Grades)\s*\((?P<klassen>[^)]*)\)?')

SCHULE = {
    'Abjuration': 'bann', 'Conjuration': 'beschwoerung', 'Divination': 'erkenntnis',
    'Enchantment': 'verzauberung', 'Evocation': 'hervorrufung', 'Illusion': 'illusion',
    'Necromancy': 'nekromantie', 'Transmutation': 'verwandlung',
    # deutsch, als Wortstamm vor „zauber" und nach „Zaubertrick der"
    'Bann': 'bann', 'Banns': 'bann', 'Bannmagie': 'bann', 'Beschwörungs': 'beschwoerung', 'Beschwörung': 'beschwoerung',
    'Erkenntnis': 'erkenntnis', 'Erkenntnismagie': 'erkenntnis',
    'Verzauberungs': 'verzauberung', 'Verzauberung': 'verzauberung',
    'Hervorrufungs': 'hervorrufung', 'Hervorrufung': 'hervorrufung',
    'Illusions': 'illusion', 'Nekromantie': 'nekromantie',
    'Verwandlungs': 'verwandlung', 'Verwandlung': 'verwandlung',
}

KLASSE = {
    'Bard': 'barde', 'Cleric': 'kleriker', 'Druid': 'druide', 'Paladin': 'paladin',
    'Ranger': 'waldlaeufer', 'Sorcerer': 'zauberer', 'Warlock': 'hexenmeister', 'Wizard': 'magier',
    'Barde': 'barde', 'Kleriker': 'kleriker', 'Druide': 'druide',
    'Waldläufer': 'waldlaeufer', 'Zauberer': 'zauberer', 'Hexenmeister': 'hexenmeister', 'Magier': 'magier',
}

EIGENSCHAFT = {
    # „Component:" steht bei einigen Zaubern so im englischen Satz.
    'en': [('zeit', 'Casting Time:'), ('reichweite', 'Range:'), ('komponenten', 'Components:'),
           ('komponenten', 'Component:'), ('dauer', 'Duration:')],
    'de': [('zeit', 'Zeitaufwand:'), ('reichweite', 'Reichweite:'), ('komponenten', 'Komponenten:'), ('dauer', 'Wirkungsdauer:')],
}

# SATZFEHLER IM NAMEN, einzeln und mit Grund; jede Zeile muss genau einmal greifen.
NAMENSKORREKTUREN = {
    'en': [
        # Kapitaelchen-Rest im Satz: „Acid SplASh".
        ('Acid SplASh', 'Acid Splash'),
    ],
    'de': [],
}


def grad_von(text, sprache):
    m = (GRAD_EN if sprache == 'en' else GRAD_DE).match(text.strip())
    return m


def nach_lage(alle, von, bis):
    """Die Zeilen der Seiten von..bis in Lesefolge: linke Spalte von oben
    nach unten, dann die rechte.

    Die Textauslese folgt dem Datenstrom des PDFs, nicht dem Bild. Im
    deutschen Dokument steht auf Seite 144 die rechte Spalte vor der linken
    — „Gegenstände beleben" bekam so den Schluss von „Gedanken wahrnehmen"
    als Text. Innerhalb einer Seite ist die Lage verlaesslich.
    """
    heraus = list(alle[:von])
    i = von
    while i < bis:
        seite = alle[i]['seite']
        j = i
        while j < bis and alle[j]['seite'] == seite:
            j += 1
        heraus.extend(sorted(alle[i:j], key=lambda z: (0 if z['x'] < 300 else 1, -z['y'])))
        i = j
    heraus.extend(alle[bis:])
    return heraus


def lies(sprache, alle):
    datei = QUELLEN[sprache][0]
    rx = GRAD_EN if sprache == 'en' else GRAD_DE
    # Erst die Lesefolge im ganzen Kapitel herstellen, dann suchen.
    erste = [i for i in range(1, len(alle))
             if alle[i - 1]['art'] == 'kopf' and alle[i]['art'] == 'text' and rx.match(alle[i]['text'].strip())]
    ende = next(j for j in range(erste[-1], len(alle))
                if alle[j]['art'] == 'kopf' and alle[j]['text'].strip() == QUELLEN[sprache][1])
    anfang_seite = alle[erste[0]]['seite']
    von = next(i for i, z in enumerate(alle) if z['seite'] == anfang_seite)
    alle = nach_lage(alle, von, ende)
    anfaenge = [i for i in range(1, len(alle))
                if alle[i - 1]['art'] == 'kopf' and alle[i]['art'] == 'text' and rx.match(alle[i]['text'].strip())]
    # Nach dem letzten Zauber beginnt das Regelglossar.
    kapitelende = next(j for j in range(anfaenge[-1], len(alle))
                       if alle[j]['art'] == 'kopf' and alle[j]['text'].strip() == QUELLEN[sprache][1])
    heraus = []
    for n, i in enumerate(anfaenge):
        ende = anfaenge[n + 1] - 1 if n + 1 < len(anfaenge) else kapitelende
        name = alle[i - 1]['text'].strip()
        zeilen = alle[i:ende]
        # Die Gradzeile kann umbrechen, bis die Klammer der Klassen zu ist.
        gradzeile = zeilen[0]['text'].strip()
        k = 1
        while gradzeile.count('(') > gradzeile.count(')') and k < len(zeilen):
            gradzeile += ' ' + zeilen[k]['text'].strip()
            k += 1
        # Die vier Eigenschaften, jede bis zur naechsten.
        eigenschaften = {}
        aktuell = None
        while k < len(zeilen):
            t = zeilen[k]['text'].strip()
            treffer = next(((schluessel, marke) for schluessel, marke in EIGENSCHAFT[sprache] if t.startswith(marke)), None)
            if treffer:
                aktuell = treffer[0]
                eigenschaften[aktuell] = t[len(treffer[1]):].strip()
                marke_x = zeilen[k]['x']
                k += 1
                continue
            # Folgezeile einer Eigenschaft: nicht Fliesstext, und entweder
            # vor der Dauer (danach kommt der Text) oder sichtbar eingerueckt
            # unter ihrer Marke („Bis der Zauber gebannt oder die / Glyphe
            # ausgelöst wird").
            if aktuell and zeilen[k]['art'] in ('kopf', 'zelle') and (
                    aktuell != 'dauer' or zeilen[k]['x'] > marke_x + 4):
                eigenschaften[aktuell] += '\n' + t
                k += 1
                continue
            break
        rumpf = zeilen[k:]
        m = rx.match(gradzeile)
        schule_roh = m.group('schule') or m.group('schule0')
        heraus.append({
            'name': name,
            'gradzeile': zusammensetzen(weich_mitten(gradzeile)),
            'grad': int(m.group('grad') or 0),
            'schule': SCHULE.get(schule_roh, '?' + schule_roh),
            'klassen': sorted(KLASSE.get(k.strip(), '?' + k.strip()) for k in m.group('klassen').split(',')),
            'eigenschaften': {s: zusammensetzen(weich_mitten(v)) for s, v in eigenschaften.items()},
            '_roh': rumpf,
        })
    for falsch, richtig in NAMENSKORREKTUREN[sprache]:
        treffer = [z for z in heraus if z['name'] == falsch]
        if len(treffer) != 1:
            raise SystemExit(f'Namenskorrektur {falsch!r} greift {len(treffer)}-mal')
        treffer[0]['name'] = richtig
    return heraus


def baue_bloecke(sprache, zauber):
    datei = QUELLEN[sprache][0]
    fehler = []
    for z in zauber:
        fertig = []
        for b in bloecke(datei, z['_roh']):
            if b['typ'] == 'tabelle':
                try:
                    fertig.append(halbiere(glossar_tabellen.baue(datei, b, zusammensetzen)))
                except ValueError as e:
                    fehler.append(f'{z["name"]}: {e}')
                    fertig.append({'typ': 'absatz', 'text': zusammensetzen('\n'.join(b['zeilen']))})
            elif b['typ'] == 'wertekasten':
                fertig.append({'typ': 'liste', 'titel': b['titel'],
                               'eintraege': [zusammensetzen(weich_mitten(e)) for e in b['eintraege']]})
            else:
                fertig.append({**b, 'text': zusammensetzen(weich_mitten(b['text']))})
        paare = belegte_paare(z['_roh'])
        fertig = [t for b in fertig for t in reihen_ordnen(b)]
        z['bloecke'] = [zellen_glaetten(b, paare)[0] for b in verbinde(fertig)]
    return fehler


def merkmale(z):
    """Was eine Uebersetzung nicht aendert."""
    e = z['eigenschaften']
    komp = e.get('komponenten', '')
    kurz = re.sub(r'\(.*', '', komp, flags=re.S)
    komponenten = tuple(sorted(set(re.findall(r'\b([VSGM])\b', kurz.replace('G', 'S')))))
    dauer = e.get('dauer', '')
    konz = bool(re.search(r'Concentration|Konzentration', dauer))
    ritual = bool(re.search(r'Ritual', e.get('zeit', '')))
    text = ' '.join(b.get('text', '') for b in z['bloecke'])
    return (z['grad'], z['schule'], tuple(z['klassen']), komponenten, konz, ritual, zahlen(text))


# Wo die Fassungen selbst verschieden sind, nicht die Auslese: das Feld,
# das beim Handpaar nicht verglichen wird (Stelle in merkmale()).
ABWEICHUNGEN = {
    # Englisch „Components: S, M", deutsch „Komponenten: V, G, M".
    'Hypnotic Pattern': 3,
}


def paare(en, de, hand):
    nach_en = collections.defaultdict(list)
    nach_de = collections.defaultdict(list)
    for z in en:
        nach_en[merkmale(z)].append(z)
    for z in de:
        nach_de[merkmale(z)].append(z)
    auto = {}
    for k, liste in nach_en.items():
        if len(liste) == 1 and len(nach_de.get(k, [])) == 1:
            auto[liste[0]['name']] = nach_de[k][0]['name']
    E = {z['name']: z for z in en}
    D = {z['name']: z for z in de}
    for e, d in hand.items():
        if e not in E or d not in D:
            raise SystemExit(f'Handpaar nicht in der Auslese: {e} = {d}')
        if e in auto and auto[e] != d:
            raise SystemExit(f'Handpaar widerspricht der Automatik: {e} = {d} / {auto[e]}')
        a, b = merkmale(E[e]), merkmale(D[d])
        # Hart: Grad, Schule, Klassen, Komponenten, Konzentration, Ritual.
        if e in ABWEICHUNGEN:
            feld = ABWEICHUNGEN[e]
            a = a[:feld] + a[feld + 1:]
            b = b[:feld] + b[feld + 1:]
        if a[:5 if e in ABWEICHUNGEN else 6] != b[:5 if e in ABWEICHUNGEN else 6]:
            raise SystemExit(f'Handpaar passt nicht: {e} = {d}\n  {a[:6]}\n  {b[:6]}')
    alle = {**auto, **hand}
    if len(set(alle.values())) != len(alle):
        doppelt = [d for d, n in collections.Counter(alle.values()).items() if n > 1]
        raise SystemExit(f'Deutsch doppelt gepaart: {doppelt}')
    return alle, auto


if __name__ == '__main__':
    zeilen_en = pickle.load(open(sys.argv[1], 'rb'))
    zeilen_de = pickle.load(open(sys.argv[2], 'rb'))
    en, de = lies('en', zeilen_en), lies('de', zeilen_de)
    fehler = baue_bloecke('en', en) + baue_bloecke('de', de)
    handdatei = os.path.join(os.path.dirname(__file__), 'zauber_paare.json')
    hand = json.load(open(handdatei, encoding='utf8')) if os.path.exists(handdatei) else {}
    p, auto = paare(en, de, hand)
    for z in en + de:
        z.pop('_roh', None)
    json.dump({'en': en, 'de': de, 'paare': p}, open(sys.argv[3], 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(len(en), 'englisch,', len(de), 'deutsch,', len(auto), 'automatisch,', len(hand), 'von Hand,',
          len(p), 'gepaart;', len(fehler), 'Tabellen nicht gebaut')
    for f in fehler:
        print('  ', f)
