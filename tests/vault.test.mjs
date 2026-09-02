import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, readdir, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import entry from '../dist/tests/entry.cjs';

const {Vault, zipDirectory} = entry;

/**
 * Datiert vorhandene Fassungen zurueck, damit das Sperrfenster von fuenf
 * Minuten im Test nicht greift. Der Zeitstempel steckt im Dateinamen.
 */
async function backdateVersions(historyDir) {
  let entries;
  try {
    entries = await readdir(historyDir);
  } catch {
    return;
  }

  for (const name of entries) {
    const past = new Date(Date.now() - 60 * 60 * 1000 * (1 + entries.indexOf(name)));
    const renamed = `${past.toISOString().replace(/[:.]/g, '-')}.md`;
    if (renamed !== name) await rename(path.join(historyDir, name), path.join(historyDir, renamed));
  }
}

async function withVault(run) {
  const root = await mkdtemp(path.join(tmpdir(), 'backstory-'));
  const vault = new Vault(root);
  await vault.init();
  try {
    await run(vault, root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('Kampagne und Notiz ueberleben einen Schreib-Lese-Zyklus', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira Falkenhand');

    await vault.saveNote(campaign.id, {
      ...note,
      aliases: ['Die Jägerin'],
      tags: ['Kapitel 1'],
      fields: { species: 'Waldelfe', pronouns: 'sie/ihr' },
      body: 'Sie wuchs im [[Hafen]] auf.'
    });

    const [reloaded] = await vault.listNotes(campaign.id);
    assert.equal(reloaded.title, 'Mira Falkenhand');
    assert.deepEqual(reloaded.aliases, ['Die Jägerin']);
    assert.equal(reloaded.fields.species, 'Waldelfe');
    assert.equal(reloaded.body.trim(), 'Sie wuchs im [[Hafen]] auf.');
  });
});

test('Umbenennen zieht Links in anderen Notizen mit', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const mira = await vault.createNote(campaign.id, 'character', 'Mira');
    const toran = await vault.createNote(campaign.id, 'character', 'Toran');
    await vault.saveNote(campaign.id, { ...toran, body: 'Er schuldet [[Mira]] und [[mira|ihr]] Gold.' });

    const result = await vault.renameNote(campaign.id, mira.id, 'Mira Falkenhand');
    assert.equal(result.rewritten, 1);

    const updated = await vault.getNote(campaign.id, toran.id);
    assert.equal(updated.body.trim(), 'Er schuldet [[Mira Falkenhand]] und [[Mira Falkenhand|ihr]] Gold.');
  });
});

test('Loeschen entfernt Beziehungen anderer Notizen auf die geloeschte', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const mira = await vault.createNote(campaign.id, 'character', 'Mira');
    const toran = await vault.createNote(campaign.id, 'character', 'Toran');
    await vault.saveNote(campaign.id, {
      ...toran,
      relations: [{ id: 'r1', targetId: mira.id, type: 'Mentorin', note: '' }]
    });

    await vault.deleteNote(campaign.id, mira.id);
    const updated = await vault.getNote(campaign.id, toran.id);
    assert.deepEqual(updated.relations, []);
  });
});

test('Kampagnen sind getrennte Container', async () => {
  await withVault(async (vault) => {
    const a = await vault.createCampaign('Sturmkueste');
    const b = await vault.createCampaign('Aschetal');
    await vault.createNote(a.id, 'character', 'Mira');

    assert.equal((await vault.listNotes(a.id)).length, 1);
    assert.equal((await vault.listNotes(b.id)).length, 0);
  });
});

test('Notizdatei bleibt lesbares Markdown mit YAML-Kopf', async () => {
  await withVault(async (vault, root) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');
    await vault.saveNote(campaign.id, { ...note, body: '# Kindheit\n\nSie wuchs am Wasser auf.' });

    const raw = await readFile(path.join(root, 'campaigns', campaign.id, 'notes', `${note.id}.md`), 'utf8');
    assert.ok(raw.startsWith('---\n'));
    assert.match(raw, /title: Mira/);
    assert.match(raw, /schemaVersion: 1/);
    assert.match(raw, /# Kindheit/);
  });
});

