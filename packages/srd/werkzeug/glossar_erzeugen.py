"""
Erzeugt src/glossar.ts aus der Auslese beider Glossare und der geprueften
Paarliste.

Bricht ab, wenn glossar_pruefen.py auch nur einen Widerspruch findet: ein
falsches Paar zeigte unter dem deutschen Namen die Regel eines anderen
Eintrags.

Aufruf:  python3 werkzeug/glossar_erzeugen.py [glossar.json]
         ohne Argument wird zuerst ausgelesen (etwa eine Minute).
"""
import json
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
ZIEL = os.path.join(HIER, '..', 'src', 'glossar.ts')

import glossar_pruefen  # noqa: E402


def kennung(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def paar(de, en):
    return {'de': de, 'en': en}


def block(be, bd):
    if be['typ'] == 'tabelle':
        return {'typ': 'tabelle', 'titel': paar(bd['titel'], be['titel']),
                'kopf': paar(bd['kopf'], be['kopf']), 'reihen': paar(bd['reihen'], be['reihen'])}
    if be['typ'] == 'liste':
        return {'typ': 'liste', 'titel': paar(bd['titel'], be['titel']),
                'eintraege': paar(bd['eintraege'], be['eintraege'])}
    return {'typ': be['typ'], 'text': paar(bd['text'], be['text'])}


def erzeuge(g, p):
    fehler = glossar_pruefen.pruefe(g, p)
    if fehler:
        raise SystemExit('Die Paare widersprechen sich:\n' + '\n'.join(fehler))
    de = {e['name']: e for e in g['de']}
    heraus = []
    for e in g['en']:
        d = de[p[e['name']]]
        text = ' '.join(glossar_pruefen.texte(e))
        verweise = [kennung(glossar_pruefen.VERWEISNAMEN_EN.get(v, v))
                    for v in glossar_pruefen.verweise(text, 'en')
                    if glossar_pruefen.VERWEISNAMEN_EN.get(v, v) in p
                    and v not in glossar_pruefen.KAPITEL]
        heraus.append({
            'id': kennung(e['name']),
            'name': paar(d['name'], e['name']),
            'tag': e['tag'],
            'bloecke': [block(be, bd) for be, bd in zip(e['bloecke'], d['bloecke'])],
            'verweise': verweise,
        })
    ids = [x['id'] for x in heraus]
    if len(set(ids)) != len(ids):
        raise SystemExit('Kennung doppelt')
    return heraus


KOPF = '''/**
 * Das Regelglossar des SRD 5.2.1, alle Eintraege, woertlich und in beiden
 * Sprachen.
 *
 * DIESE DATEI IST ERZEUGT (werkzeug/glossar_erzeugen.py) und wird nicht von
 * Hand gepflegt. Welcher englische Eintrag welcher deutsche ist, steht in
 * werkzeug/glossar_paare.json und wird von werkzeug/glossar_pruefen.py
 * gegen Aufbau, Wuerfel, SG und Verweise geprueft. Drei offensichtliche
 * Satzfehler des Originals sind korrigiert; welche, steht in
 * werkzeug/glossar_lesen.py (KORREKTUREN).
 */
import type { Paar } from './namensnennung';

export type Glossarblock =
  | { readonly typ: 'absatz' | 'punkt' | 'stichpunkt'; readonly text: Paar }
  | {
      readonly typ: 'tabelle';
      readonly titel: Paar;
      readonly kopf: { readonly de: readonly string[]; readonly en: readonly string[] };
      readonly reihen: {
        readonly de: readonly (readonly string[])[];
        readonly en: readonly (readonly string[])[];
      };
    }
  | {
      readonly typ: 'liste';
      readonly titel: Paar;
      readonly eintraege: { readonly de: readonly string[]; readonly en: readonly string[] };
    };

export interface Glossareintrag {
  /** Aus dem englischen Namen: „difficult-terrain". */
  readonly id: string;
  readonly name: Paar;
  /** Das Schlagwort hinter dem Namen: zustand, aktion, gefahr, haltung, wirkungsbereich. */
  readonly tag: string | null;
  readonly bloecke: readonly Glossarblock[];
  /** Die Kennungen der Eintraege, auf die „See also" zeigt. */
  readonly verweise: readonly string[];
}
'''


if __name__ == '__main__':
    if len(sys.argv) > 1:
        g = json.load(open(sys.argv[1], encoding='utf8'))
    else:
        import glossar_lesen
        g = {s: glossar_lesen.lies(s) for s in glossar_lesen.QUELLEN}
    eintraege = erzeuge(g, glossar_pruefen.lade_paare())
    with open(ZIEL, 'w', encoding='utf8') as f:
        f.write(KOPF)
        f.write('\nexport const GLOSSAR: readonly Glossareintrag[] = ')
        f.write(json.dumps(eintraege, ensure_ascii=False, indent=1))
        f.write(' as readonly Glossareintrag[];\n')
    print(len(eintraege), 'Eintraege geschrieben')
