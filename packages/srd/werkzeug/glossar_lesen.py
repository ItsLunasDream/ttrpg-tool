"""
Liest das Regelglossar aus beiden Sprachfassungen des SRD 5.2.1.

WARUM NICHT EINFACH DER TEXT
============================
Die blosse Textauslese kann eine Ueberschrift nicht von einem Satzfragment
unterscheiden, das zufaellig gross anfaengt und kurz ist — im deutschen
Glossar fand sie so 356 „Eintraege", viele davon Tabellenzellen. Das
verlaessliche Merkmal ist die Schrift:

    GillSans-SemiBold     Ueberschrift eines Eintrags ODER einer Tabelle
    GillSans              Tabellenzelle
    Cambria-BoldItalic    Unterpunkt („Attacks Affected.")
    Cambria-Bold          Aufzaehlungspunkt unter einem Unterpunkt
    Cambria               Fliesstext

Ob eine SemiBold-Zeile einen Eintrag oder eine Tabelle einleitet, entscheidet
die Zeile danach: folgt Fliesstext, ist es ein Eintrag; folgt eine
Tabellenzelle, ist es eine Tabelle innerhalb des Eintrags davor.

Aufruf:  python3 werkzeug/glossar_lesen.py <ausgabe.json>
"""
import json
import re
import sys
from pypdf import PdfReader

import glossar_tabellen

QUELLEN = {
    'en': ('quelle/SRD_CC_v5.2.1.pdf', 'Rules Glossary', 'Gameplay Toolbox'),
    'de': ('quelle/DE_SRD_CC_v5.2.1.pdf', 'Regelglossar', 'Werkzeugkasten fürs Spiel'),
}

# Das Tag hinter einem Eintragsnamen, in beiden Sprachen.
TAG = re.compile(r'^(.*?)\s*[\[(](Action|Area of Effect|Attitude|Condition|Hazard|'
                 r'Aktion|Gefahr|Haltung|Wirkungsbereich|Zustand)[\])]$')
TAG_NORMAL = {
    'Action': 'aktion', 'Aktion': 'aktion',
    'Area of Effect': 'wirkungsbereich', 'Wirkungsbereich': 'wirkungsbereich',
    'Attitude': 'haltung', 'Haltung': 'haltung',
    'Condition': 'zustand', 'Zustand': 'zustand',
    'Hazard': 'gefahr', 'Gefahr': 'gefahr',
}


def schriftart(fd):
    name = str((fd or {}).get('/BaseFont', ''))
    name = name.split('+')[-1]
    if 'GillSans-SemiBold' in name:
        return 'kopf'
    if 'GillSans' in name:
        return 'zelle'
    if 'BoldItalic' in name:
        return 'punkt'
    if 'Bold' in name:
        return 'stichpunkt'
    if 'Cambria' in name:
        return 'text'
    return 'sonst'


def zeilen_einer_seite(seite, nummer=0):
    """Die Zeilen einer Seite, jede mit der Schrift und dem Ort ihres
    ersten Stuecks. Der Ort (Seite, x, y in PDF-Koordinaten) braucht nur
    der Tabellenbau, siehe glossar_tabellen.py."""
    zeilen = []
    offen = {'art': None, 'text': ''}

    def besucher(text, cm, tm, fd, fs):
        nonlocal offen
        art = schriftart(fd)
        teile = text.split('\n')
        for i, teil in enumerate(teile):
            if offen['art'] is None and teil.strip():
                offen['art'] = art
                offen['seite'] = nummer
                offen['x'] = tm[4] * cm[0] + cm[4]
                offen['y'] = tm[5] * cm[3] + cm[5]
            offen['text'] += teil
            # Ein Wechsel auf einen Unterpunkt mitten in der Zeile beginnt
            # etwas Neues — so stehen sie im Dokument: fett am Satzanfang.
            if i < len(teile) - 1:
                zeilen.append(offen)
                offen = {'art': None, 'text': ''}

    seite.extract_text(visitor_text=besucher)
    if offen['text'].strip():
        zeilen.append(offen)
    return [z for z in zeilen if z['text'].strip()]


