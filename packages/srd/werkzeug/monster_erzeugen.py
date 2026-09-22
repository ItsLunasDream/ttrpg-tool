"""
Erzeugt src/monster.ts aus den Wertekaesten beider Sprachfassungen.

GEPAART WIRD UEBER DIE ZAHLEN
=============================
Die Namen helfen nicht — beide Listen sind in ihrer Sprache alphabetisch.
Die Zahlen eines Wertekastens aendert eine Uebersetzung aber nicht:
Ruestungsklasse, Trefferpunkte, Herausforderungsgrad, Initiative und die
sechs Attributwerte. Diese Unterschrift ist im ganzen Dokument eindeutig;
das Skript bricht ab, wenn sie es einmal nicht mehr ist, und ebenso, wenn
zwei gepaarte Kaesten nicht dieselben Abschnitte mit derselben Zahl von
Eintraegen haben.

Nicht aufgenommen werden die Wesen, die Zauber herbeirufen („Animated
Object", „Giant Insect" …): ihre Werte haengen vom Zaubergrad ab, sie
haben keinen Herausforderungsgrad und gehoeren nicht in einen Katalog, aus
dem man Begegnungen baut.

Aufruf:  python3 werkzeug/monster_erzeugen.py [monster.json]
         ohne Argument wird zuerst ausgelesen (einige Minuten).
"""
import collections
import json
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.join(HIER, '..', 'src', 'monster.ts')

TYPEN = ['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey',
         'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead']
GROESSEN = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan']


def unterschrift(k):
    return (k['rk'], k['tp'], k['hg'], tuple(k['attribute']), k['initiative'])


