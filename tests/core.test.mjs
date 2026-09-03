import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const {pastedMarkdownToHtml, findWikiLinks, rewriteWikiLinks, parseFrontmatter, stringifyFrontmatter, countWords, markdownToHtml, htmlToMarkdown, buildIndex, backlinksFor, unresolvedLinks, searchNotes, findOccurrences, textPreview, stripMarkdown, DEFAULT_NOTE_TYPES, findNoteType, fieldLabel, toKey, translate, isLanguage, LANGUAGES, MESSAGE_KEYS, assetUrl, assetPath, renderNoteMarkdown, referencedAssets, toFileName, defaultPrompts, layoutGraph, buildGraphEdges, buildGraphNodes, mergeNoteTypes, countMergeChanges} = entry;

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
  'graph.open',
  'settings.apiKeyPlaceholder',
  'toolbar.code',
  // „Link" heisst in beiden Sprachen gleich.
  'toolbar.link',
  'link.title',
  // „Export" auch.
  'export.note'
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
  tags: 'Tags',
  yes: 'Ja',
  no: 'Nein'
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

test('Schreibhilfe liefert in beiden Sprachen dieselben Kategorien', () => {
  const german = defaultPrompts('de');
  const english = defaultPrompts('en');

  assert.ok(german.length >= 5, 'zu wenige Kategorien');
  assert.deepEqual(
    german.map((category) => category.id),
    english.map((category) => category.id),
    'Kategorien unterscheiden sich zwischen den Sprachen'
  );
});

test('Jede Kategorie hat genug und eindeutige Vorschläge', () => {
  for (const category of defaultPrompts('de')) {
    assert.ok(category.options.length >= 20, `${category.id} hat nur ${category.options.length} Einträge`);
    assert.equal(
      new Set(category.options).size,
      category.options.length,
      `${category.id} enthält Dubletten`
    );
    assert.ok(
      category.options.every((option) => option.trim().length > 10),
      `${category.id} enthält zu kurze Einträge`
    );
  }
});

test('defaultPrompts liefert eine Kopie, kein geteiltes Objekt', () => {
  const first = defaultPrompts('de');
  first[0].options.push('Testeintrag');
  assert.ok(!defaultPrompts('de')[0].options.includes('Testeintrag'), 'Vorlage wurde verändert');
});

test('Graph erzeugt gerichtete Kanten aus Beziehungen und Erwähnungen', () => {
  const mira = note({
    id: '1',
    title: 'Mira',
    relations: [{ id: 'r1', targetId: '2', type: 'Mentorin', note: '' }],
    body: 'Sie kennt [[Toran]] gut.'
  });
  const toran = note({ id: '2', title: 'Toran' });
  const index = makeIndex([mira, toran]);

  const relations = buildGraphEdges(index, 'relations');
  assert.equal(relations.length, 1);
  assert.deepEqual(relations[0], { source: '1', target: '2', label: 'Mentorin', kind: 'relation' });

  const mentions = buildGraphEdges(index, 'mentions');
  assert.equal(mentions.length, 1);
  assert.equal(mentions[0].kind, 'mention');

  assert.equal(buildGraphEdges(index, 'both').length, 2);
});

test('Graph zaehlt mehrfache Erwähnungen nur einmal', () => {
  const mira = note({ id: '1', title: 'Mira', body: '[[Toran]] und nochmal [[Toran]].' });
  const index = makeIndex([mira, note({ id: '2', title: 'Toran' })]);
  assert.equal(buildGraphEdges(index, 'mentions').length, 1);
});

test('Graph ignoriert Selbstverweise und gelöschte Ziele', () => {
  const solo = note({
    id: '1',
    title: 'Mira',
    body: 'Ich, [[Mira]], schreibe das.',
    relations: [{ id: 'r1', targetId: 'weg', type: 'Feindin', note: '' }]
  });
  assert.deepEqual(buildGraphEdges(makeIndex([solo]), 'both'), []);
});

test('Knotengrad zaehlt ein- und ausgehende Kanten', () => {
  const notes = [note({ id: '1', title: 'A' }), note({ id: '2', title: 'B' }), note({ id: '3', title: 'C' })];
  const edges = [
    { source: '1', target: '2', label: '', kind: 'relation' },
    { source: '3', target: '2', label: '', kind: 'relation' }
  ];
  const degrees = Object.fromEntries(buildGraphNodes(notes, edges).map((entry) => [entry.id, entry.degree]));
  assert.deepEqual(degrees, { 1: 1, 2: 2, 3: 1 });
});

