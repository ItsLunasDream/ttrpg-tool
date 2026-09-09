import { describe, expect, it } from 'vitest';
import { AddVttItems, PatchVttItems, RemoveVttItems } from '@/model/commands';
import { createDocument } from '@/model/document';
import { migrate } from '@/io/project';
import { buildUvtt, parseUvtt, serializeUvtt } from '@/io/uvtt';
import {
  buildFoundryNotes,
  buildFoundryNotesMacro,
  foundryIconPath,
  textToHtml,
} from '@/io/foundryNotes';
import { NOTE_ICONS, type MapDocument, type MapNote } from '@/model/types';

function note(over: Partial<MapNote> = {}): MapNote {
  return {
    id: 'n1',
    x: 250,
    y: 400,
    title: 'Krypta',
    text: 'Hier liegt der Grabräuber.',
    icon: 'danger',
    size: 1.5,
    color: 0xff4d4d,
    playerVisible: false,
    ...over,
  };
}

function docMitNotiz(over: Partial<MapNote> = {}): MapDocument {
  const doc = createDocument(20, 15, 'Testkarte');
  doc.grid.tileSize = 100;
  doc.vtt.notes = [note(over)];
  return doc;
}

describe('Notizen im Dokument', () => {
  it('ein frisches Dokument hat eine leere Notizliste', () => {
    expect(createDocument(10, 10, 'x').vtt.notes).toEqual([]);
  });

  it('Hinzufügen und Rückgängig', () => {
    const doc = createDocument(10, 10, 'x');
    const cmd = new AddVttItems('notes', [note()]);
    cmd.do(doc);
    expect(doc.vtt.notes).toHaveLength(1);
    cmd.undo(doc);
    expect(doc.vtt.notes).toHaveLength(0);
  });

  it('Löschen stellt die Reihenfolge beim Rückgängig wieder her', () => {
    const doc = createDocument(10, 10, 'x');
    new AddVttItems('notes', [
      note({ id: 'a' }),
      note({ id: 'b' }),
      note({ id: 'c' }),
    ]).do(doc);

    const cmd = new RemoveVttItems({ notes: ['b'] });
    cmd.do(doc);
    expect(doc.vtt.notes.map((n) => n.id)).toEqual(['a', 'c']);
    cmd.undo(doc);
    expect(doc.vtt.notes.map((n) => n.id)).toEqual(['a', 'b', 'c']);
  });

  it('Ändern und Rückgängig stellt den alten Text her', () => {
    const doc = docMitNotiz();
    const cmd = new PatchVttItems('notes', new Map([['n1', { text: 'neu' }]]));
    cmd.do(doc);
    expect(doc.vtt.notes[0].text).toBe('neu');
    cmd.undo(doc);
    expect(doc.vtt.notes[0].text).toBe('Hier liegt der Grabräuber.');
  });

  it('mehrere Änderungen verschmelzen zu einem Schritt', () => {
    const doc = docMitNotiz();
    const erste = new PatchVttItems('notes', new Map([['n1', { title: 'K' }]]), 'x', 'm');
    erste.do(doc);
    const zweite = new PatchVttItems('notes', new Map([['n1', { title: 'Kr' }]]), 'x', 'm');
    zweite.do(doc);
    erste.absorb(zweite);
    erste.undo(doc);
    expect(doc.vtt.notes[0].title).toBe('Krypta');
  });
});

