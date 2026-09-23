"""
Liest das Kapitel Ausruestung beider Sprachfassungen des SRD 5.2.1.

Das Kapitel ist gemischt: Muenzen, Waffen mit Eigenschaften und
Meisterschaften, Ruestungen, Werkzeuge, Abenteuerausruestung, Reittiere,
Lebenshaltung und Dienste. Gelesen wird es wie das Glossar: jede
Ueberschrift, auf die Text folgt, ist ein Eintrag; eine Ueberschrift, auf
die Zellen folgen, ist eine Tabelle im Eintrag davor. Die fett gesetzten
Angaben der Werkzeuge („Ability: …", „Attribut: …") werden Unterpunkte.

Gepaart wird ueber den Abschnitt (die Abschnitte stehen in beiden Sprachen
in derselben Folge), den Preis im Namen und die Zahlen im Text; was nicht
eindeutig ist, steht in ausruestung_paare.json.

Aufruf (aus packages/srd):
  python3 werkzeug/ausruestung_lesen.py <zeilen_en.pkl> <zeilen_de.pkl> <ausgabe.json>
"""
import collections
import json
import os
import pickle
import re
import sys

import glossar_tabellen
from glossar_lesen import QUELLEN, zusammensetzen, ist_kopfzeile
from gegenstaende_text import (halbiere, verbinde, weich_mitten, belegte_paare, zellen_glaetten,
                               reihen_ordnen, _einzelzelle, _neue_tabelle)
from gegenstaende_lesen import zahlen
from zauber_lesen import nach_lage

# Anfang: die Kapitelueberschrift, direkt gefolgt von „Coins"/„Münzen".
# Ende: „Spells"/„Zauber", direkt gefolgt von „Gaining Spells"/„Zauber erhalten".
KAPITEL = {'en': ('Equipment', 'Coins', 'Spells', 'Gaining Spells'),
           'de': ('Ausrüstung', 'Münzen', 'Zauber', 'Zauber erhalten')}
ANGABE = re.compile(r'^(Ability|Utilize|Craft|Variants|Attribut|Verwenden|Herstellen|Varianten)\s*:')

# Die Abschnitte, in der Folge des Kapitels. Ein Eintrag gehoert zum
# letzten Abschnittskopf davor.
ABSCHNITTE = {
    'en': ['Equipment', 'Coins', 'Weapons', 'Properties', 'Mastery Properties', 'Armor', 'Tools',
           'Adventuring Gear', 'Mounts and Vehicles', 'Lifestyle Expenses', 'Food, Drink, and Lodging',
           'Hirelings', 'Spellcasting', 'Magic Items', 'Crafting Nonmagical Items',
           'Brewing Potions of Healing', 'Scribing Spell Scrolls'],
    'de': ['Ausrüstung', 'Münzen', 'Waffen', 'Eigenschaften', 'Meisterschaftseigenschaft', 'Rüstung', 'Werkzeug',
           'Abenteurerausrüstung', 'Reittiere und Fahrzeuge', 'Lebenshaltungskosten', 'Essen, Trinken und Unterkunft',
           'Mietlinge', 'Zauberwirken', 'Magische Gegenstände', 'Nichtmagische Gegenstände herstellen',
           'Heiltränke brauen', 'Zauberschriftrollen verfassen'],
}


# Die Infokaesten; ihre Titel kommen in Kapitaelchen verwuerfelt an.
KASTEN = {'en': {'selling equipment': 'Selling Equipment', 'improvised weapons': 'Improvised Weapons',
                 'casting in armor': 'Casting in Armor'},
          'de': {'ausrüstung verkaufen': 'Ausrüstung verkaufen', 'improvisierte waffen': 'Improvisierte Waffen',
                 'zaubern in rüstung': 'Zaubern in Rüstung'}}
# Trennfehler im Druck, die keine Regel sicher erkennt: ein Leerzeichen
# vor dem Umlaut mitten im Wort. Jede muss greifen.
KORREKTUREN = {'en': [], 'de': [('Gelehrtenausr üstung', 'Gelehrtenausrüstung'),
                                ('Unterhaltungsk ünstler', 'Unterhaltungskünstler')]}
# Die seitenbreiten Tabellen. Von Hand, weil die Lage allein es nicht
# sicher zeigt: die Ausruestungstabelle steht in beiden Satzspalten mit
# demselben Kopf auf gleicher Hoehe und ist doch zweimal einspaltig.
BREIT = {'en': {'Weapons', 'Armor', 'Airborne and Waterborne Vehicles'},
         'de': {'Waffen', 'Rüstung', 'Luft- und Wasserfahrzeuge'}}
