import { describe, expect, it } from 'vitest';
import {
  assetIdFor,
  categoryFor,
  displayNameFor,
  isImageFile,
  tagsFor,
} from '@/assets/importStore';

describe('isImageFile', () => {
  it('erkennt die üblichen Bildformate', () => {
    for (const n of ['a.png', 'a.PNG', 'a.webp', 'a.jpg', 'a.jpeg', 'a.gif', 'a.avif']) {
      expect(isImageFile(n), n).toBe(true);
    }
  });

  it('lehnt alles andere ab', () => {
    for (const n of ['a.txt', 'a.psd', 'a', 'a.png.txt']) {
      expect(isImageFile(n), n).toBe(false);
    }
  });
});

describe('assetIdFor', () => {
  it('macht aus dem Pfad eine stabile Id', () => {
    expect(assetIdFor('moebel/Tisch Rund.png')).toBe('imp_moebel_tisch_rund');
  });

  it('unterscheidet gleichnamige Dateien in verschiedenen Ordnern', () => {
    expect(assetIdFor('a/tisch.png')).not.toBe(assetIdFor('b/tisch.png'));
  });

  it('ist für denselben Pfad immer gleich — sonst bräche das Speichern', () => {
    expect(assetIdFor('x/y.png')).toBe(assetIdFor('x/y.png'));
  });

  it('kommt mit Pfaden ohne brauchbare Zeichen zurecht', () => {
    expect(assetIdFor('___.png')).toBe('imp_asset');
  });
});

describe('categoryFor', () => {
  it('leitet die Kategorie aus dem Ordner ab', () => {
    expect(categoryFor('moebel/tisch.png')).toBe('moebel');
    expect(categoryFor('assets/trees/eiche.png')).toBe('baum');
    expect(categoryFor('Dungeon/altar.png')).toBe('dungeon');
  });

  it('nimmt den innersten passenden Ordner', () => {
    expect(categoryFor('baum/moebel/stuhl.png')).toBe('moebel');
  });

  it('fällt auf „Importiert" zurück', () => {
    expect(categoryFor('kramkiste/dings.png')).toBe('import');
    expect(categoryFor('dings.png')).toBe('import');
  });
});

describe('tagsFor', () => {
  it('zerlegt Ordner und Dateinamen in Suchbegriffe', () => {
    expect(tagsFor('moebel/tisch_rund.png').sort()).toEqual(['moebel', 'rund', 'tisch']);
  });

  it('wirft Einzelbuchstaben und Dubletten weg', () => {
    expect(tagsFor('a/tisch-tisch.png')).toEqual(['tisch']);
  });
});

describe('displayNameFor', () => {
  it('macht aus dem Dateinamen einen lesbaren Namen', () => {
    expect(displayNameFor('moebel/tisch_rund.png')).toBe('Tisch rund');
    expect(displayNameFor('altar.webp')).toBe('Altar');
  });
});

describe('Id-Rundlauf über die Projektdatei', () => {
  it('der Dateiname im Archiv trägt die Id, ohne sie zu verändern', () => {
    // Beim Speichern heißt die Datei „<id>.<endung>". Beim Öffnen muss die Id
    // daraus *abgeschnitten* werden — sie erneut durch assetIdFor zu schicken
    // hängte ein zweites „imp_" davor, und das Dokument fände sein Prop nicht
    // mehr. Genau das ist einmal passiert.
    const id = assetIdFor('moebel/tisch_rund.png');
    const imArchiv = `${id}.png`;
    expect(imArchiv.replace(/\.[^.]+$/, '')).toBe(id);
    expect(assetIdFor(imArchiv)).not.toBe(id);
  });
});
