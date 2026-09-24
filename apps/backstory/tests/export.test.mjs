import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import entry from '../dist/tests/entry.cjs';

const {zipDirectory} = entry;

/**
 * Laeuft gegen das esbuild-Bundle, nicht gegen die Quelle. Damit faellt auf,
 * wenn das Buendeln der ZIP-Bibliothek etwas zerlegt, so wie es beim ersten
 * Windows-Paket der Fall war.
 */
test('zipDirectory schreibt ein gueltiges, entpackbares Archiv', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'backstory-zip-'));
  try {
    const source = path.join(root, 'kampagne');
    await mkdir(path.join(source, 'notes'), { recursive: true });
    await writeFile(path.join(source, 'campaign.json'), '{"name":"Sturmküste"}');
    await writeFile(path.join(source, 'notes', 'mira.md'), '---\ntitle: Mira\n---\n\nText mit [[Toran]].');

    const target = path.join(root, 'sicherung.zip');
    const bytes = await zipDirectory(source, target);
    assert.ok(bytes > 0, 'Archiv ist leer');

    const header = await readFile(target);
    assert.deepEqual([...header.subarray(0, 2)], [0x50, 0x4b], 'keine ZIP-Signatur');

    const listing = execFileSync('unzip', ['-Z1', target], { encoding: 'utf8' });
    assert.match(listing, /kampagne\/campaign\.json/);
    assert.match(listing, /kampagne\/notes\/mira\.md/);

    const extracted = execFileSync('unzip', ['-p', target, 'kampagne/notes/mira.md'], { encoding: 'utf8' });
    assert.match(extracted, /\[\[Toran\]\]/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('Dateinamen im Markdown-Export unterscheiden sich auch ohne Gross/Klein', async () => {
  const { toFileName, aliasKopf } = entry;
  assert.equal(toFileName('bo', ['Bo.md']), 'bo 2.md');
  assert.equal(aliasKopf('Bo', 'Bo.md'), '');
  assert.match(aliasKopf('Wer ist Bo?', 'Wer ist Bo.md'), /aliases:\n {2}- "Wer ist Bo\?"/);
});