test('Ungueltige IDs koennen nicht aus dem Vault ausbrechen', async () => {
  await withVault(async (vault) => {
    await assert.rejects(() => vault.listNotes('../../etc'), { key: 'error.invalidId' });
  });
});

test('Leere Namen werden abgelehnt', async () => {
  await withVault(async (vault) => {
    await assert.rejects(() => vault.createCampaign('   '), { key: 'error.campaignName' });
    const campaign = await vault.createCampaign('Sturmkueste');
    await assert.rejects(() => vault.createNote(campaign.id, 'character', '  '), { key: 'error.noteTitle' });
  });
});

test('Neue Kampagnen bekommen die Standard-Notiztypen', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    assert.ok(campaign.noteTypes.length >= 5);
    assert.ok(campaign.noteTypes.some((def) => def.id === 'character'));
    assert.ok(campaign.noteTypes.some((def) => def.id === 'note' && def.fields.length === 0));
  });
});

test('Kampagne ohne Notiztypen wird beim Lesen migriert und zurueckgeschrieben', async () => {
  await withVault(async (vault, root) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const file = path.join(root, 'campaigns', campaign.id, 'campaign.json');

    // Zustand einer aelteren Version herstellen
    await writeFile(file, JSON.stringify({ id: campaign.id, name: 'Sturmkueste', createdAt: campaign.createdAt }));

    const [migrated] = await vault.listCampaigns();
    assert.ok(migrated.noteTypes.length >= 5, 'Notiztypen nicht ergaenzt');

    const onDisk = JSON.parse(await readFile(file, 'utf8'));
    assert.ok(Array.isArray(onDisk.noteTypes), 'Migration wurde nicht gespeichert');
  });
});

test('Notiztypen lassen sich anpassen', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const types = campaign.noteTypes.map((def) =>
      def.id === 'character'
        ? { ...def, label: 'Person', fields: [...def.fields, { key: 'heimat', label: 'Heimat', type: 'text' }] }
        : def
    );

    const updated = await vault.updateNoteTypes(campaign.id, types);
    const character = updated.noteTypes.find((def) => def.id === 'character');
    assert.equal(character.label, 'Person');
    assert.ok(character.fields.some((field) => field.key === 'heimat'));

    const [reloaded] = await vault.listCampaigns();
    assert.equal(reloaded.noteTypes.find((def) => def.id === 'character').label, 'Person');
  });
});

test('Entferntes Feld loescht keinen bereits eingetragenen Wert', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');
    await vault.saveNote(campaign.id, { ...note, fields: { species: 'Waldelfe' } });

    const types = campaign.noteTypes.map((def) =>
      def.id === 'character' ? { ...def, fields: def.fields.filter((field) => field.key !== 'species') } : def
    );
    await vault.updateNoteTypes(campaign.id, types);

    const reloaded = await vault.getNote(campaign.id, note.id);
    assert.equal(reloaded.fields.species, 'Waldelfe', 'Wert wurde verworfen');
  });
});

test('Ungueltige Notiztypen werden abgelehnt', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    await assert.rejects(() => vault.updateNoteTypes(campaign.id, []), { key: 'error.needsOneType' });
    await assert.rejects(
      () => vault.updateNoteTypes(campaign.id, [{ id: 'a', label: '', plural: '', fields: [] }]),
      { key: 'error.typeNeedsLabel' }
    );
    await assert.rejects(
      () => vault.updateNoteTypes(campaign.id, [
        { id: 'a', label: 'A', plural: 'A', fields: [{ key: 'x', label: 'X', type: 'text' }, { key: 'x', label: 'Y', type: 'text' }] }
      ]),
      { key: 'error.duplicateField' }
    );
    await assert.rejects(
      () => vault.updateNoteTypes(campaign.id, [
        { id: 'a', label: 'A', plural: 'A', fields: [] },
        { id: 'a', label: 'B', plural: 'B', fields: [] }
      ]),
      { key: 'error.duplicateType' }
    );
  });
});

