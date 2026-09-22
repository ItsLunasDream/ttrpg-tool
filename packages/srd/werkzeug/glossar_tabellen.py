"""
Baut die Tabellen des Glossars nach Zeilen und Spalten auf.

WARUM EIN EIGENER SCHRITT
=========================
Die Textauslese in glossar_lesen.py liefert Tabellen als lose Zeilen, und
die ZELLEN verschwimmen darin: „Geschichte Historische Ereignisse" ist eine
Zeile aus zwei Zellen, und im Deutschen kommt bei zweizeiligen Zellen die
Reihenfolge durcheinander („Arkane", „Kunde", dann erst der Text daneben).

Verlaesslich ist die LAGE der Woerter. pdfplumber liefert jedes Wort mit
seinem Ort, und daraus ergibt sich:

  Zelle   Woerter einer Zeile, zwischen denen kein breiter Abstand ist.
  Spalte  die linke Kante einer Zelle; gleiche Kanten sind eine Spalte.
  Reihe   ein groesserer Abstand nach unten als zwischen zwei Zeilen
          einer Zelle — oder, wo alle Abstaende gleich sind, eine Zeile,
          die in der ersten Spalte etwas hat.

Eine Tabelle ohne Kopfzeile ist im Dokument eine LISTE (die Aktionen, die
Zustaende, die Kreaturentypen): Sie wird als Liste von Eintraegen
zurueckgegeben, nicht als einspaltige Tabelle.

Der Text der Zellen wird nicht veraendert, nur zugeordnet. Die Pruefung
in glossar_pruefen.py vergleicht deshalb die Woerter einer gebauten
Tabelle mit denen der Textauslese: dieselben Woerter, dieselbe Zahl.
"""
import pdfplumber

# Ein Abstand zwischen zwei Woertern einer Zeile ab dem es eine neue
# Zelle ist. Wortabstaende liegen bei 3 bis 4 Punkt, Zellabstaende ab 12.
ZELLABSTAND = 8
# Zwei Woerter gehoeren zur selben Zeile, wenn ihre Grundlinien so nah
# beieinander liegen.
ZEILENTOLERANZ = 2.5

_offen = {}


def _pdf(datei):
    if datei not in _offen:
        _offen[datei] = pdfplumber.open(datei)
    return _offen[datei]


def _woerter(datei, roh, breit=False):
    """Die Woerter der Tabelle, gesammelt ueber die Orte ihrer Zeilen.

    Eine Tabelle kann ueber eine Spalte oder Seite umbrechen. Deshalb
    wird je (Seite, Satzspalte) gesammelt, in der Reihenfolge, in der die
    Textauslese die Zeilen fand.
    """
    abschnitte = []
    for z in roh:
        seite = z['seite']
        # Eine seitenbreite Tabelle (bei den magischen Gegenstaenden) liegt
        # ueber beiden Satzspalten; dann zaehlt nur die Seite.
        spalte = 2 if breit else (0 if z['x'] < 300 else 1)
        if not abschnitte or abschnitte[-1]['ort'] != (seite, spalte):
            abschnitte.append({'ort': (seite, spalte), 'y': []})
        abschnitte[-1]['y'].append(z['y'])
    alle = []
    for a in abschnitte:
        seite, spalte = a['ort']
        p = _pdf(datei).pages[seite]
        hoch, tief = max(a['y']) + 4, min(a['y']) - 4
        links, rechts = {0: (0, 300), 1: (300, p.width), 2: (0, p.width)}[spalte]
        stueck = []
        for w in p.extract_words(extra_attrs=['fontname']):
            if 'GillSans' not in w['fontname']:
                continue
            # pdfplumber misst von oben, die Textauslese von unten.
            y = p.height - w['bottom']
            if not (tief <= y <= hoch and links <= w['x0'] < rechts):
                continue
            stueck.append({'x0': w['x0'], 'x1': w['x1'], 'y': y,
                           'text': w['text'],
                           'kopf': 'SemiBold' in w['fontname']})
        alle.append(stueck)
    return alle


