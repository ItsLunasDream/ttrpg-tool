/**
 * Die Namensnennung, woertlich.
 *
 * DIESER TEXT IST VORGESCHRIEBEN und darf nicht umformuliert werden. Er
 * steht so im SRD 5.2.1 selbst, in beiden Sprachfassungen. Wizards of the
 * Coast verlangt ausdruecklich, dass darueber hinaus keine weitere
 * Nennung von Wizards oder seinen Konzerngesellschaften erfolgt.
 *
 * Erlaubt ist laut Dokument genau eine Ergaenzung: der Hinweis, dass ein
 * Werk „kompatibel mit der fuenften Edition" oder „5E-kompatibel" ist.
 * Diese Sammlung macht davon keinen Gebrauch — sie braucht ihn nicht.
 *
 * Wer hier etwas hinzufuegt, verletzt die Bedingung, unter der das
 * Material ueberhaupt benutzt werden darf. Siehe NOTICE.md.
 */

/** Die Fassung, aus der alles hier stammt. Steht in der Namensnennung. */
export const SRD_FASSUNG = '5.2.1';

export const NAMENSNENNUNG = {
  en:
    'This work includes material from the System Reference Document 5.2.1 ' +
    '(“SRD 5.2.1”) by Wizards of the Coast LLC, available at ' +
    'https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the ' +
    'Creative Commons Attribution 4.0 International License, available at ' +
    'https://creativecommons.org/licenses/by/4.0/legalcode.',
  de:
    'Dieses Werk enthält Material aus dem Systemreferenzdokument 5.2.1 ' +
    '(„SRD 5.2.1“) von Wizards of the Coast LLC, verfügbar unter ' +
    'https://www.dndbeyond.com/srd. Das SRD 5.2.1 ist lizenziert gemäß ' +
    'Creative Commons Namensnennung 4.0 International Public License ' +
    '(verfügbar unter https://creativecommons.org/licenses/by/4.0/legalcode.de).'
} as const;

/** Ein Text in beiden Sprachen, wie ueberall in der Sammlung. */
export interface Paar {
  readonly de: string;
  readonly en: string;
}

export type Sprache = 'de' | 'en';

export function text(paar: Paar, sprache: Sprache): string {
  return sprache === 'de' ? paar.de : paar.en;
}