test('Notizen mit unbekanntem Typ bleiben lesbar', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');

    // Typ entfernen, als haette die Nutzerin ihn geloescht
    await vault.updateNoteTypes(
      campaign.id,
      campaign.noteTypes.filter((def) => def.id !== 'character')
    );

    const reloaded = await vault.getNote(campaign.id, note.id);
    assert.equal(reloaded.type, 'character');
    assert.equal(reloaded.title, 'Mira');
  });
});

test('Notizen mit unbekanntem Typ koennen nicht angelegt werden', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    await assert.rejects(() => vault.createNote(campaign.id, 'gibtesnicht', 'Mira'), { key: 'error.unknownNoteType' });
  });
});

test('Bilder werden in die Kampagne kopiert und bekommen einen neuen Namen', async () => {
  await withVault(async (vault, root) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const data = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);

    const first = await vault.saveAsset(campaign.id, 'portrait.png', data);
    const second = await vault.saveAsset(campaign.id, 'portrait.png', data);

    assert.match(first, /^assets\/[0-9a-f-]+\.png$/);
    assert.notEqual(first, second, 'gleichnamige Bilder ueberschreiben sich');

    const stored = await readFile(path.join(root, 'campaigns', campaign.id, first), null);
    assert.deepEqual([...stored], [...data]);
  });
});

test('Nur bekannte Bildformate werden angenommen', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    await assert.rejects(
      () => vault.saveAsset(campaign.id, 'schadcode.exe', new Uint8Array([1])),
      { key: 'error.unsupportedImage' }
    );
    await assert.rejects(
      () => vault.saveAsset(campaign.id, 'ohne-endung', new Uint8Array([1])),
      { key: 'error.unsupportedImage' }
    );
  });
});

test('assetFile laesst keinen Ausbruch aus dem Bildverzeichnis zu', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    assert.throws(() => vault.assetFile(campaign.id, '../../campaign.json'), { key: 'error.invalidAsset' });
    assert.throws(() => vault.assetFile(campaign.id, 'unter/ordner.png'), { key: 'error.invalidAsset' });
    assert.ok(vault.assetFile(campaign.id, 'abc-123.png').endsWith('abc-123.png'));
  });
});

test('Bilder landen in der ZIP-Sicherung', async () => {
  await withVault(async (vault, root) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const relative = await vault.saveAsset(campaign.id, 'portrait.png', new Uint8Array([1, 2, 3]));

    const target = path.join(root, 'sicherung.zip');
    await zipDirectory(path.join(root, 'campaigns', campaign.id), target);

    const listing = execFileSync('unzip', ['-Z1', target], { encoding: 'utf8' });
    assert.match(listing, new RegExp(relative.replace('assets/', 'assets/')));
  });
});

test('Erste Aenderung legt eine Fassung an, weitere im Sperrfenster nicht', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');

    assert.deepEqual(await vault.listVersions(campaign.id, note.id), [], 'neue Notiz hat schon Fassungen');

    const first = await vault.saveNote(campaign.id, { ...note, body: 'Erster Text.' });
    let versions = await vault.listVersions(campaign.id, note.id);
    assert.equal(versions.length, 1, 'kein Stand gesichert');
    assert.equal(versions[0].body.trim(), '', 'gesichert wurde der falsche Stand');

    // Zweites Speichern kurz danach darf keine weitere Fassung anlegen
    await vault.saveNote(campaign.id, { ...first, body: 'Zweiter Text.' });
    versions = await vault.listVersions(campaign.id, note.id);
    assert.equal(versions.length, 1, 'Sperrfenster greift nicht');
  });
});

