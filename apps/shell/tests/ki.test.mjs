import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import entry from '../dist/tests/entry.cjs';

const { sanitizeSettings, ohneSchluessel, DEFAULT_SETTINGS, findeKiUebernahme } = entry;

async function imOrdner(lauf) {
  const ordner = await mkdtemp(join(tmpdir(), 'huelle-ki-'));
  try {
    return await lauf(ordner);
  } finally {
    await rm(ordner, { recursive: true, force: true });
  }
}

// --- Bereinigen -------------------------------------------------------------

test('ohne KI-Abschnitt in der Datei gilt: keine KI', () => {
  // Der Normalfall. Eine Einstellungsdatei aus der Zeit vor diesem Abschnitt
  // darf nicht dazu fuehren, dass ploetzlich etwas angesprochen wird.
  const sauber = sanitizeSettings({ language: 'de' });
  assert.equal(sauber.ki.anbieter, 'none');
  assert.equal(sauber.claudeSchluessel, '');
});

test('ein unbekannter Anbieter faellt auf keine KI zurueck', () => {
  // Und nicht auf den ersten in der Liste: eine Datei aus einer neueren
  // Fassung soll die KI abschalten, nicht stillschweigend etwas anderes
  // ansprechen, als dort stand.
  const sauber = sanitizeSettings({ language: 'en', ki: { anbieter: 'openai' } });
  assert.equal(sauber.ki.anbieter, 'none');
});

test('leere Modellfelder fallen auf die Vorgaben zurueck', () => {
  // Sonst ginge die Anfrage an ein Modell namens '' und scheiterte mit einer
  // Meldung, aus der niemand schlau wird.
  const sauber = sanitizeSettings({
    ki: { anbieter: 'ollama', ollamaModell: '   ', ollamaAdresse: '' }
  });
  assert.equal(sauber.ki.ollamaModell, DEFAULT_SETTINGS.ki.ollamaModell);
  assert.equal(sauber.ki.ollamaAdresse, DEFAULT_SETTINGS.ki.ollamaAdresse);
});

test('gueltige Werte bleiben unangetastet', () => {
  const sauber = sanitizeSettings({
    language: 'de',
    ki: {
      anbieter: 'claude',
      ollamaAdresse: 'http://anders:1234',
      ollamaModell: 'mistral',
      claudeModell: 'claude-sonnet-5'
    },
    claudeSchluessel: 'AAAA'
  });
  assert.equal(sauber.ki.anbieter, 'claude');
  assert.equal(sauber.ki.claudeModell, 'claude-sonnet-5');
  assert.equal(sauber.claudeSchluessel, 'AAAA');
});

// --- Der Schluessel bleibt im Hauptprozess ---------------------------------

test('was an die Oberflaeche geht, traegt den Schluessel nicht', () => {
  // Er waere dort zwar weiterhin verschluesselt, hat aber schlicht nichts zu
  // suchen: sie muss nur wissen, OB einer da ist.
  const abgelegt = sanitizeSettings({ claudeSchluessel: 'v10:abc', language: 'de' });
  const fuerDieOberflaeche = ohneSchluessel(abgelegt);
  assert.equal(fuerDieOberflaeche.claudeSchluessel, '');
  // Und der Rest kommt vollstaendig mit.
  assert.equal(fuerDieOberflaeche.language, 'de');
  assert.deepEqual(fuerDieOberflaeche.ki, abgelegt.ki);
});

// --- Uebernahme aus dem Backstory Creator ----------------------------------

test('eine im Backstory Creator eingerichtete KI wird uebernommen', () =>
  imOrdner(async (ordner) => {
    const datei = join(ordner, 'settings.json');
    await writeFile(
      datei,
      JSON.stringify({
        aiProvider: 'ollama',
        ollamaBaseUrl: 'http://127.0.0.1:9999',
        ollamaModel: 'qwen2.5',
        claudeModel: 'claude-opus-5',
        claudeApiKeyEncrypted: 'verschluesselt'
      })
    );

    const uebernommen = await findeKiUebernahme(DEFAULT_SETTINGS, datei);
    assert.equal(uebernommen.ki.anbieter, 'ollama');
    assert.equal(uebernommen.ki.ollamaAdresse, 'http://127.0.0.1:9999');
    assert.equal(uebernommen.ki.ollamaModell, 'qwen2.5');
    // Derselbe Rechner, derselbe Schluesselbund: der Schluessel laesst sich
    // hier genauso wieder aufmachen und wandert unveraendert mit.
    assert.equal(uebernommen.claudeSchluessel, 'verschluesselt');
  }));

test('ein Schluessel ohne eingerichteten Anbieter wandert trotzdem mit', () =>
  imOrdner(async (ordner) => {
    // Den will niemand zweimal eintippen, auch wenn die Anbindung gerade aus
    // steht.
    const datei = join(ordner, 'settings.json');
    await writeFile(datei, JSON.stringify({ aiProvider: 'none', claudeApiKeyEncrypted: 'abc' }));

    const uebernommen = await findeKiUebernahme(DEFAULT_SETTINGS, datei);
    assert.deepEqual(uebernommen, { claudeSchluessel: 'abc' });
  }));

test('wer in der Huelle schon etwas eingerichtet hat, bekommt nichts zurueck', () =>
  imOrdner(async (ordner) => {
    // Das ist der wichtige Fall: die Uebernahme darf genau einmal greifen.
    // Sonst kaeme nach jedem Start der alte Stand wieder.
    const datei = join(ordner, 'settings.json');
    await writeFile(datei, JSON.stringify({ aiProvider: 'claude', claudeApiKeyEncrypted: 'alt' }));

    const schonEingerichtet = sanitizeSettings({ ki: { anbieter: 'ollama' } });
    assert.equal(await findeKiUebernahme(schonEingerichtet, datei), null);
  }));

test('auch ein hinterlegter Schluessel allein haelt die Uebernahme ab', () =>
  imOrdner(async (ordner) => {
    const datei = join(ordner, 'settings.json');
    await writeFile(datei, JSON.stringify({ aiProvider: 'claude', claudeApiKeyEncrypted: 'alt' }));

    const mitSchluessel = sanitizeSettings({ claudeSchluessel: 'neuer' });
    assert.equal(await findeKiUebernahme(mitSchluessel, datei), null);
  }));

test('ohne Datei und bei kaputter Datei passiert nichts', () =>
  imOrdner(async (ordner) => {
    // Eine fehlende Datei ist der Normalfall bei einer frischen Installation
    // und kein Fehler.
    assert.equal(await findeKiUebernahme(DEFAULT_SETTINGS, join(ordner, 'gibtsnicht.json')), null);

    const kaputt = join(ordner, 'kaputt.json');
    await writeFile(kaputt, '{ das ist kein JSON');
    assert.equal(await findeKiUebernahme(DEFAULT_SETTINGS, kaputt), null);
  }));

test('eine Datei ohne KI-Angaben gibt nichts her', () =>
  imOrdner(async (ordner) => {
    const datei = join(ordner, 'settings.json');
    await writeFile(datei, JSON.stringify({ vaultRoot: '/irgendwo', language: 'de' }));
    assert.equal(await findeKiUebernahme(DEFAULT_SETTINGS, datei), null);
  }));