def ist_kopfzeile(text):
    """Seitenkopf und Seitenzahl.

    Der Kopf steht auf manchen Seiten ZWEIMAL hintereinander in einer Zeile
    („…5.2.1System Reference Document 5.2.1"). Ein Vergleich auf das
    einfache Vorkommen liess ihn durch, und er landete als namenlose
    Tabelle in einem Eintrag.
    """
    t = text.strip()
    return (re.fullmatch(r'(?:(?:System Reference Document|Systemreferenzdokument) 5\.2\.1\s*)+', t)
            or re.fullmatch(r'\d{1,3}', t))


FUELLWOERTER = {'a', 'an', 'the', 'of', 'and', 'or', 'in', 'to', 'with',
               'den', 'der', 'die', 'das', 'des', 'dem', 'ein', 'eine',
               'einen', 'und', 'oder', 'in', 'zu', 'von', 'mit', 'im'}


def fortsetzung(erste, zweite):
    """Ob die zweite Ueberschriftzeile die erste fortsetzt.

    Nicht jede Ueberschrift unter einer Ueberschrift gehoert dazu:
    „Rules Definitions" und „Ability Check" stehen untereinander und sind
    zwei. Eine Fortsetzung faengt klein an („versetzen") oder folgt auf
    ein Fuellwort, mit dem kein Titel endet („… a", „… den").
    """
    zweite = zweite.strip()
    letztes = erste.strip().split()[-1].lower() if erste.strip() else ''
    return (zweite[:1].islower()) or (letztes in FUELLWOERTER)


BINDEWOERTER = {'und', 'oder', 'bzw', 'sowie', 'noch', 'and', 'or', 'to', 'nor'}


def _strich_am_zeilenende(treffer):
    """Silbentrennung oder echter Bindestrich? Die naechste Zeile entscheidet.

    Das Leerzeichen VOR dem Strich unterscheidet nicht — gezaehlt: beide
    Formen kommen in beiden Sprachen fuer beides vor. Verlaesslich ist der
    Anfang der naechsten Zeile:

      klein         -> Silbentrennung: „Informa‑ / tionen" = „Informationen"
      „und", „oder" -> Ergaenzungsstrich: „Intelligenz‑ und" bleibt so
      gross, Ziffer -> echter Bindestrich: „Beeinflussen-Aktion",
                       „SG‑25‑Stärkewurf"
    """
    vorne, strich, weiter = treffer.group(1), treffer.group(2), treffer.group(3)
    erstes = re.match(r'[\w’]+', weiter)
    wort = erstes.group(0).lower() if erstes else ''
    if wort in BINDEWOERTER:
        return f'{vorne}{strich} {weiter}'
    if weiter[:1].islower():
        return f'{vorne}{weiter}'
    return f'{vorne}{strich}{weiter}'


def zusammensetzen(text):
    """Zeilenenden aufloesen, ohne echte Bindestriche zu verschlucken."""
    # Der WEICHE Trennstrich (U+00AD) ist im PDF unsichtbar und bedeutet
    # immer Silbentrennung. Ohne diese Zeile wurde aus „Geschick\u00ad /
    # lichkeit" ein „Geschick lichkeit" mit unsichtbarem Zeichen darin.
    text = re.sub(r'\s*\u00ad\s*\n\s*', '', text)
    # Mitten in der Zeile und vor „und"/„oder" ist er ein Ergaenzungsstrich,
    # den der Satz sichtbar druckt: „zwischen knöchel- und hüfthoch".
    text = re.sub(r'\u00ad(?=\s+(?:und|oder)\b)', '-', text)
    text = text.replace('\u00ad', '')
    # Ein zweizeiliger Tabellenkopf „Anheben/ / Schieben/Ziehen".
    text = re.sub(r'/\s*\n\s*', '/', text)
    text = re.sub(r'(\w)\s*([-‑])\s*\n\s*(\S+)', _strich_am_zeilenende, text)
    text = re.sub(r'\s*\n\s*', ' ', text)
    # Ein Leerzeichen vor dem geschuetzten Bindestrich, das der Satz ins PDF
    # gebracht hat: „SG ‑15", „W20 ‑Prüfung", „Vorbereiten ‑Aktion". Im
    # Deutschen steht vor diesem Zeichen nie ein Leerzeichen.
    text = re.sub(r'(\w) ‑(\w)', r'\1‑\2', text)
    # Ein Leerzeichen vor dem Satzzeichen, wo die Schrift wechselt
    # („der Zauber Verwandlung , ist").
    # Nicht vor Auslassungspunkten: „Suche nach ..." steht so im Dokument.
    text = re.sub(r'(\S) +([,;:!?)]|\.(?!\.))', r'\1\2', text)
    return re.sub(r'  +', ' ', text).strip()


