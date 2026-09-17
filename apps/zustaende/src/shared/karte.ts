/**
 * Die Karte zum Vorlesen.
 *
 * Ein Zustand am Tisch hat zwei Leser mit verschiedenen Beduerfnissen: die
 * Spielleitung will die Regel, die Gruppe will wissen, was ihre Figur
 * spuert. Beides auf einem Blatt hilft niemandem.
 *
 *   Vorderseite   Name, Zeichen, der Kurzsatz, die Stufe gross.
 *                 Was die Figur merkt. KEINE Zahlen.
 *   Rueckseite    Die Stufen als Liste, Verschlimmerung, Linderung.
 *                 Fuer die Spielleitung.
 *
 * Hier entsteht nur HTML. Ob daraus ein PDF wird oder ein Bild auf dem
 * Schirm, entscheidet der Aufrufer — der Hauptprozess druckt es mit
 * `printToPDF`, die Oberflaeche zeigt dasselbe HTML gross an.
 *
 * Plattformfrei: kein `node:*`, kein `electron`, keine Browser-Globals.
 */

import type { Zustand } from './erzeuge';
import { text, type Sprache } from './tabellen';
import { wirkung } from './wirkungen';

/** Text, der in HTML landet, muss maskiert werden. */
function maskiere(wert: string): string {
  return wert
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stufentext(
  wirkungen: readonly string[],
  sprache: Sprache,
  ausformuliert?: string
): string {
  if (ausformuliert) return ausformuliert;
  return wirkungen
    .map((id) => {
      const gefunden = wirkung(id);
      return gefunden ? text(gefunden.text, sprache) : id;
    })
    .join('; ');
}

/**
 * Das Aussehen der Karte.
 *
 * Bewusst hell und ohne die dunkle Palette des Werkzeugs: das hier geht auf
 * Papier, und schwarzer Grund kostet eine Patrone. Wer sie stattdessen gross
 * auf dem Schirm zeigt, sieht dasselbe Blatt — das ist Absicht, denn es ist
 * dasselbe Blatt.
 */
export const KARTEN_STIL = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
    color: #1c1a16;
    background: #fff;
  }
  .bogen {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10mm;
    padding: 10mm;
  }
  .karte {
    border: 1.5pt solid #9c6a3f;
    border-radius: 3mm;
    padding: 7mm 8mm;
    /* Eine halbe A4-Seite, damit zwei nebeneinander und zwei untereinander
       auf einen Bogen passen. */
    min-height: 118mm;
    display: flex;
    flex-direction: column;
    page-break-inside: avoid;
    background: #fdf6e8;
  }
  .karte--rueck { background: #fff; }
  .karte__kopf { display: flex; align-items: flex-start; gap: 5mm; }
  .karte__zeichen { font-size: 34pt; line-height: 1; }
  .karte__name {
    margin: 0;
    font-size: 20pt;
    font-variant: small-caps;
    letter-spacing: 0.01em;
  }
  .karte__art { margin: 1mm 0 0; font-size: 9pt; font-style: italic; color: #6a5f50; }
  .karte__satz { margin: 6mm 0; font-size: 13pt; line-height: 1.5; }
  .karte__spuerbar { margin-top: auto; font-size: 11pt; line-height: 1.5; }
  .karte__stufenkaesten { display: flex; gap: 3mm; margin-top: 6mm; }
  .karte__kasten {
    width: 9mm; height: 9mm;
    border: 1pt solid #9c6a3f; border-radius: 2mm;
    display: flex; align-items: center; justify-content: center;
    font-size: 11pt;
  }
  .karte__ueberschrift {
    margin: 0 0 3mm;
    font-size: 11pt;
    font-variant: small-caps;
    letter-spacing: 0.04em;
    color: #7a200d;
    border-bottom: 0.5pt solid #9c6a3f;
    padding-bottom: 1mm;
  }
  /*
   * Ohne eigene Nummerierung: die Nummer steht im Text, weil sie zu den
   * Kaestchen auf der Vorderseite passen muss. Mit beidem stand dort
   * „1. 1. Nachteil auf Wahrnehmung".
   */
  .karte__stufen { margin: 0; padding-left: 0; list-style: none; font-size: 10.5pt; line-height: 1.45; }
  .karte__stufen li { margin-bottom: 1.5mm; }
  .karte__fuss { margin-top: auto; font-size: 9.5pt; line-height: 1.45; }
  .karte__fuss p { margin: 1mm 0; }
  .karte__fuss strong { color: #7a200d; }
  @page { size: A4; margin: 0; }
`;

/**
 * Die Vorderseite: was die Figur merkt.
 *
 * Keine Zahlen, keine Regelbegriffe — das ist die Seite, die man der Gruppe
 * hinhaelt. Die Kaestchen fuer die Stufen sind leer und zum Ankreuzen: am
 * Tisch wandert eine Karte hin und her, und die aktuelle Stufe steht dann
 * auf dem Papier statt in jemandes Kopf.
 */
export function vorderseite(zustand: Zustand, sprache: Sprache): string {
  const de = sprache !== 'en';
  const kaesten = zustand.stufen
    .map((stufe) => `<span class="karte__kasten">${stufe.nummer}</span>`)
    .join('');

  return `<section class="karte karte--vorn">
  <header class="karte__kopf">
    <span class="karte__zeichen" style="color:${maskiere(zustand.farbe)}">${maskiere(zustand.zeichen)}</span>
    <div>
      <h2 class="karte__name">${maskiere(zustand.name)}</h2>
      <p class="karte__art">${maskiere(zustand.art)} · ${maskiere(zustand.thema)}</p>
    </div>
  </header>
  <p class="karte__satz">${maskiere(zustand.kurzsatz)}</p>
  <div class="karte__spuerbar">
    <p>${de ? 'So lange es anhält:' : 'For as long as it lasts:'} ${maskiere(zustand.dauer)}</p>
    ${
      zustand.stufen.length > 1
        ? `<p>${de ? 'Wie weit es schon ist:' : 'How far along it is:'}</p>
    <div class="karte__stufenkaesten">${kaesten}</div>`
        : ''
    }
  </div>
</section>`;
}

/** Die Rueckseite: die Regel, fuer die Spielleitung. */
export function rueckseite(
  zustand: Zustand,
  sprache: Sprache,
  ausformuliert?: Readonly<Record<number, string>>
): string {
  const de = sprache !== 'en';
  const stufen = zustand.stufen
    .map(
      (stufe) =>
        `<li><strong>${stufe.nummer}.</strong> ${maskiere(
          stufentext(stufe.wirkungen, sprache, ausformuliert?.[stufe.nummer])
        )}</li>`
    )
    .join('\n      ');

  return `<section class="karte karte--rueck">
  <h3 class="karte__ueberschrift">${maskiere(zustand.name)}</h3>
  <ol class="karte__stufen">
      ${stufen}
  </ol>
  <div class="karte__fuss">
    <p><strong>${de ? 'Dauer' : 'Duration'}</strong> ${maskiere(zustand.dauer)}</p>
    <p><strong>${de ? 'Schlimmer' : 'Worse'}</strong> ${maskiere(zustand.verschlimmerung)}</p>
    <p><strong>${de ? 'Besser' : 'Better'}</strong> ${maskiere(zustand.linderung)}</p>
    ${
      zustand.ausloeser !== ''
        ? `<p><strong>${de ? 'Ausgelöst' : 'Triggered'}</strong> ${maskiere(zustand.ausloeser)}</p>`
        : ''
    }
  </div>
</section>`;
}

/**
 * Ein ganzer Bogen.
 *
 * Mehrere Karten kommen auf eine Seite, damit ein Ausdruck sich lohnt. Je
 * Zustand stehen Vorder- und Rueckseite nebeneinander statt wirklich vorn
 * und hinten — beidseitiger Druck ist an jedem zweiten Drucker eine
 * Zumutung, und ausgeschnitten und gefaltet ergibt das Nebeneinander
 * dasselbe.
 */
export function bogen(
  zustaende: readonly Zustand[],
  sprache: Sprache,
  ausformuliert?: Readonly<Record<number, string>>
): string {
  const karten = zustaende
    .map((zustand) => `${vorderseite(zustand, sprache)}\n${rueckseite(zustand, sprache, ausformuliert)}`)
    .join('\n');

  return `<!doctype html>
<html lang="${sprache}"><head><meta charset="utf-8">
<title>${maskiere(zustaende[0]?.name ?? '')}</title>
<style>${KARTEN_STIL}</style></head>
<body><div class="bogen">${karten}</div></body></html>`;
}