# Wohin jede Tabelle gehoert. Jede Tabelle muss hier stehen und jeder
# Eintrag hier muss eine Tabelle finden.
TABELLE_ZU = {
    'en': {'Coin Values': 'Coins', 'Weapons': 'Weapons', 'Armor': 'Armor', 'Adventuring Gear': 'Adventuring Gear',
           'Ammunition': 'Ammunition (Varies)', 'Arcane Focuses': 'Arcane Focus (Varies)',
           'Druidic Focuses': 'Druidic Focus (Varies)', 'Holy Symbols': 'Holy Symbol (Varies)',
           'Mounts and Other Animals': 'Mounts and Vehicles', 'Tack, Harness, and Drawn Vehicles': 'Mounts and Vehicles',
           'Airborne and Waterborne Vehicles': 'Large Vehicles', 'Food, Drink, and Lodging': 'Food, Drink, and Lodging',
           'Hirelings': 'Hirelings', 'Spellcasting Services': 'Spellcasting', 'Spell Scroll Costs': 'Time and Cost'},
    'de': {'Münzwerte': 'Münzen', 'Waffen': 'Waffen', 'Rüstung': 'Rüstung', 'Abenteurerausrüstung': 'Abenteurerausrüstung',
           'Geschosse': 'Geschosse (Preis variiert)', 'Arkane Fokusse': 'Arkaner Fokus (Preis variiert)',
           'Druidische Fokusse': 'Druidischer Fokus (Preis variiert)', 'Heilige Symbole': 'Heiliges Symbol (Preis variiert)',
           'Reittiere und andere Tiere': 'Reittiere und Fahrzeuge',
           'Sattel und Zaumzeug, Geschirr und Fuhrwerke': 'Reittiere und Fahrzeuge',
           'Luft- und Wasserfahrzeuge': 'Große Fahrzeuge', 'Essen, Trinken und Unterkunft': 'Essen, Trinken und Unterkunft',
           'Mietlinge': 'Mietlinge', 'Zauberwirken-Dienstleistungen': 'Zauberwirken',
           'Kosten für Zauberschriftrollen': 'Zeit und Kosten'},
}


def kapitel(sprache, alle):
    anfang, danach, ende, ende_danach = KAPITEL[sprache]
    von = next(i for i, z in enumerate(alle)
               if z['art'] == 'kopf' and z['text'].strip() == anfang and alle[i + 1]['text'].strip() == danach)
    bis = next(i for i in range(von + 1, len(alle))
               if alle[i]['art'] == 'kopf' and alle[i]['text'].strip() == ende
               and alle[i + 1]['text'].strip() == ende_danach)
    seite_von = alle[von]['seite']
    start = next(i for i, z in enumerate(alle) if z['seite'] == seite_von)
    geordnet = nach_lage(alle, start, bis)
    von = next(i for i, z in enumerate(geordnet)
               if z['art'] == 'kopf' and z['text'].strip() == anfang and z['seite'] == seite_von)
    return [z for z in geordnet[von:bis] if not ist_kopfzeile(z['text'])]


KASTEN_TITEL = re.compile(r'[a-zäöüß][A-ZÄÖÜ]')


def ist_kasten(z):
    """Die erste Zeile eines Infokastens: eingerueckt, und der Titel steht in
    Kapitaelchen, die als wildes Gemisch ankommen („sEllinG EquipMEnt")."""
    einzug = z['x'] - (63 if z['x'] < 300 else 313)
    return (z['art'] == 'zelle' and 7 <= einzug <= 12 and len(z['text'].strip()) < 45
            and bool(KASTEN_TITEL.search(z['text'])))


