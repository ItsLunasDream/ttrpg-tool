"""
Liest die magischen Gegenstaende beider Sprachfassungen des SRD 5.2.1.

WIE EIN GEGENSTAND ERKANNT WIRD
===============================
An der Form: eine Ueberschrift (der Name), direkt darunter eine Zeile, die
mit einer Kategorie anfaengt („Wondrous Item, Rare (Requires Attunement)" /
„Wundersamer Gegenstand, sehr selten (erfordert Einstimmung)"). Die Zeile
kann umbrechen; sie endet mit der Seltenheit und der optionalen Klammer zur
Einstimmung. Was danach kommt, ist der Text.

Gepaart wird wie bei den Monstern ueber das, was eine Uebersetzung nicht
aendert: Kategorie, Seltenheit, Einstimmung, und die Zahlen im Text
(Boni, Wuerfel, SG, Ladungen). Was nicht eindeutig ist, wird nicht geraten.

Aufruf:  python3 werkzeug/gegenstaende_lesen.py <zeilen_en.pkl> <zeilen_de.pkl> <ausgabe.json>
         (die Zeilen, wie monster_lesen.lies_zeilen sie liefert)
"""
import collections
import json
import pickle
import re
import sys

from glossar_lesen import zusammensetzen

KATEGORIEN = {
    'en': [('Wondrous Item', 'wundersam'), ('Armor', 'ruestung'), ('Weapon', 'waffe'),
           ('Potion', 'trank'), ('Ring', 'ring'), ('Rod', 'zepter'), ('Scroll', 'schriftrolle'),
           ('Staff', 'stab'), ('Wand', 'zauberstab')],
    'de': [('Wundersamer Gegenstand', 'wundersam'), ('Rüstung', 'ruestung'), ('Waffe', 'waffe'),
           ('Trank', 'trank'), ('Ring', 'ring'), ('Zepter', 'zepter'),
           ('Schriftrolle', 'schriftrolle'), ('Stab', 'stab'), ('Zauberstab', 'zauberstab')],
}

SELTEN = {
    'en': [('Very Rare', 'veryRare'), ('Uncommon', 'uncommon'), ('Common', 'common'),
           ('Rare', 'rare'), ('Legendary', 'legendary'), ('Artifact', 'artifact'),
           ('Rarity Varies', 'varies')],
    'de': [('sehr selten', 'veryRare'), ('ungewöhnlich', 'uncommon'), ('gewöhnlich', 'common'),
           ('selten', 'rare'), ('legendär', 'legendary'), ('Artefakt', 'artifact'),
           ('Seltenheit variiert', 'varies')],
}

ATTUNE = {'en': 'Requires Attunement', 'de': 'erfordert Einstimmung'}


def kategorie(text, sprache):
    for wort, kennung in KATEGORIEN[sprache]:
        if text.startswith(wort):
            return kennung
    return None


def seltenheiten(kopfzeile, sprache):
    """Alle Seltenheiten in der Zeile, in der Reihenfolge ihres Auftretens."""
    gefunden = []
    rest = kopfzeile
    for wort, kennung in SELTEN[sprache]:
        for m in re.finditer(r'(?<![\wä])' + re.escape(wort) + r'(?![\wä])', rest, re.I):
            gefunden.append((m.start(), kennung))
        rest = re.sub(r'(?<![\wä])' + re.escape(wort) + r'(?![\wä])', ' ' * len(wort), rest, flags=re.I)
    return [k for _, k in sorted(gefunden)]


def name_von(alle, i):
    """
    Der Name ueber der Kategoriezeile. Zweizeilige Namen („Amulet of Proof
    against Detection / and Location") stehen als zwei Kopfzeilen direkt
    untereinander: gleiche Seite, gleiche Spalte, eine Zeile Abstand.
    Eine Kapitelueberschrift davor steht weiter weg und bleibt draussen.
    """
    name = alle[i - 1]['text'].strip()
    if i >= 2:
        vv, v = alle[i - 2], alle[i - 1]
        if (vv['art'] == 'kopf' and vv['seite'] == v['seite'] and abs(vv['x'] - v['x']) < 3
                and 0 < vv['y'] - v['y'] < 16):
            oben = vv['text'].strip()
            name = (oben + name) if oben.endswith('-') else (oben + ' ' + name)
    return name


