import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
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
    await assert.rejects(() => vault.listNotes('../../etc'), /Ungültige ID/);
  });
});

test('Leere Namen werden abgelehnt', async () => {
  await withVault(async (vault) => {
    await assert.rejects(() => vault.createCampaign('   '), /Namen/);
    const campaign = await vault.createCampaign('Sturmkueste');
    await assert.rejects(() => vault.createNote(campaign.id, 'character', '  '), /Titel/);
  });
});