def verbinde_koepfe(zeilen):
    """Zweizeilige Ueberschriften, wie im Glossar: zwei Kopfzeilen direkt
    untereinander, die zweite faengt klein an oder die erste endet offen."""
    zusammen = []
    i = 0
    while i < len(zeilen):
        z = zeilen[i]
        offen = z['text'].rstrip().endswith((' und', ' and', ','))
        if (z['art'] == 'kopf' and i + 2 < len(zeilen) and zeilen[i + 1]['art'] == 'kopf'
                and (zeilen[i + 2]['art'] in ('text', 'punkt', 'stichpunkt') or offen)
                and abs(zeilen[i + 1]['x'] - z['x']) < 3
                and zeilen[i + 1]['seite'] == z['seite'] and 0 < z['y'] - zeilen[i + 1]['y'] < 21
                and (zeilen[i + 1]['text'].strip()[:1].islower() or z['text'].endswith(' ')
                     or z['text'].rstrip().endswith(('und', 'and', '-', '(')))):
            oben = z['text'].strip()
            unten = zeilen[i + 1]['text'].strip()
            zusammen.append({**z, 'text': (oben + unten) if oben.endswith('-') else f'{oben} {unten}'})
            i += 2
            continue
        zusammen.append(z)
        i += 1
    return zusammen


def ist_tabellentitel(datei, zeilen, i):
    """Eine Kopfzeile, auf die ein Tabellenkopf und dann Zellen folgen."""
    z = zeilen[i]
    if z['art'] != 'kopf' or ANGABE.match(z['text'].strip()) or not _einzelzelle(datei, z):
        return False
    for k in range(i + 1, min(i + 6, len(zeilen))):
        if zeilen[k]['art'] == 'zelle':
            return k > i + 1
        if zeilen[k]['art'] != 'kopf' or ANGABE.match(zeilen[k]['text'].strip()):
            return False
    return False


def tabellen_heraus(sprache, datei, zeilen):
    """Nimmt die Tabellen mit Titel aus dem Textfluss.

    Sie stehen im Druck, wo Platz war, und nicht beim Eintrag, zu dem sie
    gehoeren: die Waffentabelle auf einer eigenen Seite, die Ausruestungs-
    tabelle mitten zwischen den Gegenstaenden. Im Fluss gelassen, landete
    sie im Eintrag davor und unterbraeche dessen Absatz. Wohin sie gehoert,
    sagt TABELLE_ZU. Eine seitenbreite Tabelle nimmt ausserdem alles in
    ihrem Band mit; die rechte Haelfte ihrer Zeilen steht sonst als lose
    Zellen am Kopf der rechten Satzspalte.
    """
    tabellen = []
    raus = set()
    baender = []
    i = 0
    while i < len(zeilen):
        if not ist_tabellentitel(datei, zeilen, i):
            i += 1
            continue
        j = i + 1
        while (j < len(zeilen) and zeilen[j]['art'] in ('kopf', 'zelle') and not ist_kasten(zeilen[j])
               and not (zeilen[j - 1]['art'] == 'zelle' and ist_tabellentitel(datei, zeilen, j))
               and not ANGABE.match(zeilen[j]['text'].strip())
               and not (zeilen[j]['art'] == 'kopf' and j + 1 < len(zeilen)
                        and zeilen[j + 1]['art'] not in ('kopf', 'zelle'))):
            j += 1
        breit = zeilen[i]['text'].strip() in BREIT[sprache]
        roh = zeilen[i + 1:j]
        if breit:
            # Alles im Band gehoert dazu, auch die Kopfteile rechts.
            seite, oben = zeilen[i]['seite'], zeilen[i]['y']
            unten = min(z['y'] for z in roh if z['seite'] == seite)
            roh = sorted((z for z in zeilen if z['seite'] == seite and unten - 3 <= z['y'] < oben - 3),
                         key=lambda z: (-z['y'], z['x']))
        tabellen.append({'titel': zeilen[i]['text'].strip(), 'roh': roh, 'breit': breit})
        raus.update(range(i, j))
        if breit and len({z['seite'] for z in roh}) != 1:
            raise SystemExit(f'{sprache}: seitenbreite Tabelle ueber mehrere Seiten: {zeilen[i]["text"]!r}')
        if breit:
            baender.append((seite, unten - 3, oben + 3))
        i = j
    rest = [z for n, z in enumerate(zeilen) if n not in raus
            and not any(z['seite'] == s and u <= z['y'] <= o for s, u, o in baender)]
    return rest, tabellen