test('Unveraendertes Speichern legt keine Fassung an', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');
    const saved = await vault.saveNote(campaign.id, { ...note, body: 'Text.' });

    const before = (await vault.listVersions(campaign.id, note.id)).length;
    await vault.saveNote(campaign.id, saved);
    const after = (await vault.listVersions(campaign.id, note.id)).length;

    assert.equal(after, before, 'gleicher Inhalt hat eine Fassung erzeugt');
  });
});

test('Wiederherstellen holt den alten Text zurueck und sichert den aktuellen', async () => {
  await withVault(async (vault, root) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');
    const first = await vault.saveNote(campaign.id, { ...note, body: 'Alter Text.' });

    // Sperrfenster umgehen, indem die vorhandene Fassung zurueckdatiert wird
    const historyDir = path.join(root, 'campaigns', campaign.id, 'history', note.id);
    await backdateVersions(historyDir);

    await vault.saveNote(campaign.id, { ...first, body: 'Neuer Text.' });

    // Erst zurueckdatieren, dann auflisten: das Umbenennen aendert die IDs
    await backdateVersions(historyDir);
    const versions = await vault.listVersions(campaign.id, note.id);
    const oldVersion = versions.find((version) => version.body.includes('Alter Text'));
    assert.ok(oldVersion, 'alte Fassung fehlt im Verlauf');

    const restored = await vault.restoreVersion(campaign.id, note.id, oldVersion.id);

    assert.match(restored.body, /Alter Text/);
    assert.equal(restored.id, note.id, 'Notiz-ID wurde ersetzt');
    assert.equal(restored.createdAt, note.createdAt, 'Erstellungszeit wurde ersetzt');

    const afterRestore = await vault.listVersions(campaign.id, note.id);
    assert.ok(
      afterRestore.some((version) => version.body.includes('Neuer Text')),
      'der überschriebene Stand wurde nicht gesichert'
    );
  });
});

test('Der Verlauf wird auf die eingestellte Hoechstzahl gekuerzt', async () => {
  await withVault(async (vault, root) => {
    vault.setHistoryOptions({ enabled: true, maxVersions: 3 });
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');
    const historyDir = path.join(root, 'campaigns', campaign.id, 'history', note.id);

    let current = note;
    for (let round = 0; round < 6; round++) {
      current = await vault.saveNote(campaign.id, { ...current, body: `Fassung ${round}` });
      await backdateVersions(historyDir);
    }

    const versions = await vault.listVersions(campaign.id, note.id);
    assert.ok(versions.length <= 3, `zu viele Fassungen: ${versions.length}`);
  });
});

test('Abgeschalteter Verlauf legt nichts an', async () => {
  await withVault(async (vault) => {
    vault.setHistoryOptions({ enabled: false, maxVersions: 50 });
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');
    await vault.saveNote(campaign.id, { ...note, body: 'Text.' });

    assert.deepEqual(await vault.listVersions(campaign.id, note.id), []);
  });
});

test('Unbekannte Fassung wird abgelehnt', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');
    await assert.rejects(() => vault.restoreVersion(campaign.id, note.id, 'gibtesnicht'), {
      key: 'error.versionMissing'
    });
    await assert.rejects(() => vault.restoreVersion(campaign.id, note.id, '../../campaign'), {
      key: 'error.invalidId'
    });
  });
});

test('Schreibhilfe wird beim ersten Lesen als Datei angelegt', async () => {
  await withVault(async (vault, root) => {
    const prompts = await vault.readPrompts('de');
    assert.ok(prompts.length >= 5);

    const raw = JSON.parse(await readFile(path.join(root, 'writing-prompts.json'), 'utf8'));
    assert.equal(raw.length, prompts.length, 'Datei wurde nicht geschrieben');
  });
});