test('Anordnung ist wiederholbar und bleibt in der Fläche', () => {
  const ids = [
    { id: 'a', degree: 1 },
    { id: 'b', degree: 1 },
    { id: 'c', degree: 0 }
  ];
  const edges = [{ source: 'a', target: 'b', label: '', kind: 'relation' }];
  const options = { width: 800, height: 600, iterations: 120, seed: 7 };

  const first = layoutGraph(ids, edges, options);
  const second = layoutGraph(ids, edges, options);
  assert.deepEqual(first, second, 'gleicher Startwert liefert unterschiedliche Anordnungen');

  for (const node of first) {
    assert.ok(node.x >= 0 && node.x <= 800, `x außerhalb der Fläche: ${node.x}`);
    assert.ok(node.y >= 0 && node.y <= 600, `y außerhalb der Fläche: ${node.y}`);
    assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y), 'ungültige Koordinate');
  }
});

test('Verbundene Knoten landen näher beieinander als unverbundene', () => {
  const ids = [
    { id: 'a', degree: 1 },
    { id: 'b', degree: 1 },
    { id: 'c', degree: 0 }
  ];
  const edges = [{ source: 'a', target: 'b', label: '', kind: 'relation' }];
  const nodes = layoutGraph(ids, edges, { width: 800, height: 600, iterations: 400, seed: 3 });

  const at = (id) => nodes.find((node) => node.id === id);
  const distance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y);

  const linked = distance(at('a'), at('b'));
  const loose = Math.min(distance(at('a'), at('c')), distance(at('b'), at('c')));
  assert.ok(linked < loose, `verbunden ${linked.toFixed(1)} nicht näher als unverbunden ${loose.toFixed(1)}`);
});

test('Anordnung kommt mit einem einzelnen Knoten klar', () => {
  const nodes = layoutGraph([{ id: 'a', degree: 0 }], [], { width: 400, height: 300 });
  assert.equal(nodes.length, 1);
  assert.ok(Number.isFinite(nodes[0].x));
});

const TYPE_A = { id: 'character', label: 'Charakter', plural: 'Charaktere', fields: [{ key: 'age', label: 'Alter', type: 'text' }] };
const TYPE_B = { id: 'item', label: 'Gegenstand', plural: 'Gegenstände', fields: [{ key: 'value', label: 'Wert', type: 'text' }] };

test('mergeNoteTypes ergaenzt fehlende Typen', () => {
  const merged = mergeNoteTypes([TYPE_A], [TYPE_B]);
  assert.deepEqual(merged.map((def) => def.id), ['character', 'item']);
});

test('mergeNoteTypes ergaenzt fehlende Felder, ohne vorhandene zu aendern', () => {
  const incoming = {
    ...TYPE_A,
    label: 'Person',
    fields: [
      { key: 'age', label: 'Lebensjahre', type: 'number' },
      { key: 'origin', label: 'Herkunft', type: 'text' }
    ]
  };
  const [character] = mergeNoteTypes([TYPE_A], [incoming]);

  assert.equal(character.label, 'Charakter', 'die eigene Bezeichnung wurde überschrieben');
  assert.equal(character.fields[0].label, 'Alter', 'ein vorhandenes Feld wurde überschrieben');
  assert.deepEqual(character.fields.map((field) => field.key), ['age', 'origin']);
});

test('mergeNoteTypes entfernt nie etwas', () => {
  const merged = mergeNoteTypes([TYPE_A, TYPE_B], [TYPE_B]);
  assert.deepEqual(merged.map((def) => def.id), ['character', 'item']);
});

test('mergeNoteTypes laesst die Vorlagen unberuehrt', () => {
  const current = [structuredClone(TYPE_A)];
  const incoming = [{ ...structuredClone(TYPE_A), fields: [{ key: 'x', label: 'X', type: 'text' }] }];
  mergeNoteTypes(current, incoming);
  assert.equal(current[0].fields.length, 1, 'die übergebene Liste wurde verändert');
});

test('countMergeChanges zaehlt Typen und Felder', () => {
  assert.deepEqual(countMergeChanges([TYPE_A], [TYPE_B]), { types: 1, fields: 1 });
  assert.deepEqual(countMergeChanges([TYPE_A], [TYPE_A]), { types: 0, fields: 0 });
});

test('Die Rundenzahl sinkt bei vielen Knoten, damit nichts blockiert', () => {
  const many = Array.from({ length: 600 }, (_, index) => ({ id: `n${index}`, degree: 0 }));

  const started = Date.now();
  const nodes = layoutGraph(many, [], { width: 1200, height: 780 });
  const duration = Date.now() - started;

  assert.equal(nodes.length, 600);
  assert.ok(duration < 8000, `Anordnung dauerte ${duration} ms`);
  assert.ok(nodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y)));
});