def doppeltabelle(datei, tabelle):
    """Eine Tabelle, die in einer Satzspalte zweimal nebeneinander steht
    („Item Cost Item Cost", bei Essen, Trinken und Unterkunft).

    Gelesen wird je Stueck erst die linke, dann die rechte Haelfte; so
    laeuft die Liste im Druck weiter (die Preise der Unterkunft gehen oben
    rechts weiter). Eine Zeile ohne Preis ist eine Zwischenzeile
    („Inn Stay per Day"), die eingerueckten Zeilen darunter gehoeren zu ihr.
    """
    stuecke = [glossar_tabellen._zeilen(w) for w in glossar_tabellen._woerter(datei, tabelle['roh'])]
    stuecke = [s for s in stuecke if s]
    if not stuecke or not stuecke[0][0]['kopf']:
        return None
    kopf = [c['text'] for c in stuecke[0][0]['zellen']]
    if len(kopf) != 4 or kopf[:2] != kopf[2:]:
        return None
    reihen = []
    for zeilen in stuecke:
        k = zeilen[0]
        if not k['kopf'] or [c['text'] for c in k['zellen']] != kopf:
            raise ValueError(f'Doppeltabelle ohne Kopf im Stueck: {tabelle["titel"]!r}')
        c = k['zellen']
        mitte = c[2]['x0'] - 4
        preis = (c[1]['x0'] - 10, c[3]['x0'] - 10)
        for haelfte in (0, 1):
            for z in zeilen[1:]:
                w = [w for w in z['w'] if (w['x0'] >= mitte) == bool(haelfte)]
                if not w:
                    continue
                name = ' '.join(x['text'] for x in w if x['x0'] < preis[haelfte])
                kosten = ' '.join(x['text'] for x in w if x['x0'] >= preis[haelfte])
                reihen.append([zusammensetzen(name), zusammensetzen(kosten)])
    return {'typ': 'tabelle', 'titel': zusammensetzen(tabelle['titel']), 'kopf': kopf[:2], 'reihen': reihen}


