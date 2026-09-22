"""
Prueft die Paarliste des Glossars gegen beide Sprachfassungen.

WARUM EINE LISTE UND KEIN ALGORITHMUS
=====================================
Beide Glossare sind alphabetisch, jedes in seiner Sprache; die Reihenfolge
hilft nicht. Ein Versuch, die Paare aus Aufbau, Wuerfeln und Verweisen zu
errechnen, fand nur ein Dutzend eindeutig — zu viele Eintraege sind kurze
Absaetze ohne jedes Merkmal („Ally", „Enemy", „Per Day").

Die Paare stehen deshalb in glossar_paare.json, von Hand zugeordnet. Von
Hand heisst hier nicht ungeprueft: dieses Skript prueft jedes Paar auf
alles, was eine Uebersetzung nicht aendert, und bricht beim ersten
Widerspruch ab.

  - vollstaendig und eindeutig: jeder Eintrag beider Sprachen genau einmal
  - dasselbe Schlagwort (Zustand, Aktion, …)
  - derselbe Aufbau: Absaetze, Unterpunkte, Stichpunkte, Tabellen, Listen
  - Tabellen mit derselben Zahl Spalten und Reihen, Listen gleich lang
  - dieselben Wuerfel (1d6 = 1W6) und Schwierigkeitsgrade (DC 15 = SG 15)
  - „See also" zeigt auf die Paare von „Siehe auch"
  - Listen, die Eintragsnamen nennen, nennen die gepaarten Namen
  - keine Reste der Auslese: weiche Trennstriche, Seitenkoepfe, leere Bloecke

Aufruf:  python3 werkzeug/glossar_pruefen.py <glossar.json>
"""
import json
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))


def aufbau(e):
    kurz = {'absatz': 'A', 'punkt': 'P', 'stichpunkt': 'S', 'tabelle': 'T', 'liste': 'L'}
    return ''.join(kurz[b['typ']] for b in e['bloecke'])


def texte(e):
    """Jeder Text eines Eintrags, auch der in Tabellen und Listen."""
    for b in e['bloecke']:
        if 'text' in b:
            yield b['text']
        if b.get('titel'):
            yield b['titel']
        yield from b.get('kopf', [])
        for r in b.get('reihen', []):
            yield from r
        yield from b.get('eintraege', [])


def wuerfel(t):
    return sorted(m.lower().replace('w', 'd') for m in re.findall(r'\d+[dDwW]\d+', t))


def grade(t):
    # Deutsch schreibt „SG‑15‑Stärkewurf" mit geschuetztem Bindestrich.
    return sorted(re.findall(r'(?:DC|SG)[\s‑-]*(\d+)', t))


def verweise(t, sprache):
    """Die Ziele von „See also" / „Siehe auch".

    Das Englische setzt Satzzeichen in die Anfuehrung („“Encounter.”"),
    das Deutsche dahinter; sie gehoeren nicht zum Namen.
    """
    if sprache == 'en':
        m = re.search(r'See also\s+(.*)$', t)
        ziele = re.findall(r'“([^”]+)”', m.group(1)) if m else []
    else:
        m = re.search(r'Siehe auch\s+(.*)$', t)
        ziele = re.findall(r'„([^“]+)“', m.group(1)) if m else []
    return [z.rstrip('.,;') for z in ziele]


# ANDERS GENANNT, im Dokument selbst.
# Die deutsche Liste der Aktionen nennt „Magie wirken", der Eintrag heisst
# „Magie"; die Liste der Zustaende nennt „Erschöpft", der Eintrag heisst
# „Erschöpfung". Beides steht so im Original und bleibt so im Text —
# diese Liste sagt nur, welcher Eintrag gemeint ist.
LISTENNAMEN = {'Magie wirken': 'Magie', 'Erschöpft': 'Erschöpfung'}

# Verweise auf KAPITEL des Dokuments, nicht auf Eintraege des Glossars.
# Einige tragen denselben Namen wie ein deutscher Eintrag („Zauber",
# „Monster") — darum hier ausdruecklich, statt am Namen geraten.
KAPITEL = {
    'Playing the Game': 'Die Spielregeln', 'D20 Tests': 'W20‑Prüfungen',
    'The Six Abilities': 'Die sechs Attribute', 'Actions': 'Aktionen',
    'Character Creation': 'Charaktererstellung',
    'Create Your Character': 'Deinen Charakter erstellen',
    'Equipment': 'Ausrüstung', 'Armor': 'Rüstung', 'Weapons': 'Waffen',
    'Magic Items': 'Magische Gegenstände', 'Exploration': 'Erkundung',
    'Combat': 'Kampf', 'Damage and Healing': 'Schaden und Heilung',
    'Social Interaction': 'Soziale Interaktion',
    'Level Advancement': 'Stufenaufstiege', 'Spells': 'Zauber',
    'Casting Spells': 'Zauber wirken', 'Monsters': 'Monster',
}