test('Ankreuzfelder erscheinen im Export als Ja oder Nein', () => {
  const types = [
    {
      id: 'character',
      label: 'Charakter',
      plural: 'Charaktere',
      fields: [
        { key: 'lebt', label: 'Lebt noch', type: 'checkbox' },
        { key: 'tot', label: 'Verstorben', type: 'checkbox' }
      ]
    }
  ];
  const entry = note({ id: '1', title: 'Mira', fields: { lebt: 'ja', tot: '' } });
  const markdown = renderNoteMarkdown(entry, types, [entry], EXPORT_LABELS);

  assert.match(markdown, /\*\*Lebt noch:\*\* Ja/);
  assert.match(markdown, /\*\*Verstorben:\*\* Nein/, 'ein nicht gesetztes Ankreuzfeld fehlt im Export');
});

test('Die Systemanweisung verbietet fertigen Text', () => {
  const { systemPrompt } = entry;
  assert.match(systemPrompt('de'), /schreibst den Text nicht/);
  assert.match(systemPrompt('en'), /do not write the text/);
});

test('Eine Rueckfrage ersetzt die Aufgabenvorlage', () => {
  const { userPrompt } = entry;
  const base = { task: 'questions', language: 'de', note: 'Notiztext', context: '', history: [] };

  assert.match(userPrompt(base), /Notiztext/);
  assert.equal(userPrompt({ ...base, followUp: '  Wie meinst du das?  ' }), 'Wie meinst du das?');
});

test('Bilder mit Breite bleiben als HTML erhalten und behalten den relativen Pfad', () => {
  const markdown = 'Text\n\n<img src="assets/abc.png" alt="Szene" width="320">';
  const html = markdownToHtml(markdown, (target) => assetUrl('k1', target));

  assert.match(html, /backstory-asset:\/\/k1\/abc\.png/);
  assert.match(html, /width="320"/);

  const back = htmlToMarkdown(html, assetPath);
  assert.match(back, /<img src="assets\/abc\.png"[^>]*width="320">/);
  assert.ok(!back.includes('backstory-asset'), 'Protokoll-URL blieb im Markdown stehen');
});

test('Bilder ohne Breite bleiben gewoehnliches Markdown', () => {
  const back = htmlToMarkdown(markdownToHtml('![Szene](assets/abc.png)', (t) => assetUrl('k1', t)), assetPath);
  assert.match(back, /!\[Szene\]\(assets\/abc\.png\)/);
  assert.ok(!back.includes('<img'), 'ohne Breite wurde unnötig HTML erzeugt');
});

test('Durchgestrichener Text ueberlebt den Rundlauf', () => {
  // Die Werkzeugleiste bietet Durchstreichen an. Ohne eigene Regel wirft
  // Turndown das Element weg und die Auszeichnung waere beim Speichern weg.
  assert.equal(htmlToMarkdown('<p><s>weg</s></p>'), '~~weg~~');
  assert.equal(htmlToMarkdown('<p><del>weg</del></p>'), '~~weg~~');
  assert.equal(htmlToMarkdown(markdownToHtml('Das ist ~~falsch~~ gewesen.')), 'Das ist ~~falsch~~ gewesen.');
});

test('Trennlinien behalten ihre Schreibweise', () => {
  assert.equal(htmlToMarkdown(markdownToHtml('oben\n\n---\n\nunten')), 'oben\n\n---\n\nunten');
});

test('Ein blosser Link wird nicht in Klammerschreibweise umgeschrieben', () => {
  // Markdown macht aus einer nackten Adresse automatisch einen Link. Ohne
  // eigene Regel stuende nach dem Speichern [https://x](https://x) im Text.
  assert.equal(htmlToMarkdown(markdownToHtml('Siehe https://example.org heute.')), 'Siehe https://example.org heute.');
  assert.equal(
    htmlToMarkdown(markdownToHtml('Siehe [Handbuch](https://example.org).')),
    'Siehe [Handbuch](https://example.org).'
  );
});

test('Tabellen ueberleben den Rundlauf', () => {
  const markdown = '| Jahr | Ereignis |\n| --- | --- |\n| 712 | Geboren |\n| 730 | Verbannt |';
  assert.equal(htmlToMarkdown(markdownToHtml(markdown)), markdown);
});

test('Ein Senkrechtstrich in einer Zelle zerlegt die Tabelle nicht', () => {
  const html = '<table><tbody><tr><th>A</th></tr><tr><td>x | y</td></tr></tbody></table>';
  const markdown = htmlToMarkdown(html);
  assert.match(markdown, /x \\\| y/);
  // Und wieder zurueck: der Strich gehoert in die Zelle, nicht dazwischen.
  assert.equal(htmlToMarkdown(markdownToHtml(markdown)), markdown);
});