test('Eigene Schreibhilfe-Datei wird benutzt und repariert', async () => {
  await withVault(async (vault, root) => {
    await writeFile(
      path.join(root, 'writing-prompts.json'),
      JSON.stringify([
        { id: 'eigene', label: 'Eigene Liste', options: ['Erster Eintrag', '  ', 42] },
        { label: '', options: ['wird verworfen'] },
        { label: 'Ohne Einträge', options: [] },
        'kaputt'
      ])
    );

    const prompts = await vault.readPrompts('de');
    assert.equal(prompts.length, 1, 'unbrauchbare Einträge wurden nicht aussortiert');
    assert.equal(prompts[0].label, 'Eigene Liste');
    assert.deepEqual(prompts[0].options, ['Erster Eintrag']);
  });
});

test('Unlesbare Schreibhilfe-Datei faellt auf die Vorlage zurueck', async () => {
  await withVault(async (vault, root) => {
    await writeFile(path.join(root, 'writing-prompts.json'), 'kein json');
    assert.ok((await vault.readPrompts('de')).length >= 5);
  });
});

test('Verwaiste Bilder werden gefunden, benutzte nicht', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');

    const imBody = await vault.saveAsset(campaign.id, 'szene.png', new Uint8Array([1, 2, 3]));
    const imField = await vault.saveAsset(campaign.id, 'portrait.png', new Uint8Array([1, 2, 3, 4]));
    const unused = await vault.saveAsset(campaign.id, 'alt.png', new Uint8Array([1, 2, 3, 4, 5]));

    await vault.saveNote(campaign.id, {
      ...note,
      body: `Text ![Szene](${imBody})`,
      fields: { portrait: imField }
    });

    const orphans = await vault.listOrphanedAssets(campaign.id);
    assert.deepEqual(
      orphans.map((entry) => entry.name),
      [unused.replace('assets/', '')],
      'falsche Dateien als verwaist gemeldet'
    );
    assert.equal(orphans[0].bytes, 5);
  });
});

test('Bilder aus dem Versionsverlauf gelten als benutzt', async () => {
  await withVault(async (vault, root) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');
    const image = await vault.saveAsset(campaign.id, 'szene.png', new Uint8Array([1, 2, 3]));

    const withImage = await vault.saveNote(campaign.id, { ...note, body: `![](${image})` });
    await backdateVersions(path.join(root, 'campaigns', campaign.id, 'history', note.id));

    // Bild aus dem Text entfernen: der alte Stand wandert in den Verlauf
    await vault.saveNote(campaign.id, { ...withImage, body: 'Ohne Bild.' });

    assert.deepEqual(
      await vault.listOrphanedAssets(campaign.id),
      [],
      'ein noch im Verlauf benutztes Bild wurde als verwaist gemeldet'
    );
  });
});

test('Ohne Versionsverlauf wird das entfernte Bild verwaist', async () => {
  await withVault(async (vault) => {
    vault.setHistoryOptions({ enabled: false, maxVersions: 50 });
    const campaign = await vault.createCampaign('Sturmkueste');
    const note = await vault.createNote(campaign.id, 'character', 'Mira');
    const image = await vault.saveAsset(campaign.id, 'szene.png', new Uint8Array([1, 2, 3]));

    const withImage = await vault.saveNote(campaign.id, { ...note, body: `![](${image})` });
    await vault.saveNote(campaign.id, { ...withImage, body: 'Ohne Bild.' });

    const orphans = await vault.listOrphanedAssets(campaign.id);
    assert.equal(orphans.length, 1);
    assert.equal(orphans[0].name, image.replace('assets/', ''));
  });
});

test('Loeschen entfernt genau die genannten Dateien', async () => {
  await withVault(async (vault, root) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const keep = await vault.saveAsset(campaign.id, 'behalten.png', new Uint8Array([1]));
    const drop = await vault.saveAsset(campaign.id, 'weg.png', new Uint8Array([1]));

    const removed = await vault.deleteAssets(campaign.id, [drop.replace('assets/', '')]);
    assert.equal(removed, 1);

    const files = await readdir(path.join(root, 'campaigns', campaign.id, 'assets'));
    assert.deepEqual(files, [keep.replace('assets/', '')]);

    // Erneutes Loeschen ist kein Fehler
    assert.equal(await vault.deleteAssets(campaign.id, [drop.replace('assets/', '')]), 0);
  });
});

