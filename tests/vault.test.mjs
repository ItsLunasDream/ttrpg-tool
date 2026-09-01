import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import entry from '../dist/tests/entry.cjs';

const {Vault} = entry;

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