test('Eine Tabelle ohne Kopfzeile bekommt eine leere', () => {
  // Markdown kennt keine kopflose Tabelle. Ohne Ersatzzeile waere es keine.
  const markdown = htmlToMarkdown('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
  assert.equal(markdown, '|  |  |\n| --- | --- |\n| a | b |');
});

test('Eine Zeile mit Kopf- und Datenzellen behaelt ihre Reihenfolge', () => {
  const markdown = htmlToMarkdown(
    '<table><tbody><tr><th>Name</th><th>Wert</th></tr><tr><th>Stärke</th><td>16</td></tr></tbody></table>'
  );
  assert.equal(markdown, '| Name | Wert |\n| --- | --- |\n| Stärke | 16 |');
});

test('Die Kurzinfo zeigt Tabellen ohne Striche', () => {
  const markdown = 'Vorher.\n\n| Jahr | Ereignis |\n| --- | --- |\n| 712 | Geboren |\n\nNachher.';
  const text = textPreview(markdown);
  assert.ok(!text.includes('|'), text);
  assert.ok(!text.includes('---'), text);
  assert.ok(text.includes('Jahr Ereignis'), text);
  assert.ok(text.includes('712 Geboren'), text);
});

test('Leerzeichen am Zeilenende werden nicht mitgeschrieben', () => {
  // Turndown laesst in Listen und Zitaten Zeilen aus lauter Leerzeichen
  // zurueck. Sie aendern nichts an der Darstellung, aber die Datei sieht
  // nach jedem Speichern anders aus.
  const markdown = htmlToMarkdown('<ul><li><p>eins</p></li><li><p>zwei</p></li></ul>');
  assert.ok(!/[ \t]+$/m.test(markdown), JSON.stringify(markdown));

  const zitat = htmlToMarkdown('<blockquote><p>oben</p><p>unten</p></blockquote>');
  assert.ok(!/[ \t]+$/m.test(zitat), JSON.stringify(zitat));
});

test('Ein harter Zeilenumbruch behaelt seine zwei Leerzeichen', () => {
  // Zwei Leerzeichen am Zeilenende sind in Markdown ein Umbruch, kein Rest.
  assert.equal(htmlToMarkdown('<p>Erste Zeile<br>Zweite Zeile</p>'), 'Erste Zeile  \nZweite Zeile');
});

test('Ein zweiter Rundlauf aendert nichts mehr', () => {
  // Der erste Rundlauf darf die Schreibweise vereinheitlichen. Aendert sich
  // danach weiter etwas, saehe die Datei nach jedem Speichern anders aus.
  const quellen = [
    '- eins\n- zwei\n  - zwei a\n\n1. erstens\n2. zweitens',
    '> Sie sagte nichts.\n>\n> Dann ging sie.',
    '| Jahr | Ereignis |\n| --- | --- |\n| 712 | Geboren |',
    '# Eins\n\n## Zwei\n\nText mit **fett**, *kursiv* und ~~weg~~.',
    'Siehe [Handbuch](https://example.org) und https://example.org.',
    'oben\n\n---\n\nunten',
    'Erste Zeile  \nZweite Zeile'
  ];

  for (const quelle of quellen) {
    const einmal = htmlToMarkdown(markdownToHtml(quelle));
    const zweimal = htmlToMarkdown(markdownToHtml(einmal));
    assert.equal(zweimal, einmal, `nicht stabil: ${JSON.stringify(quelle)}`);
  }
});

test('Ein Wiki-Link mit Alias wird auch in einer Tabellenzelle erkannt', () => {
  // In einer Tabelle muss der Senkrechtstrich maskiert sein, sonst zerfaellt
  // die Zeile. Der Link ist derselbe und muss gefunden werden.
  const links = findWikiLinks('| Wer |\n| --- |\n| [[Mira\\|ihr]] |');
  assert.equal(links.length, 1);
  assert.equal(links[0].target, 'Mira');
  assert.equal(links[0].label, 'ihr');
});

test('Umbenennen behaelt die Maskierung in einer Tabellenzelle', () => {
  // Schriebe das Umbenennen einen blossen Strich zurueck, zerfiele die Zeile
  // und der Text der letzten Spalte waere weg.
  const zeile = '| [[Mira\\|ihr]] | dazu |';
  assert.equal(rewriteWikiLinks(zeile, 'Mira', 'Mira Falkenhand'), '| [[Mira Falkenhand\\|ihr]] | dazu |');
  assert.equal(rewriteWikiLinks('Er schuldet [[Mira|ihr]] Gold.', 'Mira', 'Mira F.'), 'Er schuldet [[Mira F.|ihr]] Gold.');
});

test('Die Kurzinfo zeigt den Anzeigetext auch bei maskiertem Strich', () => {
  assert.equal(stripMarkdown('Siehe [[Mira\\|ihr]] dazu.').trim(), 'Siehe ihr dazu.');
});

test('Auszeichnungen in einer Tabellenzelle bleiben erhalten', () => {
  const markdown = '| Wer | Was |\n| --- | --- |\n| **Mira** | ein [Link](https://example.org) |';
  assert.equal(htmlToMarkdown(markdownToHtml(markdown)), markdown);
});

test('Ein Backslash vor dem Strich in einer Zelle zerlegt die Tabelle nicht', () => {
  const markdown = htmlToMarkdown(
    '<table><tbody><tr><th>A</th><th>B</th></tr><tr><td>a\\|b</td><td>z</td></tr></tbody></table>'
  );
  // Die letzte Spalte muss ueberleben: sonst faellt sie beim naechsten Laden weg.
  const zeilen = markdown.split('\n');
  assert.equal(zeilen[2].split(/(?<!\\)\|/).length, 4, markdown);
  assert.equal(htmlToMarkdown(markdownToHtml(markdown)), markdown);
});

test('Eine blosse E-Mail-Adresse bleibt eine blosse Adresse', () => {
  assert.equal(
    htmlToMarkdown(markdownToHtml('Schreib an mira@example.org bitte.')),
    'Schreib an mira@example.org bitte.'
  );
});

test('Leerzeilen in einem Codeblock bleiben, wie sie sind', () => {
  // Ausserhalb von Codebloecken sind Leerzeichen am Zeilenende Reste,
  // darin sind sie Inhalt.
  assert.equal(htmlToMarkdown('<pre><code>eins\n   \nzwei</code></pre>'), '```\neins\n   \nzwei\n```');
});

test('Eine Datenzeile aus Strichen wird nicht fuer eine Trennzeile gehalten', () => {
  const text = stripMarkdown('| Wer | Was |\n| --- | --- |\n| - | - |\n| a | b |');
  assert.ok(text.includes('a'), text);
  assert.ok(text.includes('b'), text);
  assert.ok(/-/.test(text), `Die Datenzeile fehlt: ${text}`);
});

test('Eine E-Mail-Adresse mit Unterstrich bleibt ein richtiger Link', () => {
  // Turndown maskiert den Unterstrich. Als blosse Adresse geschrieben,
  // begaenne die automatische Erkennung erst nach der Maskierung und der
  // Link zeigte auf die falsche Adresse.
  const back = htmlToMarkdown(markdownToHtml('Schreib an mira_x@example.org bitte.'));
  assert.equal(htmlToMarkdown(markdownToHtml(back)), back);
  assert.ok(back.includes('mira_x@example.org') || back.includes('mailto:mira_x@example.org'), back);
});

test('Ein Zaun im Codeblock bringt die Erkennung nicht durcheinander', () => {
  // Ein laengerer Zaun darf einen kuerzeren enthalten. Wird der als Ende
  // gelesen, gilt der Rest des Textes faelschlich als Code.
  const markdown = '````\ncode mit ``` darin\n````\n\nText.\n\n```\neins\n   \nzwei\n```';
  assert.equal(htmlToMarkdown(markdownToHtml(markdown)).includes('eins\n   \nzwei'), true);
});

test('Eine Trennzeile mit einem Strich je Zelle wird erkannt', () => {
  for (const trenner of ['| - | - |', '|:--|--:|', '| --- | --- |']) {
    const text = stripMarkdown(`| Wer | Was |\n${trenner}\n| a | b |`);
    assert.ok(!text.includes('-'), `${trenner} blieb stehen: ${text}`);
  }
});

test('Eine Datenzeile aus Strichen bleibt erhalten', () => {
  // Dieselbe Zeile, aber nicht an zweiter Stelle: dann ist sie Inhalt.
  const text = stripMarkdown('| Wer | Was |\n| --- | --- |\n| - | - |\n| a | b |');
  assert.ok(/-/.test(text), `Die Datenzeile fehlt: ${text}`);
});

test('Woerter in einer Tabelle werden richtig gezaehlt', () => {
  assert.equal(countWords('| Wer | Was |\n| --- | --- |\n| Mira | Bogen |'), 4);
});

test('Ein maskierter Strich ausserhalb einer Tabelle wird auch entmaskiert', () => {
  assert.equal(stripMarkdown('Er sagte a \\| b.').trim(), 'Er sagte a | b.');
});

test('Eine Adresse mit eckiger Klammer ueberlebt mehrere Rundlaeufe', () => {
  const quelle = 'Siehe https://example.org/a[b_c dazu.';
  const einmal = htmlToMarkdown(markdownToHtml(quelle));
  const zweimal = htmlToMarkdown(markdownToHtml(einmal));
  assert.equal(zweimal, einmal, `nicht stabil: ${JSON.stringify(einmal)} -> ${JSON.stringify(zweimal)}`);
});

test('Ein Wiki-Link mit Sonderzeichen im Titel bleibt ein Link', () => {
  // Unterstriche, Sterne und Backticks sind in Titeln erlaubt. Werden sie
  // beim Speichern maskiert, ist der Link beim naechsten Laden keiner mehr.
  for (const titel of ['Haus_am_See', 'Der *Turm*', 'Ort #1', 'Fluss & Feld', 'Weg 3 - Nord']) {
    const quelle = `Sie wohnt in [[${titel}]].`;
    const back = htmlToMarkdown(markdownToHtml(quelle));
    assert.deepEqual(findWikiLinks(back).map((link) => link.target), [titel], back);
    assert.equal(htmlToMarkdown(markdownToHtml(back)), back);
  }
});

test('Ein Alias im Wiki-Link ueberlebt Sonderzeichen ebenfalls', () => {
  const quelle = 'Sie wohnt in [[Haus_am_See|dort]].';
  const back = htmlToMarkdown(markdownToHtml(quelle));
  assert.equal(back, quelle);
});

test('Wiki-Links ueberstehen Sonderzeichen im Titel in beide Richtungen', () => {
  for (const titel of ['Haus_am_See', 'Haus _am_ See', 'Der *Turm*', 'Fluss `Weiss`', 'Ort #1', 'A & B']) {
    const quelle = `Sie wohnt in [[${titel}]].`;
    const back = htmlToMarkdown(markdownToHtml(quelle));
    assert.equal(back, quelle, `Rundlauf verändert: ${JSON.stringify(back)}`);
    assert.deepEqual(findWikiLinks(back).map((link) => link.target), [titel], back);
  }
});

test('Ein Wiki-Link wird im Editor nicht als Auszeichnung gelesen', () => {
  // Ohne Schutz machte marked aus [[Der *Turm*]] kursiven Text, und der
  // Link war beim Speichern nicht mehr zusammenhaengend.
  const html = markdownToHtml('Sie wohnt in [[Der *Turm*]].');
  assert.ok(!html.includes('<em>'), html);
});

test('Eine Adresse mit Leerzeichen im Text bleibt ein richtiger Link', () => {
  const back = htmlToMarkdown('<p><a href="https://example.org/a%20b">https://example.org/a b</a></p>');
  assert.equal(back, '[https://example.org/a b](https://example.org/a%20b)');
});

test('Ein Wiki-Link in einer Tabellenzelle wird nicht doppelt maskiert', () => {
  const markdown = '| Wer | Notiz |\n| --- | --- |\n| [[Mira\\|ihr]] | dazu |';
  assert.equal(htmlToMarkdown(markdownToHtml(markdown)), markdown);
});

test('Doppelte Klammern in einer Adresse gelten nicht als Wiki-Link', () => {
  const quelle = 'Siehe https://example.org/x?a=[[b]] und [[Mira]].';
  const einmal = htmlToMarkdown(markdownToHtml(quelle));

  // Die Adresse wird zur ausgeschriebenen Linkschreibweise, weil die
  // Klammern darin maskiert werden muessen. Wichtig ist, dass sie dabei
  // heil bleibt und der Text nicht bei jedem Speichern weiter waechst.
  assert.ok(einmal.includes('https://example.org/x?a=%5B%5Bb%5D%5D'), einmal);
  assert.equal(htmlToMarkdown(markdownToHtml(einmal)), einmal);

  // Der echte Wiki-Link daneben bleibt einer.
  assert.deepEqual(findWikiLinks(einmal).map((link) => link.target), ['Mira'], einmal);
});

test('Doppelte Klammern in einem ausgeschriebenen Verweis bleiben heil', () => {
  const quelle = 'Siehe [Text](https://example.org/x?a=[[b]]) dazu.';
  const einmal = htmlToMarkdown(markdownToHtml(quelle));
  assert.ok(einmal.includes('%5B%5Bb%5D%5D'), einmal);
  assert.equal(htmlToMarkdown(markdownToHtml(einmal)), einmal);
});

test('Ein Wiki-Link geht nicht ueber Zeilengrenzen', () => {
  // Sonst verschluckt eine offene Klammer alles bis zur naechsten
  // schliessenden, samt Absaetzen und Listenpunkten.
  assert.deepEqual(findWikiLinks('Ein [[offener Anfang\n\nund ein Ende]] hier.'), []);
  const quelle = 'Ein [[offener Anfang\n\nund ein Ende]] hier.';
  assert.ok(htmlToMarkdown(markdownToHtml(quelle)).includes('\n\n'), 'Der Absatz ist verlorengegangen');
});

test('Ein Anfuehrungszeichen im Titel bricht kein HTML-Attribut auf', () => {
  const html = markdownToHtml('![[[Bild "gross"]]](assets/a.png)');
  assert.ok(!/alt="[^"]*"[^>]*"/.test(html), html);
});