def lies(sprache, alle):
    heraus = []
    i = 1
    while i < len(alle):
        z = alle[i]
        vorher = alle[i - 1]
        if vorher['art'] == 'kopf' and z['art'] == 'text' and kategorie(z['text'].strip(), sprache):
            # Die Kopfzeile sammeln, bis die Seltenheit (und eine offene
            # Klammer) abgeschlossen ist — hoechstens drei Zeilen.
            kopf = z['text'].strip()
            j = i + 1
            while j < len(alle) and j < i + 4 and (
                not seltenheiten(kopf, sprache) or kopf.count('(') > kopf.count(')')
                # „Uncommon (+1), Rare (+2), / or Very Rare (+3)": eine Zeile,
                # die mit Komma oder „or" endet, geht weiter.
                or re.search(r'(,|\bor|\boder|\bVery|\bsehr)\s*$', kopf)
                # „… Rare / (+2), or Very Rare (+3)": die naechste Zeile setzt
                # die Seltenheiten fort.
                or re.match(r'\((?:\+\d|erfordert|Requires)|or\b|oder\b', alle[j]['text'].strip())
            ):
                kopf += ' ' + alle[j]['text'].strip()
                j += 1
            text = []
            while j < len(alle):
                w = alle[j]
                if w['art'] == 'kopf' and j + 1 < len(alle) and alle[j + 1]['art'] == 'text' and \
                        kategorie(alle[j + 1]['text'].strip(), sprache):
                    # Die obere Zeile eines zweizeiligen Namens gehoert
                    # zum naechsten Gegenstand, nicht zu diesem.
                    if name_von(alle, j + 1) != w['text'].strip() and text:
                        text.pop()
                    break
                # Ein Kapitelwechsel beendet den Bestand.
                if w['art'] == 'kopf' and w['text'].strip() in ('Monsters', 'Monster', 'Monsters A–Z', 'Monster von A–Z'):
                    break
                text.append(w['text'])
                j += 1
            kopf = zusammensetzen(kopf)
            if not seltenheiten(kopf, sprache):
                # Keine Seltenheit: das war kein Gegenstand, sondern etwa ein
                # Abschnitt im Kapitel Ausruestung („Armor Training").
                i += 1
                continue
            heraus.append({
                'name': name_von(alle, i),
                'kopfzeile': kopf,
                'kategorie': kategorie(kopf, sprache),
                'seltenheiten': seltenheiten(kopf, sprache),
                'einstimmung': ATTUNE[sprache].lower() in kopf.lower(),
                'text': zusammensetzen('\n'.join(text)),
            })
            i = j
            continue
        i += 1
    return heraus


def zahlen(text):
    """Die Zahlen, die eine Uebersetzung nicht aendert: Wuerfel, Boni, SG."""
    w = sorted(m.lower().replace('w', 'd') for m in re.findall(r'\d+[dDwW]\d+', text))
    b = sorted(re.findall(r'[+]\d+', text))
    sg = sorted(re.findall(r'(?:DC|SG)[\s‑-]*(\d+)', text))
    return (tuple(w), tuple(b), tuple(sg))


# Was von Hand gepaart ist, darf in diesen Faellen vom Rahmen abweichen —
# es sind Satzfehler oder Leseeigenheiten, keine falschen Paare.
ABWEICHUNGEN = {
    # Im deutschen PDF steht als Kategorie „Zauberstab", im englischen „Staff".
    'Staff of Withering': 'kategorie',
    # Die englische Seltenheitszeile bricht so um, dass „Legendary" in den
    # Text rutscht; die deutsche nennt alle drei.
    'Horn of Valhalla': 'seltenheiten',
}


def paare(en, de, hand=None):
    """
    Automatisch, wo Kategorie, Seltenheit, Einstimmung und die Zahlen im Text
    genau ein Paar ergeben; der Rest aus der Handliste. Jedes Handpaar muss
    im Rahmen (Kategorie, Seltenheit, Einstimmung) passen, ausser es steht in
    ABWEICHUNGEN. Sonst bricht das Skript ab.
    """
    auto = paare_automatisch(en, de)
    if not hand:
        return auto
    nach_en = {g['name']: g for g in en}
    nach_de = {g['name']: g for g in de}
    for e, d in hand.items():
        if e not in nach_en or d not in nach_de:
            raise SystemExit(f'Handpaar nicht in der Auslese: {e} = {d}')
        if e in auto and auto[e] != d:
            raise SystemExit(f'Handpaar widerspricht der Automatik: {e} = {d} / {auto[e]}')
        for feld in ('kategorie', 'seltenheiten', 'einstimmung'):
            if nach_en[e][feld] != nach_de[d][feld] and ABWEICHUNGEN.get(e) != feld:
                raise SystemExit(f'Handpaar passt nicht ({feld}): {e} = {d}')
    alle = {**auto, **hand}
    if len(set(alle.values())) != len(alle):
        raise SystemExit('Ein deutscher Gegenstand ist doppelt gepaart')
    return alle


def paare_automatisch(en, de):
    def schluessel(g):
        return (g['kategorie'], tuple(g['seltenheiten']), g['einstimmung'], zahlen(g['text']))
    nach_de = collections.defaultdict(list)
    for g in de:
        nach_de[schluessel(g)].append(g)
    nach_en = collections.defaultdict(list)
    for g in en:
        nach_en[schluessel(g)].append(g)
    gepaart = {}
    for k, liste in nach_en.items():
        if len(liste) == 1 and len(nach_de.get(k, [])) == 1:
            gepaart[liste[0]['name']] = nach_de[k][0]['name']
    return gepaart


if __name__ == '__main__':
    zeilen_en = pickle.load(open(sys.argv[1], 'rb'))
    zeilen_de = pickle.load(open(sys.argv[2], 'rb'))
    en, de = lies('en', zeilen_en), lies('de', zeilen_de)
    import os
    handdatei = os.path.join(os.path.dirname(__file__), 'gegenstaende_paare.json')
    hand = json.load(open(handdatei, encoding='utf8')) if os.path.exists(handdatei) else {}
    p = paare(en, de, hand)
    json.dump({'en': en, 'de': de, 'paare': p}, open(sys.argv[3], 'w', encoding='utf8'),
              ensure_ascii=False, indent=1)
    print(len(en), 'englisch,', len(de), 'deutsch,', len(p), 'gepaart', f'({len(hand)} von Hand)')
