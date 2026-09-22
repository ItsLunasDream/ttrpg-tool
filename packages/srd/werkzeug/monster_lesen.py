"""
Liest die Wertekaesten (Stat Blocks) beider Sprachfassungen des SRD 5.2.1.

WIE EIN WERTEKASTEN ERKANNT WIRD
================================
Nicht am Kapitel, sondern an der Form: eine Ueberschrift (der Name), direkt
darunter eine Zeile, die mit einer Groesse anfaengt („Large Aberration,
Lawful Evil" / „Große Aberration, rechtschaffen böse"). So werden auch die
Wertekaesten ausserhalb von „Monsters A–Z" gefunden, etwa die Tiere im
Anhang.

Der Kasten endet an der naechsten Ueberschrift, die keine Attributzeile ist
(„Str 21 +5 +5 Dex 9 …" steht in derselben Schrift wie die Namen).

Aufruf:  python3 werkzeug/monster_lesen.py <ausgabe.json>
"""
import json
import re
import sys

from pypdf import PdfReader

from glossar_lesen import QUELLEN, ist_kopfzeile, zeilen_einer_seite, zusammensetzen

GROESSEN = {
    'en': r'(Tiny|Small|Medium|Large|Huge|Gargantuan)',
    'de': r'(Winzig|Klein|Mittelgroß|Groß|Riesig|Gigantisch)\w*',
}

# Die Abschnitte eines Kastens. Die Reihenfolge ist die des Dokuments.
ABSCHNITTE = {
    'Traits': 'merkmale', 'Merkmale': 'merkmale',
    'Actions': 'aktionen', 'Aktionen': 'aktionen',
    'Bonus Actions': 'bonusaktionen', 'Bonusaktionen': 'bonusaktionen',
    'Reactions': 'reaktionen', 'Reaktionen': 'reaktionen',
    'Legendary Actions': 'legendaer', 'Legendäre Aktionen': 'legendaer',
}

ATTRIBUTZEILE = re.compile(r'^(Str|Stä|Int)\s*\d+')
# Ein Attribut: Kuerzel, Wert, Modifikator, Rettungswurf. Der Satz ist nicht
# immer sauber: „Stä5" ohne Leerzeichen, „Int 6 −2 2" ohne Vorzeichen.
ATTRIBUT = re.compile(r'(Str|Dex|Con|Int|Wis|Cha|Stä|Ges|Kon|Wei)\w*\s*(\d+)\s+[+−-]\d+\s+[+−-]?\d+', re.I)


def zahl(text):
    """„5,900" / „5.900" / „7 ,200" als Zahl."""
    return int(re.sub(r'[^\d]', '', text)) if re.search(r'\d', text) else None


def lies_zeilen(sprache):
    datei = QUELLEN[sprache][0]
    r = PdfReader(datei)
    alle = []
    for nummer, seite in enumerate(r.pages):
        for z in zeilen_einer_seite(seite, nummer):
            if ist_kopfzeile(z['text']):
                continue
            alle.append(z)
    return alle


def kaesten(sprache, alle):
    groesse = re.compile(r'^' + GROESSEN[sprache] + r'\b')
    # Dazu muss in den naechsten Zeilen die Ruestungsklasse stehen — sonst
    # waere jede Tabelle, deren erste Zeile mit „Tiny" anfaengt, ein Kasten.
    anfaenge = [i for i in range(1, len(alle))
                if alle[i - 1]['art'] == 'kopf' and groesse.match(alle[i]['text'].strip())
                and any(re.match(r'(AC|RK)\s', z['text'].strip()) for z in alle[i + 1:i + 3])]
    heraus = []
    for n, i in enumerate(anfaenge):
        ende = anfaenge[n + 1] - 1 if n + 1 < len(anfaenge) else len(alle)
        zeilen = []
        for z in alle[i + 1:ende]:
            if z['art'] == 'kopf' and not ATTRIBUTZEILE.match(z['text'].strip()):
                break
            zeilen.append(z)
        heraus.append(baue(sprache, alle[i - 1]['text'].strip(), alle[i]['text'].strip(), zeilen))
    return heraus


