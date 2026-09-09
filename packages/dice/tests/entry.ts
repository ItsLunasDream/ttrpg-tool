// Sammelpunkt fuer die Tests: buendelt das Quellmodul, damit node --test
// gegen ein fertiges CommonJS-Bundle laufen kann (Node 20 fuehrt kein
// TypeScript direkt aus). Gleiches Vorgehen wie in apps/backstory/tests/entry.ts.
export {
  parseDiceExpression,
  rollDie,
  rollExpression,
  rollD20,
  InvalidDiceExpressionError
} from '../src/index';