def _zeilen(woerter):
    woerter = sorted(woerter, key=lambda w: (-w['y'], w['x0']))
    zeilen = []
    for w in woerter:
        if zeilen and abs(zeilen[-1]['y'] - w['y']) <= ZEILENTOLERANZ:
            zeilen[-1]['w'].append(w)
        else:
            zeilen.append({'y': w['y'], 'w': [w]})
    for z in zeilen:
        z['w'].sort(key=lambda w: w['x0'])
        zellen = []
        for w in z['w']:
            if zellen and w['x0'] - zellen[-1]['x1'] < ZELLABSTAND:
                zellen[-1]['text'] += ' ' + w['text']
                zellen[-1]['x1'] = w['x1']
            else:
                zellen.append({'x0': w['x0'], 'x1': w['x1'], 'text': w['text']})
        z['zellen'] = zellen
        z['kopf'] = all(w['kopf'] for w in z['w'])
    return zeilen


def _spalte_von(kanten, x):
    """Die Spalte, deren linke Kante am naechsten links von x liegt.

    Sechs Punkt Spiel, weil Zahlen in manchen Spalten etwas eingerueckt
    stehen.
    """
    beste = 0
    for i, k in enumerate(kanten):
        if x >= k - 6:
            beste = i
    return beste


def _verteile(kanten, zeile):
    """Die Woerter einer Zeile auf die Spalten.

    Nach WORT und nicht nach Zelle: „Gigantisch 256 Liter" steht so eng,
    dass der Abstand allein keine zwei Zellen erkennt. Die Kante der
    Spalte dagegen ist eindeutig — ein Wort, das an ihr anfaengt, gehoert
    in sie.
    """
    zellen = [[] for _ in kanten]
    for w in zeile['w']:
        zellen[_spalte_von(kanten, w['x0'])].append(w['text'])
    return [' '.join(z) for z in zellen]


def _feine_kanten(kanten, kopfzeilen, rumpf):
    """Spalten aus den Luecken im Rumpf, wo der Kopf sie nicht zeigt.

    „1W100 Effekt" steht so eng, dass der Abstand im Kopf keine zwei Zellen
    zeigt, und mehrzeilige Koepfe („HP / Regained") haben Woerter an
    Stellen, die keine Spalte sind. Verlaesslich ist der Rumpf: zwischen
    zwei Spalten gibt es einen senkrechten Streifen, den in KEINER Zeile ein
    Wort beruehrt. Ein Wortabstand ist schmaler als 6 Punkt; ein solcher
    Streifen ist breiter.

    Nur fuer die magischen Gegenstaende; das Glossar bleibt, wie es geprueft ist.
    """
    woerter = [w for z in rumpf for w in z['w']]
    if len(rumpf) < 2 or not woerter:
        return kanten
    links = min(w['x0'] for w in woerter)
    rechts = max(w['x1'] for w in woerter)
    bedeckt = [False] * (int(rechts - links) + 2)
    for w in woerter:
        for x in range(int(w['x0'] - links), int(w['x1'] - links) + 1):
            bedeckt[x] = True
    neu = [links]
    frei = 0
    for x, b in enumerate(bedeckt):
        if not b:
            frei += 1
        else:
            if frei >= 6 and x > 0:
                neu.append(links + x - 0.5)
            frei = 0
    return neu if len(neu) >= 2 else kanten


def _verteile_kopf(kanten, zeile):
    """Die Woerter einer Kopfzeile auf die Spalten, wenn die Kanten aus dem
    Rumpf stammen. Koepfe stehen nicht immer genau ueber ihrer Spalte;
    Woerter bleiben deshalb zusammen, bis zwischen zweien eine Kante liegt,
    und eine Gruppe geht an die Kante, die ihrem Anfang am naechsten ist."""
    gruppen = []
    for w in zeile['w']:
        if gruppen and not any(gruppen[-1]['x1'] < k <= w['x1'] for k in kanten[1:]):
            gruppen[-1]['text'] += ' ' + w['text']
            gruppen[-1]['x1'] = w['x1']
        else:
            gruppen.append({'x0': w['x0'], 'x1': w['x1'], 'text': w['text']})
    zellen = [''] * len(kanten)
    for g in gruppen:
        i = min(range(len(kanten)), key=lambda n: abs(kanten[n] - g['x0']))
        zellen[i] = (zellen[i] + ' ' + g['text']).strip()
    return zellen


def _abschnitt(zeilen, kopftext):
    """Kopf und Reihen EINES Abschnitts (Seite und Satzspalte).

    Bricht eine Tabelle in die naechste Satzspalte um, wiederholt das
    englische Dokument dort den Kopf, das deutsche nicht. Ein wiederholter
    Kopf wird erkannt und weggelassen; ohne ihn liegen die Kanten um so
    viel verschoben wie der ganze Abschnitt.
    """
    kopfzeilen = []
    while zeilen and zeilen[0]['kopf']:
        kopfzeilen.append(zeilen.pop(0))
    return kopfzeilen, zeilen