def lies(sprache, alle):
    datei = QUELLEN[sprache][0]
    zeilen = verbinde_koepfe(kapitel(sprache, alle))
    zeilen, tabellen = tabellen_heraus(sprache, datei, zeilen)

    eintraege = []
    aktuell = None
    abschnitt = None
    tabelle = None
    kasten = None
    reihe = ABSCHNITTE[sprache]

    def setze(name):
        # Die Abschnitte kommen nur vorwaerts; ein gleichnamiger Titel
        # spaeter setzt nicht zurueck.
        nonlocal abschnitt
        if name in reihe and (abschnitt is None or reihe.index(name) > reihe.index(abschnitt)):
            abschnitt = name
            return True
        return False

    for i, x in enumerate(zeilen):
        art = x['art']
        t = x['text'].rstrip()
        naechste = zeilen[i + 1] if i + 1 < len(zeilen) else None
        danach = zeilen[i + 2] if i + 2 < len(zeilen) else None
        if kasten is not None:
            if art == 'zelle' and abs(x['x'] - kasten['_x']) < 3:
                b = kasten['bloecke']
                if b:
                    b[-1]['text'] += '\n' + t
                else:
                    b.append({'typ': 'absatz', 'text': t})
                continue
            # Nach dem Kasten geht der Text des Eintrags davor weiter.
            aktuell, kasten = kasten['_vorher'], None
        if ist_kasten(x):
            titel = ' '.join(t.split()).lower()
            if titel not in KASTEN[sprache]:
                raise SystemExit(f'{sprache}: unbekannter Kasten {t!r}')
            kasten = {'name': KASTEN[sprache][titel], 'abschnitt': abschnitt, 'kasten': True, 'bloecke': [], '_roh': [],
                      '_x': x['x'], '_vorher': aktuell}
            eintraege.append(kasten)
            tabelle = None
            continue
        if (art == 'kopf' and naechste is not None and naechste['art'] == 'kopf' and danach is not None
                and not ANGABE.match(t.strip()) and not ANGABE.match(naechste['text'].strip())
                and danach['art'] == 'kopf' and ANGABE.match(danach['text'].strip())):
            # Ein Zwischenkopf ohne Text („Other Tools") vor dem naechsten Werkzeug.
            tabelle = None
            continue
        if art == 'kopf' and ANGABE.match(t.strip()) and aktuell is not None:
            aktuell['bloecke'].append({'typ': 'stichpunkt', 'text': t, 'angabe': True})
            tabelle = None
            continue
        if (art == 'kopf' and naechste is not None and naechste['art'] == 'kopf'
                and not ANGABE.match(naechste['text'].strip()) and setze(t.strip())):
            # Ein Abschnittskopf ohne eigenen Text („Equipment" vor „Coins").
            tabelle = None
            continue
        if art == 'kopf' and naechste is not None and naechste['art'] in ('text', 'punkt', 'stichpunkt', 'sonst') or (
                art == 'kopf' and naechste is not None and naechste['art'] == 'kopf' and ANGABE.match(naechste['text'].strip())):
            name = t.strip()
            setze(name)
            aktuell = {'name': name, 'abschnitt': abschnitt, 'bloecke': [], '_roh': []}
            eintraege.append(aktuell)
            tabelle = None
            continue
        if aktuell is None:
            continue
        aktuell['_roh'].append(x)
        b = aktuell['bloecke']
        if art == 'zelle' and tabelle is None and b and b[-1].get('angabe'):
            # Die Angabe eines Werkzeugs laeuft eingerueckt weiter.
            b[-1]['text'] += '\n' + t
            continue
        if art in ('kopf', 'zelle'):
            if art == 'kopf' and _neue_tabelle(tabelle, x):
                tabelle = None
            if tabelle is None:
                tabelle = {'typ': 'tabelle', 'titel': '', 'zeilen': [], 'roh': [], 'feine_spalten': True}
                aktuell['bloecke'].append(tabelle)
            tabelle['zeilen'].append(t.strip())
            tabelle['roh'].append(x)
            continue
        tabelle = None
        b = aktuell['bloecke']
        if art in ('punkt', 'stichpunkt'):
            b.append({'typ': art, 'text': t})
        elif b and b[-1]['typ'] in ('absatz', 'punkt', 'stichpunkt') and not b[-1].get('angabe'):
            b[-1]['text'] += '\n' + t
        else:
            b.append({'typ': 'absatz', 'text': t})

    # Die Tabellen an ihren Eintrag, in der Folge des Drucks.
    namen = {e['name']: e for e in eintraege}
    ziel = TABELLE_ZU[sprache]
    for t in tabellen:
        if t['titel'] not in ziel:
            raise SystemExit(f'{sprache}: Tabelle ohne Ziel {t["titel"]!r}')
        if ziel[t['titel']] not in namen:
            raise SystemExit(f'{sprache}: Ziel fehlt {ziel[t["titel"]]!r}')
        e = namen[ziel[t['titel']]]
        e['bloecke'].append({'typ': 'tabelle', 'titel': t['titel'], 'zeilen': [z['text'].strip() for z in t['roh']],
                             'roh': t['roh'], 'feine_spalten': True, 'zwischenzeilen': True, 'breit': t['breit']})
        e['_roh'].extend(t['roh'])
    if len(set(ziel)) != len(tabellen) or {t['titel'] for t in tabellen} != set(ziel):
        raise SystemExit(f'{sprache}: TABELLE_ZU passt nicht zu den Tabellen')

    fehler = []
    for e in eintraege:
        e.pop('_x', None)
        e.pop('_vorher', None)
        fertig = []
        for b in e['bloecke']:
            if b['typ'] == 'tabelle':
                try:
                    doppelt = doppeltabelle(datei, b) if b.get('titel') else None
                    fertig.append(doppelt or halbiere(glossar_tabellen.baue(datei, b, zusammensetzen)))
                except ValueError as err:
                    fehler.append(f'{e["name"]}: {err}')
                    fertig.append({'typ': 'absatz', 'text': zusammensetzen('\n'.join(b['zeilen']))})
            elif b.get('angabe'):
                # „Ability: Strength  Weight: 8 lb." sind zwei Angaben.
                for teil in re.split(r'\s+(?=(?:Weight|Gewicht):)', zusammensetzen(weich_mitten(b['text']))):
                    fertig.append({'typ': 'stichpunkt', 'text': teil})
            else:
                fertig.append({'typ': b['typ'], 'text': zusammensetzen(weich_mitten(b['text']))})
        paare = belegte_paare(e['_roh'])
        # Die Tabellen hier haben Zwischenzeilen („Simple Melee Weapons",
        # „Inn Stay per Day"); reihen_ordnen hielte sie fuer Umbrueche.
        fertig = [t for b in fertig for t in ([b] if b['typ'] == 'tabelle' and b.get('titel') else reihen_ordnen(b))]
        e['bloecke'] = [zellen_glaetten(b, paare)[0] for b in verbinde(fertig)]
        e['name'] = zusammensetzen(weich_mitten(e['name']))
    eintraege = korrigiere(sprache, eintraege)
    # Gleiche Namen („Tools" als Abschnitt und als Teil von „Crafting
    # Nonmagical Items") bekommen den Abschnitt als Vorsatz im Schluessel.
    zahl = collections.Counter(e['name'] for e in eintraege)
    for e in eintraege:
        e['schluessel'] = (e['name'] if zahl[e['name']] == 1 or e['name'] == e['abschnitt']
                           else f'{e["abschnitt"]}/{e["name"]}')
    if len({e['schluessel'] for e in eintraege}) != len(eintraege):
        raise SystemExit(f'{sprache}: Schluessel doppelt')
    return eintraege, fehler