test('Ein Wiki-Link direkt hinter einem Verweis bleibt ein Link', () => {
  const quelle = 'Siehe [Karte](https://example.org)[[Der *Turm*]] dazu.';
  const back = htmlToMarkdown(markdownToHtml(quelle));
  assert.deepEqual(findWikiLinks(back).map((link) => link.target), ['Der *Turm*'], back);
});

test('Eingefuegter Text: Markdown gilt, rohes HTML bleibt Text', () => {
  assert.match(pastedMarkdownToHtml('**fett**'), /<strong>fett<\/strong>/);
  assert.match(pastedMarkdownToHtml('> Zitat'), /<blockquote>/);
  assert.match(pastedMarkdownToHtml('| a | b |\n| --- | --- |\n| 1 | 2 |'), /<table>/);

  // Ein unbekanntes Element wuerde der Editor samt Inhalt verwerfen.
  const html = pastedMarkdownToHtml('Ein <div>Kasten</div> hier.');
  assert.ok(!html.includes('<div>'), html);
  assert.match(html, /&lt;div&gt;Kasten&lt;\/div&gt;/);
});

test('Eingefuegter Text: Sonderzeichen werden nicht doppelt maskiert', () => {
  assert.match(pastedMarkdownToHtml('`a & b`'), /<code>a &amp; b<\/code>/);
  assert.match(pastedMarkdownToHtml('![B](assets/x.png "T")'), /<img[^>]+src="assets\/x\.png"/);
});