test('Loeschen laesst keinen Ausbruch aus dem Bildverzeichnis zu', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    await assert.rejects(() => vault.deleteAssets(campaign.id, ['../campaign.json']), { key: 'error.invalidAsset' });
  });
});

test('Umbenennen zieht auch einen Selbstverweis mit', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const mira = await vault.createNote(campaign.id, 'character', 'Mira');
    await vault.saveNote(campaign.id, { ...mira, body: 'Ich, [[Mira]], schreibe das.' });

    await vault.renameNote(campaign.id, mira.id, 'Mira Falkenhand');

    const updated = await vault.getNote(campaign.id, mira.id);
    assert.equal(updated.title, 'Mira Falkenhand');
    assert.match(updated.body, /\[\[Mira Falkenhand\]\]/);
    assert.ok(!/\[\[Mira\]\]/.test(updated.body), 'der alte Name steht noch im eigenen Text');
  });
});

test('Beim Umbenennen wird der Titel zuletzt gesetzt', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const mira = await vault.createNote(campaign.id, 'character', 'Mira');
    const toran = await vault.createNote(campaign.id, 'character', 'Toran');
    await vault.saveNote(campaign.id, { ...toran, body: 'Er kennt [[Mira]].' });

    // Schreiben der anderen Notiz scheitern lassen, um einen Abbruch mitten
    // im Umbenennen nachzustellen
    const original = fs.rename;
    let broken = true;
    fs.rename = async (from, to) => {
      if (broken && String(to).endsWith(`${toran.id}.md`)) throw new Error('Schreiben fehlgeschlagen');
      return original(from, to);
    };

    try {
      await assert.rejects(() => vault.renameNote(campaign.id, mira.id, 'Mira Falkenhand'));

      // Die Notiz muss noch den alten Titel tragen, sonst waere der Zustand
      // nicht mehr durch erneutes Umbenennen zu reparieren
      const afterCrash = await vault.getNote(campaign.id, mira.id);
      assert.equal(afterCrash.title, 'Mira', 'der Titel wurde vor den Verweisen gesetzt');

      broken = false;
      await vault.renameNote(campaign.id, mira.id, 'Mira Falkenhand');
      assert.match((await vault.getNote(campaign.id, toran.id)).body, /\[\[Mira Falkenhand\]\]/);
    } finally {
      fs.rename = original;
    }
  });
});

test('Auswahllisten behalten ihre Werte', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const types = campaign.noteTypes.map((def) =>
      def.id === 'character'
        ? {
            ...def,
            fields: [
              ...def.fields,
              { key: 'gesinnung', label: 'Gesinnung', type: 'select', options: ['Rechtschaffen', 'Neutral', 'Chaotisch'] },
              { key: 'lebt', label: 'Lebt noch', type: 'checkbox' },
              { key: 'geburtstag', label: 'Geburtstag', type: 'date' }
            ]
          }
        : def
    );

    const updated = await vault.updateNoteTypes(campaign.id, types);
    const character = updated.noteTypes.find((def) => def.id === 'character');
    assert.deepEqual(
      character.fields.find((field) => field.key === 'gesinnung').options,
      ['Rechtschaffen', 'Neutral', 'Chaotisch']
    );
    assert.equal(character.fields.find((field) => field.key === 'lebt').type, 'checkbox');
    assert.equal(character.fields.find((field) => field.key === 'geburtstag').type, 'date');

    // Nach dem erneuten Lesen von der Platte muss alles noch da sein
    const [reloaded] = await vault.listCampaigns();
    assert.equal(
      reloaded.noteTypes.find((def) => def.id === 'character').fields.find((field) => field.key === 'gesinnung')
        .options.length,
      3
    );
  });
});

