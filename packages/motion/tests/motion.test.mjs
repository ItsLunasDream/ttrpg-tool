import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import entry from '../dist/tests/entry.cjs';

const { DAUER, KURVEN, cssKurve, dauerFuer, bezier } = entry;

const css = readFileSync(fileURLToPath(new URL('../src/motion.css', import.meta.url)), 'utf8');

/** Liest den Wert einer Custom Property aus dem ersten :root-Block. */
function ausErstemRoot(name) {
  const block = css.slice(css.indexOf(':root'), css.indexOf('}', css.indexOf(':root')));
  const treffer = block.match(new RegExp(`--${name}:\\s*([^;]+);`));
  assert.ok(treffer, `--${name} fehlt in :root`);
  return treffer[1].trim();
}

// Der eigentliche Grund fuer dieses Paket: die Zahlen stehen an zwei Stellen,
// weil CSS und der Hauptprozess beide welche brauchen. Laufen sie auseinander,
// bewegt sich dieselbe Sache in der Huelle anders als in der Anwendung — und
// beides sieht fuer sich richtig aus.
test('CSS und index.ts nennen dieselben Dauern', () => {
  assert.equal(ausErstemRoot('motion-feedback'), `${DAUER.rueckmeldung}ms`);
  assert.equal(ausErstemRoot('motion-state'), `${DAUER.zustand}ms`);
  assert.equal(ausErstemRoot('motion-place'), `${DAUER.ortswechsel}ms`);
  assert.equal(ausErstemRoot('motion-attention'), `${DAUER.aufmerksamkeit}ms`);
});

test('CSS und index.ts nennen dieselben Kurven', () => {
  assert.equal(ausErstemRoot('motion-ease-standard'), cssKurve('standard'));
  assert.equal(ausErstemRoot('motion-ease-enter'), cssKurve('eintritt'));
  assert.equal(ausErstemRoot('motion-ease-exit'), cssKurve('austritt'));
});

test('weniger Bewegung kuerzt die Bewegung, nicht die Farbrueckmeldung', () => {
  const block = css.slice(css.indexOf('prefers-reduced-motion'));
  for (const name of ['motion-feedback', 'motion-state', 'motion-place']) {
    assert.match(block, new RegExp(`--${name}:\\s*0\\.01ms`), `--${name} wird nicht gekuerzt`);
  }
  const bisEnde = block.slice(0, block.indexOf('@keyframes'));
  assert.doesNotMatch(bisEnde, /--motion-attention:/, '--motion-attention darf bleiben');

  assert.equal(dauerFuer('ortswechsel', true), 0.01);
  assert.equal(dauerFuer('ortswechsel', false), DAUER.ortswechsel);
  assert.equal(dauerFuer('aufmerksamkeit', true), DAUER.aufmerksamkeit);
});

// Genau 0 waere naheliegend und falsch: der Browser meldet dann kein
// `transitionend`, und Code, der auf das Ende wartet, wartet ewig.
test('gekuerzte Dauern sind nicht null', () => {
  assert.ok(dauerFuer('zustand', true) > 0);
});

test('bezier faengt bei 0 an und hoert bei 1 auf', () => {
  for (const name of Object.keys(KURVEN)) {
    const f = bezier(name);
    assert.equal(f(0), 0);
    assert.equal(f(1), 1);
    assert.equal(f(-0.5), 0);
    assert.equal(f(2), 1);
  }
});

test('bezier laeuft monoton und ohne Ausreisser', () => {
  for (const name of Object.keys(KURVEN)) {
    const f = bezier(name);
    let vorher = 0;
    for (let i = 1; i <= 100; i++) {
      const y = f(i / 100);
      assert.ok(Number.isFinite(y), `${name} bei ${i}: ${y}`);
      assert.ok(y >= vorher - 1e-9, `${name} laeuft bei ${i} rueckwaerts`);
      assert.ok(y >= -1e-9 && y <= 1 + 1e-9, `${name} bei ${i} ausserhalb [0,1]: ${y}`);
      vorher = y;
    }
  }
});

// Eine Kurve mit waagerechter Tangente in der Mitte: dort wird Newton flach
// und laeuft weg. Der Rueckfall auf Intervallhalbierung muss das auffangen.
// Die drei Kurven des Pakets brauchen ihn nicht — ohne diesen Test waere er
// ungeprueft, und ungeprueft heisst kaputt, sobald jemand eine Kurve ergaenzt.
test('bezier faengt eine waagerechte Tangente ab', () => {
  const f = bezier([1, 0, 0, 1]);
  let vorher = 0;
  for (let i = 1; i <= 100; i++) {
    const y = f(i / 100);
    assert.ok(Number.isFinite(y), `bei ${i}: ${y}`);
    assert.ok(y >= vorher - 1e-9, `laeuft bei ${i} rueckwaerts`);
    vorher = y;
  }
  assert.ok(Math.abs(f(0.5) - 0.5) < 1e-3, `${f(0.5)}`);
});

// Gegenprobe von der anderen Seite: die Kurve laesst sich parametrisch
// ausrechnen (t hinein, x und y heraus). Was `bezier` zu diesem x liefert,
// muss dieses y sein. Damit prueft der Test nicht die Umkehrung gegen sich
// selbst, sondern gegen die Definition.
test('bezier stimmt mit der parametrischen Kurve ueberein', () => {
  const bernstein = (t, a, b) => {
    const u = 1 - t;
    return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
  };
  for (const [name, [x1, y1, x2, y2]] of Object.entries(KURVEN)) {
    const f = bezier(name);
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = bernstein(t, x1, x2);
      const y = bernstein(t, y1, y2);
      assert.ok(Math.abs(f(x) - y) < 1e-4, `${name} bei t=${t}: ${f(x)} statt ${y}`);
    }
  }
});

// Die Standardkurve laeuft langsam an und laeuft lang aus — das ist ihr Zweck.
// (Sie ist nicht symmetrisch: bei der Haelfte der Zeit sind drei Viertel des
// Weges getan.)
test('die Standardkurve laeuft langsam an und lang aus', () => {
  const f = bezier('standard');
  assert.ok(f(0.1) < 0.1, `${f(0.1)}`);
  assert.ok(f(0.5) > 0.7, `${f(0.5)}`);
  assert.ok(f(0.9) > 0.98 && f(0.9) < 1, `${f(0.9)}`);
});