test('Spitze Klammern im Text ueberleben das Speichern als Text', () => {
  // Eingefuegt bleibt <div> Text. Ohne Maskierung stuende es roh in der
  // Datei, und der naechste Ladevorgang machte daraus wieder HTML, das der
  // Editor verwirft: der Verlust waere nur aufgeschoben.
  const md = htmlToMarkdown(pastedMarkdownToHtml('Ein <div>Kasten</div> hier.'));
  const wieder = htmlToMarkdown(markdownToHtml(md));
  assert.equal(wieder, md);
  assert.ok(wieder.includes('Kasten'), wieder);
});

test('Feste Knoten bleiben bei der Anordnung, wo sie sind', () => {
  const ids = [
    { id: 'a', degree: 1 },
    { id: 'b', degree: 1 },
    { id: 'neu', degree: 0 }
  ];
  const edges = [{ source: 'a', target: 'b', label: '', kind: 'relation' }];
  const fixed = { a: { x: 100, y: 200 }, b: { x: 900, y: 600 } };

  const nodes = layoutGraph(ids, edges, { width: 1200, height: 780, fixed });
  const byId = new Map(nodes.map((node) => [node.id, node]));

  assert.deepEqual({ x: byId.get('a').x, y: byId.get('a').y }, fixed.a);
  assert.deepEqual({ x: byId.get('b').x, y: byId.get('b').y }, fixed.b);

  // Die neue Notiz bekommt eine berechnete Stelle, irgendwo dazwischen.
  const neu = byId.get('neu');
  assert.ok(Number.isFinite(neu.x) && Number.isFinite(neu.y), JSON.stringify(neu));
});

