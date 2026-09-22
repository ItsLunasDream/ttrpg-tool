"""
Erzeugt src/magische-gegenstaende.ts aus der Auslese (gegenstaende_text.py).

Bricht ab, wenn eine der Pruefungen scheitert:
- jeder englische Gegenstand hat genau einen deutschen, und umgekehrt;
- beide Fassungen haben dieselben Blockarten in derselben Zahl (die
  Reihenfolge darf abweichen: die deutsche ordnet Unterpunkte nach ihren
  deutschen Namen);
- jede Tabelle hat in beiden Fassungen dieselbe Form (Spalten, Reihen);
- kein weiches Trennzeichen ist im Text geblieben.

Die Bloecke stehen je Sprache, nicht paarweise wie im Glossar — eben wegen
der anderen Reihenfolge.

Aufruf (aus packages/srd):  python3 werkzeug/gegenstaende_erzeugen.py <gtext.json>
"""
import collections
import json
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.join(HIER, '..', 'src', 'magische-gegenstaende.ts')


# Die deutsche Fassung ordnet Unterpunkte nach ihren deutschen Namen. Damit
# beide Sprachen Block fuer Block nebeneinander stehen koennen, wird hier
# ausdruecklich umgeordnet: die Liste nennt, welcher deutsche Block an
# welcher Stelle steht. Danach muss die Folge der Blockarten gleich sein.
UMORDNUNG = {
    # „Golden Lions" steht im Englischen vor „Ivory Goats", im Deutschen
    # „Goldene Löwen" nach „Elfenbein-Ziegen" (mit ihren drei Ziegen).
    'Figurine of Wondrous Power': [0, 1, 2, 3, 8, 4, 5, 6, 7, 9, 10, 11, 12, 13],
}


def kennung(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def form(bloecke):
    return [(b['typ'], len(b.get('kopf', [])), len(b.get('reihen', b.get('eintraege', []))))
            for b in bloecke if b['typ'] in ('tabelle', 'liste')]


def texte(b):
    if b['typ'] == 'tabelle':
        return [b['titel'], *b['kopf'], *(c for r in b['reihen'] for c in r)]
    if b['typ'] == 'liste':
        return [b['titel'], *b['eintraege']]
    return [b['text']]


def pruefe(d):
    fehler = []
    E = {g['name']: g for g in d['en']}
    D = {g['name']: g for g in d['de']}
    p = d['paare']
    if set(p) != set(E) or set(p.values()) != set(D) or len(set(p.values())) != len(p):
        fehler.append('Paarung unvollstaendig oder doppelt')
    for en, de in p.items():
        a, b = E[en]['bloecke'], D[de]['bloecke']
        if collections.Counter(x['typ'] for x in a) != collections.Counter(x['typ'] for x in b):
            fehler.append(f'Blockarten: {en} / {de}')
        if form(a) != form(b):
            fehler.append(f'Tabellenform: {en} {form(a)} / {de} {form(b)}')
        for g in (E[en], D[de]):
            for blk in g['bloecke']:
                if any('­' in t for t in texte(blk)):
                    fehler.append(f'weiches Trennzeichen in {g["name"]}')
    return fehler


def ohne_intern(b):
    return {k: v for k, v in b.items() if k not in ('roh', 'zeilen', 'breit', 'feine_spalten')}


KOPF = '''/**
 * Die magischen Gegenstaende des SRD 5.2.1, alle 258, woertlich und in
 * beiden Sprachen.
 *
 * DIESE DATEI IST ERZEUGT (werkzeug/gegenstaende_text.py und
 * werkzeug/gegenstaende_erzeugen.py) und wird nicht von Hand gepflegt.
 * Welcher englische Gegenstand welcher deutsche ist, steht zum Teil in
 * werkzeug/gegenstaende_paare.json (von Hand, gegen Kategorie, Seltenheit
 * und Einstimmung geprueft). Die Bloecke stehen je Sprache, in derselben
 * Folge: Block i der einen Sprache ist Block i der anderen.
 */
import type { Paar } from './namensnennung';
import type { Seltenheit } from './gegenstaende';

export type Gegenstandsblock =
  | { readonly typ: 'absatz' | 'punkt' | 'stichpunkt'; readonly text: string }
  | {
      readonly typ: 'tabelle';
      readonly titel: string;
      readonly kopf: readonly string[];
      readonly reihen: readonly (readonly string[])[];
    }
  | { readonly typ: 'liste'; readonly titel: string; readonly eintraege: readonly string[] };

export type Gegenstandskategorie =
  | 'wundersam'
  | 'ruestung'
  | 'waffe'
  | 'trank'
  | 'ring'
  | 'zepter'
  | 'schriftrolle'
  | 'stab'
  | 'zauberstab';

export interface MagischerGegenstand {
  /** Aus dem englischen Namen: „bag-of-holding". */
  readonly id: string;
  readonly name: Paar;
  /** Die Zeile unter dem Namen, wie gedruckt: „Wondrous Item, Rare (Requires Attunement)". */
  readonly kopfzeile: Paar;
  readonly kategorie: Gegenstandskategorie;
  /** Mehrere bei „+1, +2 oder +3"; 'varies' und 'artifact' wie gedruckt. */
  readonly seltenheiten: readonly (Seltenheit | 'varies' | 'artifact')[];
  readonly einstimmung: boolean;
  readonly bloecke: { readonly de: readonly Gegenstandsblock[]; readonly en: readonly Gegenstandsblock[] };
}

export const MAGISCHE_GEGENSTAENDE: readonly MagischerGegenstand[] = '''


if __name__ == '__main__':
    d = json.load(open(sys.argv[1], encoding='utf8'))
    fehler = pruefe(d)
    if fehler:
        raise SystemExit('Pruefung gescheitert:\n' + '\n'.join(fehler))
    D = {g['name']: g for g in d['de']}
    heraus = []
    for e in d['en']:
        g = D[d['paare'][e['name']]]
        if e['name'] in UMORDNUNG:
            folge = UMORDNUNG[e['name']]
            if sorted(folge) != list(range(len(g['bloecke']))):
                raise SystemExit(f'Umordnung unvollstaendig: {e["name"]}')
            g = {**g, 'bloecke': [g['bloecke'][i] for i in folge]}
        if [b['typ'] for b in e['bloecke']] != [b['typ'] for b in g['bloecke']]:
            raise SystemExit(f'Blockfolge verschieden: {e["name"]}')
        heraus.append({
            'id': kennung(e['name']),
            'name': {'de': g['name'], 'en': e['name']},
            'kopfzeile': {'de': g['kopfzeile'], 'en': e['kopfzeile']},
            'kategorie': e['kategorie'],
            'seltenheiten': e['seltenheiten'],
            'einstimmung': e['einstimmung'],
            'bloecke': {'de': [ohne_intern(b) for b in g['bloecke']],
                        'en': [ohne_intern(b) for b in e['bloecke']]},
        })
    ids = [x['id'] for x in heraus]
    if len(set(ids)) != len(ids):
        raise SystemExit('Kennung doppelt')
    heraus.sort(key=lambda x: x['id'])
    with open(ZIEL, 'w', encoding='utf8') as f:
        f.write(KOPF + json.dumps(heraus, ensure_ascii=False, indent=1) + ';\n')
    print(len(heraus), 'Gegenstaende geschrieben')