def kennung(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def typ_von(art_en):
    """Der Kreaturentyp aus „Large Dragon (Chromatic), Chaotic Evil"."""
    vorne = art_en.split(',')[0].lower()
    for t in TYPEN:
        # „Swarm of Tiny Beasts" ist ein Schwarm aus Tieren.
        if re.search(r'\b' + t + r's?\b', vorne):
            return t
    raise SystemExit(f'Typ nicht erkannt: {art_en!r}')


def groesse_von(art_en):
    wort = art_en.split()[0].lower()
    if wort not in GROESSEN:
        raise SystemExit(f'Groesse nicht erkannt: {art_en!r}')
    return wort


def typname_de(art_de):
    """Das Typwort im Deutschen: „Große Aberration" -> „Aberration"."""
    vorne = art_de.split(',')[0]
    vorne = re.sub(r'\s*\(.*\)', '', vorne)
    teile = vorne.split()
    # Das Typwort steht zuletzt („Kleiner oder mittelgroßer Humanoide"),
    # nur „celestisches Wesen" sind zwei Woerter.
    wort = ' '.join(teile[-2:]) if teile[-1] == 'Wesen' else teile[-1]
    return wort[:1].upper() + wort[1:]


def zusatzzeilen(k):
    """Die Zeilen oben im Kasten ausser RK, TP, Bewegung und HG."""
    return [z for z in k['zeilen'] if not re.match(r'(AC|RK|HP|TP|Speed|Bewegungsrate|CR|HG)\s', z)]


def paar(de, en):
    return {'de': de, 'en': en}


def erzeuge(daten):
    de_nach = {}
    for k in daten['de']:
        if not k['hg']:
            continue
        u = unterschrift(k)
        if u in de_nach:
            raise SystemExit(f'Unterschrift doppelt im Deutschen: {k["name"]}')
        de_nach[u] = k

    monster = []
    typnamen = collections.defaultdict(collections.Counter)
    gesehen = set()
    for e in daten['en']:
        if not e['hg']:
            continue
        u = unterschrift(e)
        if u in gesehen:
            raise SystemExit(f'Unterschrift doppelt im Englischen: {e["name"]}')
        gesehen.add(u)
        d = de_nach.pop(u, None)
        if d is None:
            raise SystemExit(f'Kein deutsches Gegenstueck: {e["name"]}')
        form_e = [(a['id'], len(a['eintraege'])) for a in e['abschnitte']]
        form_d = [(a['id'], len(a['eintraege'])) for a in d['abschnitte']]
        if form_e != form_d:
            raise SystemExit(f'Aufbau weicht ab: {e["name"]} {form_e} / {form_d}')
        typ = typ_von(e['art'])
        typnamen[typ][typname_de(d['art'])] += 1
        monster.append({
            'id': kennung(e['name']),
            'name': paar(d['name'], e['name']),
            'art': paar(d['art'], e['art']),
            'groesse': groesse_von(e['art']),
            'typ': typ,
            'rk': e['rk'],
            'tp': e['tp'],
            'tpFormel': paar(d['tpFormel'], e['tpFormel']),
            'initiative': e['initiative'],
            'hg': e['hg'],
            'ep': e['ep'],
            'attribute': e['attribute'],
            'bewegung': paar(d['bewegung'], e['bewegung']),
            'legendaer': e['legendaer'],
            'zeilen': paar(zusatzzeilen(d), zusatzzeilen(e)),
            'abschnitte': [
                {
                    'id': ae['id'],
                    'einleitung': paar(ad['einleitung'], ae['einleitung']),
                    'eintraege': [
                        {'name': paar(xd['name'], xe['name']), 'text': paar(xd['text'], xe['text'])}
                        for xe, xd in zip(ae['eintraege'], ad['eintraege'])
                    ],
                }
                for ae, ad in zip(e['abschnitte'], d['abschnitte'])
            ],
        })
    if de_nach:
        raise SystemExit(f'Deutsche ohne Gegenstueck: {[k["name"] for k in de_nach.values()]}')
    ids = [m['id'] for m in monster]
    if len(set(ids)) != len(ids):
        raise SystemExit('Kennung doppelt')

    # Der deutsche Name eines Typs: der haeufigste im Dokument. Einzahl, wie
    # im Glossar — „Swarm of Tiny Beasts" soll den Typ nicht „Tiere" nennen.
    typen = {}
    for t in TYPEN:
        haeufig = typnamen[t].most_common()
        typen[t] = haeufig[0][0] if haeufig else t
    return sorted(monster, key=lambda m: m['name']['en']), typen


KOPF = '''/**
 * Die Monster des SRD 5.2.1, beide Sprachen, mit ihren ganzen Wertekaesten.
 *
 * DIESE DATEI IST ERZEUGT (werkzeug/monster_erzeugen.py) und wird nicht von
 * Hand gepflegt. Der Text ist woertlich aus den beiden Sprachfassungen unter
 * `quelle/`; die Paare sind ueber die Zahlen der Kaesten gebildet, nicht
 * ueber die Namen.
 */
import type { Paar } from './namensnennung';

export type MonsterGroesse = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';

export type Kreaturentyp =
  | 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon' | 'elemental' | 'fey'
  | 'fiend' | 'giant' | 'humanoid' | 'monstrosity' | 'ooze' | 'plant' | 'undead';

export interface MonsterEintrag {
  readonly name: Paar;
  readonly text: Paar;
}

export interface MonsterAbschnitt {
  /** merkmale, aktionen, bonusaktionen, reaktionen, legendaer */
  readonly id: string;
  /** Der Satz vor den Eintraegen, etwa die Zahl der legendaeren Aktionen. */
  readonly einleitung: Paar;
  readonly eintraege: readonly MonsterEintrag[];
}

export interface SrdMonster {
  /** Aus dem englischen Namen, kleingeschrieben: „adult-red-dragon". */
  readonly id: string;
  readonly name: Paar;
  /** Die Zeile unter dem Namen: Groesse, Typ, Gesinnung. */
  readonly art: Paar;
  readonly groesse: MonsterGroesse;
  readonly typ: Kreaturentyp;
  readonly rk: number;
  readonly tp: number;
  readonly tpFormel: Paar;
  readonly initiative: number;
  /** Wie im Dokument: „1/4", „10". */
  readonly hg: string;
  readonly ep: number;
  /** Str, Ges, Kon, Int, Wei, Cha. */
  readonly attribute: readonly number[];
  readonly bewegung: Paar;
  readonly legendaer: boolean;
  /** Fertigkeiten, Sinne, Sprachen, Resistenzen … je eine Zeile. */
  readonly zeilen: { readonly de: readonly string[]; readonly en: readonly string[] };
  readonly abschnitte: readonly MonsterAbschnitt[];
}
'''


def schreibe(monster, typen):
    namen_typ = {
        'aberration': 'Aberration', 'beast': 'Beast', 'celestial': 'Celestial',
        'construct': 'Construct', 'dragon': 'Dragon', 'elemental': 'Elemental', 'fey': 'Fey',
        'fiend': 'Fiend', 'giant': 'Giant', 'humanoid': 'Humanoid', 'monstrosity': 'Monstrosity',
        'ooze': 'Ooze', 'plant': 'Plant', 'undead': 'Undead',
    }
    typliste = {t: paar(typen[t], namen_typ[t]) for t in TYPEN}
    with open(ZIEL, 'w', encoding='utf8') as f:
        f.write(KOPF)
        f.write('\n/** Die Namen der Kreaturentypen, wie das Dokument sie fuehrt. */\n')
        f.write('export const KREATURENTYPEN: Readonly<Record<Kreaturentyp, Paar>> = ')
        f.write(json.dumps(typliste, ensure_ascii=False, indent=2))
        f.write(';\n\n')
        f.write('export const SRD_MONSTER: readonly SrdMonster[] = ')
        f.write(json.dumps(monster, ensure_ascii=False, indent=1))
        f.write(' as readonly SrdMonster[];\n')


if __name__ == '__main__':
    if len(sys.argv) > 1:
        daten = json.load(open(sys.argv[1], encoding='utf8'))
    else:
        sys.path.insert(0, HIER)
        import monster_lesen
        daten = {s: monster_lesen.lies(s) for s in ('en', 'de')}
    monster, typen = erzeuge(daten)
    schreibe(monster, typen)
    print(len(monster), 'Monster geschrieben;', 'Typen:', typen)