test('Ohne feste Knoten wird weiterhin in die Flaeche eingepasst', () => {
  const ids = [
    { id: 'a', degree: 1 },
    { id: 'b', degree: 1 }
  ];
  const edges = [{ source: 'a', target: 'b', label: '', kind: 'relation' }];
  const nodes = layoutGraph(ids, edges, { width: 1200, height: 780 });

  for (const node of nodes) {
    assert.ok(node.x >= 0 && node.x <= 1200, `x ausserhalb: ${node.x}`);
    assert.ok(node.y >= 0 && node.y <= 780, `y ausserhalb: ${node.y}`);
  }
});

test('Auch mit festen Knoten bleibt die Anordnung in der Flaeche', () => {
  // Ohne Begrenzung trieben die freien Knoten weit aus dem Bild, sobald ein
  // einziger festgehalten wurde: die Einpassung faellt dann ja weg.
  const ids = Array.from({ length: 40 }, (_unused, index) => ({ id: `n${index}`, degree: 2 }));
  const edges = ids.slice(1).map((entry, index) => ({
    source: ids[index].id,
    target: entry.id,
    label: '',
    kind: 'relation'
  }));

  const nodes = layoutGraph(ids, edges, { width: 1200, height: 780, fixed: { n0: { x: 600, y: 400 } } });
  for (const node of nodes) {
    assert.ok(node.x >= 0 && node.x <= 1200, `x ausserhalb: ${node.id} ${node.x}`);
    assert.ok(node.y >= 0 && node.y <= 780, `y ausserhalb: ${node.id} ${node.y}`);
  }

  const feste = nodes.find((node) => node.id === 'n0');
  assert.deepEqual({ x: feste.x, y: feste.y }, { x: 600, y: 400 });

  // Kein Knoten darf auf einem anderen liegen, sonst ist einer davon nicht
  // mehr anzuklicken.
  const stellen = nodes.map((node) => `${Math.round(node.x)},${Math.round(node.y)}`);
  assert.equal(new Set(stellen).size, stellen.length, `Knoten liegen aufeinander: ${stellen.join(' ')}`);
});