# SATZFEHLER DES ORIGINALS, ausdruecklich und einzeln.
# =====================================================
# Alle stehen so in der Textschicht des PDFs, mit einem Leerzeichen mitten
# im Wort — die einfache Textauslese zeigt es genauso. Ob es auch im
# gedruckten Bild sichtbar ist, laesst sich aus der Textschicht nicht
# sicher sagen; falsch ist es in jedem Fall. Es sind keine Lesefehler dieses
# Werkzeugs, sondern Fehler im Satz, und jeder Leser sieht sie als solche.
# Korrigiert wird nur, was hier steht, mit Grund; jede Zeile muss genau
# einmal greifen, sonst bricht die Auslese ab — eine Korrektur, die nichts
# mehr trifft, soll auffallen und nicht still liegen bleiben.
KORREKTUREN = {
    'de': [
        # Eintrag „Schadensschwellenwert", ueberall sonst in einem Wort.
        ('Schadensschwellen wert', 'Schadensschwellenwert'),
        # Eintrag „Kurze Rast", ueberall sonst in einem Wort.
        ('Treffer punktewürfel', 'Trefferpunktewürfel'),
    ],
    'en': [
        # Eintrag „Saving Throw", im Verweis auf das Kapitel „D20 Tests".
        ('D20 Test s', 'D20 Tests'),
    ],
}