describe('Notizen im Universal VTT', () => {
  it('schreibt Positionen in Grid-Einheiten', () => {
    const file = buildUvtt(docMitNotiz(), { pixelsPerGrid: 100, image: '' });
    expect(file.notes).toHaveLength(1);
    expect(file.notes?.[0].position).toEqual({ x: 2.5, y: 4 });
  });

  it('geht durch Schreiben und Lesen unverändert hindurch', () => {
    const doc = docMitNotiz();
    const text = serializeUvtt(buildUvtt(doc, { pixelsPerGrid: 100, image: '' }));
    const zurueck = parseUvtt(text, 100);

    expect(zurueck.vtt.notes).toHaveLength(1);
    const n = zurueck.vtt.notes[0];
    expect(n.x).toBeCloseTo(250, 6);
    expect(n.y).toBeCloseTo(400, 6);
    expect(n.title).toBe('Krypta');
    expect(n.text).toBe('Hier liegt der Grabräuber.');
    expect(n.icon).toBe('danger');
    expect(n.size).toBeCloseTo(1.5, 6);
    expect(n.color).toBe(0xff4d4d);
    expect(n.playerVisible).toBe(false);
  });

  it('behält die Sichtbarkeit für Spieler', () => {
    const doc = docMitNotiz({ playerVisible: true });
    const zurueck = parseUvtt(serializeUvtt(buildUvtt(doc, { pixelsPerGrid: 100, image: '' })), 100);
    expect(zurueck.vtt.notes[0].playerVisible).toBe(true);
  });

  it('eine fremde Datei ohne Notizen ergibt eine leere Liste', () => {
    const zurueck = parseUvtt(
      JSON.stringify({
        format: 0.3,
        resolution: { map_origin: { x: 0, y: 0 }, map_size: { x: 10, y: 10 }, pixels_per_grid: 100 },
        line_of_sight: [],
        portals: [],
        lights: [],
        image: '',
      }),
      100,
    );
    expect(zurueck.vtt.notes).toEqual([]);
  });

  it('ein unbekanntes Symbol fällt auf das Fähnchen zurück, statt zu scheitern', () => {
    const doc = docMitNotiz();
    const file = buildUvtt(doc, { pixelsPerGrid: 100, image: '' });
    file.notes![0].icon = 'gibtesnicht';
    const zurueck = parseUvtt(file, 100);
    expect(zurueck.vtt.notes[0].icon).toBe('marker');
  });
});

describe('Foundry-Makro', () => {
  it('rechnet die Position in Grid-Einheiten um', () => {
    const [n] = buildFoundryNotes(docMitNotiz());
    expect(n.x).toBeCloseTo(2.5, 6);
    expect(n.y).toBeCloseTo(4, 6);
  });

  it('macht aus Absätzen HTML und escaped dabei', () => {
    expect(textToHtml('Erster Absatz\n\nZweiter <b>fett</b>')).toBe(
      '<p>Erster Absatz</p><p>Zweiter &lt;b&gt;fett&lt;/b&gt;</p>',
    );
  });

  it('einzelne Zeilenumbrüche bleiben im selben Absatz', () => {
    expect(textToHtml('Zeile eins\nZeile zwei')).toBe('<p>Zeile eins<br>Zeile zwei</p>');
  });

  it('leerer Text ergibt leeres HTML statt eines leeren Absatzes', () => {
    expect(textToHtml('   \n\n  ')).toBe('');
  });

  it('eine Notiz ohne Titel bekommt einen Ersatznamen', () => {
    const [n] = buildFoundryNotes(docMitNotiz({ title: '  ' }));
    expect(n.title).toBe('Notiz 1');
  });

  it('Sichtbarkeit wird zu Foundrys Besitzstufen', () => {
    expect(buildFoundryNotes(docMitNotiz({ playerVisible: false }))[0].ownership).toBe(0);
    expect(buildFoundryNotes(docMitNotiz({ playerVisible: true }))[0].ownership).toBe(2);
  });

  it('jedes Symbol hat einen Foundry-Pfad aus dem Grundumfang', () => {
    for (const icon of NOTE_ICONS) {
      expect(foundryIconPath(icon)).toMatch(/^icons\/svg\/[a-z-]+\.svg$/);
    }
  });

  it('die Farbe steht als CSS-Farbe im Makro', () => {
    expect(buildFoundryNotes(docMitNotiz({ color: 0x00ff88 }))[0].iconTint).toBe('#00ff88');
  });

  /**
   * Der Text der Notiz landet als JSON-Literal im Skript. Ohne das könnte ein
   * Notiztext den Aufbau des Makros zerlegen — hier steht die Gegenprobe.
   */
  it('ein Notiztext kann das Makro nicht aufbrechen', () => {
    const boes = docMitNotiz({
      title: '"; ui.notifications.error("uebernommen"); //',
      text: '</script><script>alert(1)</script>',
    });
    const makro = buildFoundryNotesMacro(boes);
    expect(makro).not.toContain('</script>');
    // Der Titel steht nur als Zeichenkette darin, nicht als eigene Anweisung.
    expect(makro).not.toMatch(/^\s*ui\.notifications\.error\("uebernommen"\)/m);
    expect(makro).toContain('\\"; ui.notifications.error(\\"uebernommen\\"); //');
  });

  it('das Makro nennt die Anzahl der Notizen', () => {
    expect(buildFoundryNotesMacro(docMitNotiz())).toContain('entsteht 1 Journaleintrag');
    const doc = docMitNotiz();
    doc.vtt.notes.push(note({ id: 'n2' }));
    expect(buildFoundryNotesMacro(doc)).toContain('entstehen 2 Journaleinträge');
  });
});

