import type { AiTask } from '../../shared/types';
import type { AiRequest } from './index';

/**
 * Der Assistent stellt Fragen und prueft, er schreibt nicht. Das steht so im
 * Konzept und wird hier durchgesetzt, nicht nur gehofft: die Systemanweisung
 * verbietet fertige Textabschnitte ausdruecklich.
 */
const SYSTEM: Record<'de' | 'en', string> = {
  de: [
    'Du hilfst beim Schreiben einer Charakter-Hintergrundgeschichte für ein Pen-and-Paper-Rollenspiel.',
    '',
    'Wichtigste Regel: Du schreibst den Text nicht. Die Autorin schreibt selbst.',
    'Liefere niemals fertige Absätze, Sätze oder Formulierungen zum Übernehmen.',
    'Wenn du um Text gebeten wirst, weise freundlich darauf hin und stelle stattdessen Fragen.',
    '',
    'Antworte knapp, auf Deutsch, in Stichpunkten. Höchstens sechs Punkte.',
    'Beziehe dich konkret auf den vorliegenden Text, nicht auf Allgemeinplätze.'
  ].join('\n'),
  en: [
    'You help someone write a character backstory for a tabletop role-playing game.',
    '',
    'Most important rule: you do not write the text. The author writes it herself.',
    'Never provide finished paragraphs, sentences or phrasings to copy.',
    'If asked for prose, say so kindly and offer questions instead.',
    '',
    'Answer briefly, in English, as bullet points. At most six points.',
    'Refer to the actual text at hand, not to generic advice.'
  ].join('\n')
};

const TASKS: Record<AiTask, Record<'de' | 'en', string>> = {
  questions: {
    de: 'Stelle Fragen, die beim Weiterdenken helfen. Was bleibt offen, was widerspricht sich, was wäre interessant zu wissen?',
    en: 'Ask questions that help the author think further. What is left open, what contradicts, what would be interesting to know?'
  },
  consistency: {
    de: 'Prüfe den Text gegen die verlinkten Notizen. Nenne nur Stellen, die sich widersprechen oder nicht zusammenpassen. Findest du nichts, sag das.',
    en: 'Check the text against the linked notes. Name only places that contradict or do not fit. If you find nothing, say so.'
  },
  style: {
    de: 'Gib Rückmeldung zum Stil: Rhythmus, Wiederholungen, Erzählabstand, Stellen die zu erklärend oder zu knapp sind. Keine Umformulierungen.',
    en: 'Give feedback on style: rhythm, repetition, narrative distance, passages that explain too much or too little. No rewrites.'
  }
};

export function systemPrompt(language: 'de' | 'en'): string {
  return SYSTEM[language];
}

/**
 * Erste Nachricht eines Gespraechs: Aufgabe, Notiz und Kontext. Bei einer
 * Rueckfrage steht der Text der Nutzerin fuer sich, die Notiz ist dem Modell
 * aus dem Verlauf bereits bekannt.
 */
export function userPrompt(request: AiRequest): string {
  if (request.followUp?.trim()) return request.followUp.trim();

  const language = request.language === 'en' ? 'en' : 'de';
  const parts = [TASKS[request.task][language], '', '--- Notiz ---', request.note];

  if (request.context.trim()) {
    parts.push('', '--- Verlinkte Notizen ---', request.context);
  }
  return parts.join('\n');
}
