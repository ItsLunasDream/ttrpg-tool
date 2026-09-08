import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { parseDiceExpression, rollDie, rollExpression, rollD20, InvalidDiceExpressionError } = entry;

/** Liefert einen deterministischen RNG, der die uebergebenen [0,1)-Werte der Reihe nach zurueckgibt. */
function fakeRng(values) {
  let i = 0;
  return () => {
    if (i >= values.length) {
      throw new Error('fakeRng: keine Werte mehr uebrig');
    }
    return values[i++];
  };
}

test('parseDiceExpression liest Anzahl, Seiten und Modifikator', () => {
  assert.deepEqual(parseDiceExpression('2d6+3'), { count: 2, sides: 6, modifier: 3 });
  assert.deepEqual(parseDiceExpression('4d6-1'), { count: 4, sides: 6, modifier: -1 });
});

test('parseDiceExpression laesst die Anzahl weg, Standard ist 1', () => {
  assert.deepEqual(parseDiceExpression('d20'), { count: 1, sides: 20, modifier: 0 });
});

test('parseDiceExpression akzeptiert Leerzeichen um den Modifikator', () => {
  assert.deepEqual(parseDiceExpression('1d8 + 2'), { count: 1, sides: 8, modifier: 2 });
});

test('parseDiceExpression lehnt unbekannte Ausdruecke ab', () => {
  assert.throws(() => parseDiceExpression('hoch2'), InvalidDiceExpressionError);
  assert.throws(() => parseDiceExpression('2d1'), InvalidDiceExpressionError);
  assert.throws(() => parseDiceExpression('0d6'), InvalidDiceExpressionError);
  assert.throws(() => parseDiceExpression(''), InvalidDiceExpressionError);
});

test('rollDie bildet [0,1) linear auf 1..Seiten ab', () => {
  assert.equal(rollDie(6, fakeRng([0])), 1);
  assert.equal(rollDie(6, fakeRng([0.999999])), 6);
  assert.equal(rollDie(20, fakeRng([0.5])), 11);
});

test('rollExpression summiert Einzelwuerfe und Modifikator', () => {
  // 2d6+3 mit Wuerfen 3 und 5 (Werte 0.4 -> 3, 0.75 -> 5 bei 6 Seiten)
  const result = rollExpression('2d6+3', fakeRng([0.4, 0.75]));
  assert.deepEqual(result.rolls, [3, 5]);
  assert.equal(result.modifier, 3);
  assert.equal(result.total, 11);
  assert.equal(result.expression, '2d6+3');
});

test('rollExpression ohne Modifikator', () => {
  const result = rollExpression('d20', fakeRng([0]));
  assert.deepEqual(result.rolls, [1]);
  assert.equal(result.modifier, 0);
  assert.equal(result.total, 1);
});

test('rollD20 ohne Modus wirft genau einmal', () => {
  const result = rollD20(undefined, fakeRng([0.5]));
  assert.deepEqual(result.rolls, [11]);
  assert.equal(result.total, 11);
  assert.equal(result.expression, '1d20');
});

test('rollD20 mit Vorteil waehlt den hoeheren Wurf', () => {
  const result = rollD20('advantage', fakeRng([0.2, 0.8])); // 5 und 17
  assert.deepEqual(result.rolls, [5, 17]);
  assert.equal(result.total, 17);
  assert.match(result.expression, /Vorteil/);
});

test('rollD20 mit Nachteil waehlt den niedrigeren Wurf', () => {
  const result = rollD20('disadvantage', fakeRng([0.2, 0.8])); // 5 und 17
  assert.deepEqual(result.rolls, [5, 17]);
  assert.equal(result.total, 5);
  assert.match(result.expression, /Nachteil/);
});

test('ohne injizierten RNG ist das Ergebnis trotzdem gueltig', () => {
  const result = rollExpression('3d6+1');
  assert.equal(result.rolls.length, 3);
  for (const roll of result.rolls) {
    assert.ok(roll >= 1 && roll <= 6);
  }
  assert.equal(result.total, result.rolls.reduce((a, b) => a + b, 0) + 1);
});