# Ein Verweis, der den Eintrag anders nennt: „Fliegen" verweist auf
# „Stürzen", der Eintrag heisst „Sturz".
# Und die Abkuerzung: „Monster" verweist auf „NPC" / „NSC".
VERWEISNAMEN = {'Stürzen': 'Sturz', 'NSC': 'Nichtspielercharakter'}
VERWEISNAMEN_EN = {'NPC': 'Nonplayer Character'}


def pruefe(g, p):
    fehler = []
    en = {e['name']: e for e in g['en']}
    de = {e['name']: e for e in g['de']}
    if len(en) != len(g['en']) or len(de) != len(g['de']):
        fehler.append('doppelte Namen in einer Sprache')
    fehler += [f'EN ohne Paar: {n}' for n in en if n not in p]
    fehler += [f'Paar ohne EN-Eintrag: {n}' for n in p if n not in en]
    fehler += [f'Paar ohne DE-Eintrag: {n}' for n in p.values() if n not in de]
    fehler += [f'DE ohne Paar: {n}' for n in de if n not in p.values()]
    if len(set(p.values())) != len(p):
        fehler.append('ein DE-Eintrag ist zweimal gepaart')
    if fehler:
        return fehler

    for n_en, n_de in p.items():
        e, d = en[n_en], de[n_de]
        wo = f'{n_en} / {n_de}'
        if e['tag'] != d['tag']:
            fehler.append(f'{wo}: Schlagwort {e["tag"]} gegen {d["tag"]}')
        if aufbau(e) != aufbau(d):
            fehler.append(f'{wo}: Aufbau {aufbau(e)} gegen {aufbau(d)}')
            continue
        for be, bd in zip(e['bloecke'], d['bloecke']):
            if be['typ'] == 'tabelle':
                fe = (len(be['kopf']), len(be['reihen']))
                fd = (len(bd['kopf']), len(bd['reihen']))
                if fe != fd:
                    fehler.append(f'{wo}: Tabelle {fe} gegen {fd}')
                if any(len(r) != len(be['kopf']) for r in be['reihen'] + bd['reihen']):
                    fehler.append(f'{wo}: Reihe mit falscher Spaltenzahl')
            if be['typ'] == 'liste':
                if len(be['eintraege']) != len(bd['eintraege']):
                    fehler.append(f'{wo}: Liste {len(be["eintraege"])} gegen {len(bd["eintraege"])}')
                # Nennt die Liste Eintraege des Glossars, dann dieselben.
                if all(x in p for x in be['eintraege']):
                    soll = sorted(p[x] for x in be['eintraege'])
                    ist = sorted(LISTENNAMEN.get(x, x) for x in bd['eintraege'])
                    if soll != ist:
                        abw = sorted(set(soll) ^ set(ist))
                        fehler.append(f'{wo}: Liste nennt andere Eintraege: {abw}')
        te, td = ' '.join(texte(e)), ' '.join(texte(d))
        if wuerfel(te) != wuerfel(td):
            fehler.append(f'{wo}: Wuerfel {wuerfel(te)} gegen {wuerfel(td)}')
        if grade(te) != grade(td):
            fehler.append(f'{wo}: SG {grade(te)} gegen {grade(td)}')
        # Jeder Verweis muss auf das Paar zeigen, ob Eintrag oder Kapitel.
        v_e, v_d = verweise(te, 'en'), verweise(td, 'de')
        soll = sorted(KAPITEL.get(v) or p.get(VERWEISNAMEN_EN.get(v, v), f'?{v}') for v in v_e)
        ist = sorted(VERWEISNAMEN.get(v, v) for v in v_d)
        if soll != ist:
            fehler.append(f'{wo}: Verweise {v_e} gegen {v_d}')

    for sprache in ('en', 'de'):
        for e in g[sprache]:
            if not e['bloecke']:
                fehler.append(f'{sprache} {e["name"]}: leer')
            for t in texte(e):
                if '­' in t:
                    fehler.append(f'{sprache} {e["name"]}: weicher Trennstrich in {t[:40]!r}')
                if re.search(r'System Reference Document|Systemreferenzdokument', t):
                    fehler.append(f'{sprache} {e["name"]}: Seitenkopf im Text')
                if '\n' in t:
                    fehler.append(f'{sprache} {e["name"]}: Zeilenumbruch in {t[:40]!r}')
    return fehler


def lade_paare():
    return json.load(open(os.path.join(HIER, 'glossar_paare.json'), encoding='utf8'))


if __name__ == '__main__':
    g = json.load(open(sys.argv[1], encoding='utf8'))
    fehler = pruefe(g, lade_paare())
    for f in fehler:
        print(f)
    print(len(fehler), 'Widersprueche')
    sys.exit(1 if fehler else 0)