test('Freie Knoten legen sich nicht auf einen festgehaltenen', () => {
  // Ein Knoten wird mit hoechstens 18 Punkten Radius gezeichnet. Kommt ein
  // freier naeher, verdeckt er den festgehaltenen.
  for (const anzahl of [2, 4, 6, 12]) {
    const ids = Array.from({ length: anzahl }, (_unused, index) => ({ id: `n${index}`, degree: 2 }));
    const edges = ids.slice(1).map((entry, index) => ({
      source: ids[index].id,
      target: entry.id,
      label: '',
      kind: 'relation'
    }));

    const feste = { n0: { x: 600, y: 390 } };
    const nodes = layoutGraph(ids, edges, { width: 1200, height: 780, fixed: feste });

    for (const node of nodes) {
      if (node.id === 'n0') continue;
      const abstand = Math.hypot(node.x - feste.n0.x, node.y - feste.n0.y);
      assert.ok(abstand > 40, `${anzahl} Knoten: ${node.id} liegt ${Math.round(abstand)} entfernt`);
    }
  }
});

test('Knoten bleiben auch bei vielen Notizen weit genug auseinander', () => {
  // Ein Knoten wird mit bis zu 18 Punkten Radius gezeichnet. Kommen zwei
  // sich naeher als das Doppelte, ueberdecken sie sich.
  for (const anzahl of [20, 40, 80]) {
    const ids = Array.from({ length: anzahl }, (_unused, index) => ({ id: `n${index}`, degree: 2 }));
    const edges = ids.slice(1).map((entry, index) => ({
      source: ids[index].id,
      target: entry.id,
      label: '',
      kind: 'relation'
    }));

    for (const fixed of [{}, { n0: { x: 600, y: 390 } }]) {
      const nodes = layoutGraph(ids, edges, { width: 1200, height: 780, fixed });

      let kleinster = Infinity;
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          kleinster = Math.min(kleinster, Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y));
        }
      }

      const feste = Object.keys(fixed).length ? 'mit fester Stelle' : 'ohne feste Stelle';
      assert.ok(kleinster > 18, `${anzahl} Knoten ${feste}: nur ${Math.round(kleinster)} Punkte Abstand`);
    }
  }
});

test('Auch kleine Netze fuellen die Flaeche noch aus', () => {
  // Ein zu enger Wunschabstand draengt wenige Knoten in einen Klumpen. Der
  // Graph saehe dann bei fuenf Notizen aus wie bei fuenfzig.
  for (const anzahl of [4, 5, 8, 12]) {
    const ids = Array.from({ length: anzahl }, (_unused, index) => ({ id: `n${index}`, degree: 2 }));
    const edges = ids.slice(1).map((entry, index) => ({
      source: ids[index].id,
      target: entry.id,
      label: '',
      kind: 'relation'
    }));

    const nodes = layoutGraph(ids, edges, {
      width: 1200,
      height: 780,
      fixed: { n0: { x: 600, y: 390 } }
    });

    const breite = Math.max(...nodes.map((n) => n.x)) - Math.min(...nodes.map((n) => n.x));
    const hoehe = Math.max(...nodes.map((n) => n.y)) - Math.min(...nodes.map((n) => n.y));
    assert.ok(breite > 300, `${anzahl} Knoten: nur ${Math.round(breite)} breit`);
    assert.ok(hoehe > 150, `${anzahl} Knoten: nur ${Math.round(hoehe)} hoch`);
  }
});
