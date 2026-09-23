"""
Erzeugt src/zauber.ts aus der Auslese (zauber_lesen.py).

Bricht ab, wenn eine Pruefung scheitert: jeder Zauber genau einmal gepaart,
dieselbe Folge der Blockarten in beiden Sprachen, dieselbe Form jeder
Tabelle, alle vier Eigenschaften vorhanden, kein weiches Trennzeichen.

Aufruf (aus packages/srd):  python3 werkzeug/zauber_erzeugen.py <zauber.json>
"""
import json
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.join(HIER, '..', 'src', 'zauber.ts')
sys.path.insert(0, HIER)
from gegenstaende_erzeugen import form, texte, ohne_intern, kennung  # noqa: E402

EIGENSCHAFTEN = ('zeit', 'reichweite', 'komponenten', 'dauer')


def pruefe(d):
    fehler = []
    E = {z['name']: z for z in d['en']}
    D = {z['name']: z for z in d['de']}
    p = d['paare']
    if set(p) != set(E) or set(p.values()) != set(D) or len(set(p.values())) != len(p):
        fehler.append('Paarung unvollstaendig oder doppelt')
    for en, de in p.items():
        a, b = E[en], D[de]
        if [x['typ'] for x in a['bloecke']] != [x['typ'] for x in b['bloecke']]:
            fehler.append(f'Blockfolge: {en} / {de}')
        if form(a['bloecke']) != form(b['bloecke']):
            fehler.append(f'Tabellenform: {en} / {de}')
        for z in (a, b):
            if set(z['eigenschaften']) != set(EIGENSCHAFTEN):
                fehler.append(f'Eigenschaften: {z["name"]}')
            alles = [z['gradzeile'], *z['eigenschaften'].values(), *(t for blk in z['bloecke'] for t in texte(blk))]
            if any('­' in t for t in alles):
                fehler.append(f'weiches Trennzeichen in {z["name"]}')
    return fehler


KOPF = '''/**
 * Die Zauber des SRD 5.2.1, alle 339, woertlich und in beiden Sprachen.
 *
 * DIESE DATEI IST ERZEUGT (werkzeug/zauber_lesen.py und
 * werkzeug/zauber_erzeugen.py) und wird nicht von Hand gepflegt. Gepaart
 * ueber Grad, Schule, Klassen, Komponenten, Konzentration, Ritual und die
 * Zahlen im Text; 25 Paare stehen von Hand in werkzeug/zauber_paare.json.
 * Die Bloecke stehen je Sprache in derselben Folge.
 */
import type { Paar } from './namensnennung';
import type { Gegenstandsblock } from './magische-gegenstaende';

export type Zauberblock = Gegenstandsblock;

export type Zauberschule =
  | 'bann'
  | 'beschwoerung'
  | 'erkenntnis'
  | 'verzauberung'
  | 'hervorrufung'
  | 'illusion'
  | 'nekromantie'
  | 'verwandlung';

export type Zauberklasse =
  | 'barde'
  | 'druide'
  | 'hexenmeister'
  | 'kleriker'
  | 'magier'
  | 'paladin'
  | 'waldlaeufer'
  | 'zauberer';

export interface Zaubereigenschaften {
  readonly zeit: string;
  readonly reichweite: string;
  readonly komponenten: string;
  readonly dauer: string;
}

export interface Zauber {
  /** Aus dem englischen Namen: „fireball". */
  readonly id: string;
  readonly name: Paar;
  /** Grad, Schule und Klassen, wie gedruckt: „Level 3 Evocation (Sorcerer, Wizard)". */
  readonly gradzeile: Paar;
  /** 0 fuer Zaubertricks. */
  readonly grad: number;
  readonly schule: Zauberschule;
  readonly klassen: readonly Zauberklasse[];
  readonly konzentration: boolean;
  readonly ritual: boolean;
  readonly eigenschaften: { readonly de: Zaubereigenschaften; readonly en: Zaubereigenschaften };
  readonly bloecke: { readonly de: readonly Zauberblock[]; readonly en: readonly Zauberblock[] };
}

export const ZAUBER: readonly Zauber[] = '''


if __name__ == '__main__':
    d = json.load(open(sys.argv[1], encoding='utf8'))
    fehler = pruefe(d)
    if fehler:
        raise SystemExit('Pruefung gescheitert:\n' + '\n'.join(fehler))
    D = {z['name']: z for z in d['de']}
    heraus = []
    for e in d['en']:
        g = D[d['paare'][e['name']]]
        heraus.append({
            'id': kennung(e['name']),
            'name': {'de': g['name'], 'en': e['name']},
            'gradzeile': {'de': g['gradzeile'], 'en': e['gradzeile']},
            'grad': e['grad'],
            'schule': e['schule'],
            'klassen': e['klassen'],
            'konzentration': bool(re.search(r'Concentration', e['eigenschaften']['dauer'])),
            'ritual': bool(re.search(r'Ritual', e['eigenschaften']['zeit'])),
            'eigenschaften': {'de': {k: g['eigenschaften'][k] for k in EIGENSCHAFTEN},
                              'en': {k: e['eigenschaften'][k] for k in EIGENSCHAFTEN}},
            'bloecke': {'de': [ohne_intern(b) for b in g['bloecke']],
                        'en': [ohne_intern(b) for b in e['bloecke']]},
        })
    ids = [x['id'] for x in heraus]
    if len(set(ids)) != len(ids):
        raise SystemExit('Kennung doppelt')
    heraus.sort(key=lambda x: x['id'])
    with open(ZIEL, 'w', encoding='utf8') as f:
        f.write(KOPF + json.dumps(heraus, ensure_ascii=False, indent=1) + ';\n')
    print(len(heraus), 'Zauber geschrieben')