def lies(sprache):
    datei, anfang, ende = QUELLEN[sprache]
    r = PdfReader(datei)
    # Die Seiten des Glossars: von der ersten Seite, deren Kopf das Glossar
    # nennt, bis vor die Seite, die den naechsten Abschnitt beginnt.
    alle = []
    drin = False
    for nummer, seite in enumerate(r.pages):
        z = zeilen_einer_seite(seite, nummer)
        texte = [x['text'].strip() for x in z]
        if not drin and anfang in texte and any(t.startswith(('Glossary Conventions', 'Glossar-Konventionen')) for t in texte):
            drin = True
        if drin and (ende in texte or (ende.startswith('Werkzeugkasten') and 'Werkzeugkasten' in texte)):
            # Die Seite mit dem neuen Abschnitt: nur bis dorthin.
            for x in z:
                t = x['text'].strip()
                if t == ende or t == 'Werkzeugkasten':
                    break
                alle.append(x)
            break
        if drin:
            alle.extend(z)

    alle = [x for x in alle if not ist_kopfzeile(x['text'])]

    # ZWEIZEILIGE TITEL zusammensetzen. „Kreaturen in den Zustand
    # Bewusstlos / versetzen" steht ueber zwei Zeilen; ohne diesen Schritt
    # wurde die erste Haelfte als Tabellentitel des vorigen Eintrags
    # gelesen und die zweite als eigener Eintrag „versetzen". Die Zahl der
    # Eintraege stimmte dabei trotzdem — der Fehler haette sich versteckt.
    #
    # Erkennungszeichen: zwei Ueberschriftzeilen hintereinander, und danach
    # Fliesstext. Eine Tabelle hat nach Titel und Kopfzeile Zellen, keinen
    # Fliesstext — die bleibt so, wie sie ist.
    zusammen = []
    i = 0
    while i < len(alle):
        x = alle[i]
        if (x['art'] == 'kopf' and i + 2 < len(alle)
                and alle[i + 1]['art'] == 'kopf'
                and alle[i + 2]['art'] in ('text', 'punkt', 'stichpunkt')
                and not TAG.match(x['text'].strip())
                and fortsetzung(x['text'], alle[i + 1]['text'])):
            zusammen.append({'art': 'kopf',
                             'text': x['text'].strip() + ' ' + alle[i + 1]['text'].strip()})
            i += 2
            continue
        zusammen.append(x)
        i += 1
    alle = zusammen

    # Die Konventionen und Abkuerzungen am Anfang gehoeren nicht zu den
    # Eintraegen: erst ab „Rules Definitions" / „Regeldefinitionen".
    start = next(i for i, x in enumerate(alle)
                 if x['text'].strip() in ('Rules Definitions', 'Regeldefinitionen'))
    alle = alle[start + 1:]

    eintraege = []
    aktuell = None
    tabelle = None
    for i, x in enumerate(alle):
        t = x['text'].rstrip()
        art = x['art']
        naechste = alle[i + 1]['art'] if i + 1 < len(alle) else None
        if art == 'kopf':
            if naechste in ('text', 'punkt', 'stichpunkt') or naechste is None:
                # Ein neuer Eintrag.
                m = TAG.match(t.strip())
                name, tag = (m.group(1), TAG_NORMAL[m.group(2)]) if m else (t.strip(), None)
                aktuell = {'name': name, 'tag': tag, 'bloecke': []}
                eintraege.append(aktuell)
                tabelle = None
            else:
                # Eine Tabelle im Eintrag davor: Titel oder Kopfzeile.
                if aktuell is None:
                    continue
                if tabelle is None:
                    tabelle = {'typ': 'tabelle', 'titel': t.strip(), 'zeilen': [], 'roh': []}
                    aktuell['bloecke'].append(tabelle)
                else:
                    tabelle['zeilen'].append(t.strip())
                    tabelle['roh'].append(x)
            continue
        if aktuell is None:
            continue
        if art == 'zelle':
            if tabelle is None:
                tabelle = {'typ': 'tabelle', 'titel': '', 'zeilen': [], 'roh': []}
                aktuell['bloecke'].append(tabelle)
            tabelle['zeilen'].append(t.strip())
            tabelle['roh'].append(x)
            continue
        tabelle = None
        b = aktuell['bloecke']
        if art in ('punkt', 'stichpunkt'):
            b.append({'typ': art, 'text': t})
        elif b and b[-1]['typ'] in ('absatz', 'punkt', 'stichpunkt'):
            b[-1]['text'] += '\n' + t
        else:
            b.append({'typ': 'absatz', 'text': t})

    # WEICHE TRENNUNGEN, belegt durch die einfache Textauslese.
    # Die schriftgenaue Auslese verliert den weichen Trennstrich (U+00AD)
    # manchmal ganz und liefert „Geschick  lichkeit" innerhalb EINER Zeile.
    # Die einfache Auslese behaelt ihn. Sie dient deshalb als Beleg dafuer,
    # wo das PDF selbst eine Silbentrennung markiert — repariert werden nur
    # genau diese Wortpaare, nichts wird geraten.
    weich = set()
    for seite in r.pages:
        for vorne, hinten in re.findall(r'(\w+)\s*\u00ad\s*\n\s*(\w+)', seite.extract_text() or ''):
            weich.add((vorne, hinten))

    for e in eintraege:
        e['bloecke'] = [glossar_tabellen.baue(datei, b, zusammensetzen)
                        if b['typ'] == 'tabelle' else b for b in e['bloecke']]
        for b in e['bloecke']:
            if 'text' in b:
                t = zusammensetzen(b['text'])
                for vorne, hinten in weich:
                    t = re.sub(rf'\b{re.escape(vorne)}\s+{re.escape(hinten)}\b', vorne + hinten, t)
                b['text'] = t

    for falsch, richtig in KORREKTUREN[sprache]:
        treffer = 0
        for e in eintraege:
            for b in e['bloecke']:
                if 'text' in b and falsch in b['text']:
                    treffer += b['text'].count(falsch)
                    b['text'] = b['text'].replace(falsch, richtig)
        if treffer != 1:
            raise SystemExit(f'Korrektur {falsch!r} greift {treffer}-mal statt einmal')
    return eintraege


if __name__ == '__main__':
    heraus = {s: lies(s) for s in QUELLEN}
    json.dump(heraus, open(sys.argv[1], 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    for s, e in heraus.items():
        print(s, len(e), 'Eintraege,', sum(1 for x in e if x['tag']), 'mit Tag')
