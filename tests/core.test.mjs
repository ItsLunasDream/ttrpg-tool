import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findWikiLinks,
  rewriteWikiLinks,
  parseFrontmatter,
  stringifyFrontmatter,
  countWords,
  markdownToHtml,
  htmlToMarkdown,
  buildIndex,
  backlinksFor,
  unresolvedLinks,
  searchNotes
} from '../dist/tests/entry.mjs';

function note(overrides) {
  return {
    id: overrides.id,
    schemaVersion: 1,
    type: 'character',
    title: overrides.title,
    aliases: overrides.aliases ?? [],
    tags: overrides.tags ?? [],
    fields: overrides.fields ?? {},
    relations: overrides.relations ?? [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    body: overrides.body ?? ''
  };
}

test('findWikiLinks erkennt Ziel und Anzeigetext', () => {
  const links = findWikiLinks('Sie traf [[Mira]] und [[Hafen von Baldurs Tor|den Hafen]].');
  assert.deepEqual(
    links.map((link) => [link.target, link.label]),
    [['Mira', 'Mira'], ['Hafen von Baldurs Tor', 'den Hafen']]
  );
});

test('findWikiLinks ignoriert leere und unvollstaendige Links', () => {
  assert.equal(findWikiLinks('[[]] und [[offen').length, 0);
});

test('rewriteWikiLinks zieht Umbenennungen nach und behaelt Anzeigetexte', () => {
  const before = 'Ein Brief von [[mira]] an [[Mira|die Jägerin]]. [[Toran]] bleibt.';
  const after = rewriteWikiLinks(before, 'Mira', 'Mira Falkenhand');
  assert.equal(after, 'Ein Brief von [[Mira Falkenhand]] an [[Mira Falkenhand|die Jägerin]]. [[Toran]] bleibt.');
});

test('Frontmatter ueberlebt einen Schreib-Lese-Zyklus', () => {
  const data = { id: 'abc', title: 'Mira: die Jägerin', tags: ['Heimat', 'Kapitel 1'], schemaVersion: 1 };
  const body = 'Erste Zeile\n\n[[Toran]] zweite Zeile.';
  const { data: parsed, body: parsedBody } = parseFrontmatter(stringifyFrontmatter(data, body));
  assert.deepEqual(parsed, data);
  assert.equal(parsedBody.trim(), body);
});

test('Frontmatter-Parser haelt Dateien ohne Kopf aus', () => {
  const { data, body } = parseFrontmatter('Nur Text, kein Kopf.');
  assert.deepEqual(data, {});
  assert.equal(body, 'Nur Text, kein Kopf.');
});

test('Markdown-Rundlauf laesst Wiki-Links unversehrt', () => {
  const markdown = '## Kapitel\n\nSie kannte [[Mira]] und **den [[Hafen|Hafen]]**.';
  const roundtrip = htmlToMarkdown(markdownToHtml(markdown));
  assert.match(roundtrip, /\[\[Mira\]\]/);
  assert.match(roundtrip, /\[\[Hafen\|Hafen\]\]/);
  assert.ok(!roundtrip.includes('\\['), 'Turndown darf die Klammern nicht maskieren');
});

test('countWords zaehlt den Anzeigetext, nicht die Syntax', () => {
  assert.equal(countWords('## Titel\n\nSie traf [[Mira Falkenhand|die Jägerin]] am Tor.'), 7);
});

test('Index loest Titel und Aliase unabhaengig von Grossschreibung auf', () => {
  const index = buildIndex([note({ id: '1', title: 'Mira Falkenhand', aliases: ['Die Jägerin'] })]);
  assert.equal(index.byName.get('mira falkenhand')?.id, '1');
  assert.equal(index.byName.get('die jägerin')?.id, '1');
});

test('Index meldet mehrdeutige Namen', () => {
  const index = buildIndex([note({ id: '1', title: 'Mira' }), note({ id: '2', title: 'mira' })]);
  assert.ok(index.ambiguous.has('mira'));
});

test('Backlinks finden Erwaehnungen ueber Aliase', () => {
  const index = buildIndex([
    note({ id: '1', title: 'Mira Falkenhand', aliases: ['Die Jägerin'] }),
    note({ id: '2', title: 'Toran', body: 'Er schuldet [[Die Jägerin]] noch Gold.' })
  ]);
  const backlinks = backlinksFor(index, '1');
  assert.equal(backlinks.length, 1);
  assert.equal(backlinks[0].note.id, '2');
  assert.match(backlinks[0].context, /Gold/);
});

test('unresolvedLinks meldet nur Links ohne Notiz', () => {
  const target = note({ id: '2', title: 'Toran', body: 'Trifft [[Mira]] und [[Tante Ilva]].' });
  const index = buildIndex([note({ id: '1', title: 'Mira' }), target]);
  assert.deepEqual(unresolvedLinks(index, target), ['Tante Ilva']);
});

test('Volltextsuche greift auf Titel, Tags, Felder und Rumpf', () => {
  const index = buildIndex([
    note({ id: '1', title: 'Mira', fields: { species: 'Waldelfe' } }),
    note({ id: '2', title: 'Toran', tags: ['Hafen'] }),
    note({ id: '3', title: 'Ilva', body: 'Ihre Schmiede stand am Wasser.' })
  ]);
  assert.deepEqual(searchNotes(index, 'waldelfe').map((hit) => hit.noteId), ['1']);
  assert.deepEqual(searchNotes(index, 'hafen').map((hit) => hit.noteId), ['2']);
  assert.deepEqual(searchNotes(index, 'schmiede').map((hit) => hit.noteId), ['3']);
});