test('Eine Auswahlliste ohne Werte wird abgelehnt', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    await assert.rejects(
      () =>
        vault.updateNoteTypes(campaign.id, [
          { id: 'a', label: 'A', plural: 'A', fields: [{ key: 'x', label: 'Auswahl', type: 'select', options: [] }] }
        ]),
      { key: 'error.selectNeedsOptions' }
    );
  });
});

test('Eine von Hand kaputt gemachte Auswahlliste wird zu Text', async () => {
  await withVault(async (vault, root) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const file = path.join(root, 'campaigns', campaign.id, 'campaign.json');
    const stored = JSON.parse(await readFile(file, 'utf8'));
    stored.noteTypes = [
      { id: 'a', label: 'A', plural: 'A', fields: [{ key: 'x', label: 'Auswahl', type: 'select' }] }
    ];
    await writeFile(file, JSON.stringify(stored));

    const [reloaded] = await vault.listCampaigns();
    assert.equal(reloaded.noteTypes[0].fields[0].type, 'text', 'kaputte Auswahlliste blieb unbedienbar');
  });
});

test('Kaputte Notizdateien werden gemeldet statt stillschweigend zu fehlen', async () => {
  await withVault(async (vault, root) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const heil = await vault.createNote(campaign.id, 'character', 'Mira');

    const notesDir = path.join(root, 'campaigns', campaign.id, 'notes');
    await writeFile(path.join(notesDir, 'kaputt.md'), '---\nid: [unclosed\n  broken: yaml\n---\n\nText');

    // Die heile Notiz bleibt lesbar, die kaputte fehlt in der Liste
    const notes = await vault.listNotes(campaign.id);
    assert.deepEqual(notes.map((note) => note.id), [heil.id]);

    // ... wird aber gemeldet
    assert.deepEqual(await vault.findUnreadableNotes(campaign.id), ['kaputt.md']);
  });
});

test('Ohne kaputte Dateien meldet die Pruefung nichts', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    await vault.createNote(campaign.id, 'character', 'Mira');
    assert.deepEqual(await vault.findUnreadableNotes(campaign.id), []);
  });
});

test('Titel mit Link-Sonderzeichen werden abgelehnt', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');

    // [[ ]] und | haben im Link-Format eine Bedeutung. Stuenden sie im
    // Titel, liesse sich die Notiz nicht mehr eindeutig verlinken.
    for (const bad of ['Mira|Falke', 'Buch [[Alpha]]', 'Halb ] offen']) {
      await assert.rejects(() => vault.createNote(campaign.id, 'character', bad));
    }

    const mira = await vault.createNote(campaign.id, 'character', 'Mira');
    await assert.rejects(() => vault.renameNote(campaign.id, mira.id, 'Mira|Falke'));
    await assert.rejects(() => vault.saveNote(campaign.id, { ...mira, title: 'Mira|Falke' }));

    // Der abgelehnte Versuch darf nichts veraendert haben.
    assert.equal((await vault.getNote(campaign.id, mira.id)).title, 'Mira');
  });
});

test('Aliase mit Link-Sonderzeichen werden abgelehnt', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const mira = await vault.createNote(campaign.id, 'character', 'Mira');
    await assert.rejects(() => vault.saveNote(campaign.id, { ...mira, aliases: ['Die|Jaegerin'] }));
  });
});

test('Umbenennen bricht Links in anderen Notizen nicht auf', async () => {
  await withVault(async (vault) => {
    const campaign = await vault.createCampaign('Sturmkueste');
    const mira = await vault.createNote(campaign.id, 'character', 'Mira');
    const toran = await vault.createNote(campaign.id, 'character', 'Toran');
    await vault.saveNote(campaign.id, { ...toran, body: 'Er schuldet [[Mira]] Gold.' });

    await assert.rejects(() => vault.renameNote(campaign.id, mira.id, 'Mira|Falke'));
    const updated = await vault.getNote(campaign.id, toran.id);
    assert.equal(updated.body.trim(), 'Er schuldet [[Mira]] Gold.');
  });
});
