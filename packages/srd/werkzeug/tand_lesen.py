"""
Liest die Tabelle „Trinkets" / „Requisiten" (1W100) beider Sprachfassungen
des SRD 5.2.1 und schreibt src/tand.ts.

Die Tabelle steht im Kapitel zur Charaktererschaffung, zweispaltig ueber
zwei Seiten. pypdf liefert die Spalten nacheinander, jede Zeile beginnt mit
der Nummer; was ohne Nummer folgt, gehoert zum Eintrag davor. Gepaart wird
ueber die Nummer — sie ist in beiden Fassungen dieselbe.

Geprueft wird hart: jede Nummer 1 bis 100 genau einmal, in beiden Sprachen.
Sonst bricht das Skript ab, statt eine halbe Tabelle zu schreiben.

Aufruf (aus packages/srd):  python3 werkzeug/tand_lesen.py src/tand.ts
"""
import json
import re
import sys

from pypdf import PdfReader

from glossar_lesen import QUELLEN

KOPF = {'en': '1d100 Trinket', 'de': '1W100 Requisite'}
TITEL = {'en': 'Trinkets', 'de': 'Requisiten'}
# Nach der Tabelle beginnt das naechste Kapitel.
ENDE = {'en': ('Classes', 'Barbarian'), 'de': ('Klassen', 'Barbar')}


def seiten_mit_tabelle(reader, sprache):
    for i, seite in enumerate(reader.pages):
        text = seite.extract_text() or ''
        if KOPF[sprache] in text:
            yield i, text


def lies(sprache):
    reader = PdfReader(QUELLEN[sprache][0])
    zeilen = []
    for _, text in seiten_mit_tabelle(reader, sprache):
        teile = text.split(KOPF[sprache])
        for teil in teile[1:]:
            zeilen.extend(teil.split('\n'))
    eintraege = {}
    aktuell = None
    for roh in zeilen:
        zeile = roh.strip()
        if not zeile or zeile.startswith('System Reference Document') or zeile.startswith('Systemreferenzdokument'):
            continue
        if re.fullmatch(r'\d{1,3}', zeile):
            # Seitenzahl.
            continue
        if zeile in ENDE[sprache]:
            break
        m = re.match(r'^(\d{1,3})\s+(.*)$', zeile)
        if m:
            nummer = int(m.group(1))
            if m.group(1) == '00':
                nummer = 100
            if 1 <= nummer <= 100 and nummer not in eintraege:
                aktuell = nummer
                eintraege[nummer] = m.group(2)
                continue
        if aktuell is None:
            continue
        # Fortsetzung. „un -" am Zeilenende ist eine Trennung.
        vorher = eintraege[aktuell]
        if re.search(r'\w -$', vorher):
            eintraege[aktuell] = vorher[:-2] + zeile
        elif vorher.endswith('-') and not vorher.endswith(' -'):
            eintraege[aktuell] = vorher + zeile
        else:
            eintraege[aktuell] = vorher + ' ' + zeile
    fehlend = [n for n in range(1, 101) if n not in eintraege]
    if fehlend:
        raise SystemExit(f'{sprache}: es fehlen die Nummern {fehlend}')
    heraus = []
    for n in range(1, 101):
        text = re.sub(r'\s+', ' ', eintraege[n]).strip()
        # Weiches Trennzeichen am Zeilenende: vor einem grossgeschriebenen
        # Wort ist es ein Bindestrich („Uhrwerk-Goldfisch"), sonst nichts.
        text = re.sub('\\s*\u00ad\\s*(?=[A-ZÄÖÜ])', '-', text)
        text = re.sub('\u00ad\\s*', '', text)
        heraus.append(text)
    return heraus


KOPFTEXT = '''/**
 * Die Tabelle „Trinkets" / „Requisiten" (1W100) aus dem SRD 5.2.1.
 *
 * DIESE DATEI IST ERZEUGT (packages/srd/werkzeug/tand_lesen.py). Gepaart
 * ueber die Nummer, die in beiden Fassungen dieselbe ist. Der Text steht so
 * da, wie ihn das jeweilige PDF druckt.
 */

export const TAND_TITEL = { de: 'Requisiten', en: 'Trinkets' } as const;

/** Hundert Eintraege, Index 0 ist die 1 (im englischen Druck „01"), Index 99 die 100 („00"). */
export const TAND: readonly { readonly de: string; readonly en: string }[] = '''


if __name__ == '__main__':
    en, de = lies('en'), lies('de')
    paare = [{'de': d, 'en': e} for d, e in zip(de, en)]
    with open(sys.argv[1], 'w', encoding='utf8') as f:
        f.write(KOPFTEXT + json.dumps(paare, ensure_ascii=False, indent=2) + ';\n')
    print(len(paare), 'Eintraege geschrieben')
