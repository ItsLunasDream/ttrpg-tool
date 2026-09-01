import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const {findWikiLinks, rewriteWikiLinks, parseFrontmatter, stringifyFrontmatter, countWords, markdownToHtml, htmlToMarkdown, buildIndex, backlinksFor, unresolvedLinks, searchNotes, findOccurrences, textPreview, stripMarkdown, DEFAULT_NOTE_TYPES, findNoteType, fieldLabel, toKey, translate, isLanguage, LANGUAGES, MESSAGE_KEYS, assetUrl, assetPath, renderNoteMarkdown, referencedAssets, toFileName} = entry;

/** Baut einen Index mit den Standardtypen. */
function makeIndex(notes) {
  return buildIndex(notes, DEFAULT_NOTE_TYPES);
}

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
  const index = makeIndex([note({ id: '1', title: 'Mira Falkenhand', aliases: ['Die Jägerin'] })]);
  assert.equal(index.byName.get('mira falkenhand')?.id, '1');
  assert.equal(index.byName.get('die jägerin')?.id, '1');
});

test('Index meldet mehrdeutige Namen', () => {
  const index = makeIndex([note({ id: '1', title: 'Mira' }), note({ id: '2', title: 'mira' })]);
  assert.ok(index.ambiguous.has('mira'));
});