def baue(datei, tabelle, glaetten):
    """Ersetzt die losen Zeilen durch Kopf und Reihen, oder eine Liste.

    `glaetten` ist die Zeilenaufloesung aus glossar_lesen.py; sie kommt
    als Argument, damit die beiden Dateien einander nicht importieren.
    """
    abschnitte = []
    for stueck in _woerter(datei, tabelle['roh'], tabelle.get('breit', False)):
        zeilen = [z for z in _zeilen(stueck)
                  if ' '.join(c['text'] for c in z['zellen']) != tabelle['titel']]
        if zeilen:
            abschnitte.append(zeilen)
    if not abschnitte:
        raise ValueError(f'leere Tabelle {tabelle["titel"]!r}')

    if not abschnitte[0][0]['kopf']:
        # Eine Liste. Im Dokument steht sie in mehreren Spalten, und gelesen
        # wird sie spaltenweise — so ist sie alphabetisch. Aufzaehlungs-
        # punkte fassen ihre Folgezeilen zusammen.
        eintraege = []
        for zeilen in abschnitte:
            zellen = [(c['x0'], -z['y'], c['text']) for z in zeilen for c in z['zellen']]
            kanten = sorted({round(x) for x, _, _ in zellen})
            gruppen = []
            for k in kanten:
                if not gruppen or k - gruppen[-1] > 6:
                    gruppen.append(k)
            if any(t.startswith('•') for _, _, t in zellen):
                # Aufzaehlungen stehen einspaltig, und ihre Folgezeilen
                # sind eingerueckt — eine Spalte waere hier falsch erkannt.
                zellen.sort(key=lambda c: c[1])
            else:
                zellen.sort(key=lambda c: (_spalte_von(gruppen, c[0]), c[1]))
            for _, _, t in zellen:
                if eintraege and eintraege[-1].startswith('•') and not t.startswith('•'):
                    eintraege[-1] += '\n' + t
                else:
                    eintraege.append(t)
        return {'typ': 'liste', 'titel': glaetten(tabelle['titel']),
                'eintraege': [glaetten(e.lstrip('•').strip()) for e in eintraege]}

    kopf = None
    reihen = []
    for zeilen in abschnitte:
        kopfzeilen, rumpf = _abschnitt(list(zeilen), kopf)
        if kopfzeilen:
            breiteste = max(kopfzeilen, key=lambda z: len(z['zellen']))
            kanten = [c['x0'] for c in breiteste['zellen']]
            if tabelle.get('feine_spalten'):
                kanten = _feine_kanten(kanten, kopfzeilen, rumpf)
            spalten = [[] for _ in kanten]
            verteile = _verteile_kopf if tabelle.get('feine_spalten') else _verteile
            for z in kopfzeilen:
                for i, t in enumerate(verteile(kanten, z)):
                    if t:
                        spalten[i].append(t)
            neu = [glaetten('\n'.join(t)) for t in spalten]
            if kopf is not None and neu != kopf:
                raise ValueError(f'anderer Kopf im Umbruch: {neu} statt {kopf}')
            kopf = neu
        elif kopf is None:
            raise ValueError(f'Tabelle ohne Kopf: {tabelle["titel"]!r}')
        else:
            # Ohne wiederholten Kopf: dieselben Kanten, verschoben.
            versatz = min(w['x0'] for z in rumpf for w in z['w']) - kanten[0]
            kanten = [k + versatz for k in kanten]

        abstaende = [a['y'] - b['y'] for a, b in zip(rumpf, rumpf[1:])]
        grund = min(abstaende) if abstaende else 0
        mit_luecken = any(d > grund * 1.1 for d in abstaende)
        vorige = None
        for z in rumpf:
            teile = _verteile(kanten, z)
            neu = (vorige is None
                   or (mit_luecken and vorige['y'] - z['y'] > grund * 1.1)
                   or (not mit_luecken and bool(teile[0])))
            if neu:
                reihen.append([''] * len(kanten))
            for i, t in enumerate(teile):
                if t:
                    reihen[-1][i] = (reihen[-1][i] + '\n' + t) if reihen[-1][i] else t
            vorige = z
    return {'typ': 'tabelle', 'titel': glaetten(tabelle['titel']), 'kopf': kopf,
            'reihen': [[glaetten(c) for c in r] for r in reihen]}
