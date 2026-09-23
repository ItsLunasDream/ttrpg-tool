"""
Erzeugt src/ausruestung.ts aus der Auslese (ausruestung_lesen.py).

Bricht ab, wenn eine Pruefung scheitert: jeder Eintrag genau einmal
gepaart, dieselbe Folge der Blockarten in beiden Sprachen, dieselbe Form
jeder Tabelle, kein weiches Trennzeichen, keine leere Zelle in der ersten
Spalte einer Tabelle.

Aufruf (aus packages/srd):  python3 werkzeug/ausruestung_erzeugen.py <ausruestung.json>
"""
import json
import os
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.join(HIER, '..', 'src', 'ausruestung.ts')
sys.path.insert(0, HIER)
from gegenstaende_erzeugen import form, texte, ohne_intern, kennung  # noqa: E402
from ausruestung_lesen import ABSCHNITTE  # noqa: E402


def pruefe(d):
    fehler = []
    E = {z['schluessel']: z for z in d['en']}
    D = {z['schluessel']: z for z in d['de']}
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
            if not z['bloecke']:
                fehler.append(f'leer: {z["name"]}')
            alles = [z['name'], *(t for blk in z['bloecke'] for t in texte(blk))]
            if any('­' in t for t in alles):
                fehler.append(f'weiches Trennzeichen in {z["name"]}')
            for blk in z['bloecke']:
                if blk['typ'] == 'tabelle' and any(not r[0] for r in blk['reihen']):
                    fehler.append(f'leere erste Zelle in {z["name"]}: {blk["titel"]}')
    return fehler


KOPF = '''/**
 * Das Kapitel Ausruestung des SRD 5.2.1: Muenzen, Waffen mit Eigenschaften
 * und Meisterschaften, Ruestung, Werkzeug, Abenteuerausruestung, Reittiere
 * und Fahrzeuge, Lebenshaltung, Dienste, magische Gegenstaende im
 * Allgemeinen und das Herstellen. Woertlich und in beiden Sprachen.
 *
 * DIESE DATEI IST ERZEUGT (werkzeug/ausruestung_lesen.py und
 * werkzeug/ausruestung_erzeugen.py) und wird nicht von Hand gepflegt.
 * Gepaart ueber Abschnitt, Preis, Tabellenform und die Zahlen im Text; der
 * Rest steht von Hand in werkzeug/ausruestung_paare.json, gegen Abschnitt,
 * Preis und Tabellenform geprueft. Die Eintraege stehen in der Folge des
 * Kapitels.
 */
import type { Paar } from './namensnennung';
import type { Gegenstandsblock } from './magische-gegenstaende';

export type Ausruestungsblock = Gegenstandsblock;

export interface Ausruestung {
  /** Aus dem englischen Namen: „alchemist-s-fire-50-gp". */
  readonly id: string;
  readonly name: Paar;
  /** Der Abschnitt des Kapitels: „Weapons" / „Waffen". */
  readonly abschnitt: Paar;
  /** Ein Infokasten („Selling Equipment"), kein Eintrag des Fliesstexts. */
  readonly kasten?: true;
  readonly bloecke: { readonly de: readonly Ausruestungsblock[]; readonly en: readonly Ausruestungsblock[] };
}

export const AUSRUESTUNG: readonly Ausruestung[] = '''


if __name__ == '__main__':
    d = json.load(open(sys.argv[1], encoding='utf8'))
    fehler = pruefe(d)
    if fehler:
        raise SystemExit('Pruefung gescheitert:\n' + '\n'.join(fehler))
    D = {z['schluessel']: z for z in d['de']}
    heraus = []
    for e in d['en']:
        g = D[d['paare'][e['schluessel']]]
        i = ABSCHNITTE['en'].index(e['abschnitt'])
        x = {
            'id': kennung(e['schluessel']),
            'name': {'de': g['name'], 'en': e['name']},
            'abschnitt': {'de': ABSCHNITTE['de'][i], 'en': ABSCHNITTE['en'][i]},
        }
        if e.get('kasten'):
            x['kasten'] = True
        x['bloecke'] = {'de': [ohne_intern(b) for b in g['bloecke']],
                        'en': [ohne_intern(b) for b in e['bloecke']]}
        heraus.append(x)
    ids = [x['id'] for x in heraus]
    if len(set(ids)) != len(ids):
        raise SystemExit('Kennung doppelt')
    with open(ZIEL, 'w', encoding='utf8') as f:
        f.write(KOPF + json.dumps(heraus, ensure_ascii=False, indent=1) + ';\n')
    print(len(heraus), 'Eintraege geschrieben')
