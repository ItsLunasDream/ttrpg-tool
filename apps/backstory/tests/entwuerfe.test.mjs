import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { zieheUmbenennungNach, effektiverStand } = entry;

function notiz(id, title, body = '') {
  return { id, title, body, type: 'character', aliases: [], tags: [], fields: {}, relations: [] };
}

test('zieht eine Umbenennung durch die Entwuerfe derselben Kampagne', () => {
  const entwuerfe = new Map([
    ['a', { notiz: notiz('a', 'A', 'Siehe [[Alter Name]] und [[Alter Name|Anzeige]].'), campaignId: 'k1' }]
  ]);
  const danach = zieheUmbenennungNach(entwuerfe, 'k1', 'Alter Name', 'Neuer Name');
  assert.equal(danach.get('a').notiz.body, 'Siehe [[Neuer Name]] und [[Neuer Name|Anzeige]].');
});

// Der Fehler, um dessentwillen es diese Funktion gibt: ohne sie schreibt der
// spaeter gespeicherte Entwurf den alten Namen zurueck und macht den Link tot.
// Auffallen wuerde es niemandem — direkt nach dem Umbenennen sieht alles
// richtig aus.
test('laesst Entwuerfe anderer Kampagnen in Ruhe', () => {
  const entwuerfe = new Map([
    ['a', { notiz: notiz('a', 'A', 'Siehe [[Alter Name]].'), campaignId: 'k2' }]
  ]);
  const danach = zieheUmbenennungNach(entwuerfe, 'k1', 'Alter Name', 'Neuer Name');
  assert.equal(danach.get('a').notiz.body, 'Siehe [[Alter Name]].');
});

test('gibt dieselbe Sammlung zurueck, wenn nichts zu tun war', () => {
  const entwuerfe = new Map([['a', { notiz: notiz('a', 'A', 'ohne Links'), campaignId: 'k1' }]]);
  assert.equal(zieheUmbenennungNach(entwuerfe, 'k1', 'Alt', 'Neu'), entwuerfe);
  assert.equal(zieheUmbenennungNach(entwuerfe, 'k1', 'Gleich', 'Gleich'), entwuerfe);
});

test('der effektive Stand legt Entwuerfe ueber die Platte', () => {
  const platte = [notiz('a', 'Alt A'), notiz('b', 'B')];
  const entwuerfe = new Map([['a', { notiz: notiz('a', 'Neu A'), campaignId: 'k1' }]]);
  const stand = effektiverStand(platte, entwuerfe, 'k1', null);
  assert.equal(stand.find((n) => n.id === 'a').title, 'Neu A');
  assert.equal(stand.find((n) => n.id === 'b').title, 'B');
});

// Die offene Notiz steht nicht im Entwurfsspeicher — dort landet sie erst beim
// Wechsel. Ohne diesen Zweig zeigte die Liste beim Tippen eines neuen Titels
// weiter den alten.
test('der effektive Stand kennt auch die gerade offene Notiz', () => {
  const platte = [notiz('a', 'Alt A')];
  const stand = effektiverStand(platte, new Map(), 'k1', notiz('a', 'Gerade getippt'));
  assert.equal(stand[0].title, 'Gerade getippt');
});

test('Entwuerfe fremder Kampagnen ueberlagern nichts', () => {
  const platte = [notiz('a', 'Alt A')];
  const entwuerfe = new Map([['a', { notiz: notiz('a', 'Aus K2'), campaignId: 'k2' }]]);
  assert.equal(effektiverStand(platte, entwuerfe, 'k1', null)[0].title, 'Alt A');
});

test('ohne Entwuerfe kommt dieselbe Liste zurueck', () => {
  const platte = [notiz('a', 'A')];
  assert.equal(effektiverStand(platte, new Map(), 'k1', null), platte);
});