test('Backlinks finden Erwaehnungen ueber Aliase', () => {
  const index = makeIndex([
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
  const index = makeIndex([note({ id: '1', title: 'Mira' }), target]);
  assert.deepEqual(unresolvedLinks(index, target), ['Tante Ilva']);
});

test('findOccurrences findet alle Vorkommen ohne Ruecksicht auf Grossschreibung', () => {
  const hits = findOccurrences('Mira traf mira und MIRA.', 'mira');
  assert.equal(hits.length, 3);
  assert.deepEqual(hits[0], { from: 0, to: 4 });
  assert.deepEqual(hits[2], { from: 19, to: 23 });
});

test('findOccurrences ueberlappt sich nicht und kommt mit leerem Begriff klar', () => {
  assert.deepEqual(findOccurrences('aaaa', 'aa'), [{ from: 0, to: 2 }, { from: 2, to: 4 }]);
  assert.deepEqual(findOccurrences('irgendwas', ''), []);
});

test('Suchtreffer liefern Fundstellen fuer die Hervorhebung', () => {
  const index = makeIndex([
    note({ id: '1', title: 'Mira Falkenhand', body: 'Mira ging fort. Später kam Mira zurück.' })
  ]);

  const [hit] = searchNotes(index, 'mira');
  assert.equal(hit.field, 'title');
  assert.deepEqual(hit.matches, [{ from: 0, to: 4 }]);
  assert.equal(hit.snippet, 'Mira Falkenhand');
});

test('Rumpftreffer zaehlen alle Fundstellen und markieren im Ausschnitt', () => {
  const index = makeIndex([
    note({ id: '1', title: 'Toran', body: 'Die Schmiede stand am Wasser. Die Schmiede brannte.' })
  ]);

  const [hit] = searchNotes(index, 'schmiede');
  assert.equal(hit.field, 'body');
  assert.equal(hit.bodyMatches, 2);
  assert.ok(hit.matches.length >= 1, 'keine Fundstelle im Ausschnitt');

  for (const match of hit.matches) {
    assert.equal(hit.snippet.slice(match.from, match.to).toLowerCase(), 'schmiede');
  }
});

test('Feldtreffer bekommen die lesbare Feldbezeichnung', () => {
  const index = makeIndex([note({ id: '1', title: 'Mira', fields: { species: 'Waldelfe' } })]);
  const [hit] = searchNotes(index, 'waldelfe');
  assert.equal(hit.field, 'field');
  assert.equal(hit.label, 'Spezies');
  assert.equal(hit.snippet, 'Waldelfe');
});

test('Volltextsuche greift auf Titel, Tags, Felder und Rumpf', () => {
  const index = makeIndex([
    note({ id: '1', title: 'Mira', fields: { species: 'Waldelfe' } }),
    note({ id: '2', title: 'Toran', tags: ['Hafen'] }),
    note({ id: '3', title: 'Ilva', body: 'Ihre Schmiede stand am Wasser.' })
  ]);
  assert.deepEqual(searchNotes(index, 'waldelfe').map((hit) => hit.noteId), ['1']);
  assert.deepEqual(searchNotes(index, 'hafen').map((hit) => hit.noteId), ['2']);
  assert.deepEqual(searchNotes(index, 'schmiede').map((hit) => hit.noteId), ['3']);
});

test('stripMarkdown entfernt Syntax und behaelt den Anzeigetext', () => {
  const markdown = '## Kindheit\n\n- **Sie** kannte [[Mira Falkenhand|die Jägerin]]\n\n> Ein Zitat\n\n`code`';
  const plain = stripMarkdown(markdown);
  assert.match(plain, /Kindheit/);
  assert.match(plain, /die Jägerin/);
  assert.match(plain, /Ein Zitat/);
  assert.ok(!plain.includes('#'), 'Überschriftenzeichen übrig');
  assert.ok(!plain.includes('**'), 'Fettauszeichnung übrig');
  assert.ok(!plain.includes('[['), 'Wiki-Klammern übrig');
  assert.ok(!plain.includes('`'), 'Code-Auszeichnung übrig');
});

test('textPreview kuerzt an der Wortgrenze', () => {
  const markdown = 'Ein '.repeat(200);
  const preview = textPreview(markdown, 50);
  assert.ok(preview.length <= 52, `zu lang: ${preview.length}`);
  assert.ok(preview.endsWith(' …'), 'kein Auslassungszeichen');
  assert.ok(!preview.includes('  '), 'doppelte Leerzeichen');
});

test('textPreview laesst kurzen Text unveraendert', () => {
  assert.equal(textPreview('Sie wuchs am [[Hafen]] auf.', 220), 'Sie wuchs am Hafen auf.');
});

test('textPreview liefert bei leerem Rumpf einen leeren String', () => {
  assert.equal(textPreview(''), '');
  assert.equal(textPreview('   \n\n  '), '');
});

test('toKey erzeugt stabile Schluessel und weicht bei Kollision aus', () => {
  assert.equal(toKey('Größe des Charakters'), 'groesse_des_charakters');
  assert.equal(toKey('Spezies', ['spezies']), 'spezies_2');
  assert.equal(toKey('Spezies', ['spezies', 'spezies_2']), 'spezies_3');
  assert.equal(toKey('###'), 'feld');
});

test('findNoteType liefert einen Platzhalter statt zu werfen', () => {
  const def = findNoteType(DEFAULT_NOTE_TYPES, 'gibtesnicht');
  assert.equal(def.id, 'gibtesnicht');
  assert.deepEqual(def.fields, []);
});

test('Standardtypen enthalten einen freien Typ ohne Felder', () => {
  const generic = DEFAULT_NOTE_TYPES.find((def) => def.fields.length === 0);
  assert.ok(generic, 'kein freier Typ vorhanden');
  assert.equal(generic.id, 'note');
});

test('fieldLabel faellt auf den Schluessel zurueck', () => {
  assert.equal(fieldLabel(DEFAULT_NOTE_TYPES, 'character', 'species'), 'Spezies');
  assert.equal(fieldLabel(DEFAULT_NOTE_TYPES, 'character', 'unbekannt'), 'unbekannt');
});

test('translate setzt Platzhalter ein und faellt auf Deutsch zurueck', () => {
  assert.equal(translate('de', 'editor.words', { count: 42 }), '42 Wörter');
  assert.equal(translate('en', 'editor.words', { count: 42 }), '42 words');
  assert.equal(translate('en', 'error.unknownNoteType', { type: 'x' }), 'Unknown note type: x');
  // Unbekannter Platzhalter bleibt stehen, statt "undefined" zu schreiben
  assert.equal(translate('de', 'editor.words', {}), '{count} Wörter');
});

// Wenige Texte sind in beiden Sprachen gleich, das ist kein Fehler.
const ALLOWED_SAME = new Set([
  'card.alias',
  'dialog.ok',
  'editor.tags',
  'export.tags',
  'fieldType.text',
  'fieldType.url',
  'toolbar.code'
]);

test('jeder deutsche Schluessel hat eine englische Entsprechung', () => {
  const missing = [];
  // Fehlt ein Schluessel im Englischen, faellt translate auf Deutsch zurueck.
  // Genau das soll hier auffallen.
  for (const key of MESSAGE_KEYS) {
    const german = translate('de', key);
    const english = translate('en', key);
    if (german === english && !ALLOWED_SAME.has(key)) missing.push(key);
  }
  assert.deepEqual(missing, [], `ohne englische Fassung: ${missing.join(', ')}`);
});

test('isLanguage erkennt nur bekannte Sprachen', () => {
  assert.ok(isLanguage('de'));
  assert.ok(isLanguage('en'));
  assert.ok(!isLanguage('fr'));
  assert.ok(!isLanguage(undefined));
});

test('LANGUAGES enthaelt Deutsch und Englisch', () => {
  assert.deepEqual(LANGUAGES.map((entry) => entry.id).sort(), ['de', 'en']);
});

test('Bildverweise ueberstehen den Rundlauf durch den Editor', () => {
  const markdown = 'Ein Portrait:\n\n![Mira](assets/abc.png)';
  const html = markdownToHtml(markdown, (target) => assetUrl('kampagne-1', target));

  assert.match(html, /backstory-asset:\/\/kampagne-1\/abc\.png/);
  assert.ok(!html.includes('assets/abc.png'), 'relativer Pfad blieb im HTML stehen');

  const back = htmlToMarkdown(html, assetPath);
  assert.match(back, /!\[Mira\]\(assets\/abc\.png\)/);
});

test('Fremde Bild-URLs bleiben beim Speichern unveraendert', () => {
  const html = '<p><img src="https://example.org/bild.png" alt="Fremd"></p>';
  assert.match(htmlToMarkdown(html, assetPath), /https:\/\/example\.org\/bild\.png/);
});

test('assetPath erkennt nur das eigene Schema', () => {
  assert.equal(assetPath('backstory-asset://k1/abc.png'), 'assets/abc.png');
  assert.equal(assetPath('https://example.org/x.png'), null);
  assert.equal(assetPath('assets/x.png'), null);
});

test('assetUrl kodiert den Dateinamen', () => {
  assert.equal(assetUrl('k1', 'assets/a b.png'), 'backstory-asset://k1/a%20b.png');
});

test('Standard-Charakter hat ein Portrait-Feld', () => {
  const character = DEFAULT_NOTE_TYPES.find((def) => def.id === 'character');
  const portrait = character.fields.find((field) => field.type === 'image');
  assert.ok(portrait, 'kein Bildfeld vorhanden');
  assert.equal(portrait.key, 'portrait');
});

const EXPORT_LABELS = {
  type: 'Typ',
  relations: 'Beziehungen',
  mentionedBy: 'Erwähnt von',
  aliases: 'Aliase',
  tags: 'Tags'
};

test('Markdown-Export schreibt Steckbrief, Text und Beziehungen aus', () => {
  const mira = note({
    id: '1',
    title: 'Mira Falkenhand',
    aliases: ['Die Jägerin'],
    tags: ['Kapitel 1'],
    fields: { species: 'Waldelfe', portrait: 'assets/p.png' },
    body: 'Sie wuchs im [[Hafen]] auf.',
    relations: [{ id: 'r1', targetId: '2', type: 'Mentorin', note: 'Bringt ihr das Bogenschießen bei.' }]
  });
  const toran = note({ id: '2', title: 'Toran', body: 'Er schuldet [[Mira Falkenhand]] Gold.' });

  const markdown = renderNoteMarkdown(mira, DEFAULT_NOTE_TYPES, [mira, toran], EXPORT_LABELS);

  assert.match(markdown, /^# Mira Falkenhand/);
  assert.match(markdown, /\*Charakter\*/);
  assert.match(markdown, /\*\*Spezies:\*\* Waldelfe/);
  assert.match(markdown, /\*\*Portrait:\*\* !\[\]\(assets\/p\.png\)/);
  assert.match(markdown, /\*\*Aliase:\*\* Die Jägerin/);
  assert.match(markdown, /Sie wuchs im \[\[Hafen\]\] auf\./);
  assert.match(markdown, /## Beziehungen/);
  assert.match(markdown, /\*\*Mentorin\*\* \[\[Toran\]\] — Bringt ihr das Bogenschießen bei\./);
  assert.match(markdown, /## Erwähnt von/);
  assert.match(markdown, /- \[\[Toran\]\]/);
  assert.ok(!markdown.includes('---\nid:'), 'YAML-Kopf im Export');
});

test('Markdown-Export laesst leere Abschnitte weg', () => {
  const solo = note({ id: '1', title: 'Allein', body: 'Nur Text.' });
  const markdown = renderNoteMarkdown(solo, DEFAULT_NOTE_TYPES, [solo], EXPORT_LABELS);

  assert.ok(!markdown.includes('## Beziehungen'), 'leerer Beziehungsabschnitt');
  assert.ok(!markdown.includes('## Erwähnt von'), 'leerer Erwähnungsabschnitt');
  assert.ok(!markdown.includes('Aliase'), 'leerer Aliasabschnitt');
});

test('Beziehungen auf geloeschte Notizen tauchen im Export nicht auf', () => {
  const solo = note({
    id: '1',
    title: 'Allein',
    relations: [{ id: 'r1', targetId: 'weg', type: 'Feindin', note: '' }]
  });
  assert.ok(!renderNoteMarkdown(solo, DEFAULT_NOTE_TYPES, [solo], EXPORT_LABELS).includes('Beziehungen'));
});

test('referencedAssets findet Bilder aus Text und Steckbrief', () => {
  const withImages = note({
    id: '1',
    title: 'Mira',
    fields: { portrait: 'assets/p.png' },
    body: 'Text ![Szene](assets/s.png) und nochmal ![](assets/s.png), dazu ![extern](https://x/y.png)'
  });
  const assets = referencedAssets(withImages, DEFAULT_NOTE_TYPES).sort();
  assert.deepEqual(assets, ['assets/p.png', 'assets/s.png']);
});

test('toFileName entfernt kritische Zeichen und weicht bei Kollision aus', () => {
  assert.equal(toFileName('Mira: die Jägerin'), 'Mira die Jägerin.md');
  assert.equal(toFileName('A/B\\C'), 'ABC.md');
  assert.equal(toFileName('Mira', ['Mira.md']), 'Mira 2.md');
  assert.equal(toFileName('   '), 'Notiz.md');
});
