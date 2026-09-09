// Sammelpunkt fuer die Tests: buendelt das Quellmodul, damit node --test
// gegen ein fertiges CommonJS-Bundle laufen kann. Gleiches Vorgehen wie in
// packages/dice/tests/entry.ts.
export { DAUER, KURVEN, cssKurve, dauerFuer, bezier } from '../src/index';