describe('Notizen in der Projektdatei', () => {
  it('überstehen Speichern und Laden', () => {
    const doc = docMitNotiz();
    const bericht = { warnings: [] as string[] };
    const zurueck = migrate(JSON.parse(JSON.stringify(doc)), bericht as never);
    expect(zurueck.vtt.notes).toHaveLength(1);
    expect(zurueck.vtt.notes[0].title).toBe('Krypta');
  });

  /**
   * Ältere Projektdateien kennen das Feld nicht. Sie müssen weiterladen, und
   * zwar mit leerer Liste statt mit undefined — sonst fiele jeder Lesezugriff
   * darüber.
   */
  it('eine alte Datei ohne Notizfeld lädt mit leerer Liste', () => {
    const alt = JSON.parse(JSON.stringify(createDocument(10, 10, 'alt')));
    delete alt.vtt.notes;
    const zurueck = migrate(alt, { warnings: [] } as never);
    expect(zurueck.vtt.notes).toEqual([]);
  });
});

describe('Musterfüllung', () => {
  it('bleibt beim Speichern und Laden erhalten', () => {
    const doc = createDocument(10, 10, 'x');
    const layer = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!;
    doc.objects.s1 = {
      id: 's1',
      kind: 'shape',
      layerId: layer.id,
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      z: 0,
      locked: false,
      shape: 'rect',
      points: [0, 0, 100, 100],
      closed: true,
      blend: 'normal',
      stroke: null,
      fill: {
        color: 0x998877,
        alpha: 1,
        gradient: null,
        pattern: { kind: 'bricks', size: 100, color: 0x111111, alpha: 0.4, angle: 15 },
      },
    };
    const zurueck = migrate(JSON.parse(JSON.stringify(doc)), { warnings: [] } as never);
    const form = zurueck.objects.s1;
    expect(form.kind).toBe('shape');
    if (form.kind !== 'shape') return;
    expect(form.fill?.pattern).toEqual({
      kind: 'bricks',
      size: 100,
      color: 0x111111,
      alpha: 0.4,
      angle: 15,
    });
  });

  /**
   * Ältere Dateien kennen das Feld nicht. Es ist optional, damit sie ohne
   * Umbau weiterladen — die Gegenprobe steht hier, weil ein „required" beim
   * Verlauf schon einmal beinahe passiert wäre.
   */
  it('eine Form ohne Musterfeld lädt unverändert', () => {
    const doc = createDocument(10, 10, 'x');
    const layer = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!;
    doc.objects.s1 = {
      id: 's1',
      kind: 'shape',
      layerId: layer.id,
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      z: 0,
      locked: false,
      shape: 'rect',
      points: [0, 0, 100, 100],
      closed: true,
      blend: 'normal',
      stroke: null,
      fill: { color: 0x998877, alpha: 1 },
    };
    const zurueck = migrate(JSON.parse(JSON.stringify(doc)), { warnings: [] } as never);
    const form = zurueck.objects.s1;
    if (form.kind !== 'shape') throw new Error('keine Form');
    expect(form.fill?.pattern).toBeUndefined();
  });
});