def korrigiere(sprache, eintraege):
    roh = json.dumps(eintraege, ensure_ascii=False)
    for alt, neu in KORREKTUREN[sprache]:
        if alt not in roh:
            raise SystemExit(f'{sprache}: Korrektur greift nicht: {alt!r}')
        roh = roh.replace(alt, neu)
    return json.loads(roh)


PREIS = re.compile(r'\(([\d.,]+)\s*(GP|SP|CP|GM|SM|KM|EM|PP|PM|EP)\b')
MUENZE = {'GP': 'gm', 'GM': 'gm', 'SP': 'sm', 'SM': 'sm', 'CP': 'km', 'KM': 'km', 'EP': 'em', 'EM': 'em',
          'PP': 'pm', 'PM': 'pm'}


def merkmale(e, sprache):
    m = PREIS.search(e['name'])
    preis = (m.group(1).replace('.', '').replace(',', ''), MUENZE[m.group(2)]) if m else None
    text = ' '.join(b.get('text', '') for b in e['bloecke'])
    form = tuple((b['typ'], len(b.get('kopf', [])), len(b.get('reihen', b.get('eintraege', []))))
                 for b in e['bloecke'] if b['typ'] in ('tabelle', 'liste'))
    return (ABSCHNITTE[sprache].index(e['abschnitt']) if e['abschnitt'] in ABSCHNITTE[sprache] else -1,
            preis, form, zahlen(text))


def paare(en, de, hand):
    ne, nd = collections.defaultdict(list), collections.defaultdict(list)
    for e in en:
        ne[merkmale(e, 'en')].append(e)
    for d in de:
        nd[merkmale(d, 'de')].append(d)
    auto = {l[0]['schluessel']: nd[k][0]['schluessel'] for k, l in ne.items()
            if len(l) == 1 and len(nd.get(k, [])) == 1}
    E = {e['schluessel']: e for e in en}
    D = {d['schluessel']: d for d in de}
    for e, d in hand.items():
        if e not in E or d not in D:
            raise SystemExit(f'Handpaar nicht in der Auslese: {e} = {d}')
        if e in auto and auto[e] != d:
            raise SystemExit(f'Handpaar widerspricht der Automatik: {e} = {d} / {auto[e]}')
        a, b = merkmale(E[e], 'en'), merkmale(D[d], 'de')
        # Hart: Abschnitt, Preis und Form der Tabellen.
        if E[e].get('kasten'):
            # Ein Kasten steht, wo auf der Seite Platz war, auch mal im
            # Abschnitt davor.
            a, b = a[1:], b[1:]
        if a[:3] != b[:3]:
            raise SystemExit(f'Handpaar passt nicht: {e} = {d}\n  {a[:3]}\n  {b[:3]}')
    alle = {**auto, **hand}
    if len(set(alle.values())) != len(alle):
        raise SystemExit('Deutsch doppelt gepaart')
    offen = [e for e in E if e not in alle]
    if offen:
        raise SystemExit(f'{len(offen)} englische Eintraege ungepaart: {offen}')
    return alle, auto


if __name__ == '__main__':
    zeilen_en = pickle.load(open(sys.argv[1], 'rb'))
    zeilen_de = pickle.load(open(sys.argv[2], 'rb'))
    (en, fe), (de, fd) = lies('en', zeilen_en), lies('de', zeilen_de)
    handdatei = os.path.join(os.path.dirname(__file__), 'ausruestung_paare.json')
    hand = json.load(open(handdatei, encoding='utf8')) if os.path.exists(handdatei) else {}
    p, auto = paare(en, de, hand)
    for e in en + de:
        e.pop('_roh', None)
    json.dump({'en': en, 'de': de, 'paare': p}, open(sys.argv[3], 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(len(en), 'englisch,', len(de), 'deutsch,', len(auto), 'automatisch,', len(hand), 'von Hand;',
          len(fe) + len(fd), 'Tabellen nicht gebaut')
    for f in fe + fd:
        print('  ', f)
