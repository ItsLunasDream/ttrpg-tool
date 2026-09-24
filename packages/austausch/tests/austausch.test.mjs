import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const A = require('../dist/tests/entry.cjs');

const monster = {
  werkzeug: 'monster',
  kennung: 'ghul',
  name: 'Ghul',
  art: 'Monster',
  inhalt: '---\nid: ghul\nname: Ghul\n---\n# Ghul\n\nKlauen.\n',
  bilder: []
};

test('ein Paket kommt so zurueck, wie es hineinging', () => {
  const paket = {
    version: 1,
    erstellt: '2026-09-23T08:00:00.000Z',
    sendungen: [
      monster,
      {
        werkzeug: 'backstory',
        kennung: 'k1/n1',
        name: 'Der König',
        art: 'Charakter',
        inhalt: 'Text mit Bild ![](assets/a.png)\nzweite Zeile',
        bilder: [{ name: 'assets/a.png', mime: 'image/png', daten: 'A'.repeat(200) + '==' }],
        zusatz: { typ: 'character', typName: 'Charakter' }
      },
      { werkzeug: 'nachschlagewerk', kennung: 'regel/critical-hit', name: 'Critical Hit', art: 'Regel', inhalt: null, bilder: [] }
    ]
  };
  assert.deepEqual(A.lesePaket(A.alsPaket(paket)), paket);
});

test('Zeilen im Inhalt, die wie eine Marke aussehen, bringen das Paket nicht durcheinander', () => {
  const tueckisch = { ...monster, inhalt: '<!-- ttrpg:ende -->\n\\<!-- ttrpg:bild {}\n-->\nEnde' };
  const paket = { version: 1, erstellt: '', sendungen: [tueckisch, monster] };
  assert.deepEqual(A.lesePaket(A.alsPaket(paket)).sendungen, [tueckisch, monster]);
});

test('ein Paket mit Windows-Zeilenenden wird gelesen', () => {
  const text = A.alsPaket({ version: 1, erstellt: '', sendungen: [monster] }).replace(/\n/g, '\r\n');
  assert.equal(A.lesePaket(text).sendungen[0].name, 'Ghul');
});

test('eine fremde oder abgebrochene Datei wird abgelehnt statt halb angenommen', () => {
  assert.throws(() => A.lesePaket('# Nur eine Notiz'), A.PaketFehler);
  const ganz = A.alsPaket({ version: 1, erstellt: '', sendungen: [monster] });
  assert.throws(() => A.lesePaket(ganz.slice(0, ganz.indexOf('<!-- ttrpg:ende'))), /bricht/);
  assert.throws(() => A.lesePaket(ganz.replace('"version":1', '"version":7')), /Fassung/);
  const bild = A.alsPaket({ version: 1, erstellt: '', sendungen: [{ ...monster, bilder: [{ name: 'x.png', mime: 'image/png', daten: 'QUJD' }] }] });
  assert.throws(() => A.lesePaket(bild.replace('QUJD', 'kein base64!')), /Base64/);
});

test('der Grund einer abgelehnten Datei gibt es auch auf Englisch', () => {
  try {
    A.lesePaket('# Nur eine Notiz');
    assert.fail('haette werfen muessen');
  } catch (fehler) {
    assert.equal(fehler.text('de'), 'Keine Paketdatei');
    assert.equal(fehler.text('en'), 'Not a package file');
  }
});

test('freie Kennung, Kopfwert und Bildverweise', () => {
  assert.equal(A.freieKennung('ghul', ['ghul', 'ghul-2']), 'ghul-3');
  assert.equal(A.freieKennung('ork', ['ghul']), 'ork');
  assert.equal(A.setzeKopfwert(monster.inhalt, 'id', 'ghul-2'), monster.inhalt.replace('id: ghul', 'id: ghul-2'));
  assert.match(A.setzeKopfwert(monster.inhalt, 'quelle', 'Tisch: Anna'), /quelle: "Tisch: Anna"\n---/);
  assert.equal(A.setzeKopfwert('ohne Kopf', 'id', 'x'), 'ohne Kopf');
  assert.deepEqual(A.bildverweise('![](assets/a.png) und ![x](assets/b.jpg) und ![](assets/a.png)'), ['assets/a.png', 'assets/b.jpg']);
  assert.equal(A.mimeVon('assets/a.JPG'), 'image/jpeg');
  assert.equal(A.VORGABE_MODUS, 'daneben');
});