def baue(sprache, name, kopfzeile, zeilen):
    en = sprache == 'en'
    k = {'name': name, 'art': kopfzeile, 'abschnitte': []}
    werte = {}
    abschnitt = None
    eintrag = None
    for z in zeilen:
        t = z['text'].strip()
        if z['art'] == 'zelle' and t in ABSCHNITTE:
            abschnitt = {'id': ABSCHNITTE[t], 'einleitung': '', 'eintraege': []}
            k['abschnitte'].append(abschnitt)
            eintrag = None
            continue
        if z['art'] == 'zelle':
            continue  # „MOD SAVE MOD SAVE"
        if abschnitt is None:
            if z['art'] == 'kopf':
                for m in ATTRIBUT.finditer(t):
                    werte.setdefault('attribute', []).append(int(m.group(2)))
                continue
            # Eine Zeile oben im Kasten: „AC 17  Initiative +7 (17)" usw.
            # Umgebrochene Zeilen (lange Sinne, Sprachen) haengen an der
            # vorigen.
            if z['art'] == 'stichpunkt':
                werte.setdefault('zeilen', []).append(t)
            elif werte.get('zeilen'):
                werte['zeilen'][-1] += ' ' + t
            continue
        trenner = '.' if en else ':'
        if z['art'] == 'punkt' and (eintrag is None or eintrag['fertig']):
            eintrag = {'name': '', 'text': '', 'fertig': False}
            abschnitt['eintraege'].append(eintrag)
        if eintrag is None:
            abschnitt['einleitung'] += t + '\n'
            continue
        if not eintrag['fertig'] and z['art'] == 'punkt':
            # Der fette Name endet am ersten Trenner ausserhalb von Klammern.
            # Die Klammertiefe laeuft ueber Zeilen weiter: „Legendäre
            # Resistenz (3-mal täglich, im Hort 4-mal / täglich): …".
            tiefe = eintrag.setdefault('tiefe', 0)
            for j, c in enumerate(t):
                tiefe += c == '('
                tiefe -= c == ')'
                if c == trenner and tiefe == 0:
                    eintrag['name'] += t[:j]
                    eintrag['text'] += t[j + 1:].strip() + '\n'
                    eintrag['fertig'] = True
                    break
            else:
                eintrag['name'] += t + ' '
            eintrag['tiefe'] = tiefe
            continue
        eintrag['text'] += t + '\n'

    for a in k['abschnitte']:
        a['einleitung'] = zusammensetzen(a['einleitung'])
        for e in a['eintraege']:
            e['name'] = zusammensetzen(e['name'])
            e['text'] = zusammensetzen(e['text'])
            del e['fertig']
            e.pop('tiefe', None)
    k['attribute'] = werte.get('attribute', [])
    k['zeilen'] = [zusammensetzen(z) for z in werte.get('zeilen', [])]
    return k


def kennzahlen(k, sprache):
    """RK, TP, HG, EP, Initiative — die Zahlen, nach denen man filtert."""
    en = sprache == 'en'
    zeilen = k['zeilen']

    def zeile(praefix):
        return next((z for z in zeilen if re.match(praefix, z)), '')

    rk = re.match(r'(?:AC|RK)\s+(\d+)', zeile(r'AC|RK'))
    ini = re.search(r'Initiative\s+([+−–-]\d+)', zeile(r'AC|RK'))
    tp = re.match(r'(?:HP|TP)\s+(\d+)\s*\(([^)]*)\)', zeile(r'HP|TP'))
    # „CR 10 (XP 5,900, …)" und „CR 3 (700 XP; …)" — beide Formen kommen vor.
    hg = re.match(r'(?:CR|HG)\s+([\d/]+)\s*\((?:(?:XP|EP)\s+)?([\d.,\s]+)', zeile(r'CR|HG'))
    k['rk'] = int(rk.group(1)) if rk else None
    k['initiative'] = int(ini.group(1).replace('−', '-').replace('–', '-')) if ini else None
    k['tp'] = int(tp.group(1)) if tp else None
    k['tpFormel'] = tp.group(2).replace(' ', '') if tp else ''
    k['hg'] = hg.group(1) if hg else ''
    k['ep'] = zahl(hg.group(2)) if hg else None
    k['bewegung'] = re.sub(r'^(Speed|Bewegungsrate)\s+', '', zeile(r'Speed|Bewegungsrate'))
    k['legendaer'] = any(a['id'] == 'legendaer' for a in k['abschnitte'])
    return k


def lies(sprache):
    return [kennzahlen(k, sprache) for k in kaesten(sprache, lies_zeilen(sprache))]


if __name__ == '__main__':
    heraus = {s: lies(s) for s in ('en', 'de')}
    json.dump(heraus, open(sys.argv[1], 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    for s, ks in heraus.items():
        ohne = [k['name'] for k in ks if k['rk'] is None or k['tp'] is None or not k['hg']
                or len(k['attribute']) != 6]
        print(s, len(ks), 'Wertekaesten,', len(ohne), 'unvollstaendig:', ohne[:10])
