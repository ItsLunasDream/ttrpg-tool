/**
 * Die Wirkungen: was ein Zustand auf einer Stufe TUT.
 *
 * Das ist die Bauteilliste des ganzen Werkzeugs. Eine Stufe ist keine
 * Erfindung, sondern eine Wirkung aus dieser Liste — deshalb kommen die
 * Tabellen ohne KI aus und deshalb laesst sich ein Zustand ueberhaupt
 * wiegen.
 *
 * DREI DINGE, die jede Zeile hier traegt:
 *
 *   `schwere`  in welcher Stufe sie vorkommen darf. Aufsteigend, damit ein
 *              Zustand auf Stufe 4 nicht harmloser ist als auf Stufe 2.
 *   `punkte`   wie schwer sie wiegt, wenn sie anliegt.
 *   `themen`   zu welchem Thema sie gehoert. Fehlt das Feld, gehoert sie zu
 *              allen — siehe unten.
 *
 * ZU DEN TEXTEN: sie nennen Zahlen. „Weniger Schaden" ist keine Wirkung,
 * sondern eine Absicht; am Tisch muss jemand entscheiden, wie viel weniger,
 * und dann ist die Tabelle nur noch Deko. Also steht hier „1W4 weniger",
 * „−2 auf Angriffswuerfe", „Rettungswurf SG 13". Die Schwierigkeitsgrade
 * sind bewusst mittig gehalten (SG 13); wer fuer eine hohe Stufe spielt,
 * schraubt sie hoch.
 *
 * ZU DEN THEMEN: die allgemeinen Wirkungen (ohne `themen`) passen ueberall
 * hin. Daneben steht je Thema ein eigener Satz — Feuer brennt weiter, bis
 * man es loescht, Saeure frisst die Ruestung, Zeit schickt dich ans Ende der
 * Runde. Ein Zustand zieht zuerst aus dem eigenen Satz und erst danach aus
 * dem allgemeinen. Eine themengebundene Wirkung darf NIE in einem anderen
 * Thema auftauchen, sonst brennt man an einem Zustand aus Kaelte.
 *
 * Zu den Punkten steht das Noetige in `gewicht.ts`: sie messen NICHT, ob
 * ein Zustand fuer eine Kampagne zu hart ist. Das haengt daran, wie oft man
 * ihn bekommt, und das weiss nur der Tisch.
 *
 * Plattformfrei, wie alles unter `shared`.
 */

import type { Paar } from './tabellen';

/** Wie schwer eine Wirkung ist. Die Reihenfolge ist die Rangfolge. */
export const SCHWEREN = ['leicht', 'mittel', 'schwer', 'toedlich'] as const;
export type Schwere = (typeof SCHWEREN)[number];

/** Wohin eine Wirkung zielt. Zwei Wirkungen derselben Spur greifen dasselbe an. */
export type Spur =
  | 'sinne'
  | 'bewegung'
  | 'angriff'
  | 'verteidigung'
  | 'handlung'
  | 'geist'
  | 'koerper'
  | 'schaden';

/** Buff oder Debuff. Ein Segen wirkt in die andere Richtung. */
export type Richtung = 'debuff' | 'buff' | 'schaden';

export interface Wirkung {
  readonly id: string;
  readonly text: Paar;
  readonly schwere: Schwere;
  readonly spur: Spur;
  readonly richtung: Richtung;
  /**
   * Das Gewicht dieser Wirkung.
   *
   * Eine eigene Einschaetzung, keine Zahl aus einem Regelwerk — dort gibt es
   * sie nicht. Geprueft wird sie ueber die Eichung: wenn „gelaehmt" damit
   * schwerer wiegt als „vergiftet", taugt die Rangfolge; wenn nicht, taugen
   * die Zahlen nicht. Siehe `eichung.ts`.
   *
   * Ein Buff hat einen negativen Wert: er macht den Zustand leichter.
   */
  readonly punkte: number;
  /**
   * Zu welchen Themen sie gehoert. Fehlt das Feld, gehoert sie zu allen.
   *
   * Eine Wirkung MIT Themen ist gebunden: sie kommt nur in diesen Themen
   * vor. Das ist kein „passt besonders gut", sondern eine Sperre — „du
   * brennst weiter" hat in einem Zustand aus Kaelte nichts verloren.
   */
  readonly themen?: readonly string[];
}

/** Die allgemeinen Wirkungen: sie passen zu jedem Thema. */
const ALLGEMEIN: readonly Wirkung[] = [
  /* ---------- leicht ---------- */
  { id: 'nachteil-wahrnehmung', schwere: 'leicht', spur: 'sinne', richtung: 'debuff', punkte: 1,
    text: { de: 'Nachteil auf Wahrnehmung', en: 'Disadvantage on Perception checks' } },
  { id: 'nachteil-eine-fertigkeit', schwere: 'leicht', spur: 'geist', richtung: 'debuff', punkte: 1,
    text: { de: 'Nachteil auf eine Fertigkeit deiner Wahl', en: 'Disadvantage on one skill of your choice' } },
  { id: 'bewegung-minus-fuenf', schwere: 'leicht', spur: 'bewegung', richtung: 'debuff', punkte: 1,
    text: { de: 'Bewegungsrate um 5 Fuß gesenkt', en: 'Speed reduced by 5 feet' } },
  { id: 'lautlos-unmoeglich', schwere: 'leicht', spur: 'sinne', richtung: 'debuff', punkte: 1,
    text: { de: 'Du kannst dich nicht heimlich bewegen', en: 'You cannot move stealthily' } },
  { id: 'minus-eins-rettung', schwere: 'leicht', spur: 'verteidigung', richtung: 'debuff', punkte: 1,
    text: { de: '−1 auf Rettungswürfe', en: '−1 to saving throws' } },
  { id: 'nachteil-konzentration', schwere: 'leicht', spur: 'geist', richtung: 'debuff', punkte: 1,
    text: { de: 'Nachteil auf Würfe, um Konzentration zu halten', en: 'Disadvantage on checks to maintain concentration' } },
  { id: 'kein-langer-blick', schwere: 'leicht', spur: 'sinne', richtung: 'debuff', punkte: 1,
    text: { de: 'Du siehst weiter als 30 Fuß nur verschwommen', en: 'Everything beyond 30 feet is blurred' } },
  { id: 'unruhiger-schlaf', schwere: 'leicht', spur: 'koerper', richtung: 'debuff', punkte: 1,
    text: { de: 'Eine Rast erholt dich nur halb', en: 'A rest restores only half as much' } },
  { id: 'minus-zwei-initiative', schwere: 'leicht', spur: 'handlung', richtung: 'debuff', punkte: 1,
    text: { de: '−2 auf Initiative', en: '−2 to initiative' } },
  { id: 'schaden-eins-weniger', schwere: 'leicht', spur: 'angriff', richtung: 'debuff', punkte: 1,
    text: { de: 'Deine Angriffe richten 1W4 Schaden weniger an (mindestens 1)', en: 'Your attacks deal 1d4 less damage (minimum 1)' } },

  /* ---------- mittel ---------- */
  { id: 'bewegung-halbiert', schwere: 'mittel', spur: 'bewegung', richtung: 'debuff', punkte: 2,
    text: { de: 'Bewegungsrate halbiert', en: 'Speed halved' } },
  { id: 'nachteil-rettungen', schwere: 'mittel', spur: 'verteidigung', richtung: 'debuff', punkte: 2,
    text: { de: 'Nachteil auf Rettungswürfe', en: 'Disadvantage on saving throws' } },
  { id: 'keine-reaktion', schwere: 'mittel', spur: 'handlung', richtung: 'debuff', punkte: 2,
    text: { de: 'Du kannst keine Reaktion nutzen', en: 'You cannot take reactions' } },
  { id: 'nachteil-geschick', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 2,
    text: { de: 'Nachteil auf Geschicklichkeitsproben', en: 'Disadvantage on Dexterity checks' } },
  { id: 'nachteil-staerke', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 2,
    text: { de: 'Nachteil auf Stärkeproben', en: 'Disadvantage on Strength checks' } },
  { id: 'kein-vorteil', schwere: 'mittel', spur: 'angriff', richtung: 'debuff', punkte: 2,
    text: { de: 'Du kannst keinen Vorteil auf Angriffe erhalten', en: 'You cannot gain advantage on attacks' } },
  { id: 'minus-zwei-angriffe', schwere: 'mittel', spur: 'angriff', richtung: 'debuff', punkte: 2,
    text: { de: '−2 auf Angriffswürfe', en: '−2 to attack rolls' } },
  { id: 'hoechst-tp-gesenkt', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 3,
    text: { de: 'Deine Trefferpunkte-Höchstgrenze sinkt um 1W10', en: 'Your hit point maximum drops by 1d10' } },
  { id: 'angriffe-gegen-dich-vorteil', schwere: 'mittel', spur: 'verteidigung', richtung: 'debuff', punkte: 3,
    text: { de: 'Angriffe gegen dich haben Vorteil', en: 'Attacks against you have advantage' } },
  { id: 'keine-heilung', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 3,
    text: { de: 'Heilung wirkt bei dir nur halb', en: 'Healing restores only half as much to you' } },

  /* ---------- schwer ---------- */
  { id: 'nachteil-angriffe', schwere: 'schwer', spur: 'angriff', richtung: 'debuff', punkte: 3,
    text: { de: 'Nachteil auf alle Angriffswürfe', en: 'Disadvantage on all attack rolls' } },
  { id: 'keine-bonusaktion', schwere: 'schwer', spur: 'handlung', richtung: 'debuff', punkte: 3,
    text: { de: 'Du kannst keine Bonusaktion nutzen', en: 'You cannot take bonus actions' } },
  { id: 'blind', schwere: 'schwer', spur: 'sinne', richtung: 'debuff', punkte: 4,
    text: { de: 'Du bist blind', en: 'You are blinded' } },
  { id: 'taub', schwere: 'schwer', spur: 'sinne', richtung: 'debuff', punkte: 3,
    text: { de: 'Du bist taub', en: 'You are deafened' } },
  { id: 'festgehalten', schwere: 'schwer', spur: 'bewegung', richtung: 'debuff', punkte: 4,
    text: { de: 'Du bist festgehalten', en: 'You are restrained' } },
  { id: 'keine-zauber', schwere: 'schwer', spur: 'geist', richtung: 'debuff', punkte: 4,
    text: { de: 'Du kannst nicht zaubern', en: 'You cannot cast spells' } },
  { id: 'verwirrt', schwere: 'schwer', spur: 'geist', richtung: 'debuff', punkte: 4,
    text: { de: 'Du greifst zu Beginn deines Zuges das nächste Wesen an', en: 'At the start of your turn you attack the nearest creature' } },
  { id: 'erschoepfung', schwere: 'schwer', spur: 'koerper', richtung: 'debuff', punkte: 4,
    text: { de: 'Eine Stufe Erschöpfung dazu', en: 'One level of exhaustion' } },

  /* ---------- toedlich ---------- */
  /*
   * Neun, nicht sechs.
   *
   * Die Eichung hat das aufgedeckt: mit sechs wog „handlungsunfaehig"
   * weniger als „blind", und das ist falsch herum. Wer blind ist, kaempft
   * schlecht; wer handlungsunfaehig ist, kaempft gar nicht. Eine ganze Runde
   * zu verlieren wiegt schwerer als jeder Nachteil auf einen Wurf.
   */
  { id: 'handlungsunfaehig', schwere: 'toedlich', spur: 'handlung', richtung: 'debuff', punkte: 9,
    text: { de: 'Du bist handlungsunfähig', en: 'You are incapacitated' } },
  { id: 'gelaehmt', schwere: 'toedlich', spur: 'handlung', richtung: 'debuff', punkte: 8,
    text: { de: 'Du bist gelähmt', en: 'You are paralysed' } },
  { id: 'bewusstlos', schwere: 'toedlich', spur: 'handlung', richtung: 'debuff', punkte: 10,
    text: { de: 'Du bist bewusstlos', en: 'You are unconscious' } },
  { id: 'sterbend', schwere: 'toedlich', spur: 'koerper', richtung: 'debuff', punkte: 10,
    text: { de: 'Du fällst auf 0 Trefferpunkte', en: 'You drop to 0 hit points' } },
  { id: 'tod-nach-frist', schwere: 'toedlich', spur: 'koerper', richtung: 'debuff', punkte: 12,
    text: { de: 'Ohne Hilfe stirbst du nach der nächsten Frist', en: 'Without help you die at the end of the next interval' } },

  /* ---------- Schaden ueber Zeit ---------- */
  /*
   * Mit Wuerfeln, nicht mit „wenig" und „viel".
   *
   * Die Schadensart steht hier absichtlich nicht: die haengt am Thema, und
   * die themeneigenen Wirkungen weiter unten nennen sie. Diese drei sind der
   * Rueckfall fuer Themen, die keinen eigenen Schaden haben.
   */
  { id: 'schaden-klein', schwere: 'leicht', spur: 'schaden', richtung: 'schaden', punkte: 1,
    text: { de: '1W4 Schaden je Frist', en: '1d4 damage each interval' } },
  { id: 'schaden-mittel', schwere: 'mittel', spur: 'schaden', richtung: 'schaden', punkte: 2,
    text: { de: '2W6 Schaden je Frist', en: '2d6 damage each interval' } },
  { id: 'schaden-gross', schwere: 'schwer', spur: 'schaden', richtung: 'schaden', punkte: 4,
    text: { de: '4W6 Schaden je Frist', en: '4d6 damage each interval' } },

  /* ---------- Buffs: die Gegenrichtung ---------- */
  { id: 'vorteil-eine-sache', schwere: 'leicht', spur: 'geist', richtung: 'buff', punkte: -1,
    text: { de: 'Vorteil auf eine Sache deiner Wahl', en: 'Advantage on one thing of your choice' } },
  { id: 'bewegung-plus-zehn', schwere: 'leicht', spur: 'bewegung', richtung: 'buff', punkte: -1,
    text: { de: 'Bewegungsrate um 10 Fuß erhöht', en: 'Speed increased by 10 feet' } },
  { id: 'zeitweilige-tp', schwere: 'leicht', spur: 'koerper', richtung: 'buff', punkte: -1,
    text: { de: '2W6 zeitweilige Trefferpunkte', en: '2d6 temporary hit points' } },
  { id: 'widerstand-eine-art', schwere: 'mittel', spur: 'verteidigung', richtung: 'buff', punkte: -2,
    text: { de: 'Resistenz gegen eine Schadensart', en: 'Resistance to one damage type' } },
  { id: 'plus-eins-angriffe', schwere: 'mittel', spur: 'angriff', richtung: 'buff', punkte: -2,
    text: { de: '+1 auf Angriffswürfe', en: '+1 to attack rolls' } },
  { id: 'schaden-dazu', schwere: 'mittel', spur: 'angriff', richtung: 'buff', punkte: -2,
    text: { de: 'Deine Angriffe richten 1W6 Schaden mehr an', en: 'Your attacks deal 1d6 extra damage' } },
  { id: 'vorteil-rettungen', schwere: 'schwer', spur: 'verteidigung', richtung: 'buff', punkte: -3,
    text: { de: 'Vorteil auf Rettungswürfe', en: 'Advantage on saving throws' } },
  { id: 'zusatzangriff', schwere: 'schwer', spur: 'angriff', richtung: 'buff', punkte: -4,
    text: { de: 'Ein zusätzlicher Angriff, wenn du angreifst', en: 'One extra attack when you take the Attack action' } },
  { id: 'nicht-unter-null', schwere: 'toedlich', spur: 'koerper', richtung: 'buff', punkte: -5,
    text: { de: 'Du fällst nicht unter 1 Trefferpunkt', en: 'You do not drop below 1 hit point' } }
];

/**
 * Die themeneigenen Wirkungen.
 *
 * Je Thema drei bis vier, ueber die Schweren verteilt, damit ein Zustand auf
 * jeder Stufe etwas Eigenes findet. Sie nennen die Schadensart des Themas
 * und, wo es passt, den Weg heraus („bis du die Flammen loeschst") — das ist
 * der Teil, den die allgemeinen Wirkungen nicht leisten koennen.
 */
const THEMENEIGEN: readonly Wirkung[] = [
  /* ---------- Kälte ---------- */
  { id: 'kaelte-klamm', schwere: 'leicht', spur: 'koerper', richtung: 'debuff', punkte: 1, themen: ['kaelte'],
    text: { de: 'Klamme Finger: −2 auf Geschicklichkeitsproben', en: 'Numb fingers: −2 to Dexterity checks' } },
  { id: 'kaelte-steife-glieder', schwere: 'leicht', spur: 'bewegung', richtung: 'debuff', punkte: 1, themen: ['kaelte'],
    text: { de: 'Steife Glieder: Bewegungsrate um 10 Fuß gesenkt', en: 'Stiff limbs: speed reduced by 10 feet' } },
  { id: 'kaelte-zittern', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 2, themen: ['kaelte'],
    text: { de: 'Du zitterst: Nachteil auf Fernkampfangriffe und auf Würfe, um Konzentration zu halten', en: 'You are shivering: disadvantage on ranged attacks and on checks to maintain concentration' } },
  { id: 'kaelte-frostschaden', schwere: 'mittel', spur: 'schaden', richtung: 'schaden', punkte: 2, themen: ['kaelte'],
    text: { de: '1W6 Kälteschaden je Frist; eine Stunde am Feuer beendet es', en: '1d6 cold damage each interval; an hour by a fire ends it' } },
  { id: 'kaelte-festgefroren', schwere: 'schwer', spur: 'bewegung', richtung: 'debuff', punkte: 4, themen: ['kaelte'],
    text: { de: 'Du frierst fest: Bewegungsrate 0, bis du eine Stärkeprobe (SG 13) schaffst', en: 'Frozen in place: speed 0 until you succeed on a DC 13 Strength check' } },

  /* ---------- Hitze ---------- */
  { id: 'hitze-durst', schwere: 'leicht', spur: 'koerper', richtung: 'debuff', punkte: 1, themen: ['hitze'],
    text: { de: 'Ausgedörrt: Nachteil auf Konstitutionsproben, bis du trinkst', en: 'Parched: disadvantage on Constitution checks until you drink' } },
  { id: 'hitze-ruestung-glueht', schwere: 'mittel', spur: 'verteidigung', richtung: 'debuff', punkte: 2, themen: ['hitze', 'feuer'],
    text: { de: 'Deine Rüstung glüht: 1W6 Feuerschaden je Frist, solange du sie trägst', en: 'Your armour glows: 1d6 fire damage each interval while you wear it' } },
  { id: 'hitze-flimmern', schwere: 'mittel', spur: 'sinne', richtung: 'debuff', punkte: 2, themen: ['hitze', 'licht'],
    text: { de: 'Die Luft flimmert: −5 auf Angriffe über 30 Fuß Entfernung', en: 'The air shimmers: −5 to attacks beyond 30 feet' } },
  { id: 'hitze-hitzschlag', schwere: 'schwer', spur: 'koerper', richtung: 'debuff', punkte: 4, themen: ['hitze'],
    text: { de: 'Hitzschlag: eine Stufe Erschöpfung je volle Stunde ohne Schatten', en: 'Heatstroke: one level of exhaustion per full hour without shade' } },

  /* ---------- Fäulnis ---------- */
  { id: 'faeulnis-gestank', schwere: 'leicht', spur: 'koerper', richtung: 'debuff', punkte: 1, themen: ['faeulnis'],
    text: { de: 'Der Gestank hängt an dir: Nachteil auf Charismaproben', en: 'The stench clings to you: disadvantage on Charisma checks' } },
  { id: 'faeulnis-nekrotisch', schwere: 'mittel', spur: 'schaden', richtung: 'schaden', punkte: 2, themen: ['faeulnis', 'schatten'],
    text: { de: '1W6 nekrotischer Schaden je Frist', en: '1d6 necrotic damage each interval' } },
  { id: 'faeulnis-fleisch', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 3, themen: ['faeulnis'],
    text: { de: 'Faulendes Fleisch: Trefferpunkte-Höchstgrenze um 1W10 gesenkt, bis es geheilt wird', en: 'Rotting flesh: hit point maximum reduced by 1d10 until cured' } },
  { id: 'faeulnis-keine-heilung', schwere: 'schwer', spur: 'koerper', richtung: 'debuff', punkte: 4, themen: ['faeulnis'],
    text: { de: 'Heilzauber wirken bei dir nicht, bis die Fäulnis entfernt wird', en: 'Healing spells do not work on you until the rot is removed' } },

  /* ---------- Wahnsinn ---------- */
  { id: 'wahnsinn-stimmen', schwere: 'leicht', spur: 'geist', richtung: 'debuff', punkte: 1, themen: ['wahnsinn', 'traum'],
    text: { de: 'Stimmen, die nicht da sind: Nachteil auf Nachforschungen', en: 'Voices that are not there: disadvantage on Investigation checks' } },
  { id: 'wahnsinn-misstrauen', schwere: 'mittel', spur: 'geist', richtung: 'debuff', punkte: 2, themen: ['wahnsinn'],
    text: { de: 'Du traust niemandem: Du kannst keine Hilfe-Aktion erhalten', en: 'You trust no one: you cannot benefit from the Help action' } },
  { id: 'wahnsinn-wurf', schwere: 'schwer', spur: 'handlung', richtung: 'debuff', punkte: 4, themen: ['wahnsinn'],
    text: { de: 'Zu Beginn deines Zuges 1W6: bei 1–2 greifst du das nächste Wesen an, bei 3–4 fliehst du', en: 'At the start of your turn roll 1d6: on 1–2 you attack the nearest creature, on 3–4 you flee' } },
  { id: 'wahnsinn-vergessen', schwere: 'schwer', spur: 'geist', richtung: 'debuff', punkte: 4, themen: ['wahnsinn', 'leere'],
    text: { de: 'Du vergisst zwei Zauber deiner Wahl bis zur nächsten langen Rast', en: 'You forget two spells of your choice until your next long rest' } },

  /* ---------- Licht ---------- */
  { id: 'licht-nachbild', schwere: 'leicht', spur: 'sinne', richtung: 'debuff', punkte: 1, themen: ['licht'],
    text: { de: 'Nachbilder im Blick: −2 auf Angriffswürfe', en: 'Afterimages: −2 to attack rolls' } },
  { id: 'licht-leuchtend', schwere: 'mittel', spur: 'verteidigung', richtung: 'debuff', punkte: 2, themen: ['licht'],
    text: { de: 'Du leuchtest 20 Fuß weit: Angriffe gegen dich haben Vorteil, und du kannst dich nicht verstecken', en: 'You shed light for 20 feet: attacks against you have advantage and you cannot hide' } },
  { id: 'licht-strahlend', schwere: 'mittel', spur: 'schaden', richtung: 'schaden', punkte: 2, themen: ['licht'],
    text: { de: '1W8 gleißender Schaden je Frist, wenn du im Tageslicht stehst', en: '1d8 radiant damage each interval while you stand in daylight' } },
  { id: 'licht-geblendet', schwere: 'schwer', spur: 'sinne', richtung: 'debuff', punkte: 4, themen: ['licht'],
    text: { de: 'Du bist blind, bis du am Ende deines Zuges eine Konstitutionsrettung (SG 13) schaffst', en: 'You are blinded until you succeed on a DC 13 Constitution save at the end of your turn' } },

  /* ---------- Leere ---------- */
  { id: 'leere-taub-im-kopf', schwere: 'leicht', spur: 'geist', richtung: 'debuff', punkte: 1, themen: ['leere'],
    text: { de: '−2 auf Intelligenz- und Weisheitsproben', en: '−2 to Intelligence and Wisdom checks' } },
  { id: 'leere-starren', schwere: 'mittel', spur: 'handlung', richtung: 'debuff', punkte: 3, themen: ['leere'],
    text: { de: 'Du starrst ins Nichts: du verlierst Reaktion und Bonusaktion', en: 'You stare into nothing: you lose your reaction and your bonus action' } },
  { id: 'leere-auszehrung', schwere: 'schwer', spur: 'koerper', richtung: 'debuff', punkte: 4, themen: ['leere', 'tiefe'],
    text: { de: 'Auszehrung: Trefferpunkte-Höchstgrenze je lange Rast um 1W10 gesenkt', en: 'Wasting: hit point maximum drops by 1d10 with every long rest' } },

  /* ---------- Feuer ---------- */
  { id: 'feuer-brennt', schwere: 'leicht', spur: 'schaden', richtung: 'schaden', punkte: 1, themen: ['feuer'],
    text: { de: 'Du brennst: 1W4 Feuerschaden je Frist, bis du die Flammen mit einer Aktion löschst', en: 'You are burning: 1d4 fire damage each interval until you put out the flames with an action' } },
  { id: 'feuer-versengte-haut', schwere: 'leicht', spur: 'verteidigung', richtung: 'debuff', punkte: 1, themen: ['feuer'],
    text: { de: 'Versengte Haut: Jeder Feuerschaden an dir ist um 1W4 höher', en: 'Scorched skin: every instance of fire damage against you is 1d4 higher' } },
  { id: 'feuer-frisst-sich-fest', schwere: 'mittel', spur: 'schaden', richtung: 'schaden', punkte: 2, themen: ['feuer'],
    text: { de: 'Die Flammen fressen sich fest: 2W6 Feuerschaden je Frist; nur Wasser löscht sie', en: 'The flames take hold: 2d6 fire damage each interval; only water puts them out' } },
  { id: 'feuer-verbrannte-haende', schwere: 'mittel', spur: 'angriff', richtung: 'debuff', punkte: 2, themen: ['feuer', 'saeure'],
    text: { de: 'Verbrannte Hände: Deine Angriffe richten 1W6 Schaden weniger an (mindestens 1)', en: 'Burnt hands: your attacks deal 1d6 less damage (minimum 1)' } },
  { id: 'feuer-lodernd', schwere: 'schwer', spur: 'schaden', richtung: 'schaden', punkte: 4, themen: ['feuer'],
    text: { de: '4W6 Feuerschaden je Frist; Wasser halbiert den Schaden, beendet ihn aber nicht', en: '4d6 fire damage each interval; water halves it but does not end it' } },
  { id: 'feuer-verwundbar', schwere: 'schwer', spur: 'verteidigung', richtung: 'debuff', punkte: 4, themen: ['feuer'],
    text: { de: 'Verwundbar gegen Feuer: Feuerschaden an dir ist verdoppelt', en: 'Vulnerable to fire: fire damage against you is doubled' } },

  /* ---------- Gift ---------- */
  { id: 'gift-uebelkeit', schwere: 'leicht', spur: 'koerper', richtung: 'debuff', punkte: 1, themen: ['gift'],
    text: { de: 'Übelkeit: Nachteil auf Konstitutionsproben', en: 'Nausea: disadvantage on Constitution checks' } },
  { id: 'gift-schaden', schwere: 'mittel', spur: 'schaden', richtung: 'schaden', punkte: 2, themen: ['gift'],
    text: { de: '1W8 Giftschaden je Frist, bis dir jemand ein Gegengift gibt', en: '1d8 poison damage each interval until someone gives you an antidote' } },
  { id: 'gift-kriecht-weiter', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 3, themen: ['gift', 'blut'],
    text: { de: 'Es kriecht weiter: Trefferpunkte-Höchstgrenze je Frist um 1W6 gesenkt', en: 'It spreads: hit point maximum drops by 1d6 each interval' } },
  { id: 'gift-laehmend', schwere: 'schwer', spur: 'handlung', richtung: 'debuff', punkte: 4, themen: ['gift'],
    text: { de: 'Lähmendes Gift: Konstitutionsrettung (SG 13) zu Beginn deines Zuges, sonst verlierst du deine Aktion', en: 'Numbing venom: DC 13 Constitution save at the start of your turn or you lose your action' } },

  /* ---------- Säure ---------- */
  { id: 'saeure-ruestung-an', schwere: 'leicht', spur: 'verteidigung', richtung: 'debuff', punkte: 1, themen: ['saeure'],
    text: { de: 'Die Säure frisst deine Rüstung: −1 auf Rüstungsklasse', en: 'The acid eats at your armour: −1 to Armour Class' } },
  { id: 'saeure-schaden', schwere: 'mittel', spur: 'schaden', richtung: 'schaden', punkte: 2, themen: ['saeure'],
    text: { de: '1W6 Säureschaden je Frist, bis du dich mit Wasser abspülst', en: '1d6 acid damage each interval until you rinse yourself with water' } },
  { id: 'saeure-riemen', schwere: 'mittel', spur: 'verteidigung', richtung: 'debuff', punkte: 2, themen: ['saeure'],
    text: { de: 'Zerfressene Riemen: Dein Schild gibt keinen Bonus mehr, bis es geflickt wird', en: 'Eaten straps: your shield grants no bonus until it is mended' } },
  { id: 'saeure-ruestung-zerfressen', schwere: 'schwer', spur: 'verteidigung', richtung: 'debuff', punkte: 3, themen: ['saeure'],
    text: { de: 'Deine Rüstung ist zerfressen: −3 auf Rüstungsklasse, bis sie geschmiedet wird', en: 'Your armour is eaten through: −3 to Armour Class until it is reforged' } },
  { id: 'saeure-veraetzte-haende', schwere: 'schwer', spur: 'handlung', richtung: 'debuff', punkte: 3, themen: ['saeure'],
    text: { de: 'Verätzte Hände: Zu Beginn deines Zuges Konstitutionsrettung (SG 13), sonst lässt du fallen, was du hältst', en: 'Burnt hands: DC 13 Constitution save at the start of your turn or you drop what you are holding' } },

  /* ---------- Sturm ---------- */
  { id: 'sturm-laerm', schwere: 'leicht', spur: 'sinne', richtung: 'debuff', punkte: 1, themen: ['sturm'],
    text: { de: 'Der Lärm übertönt alles: Du hörst nichts weiter als 10 Fuß', en: 'The roar drowns everything: you hear nothing beyond 10 feet' } },
  { id: 'sturm-gegenwind', schwere: 'mittel', spur: 'bewegung', richtung: 'debuff', punkte: 2, themen: ['sturm'],
    text: { de: 'Gegenwind: Jeder Fuß Bewegung kostet zwei', en: 'Headwind: every foot of movement costs two' } },
  { id: 'sturm-blitz', schwere: 'mittel', spur: 'schaden', richtung: 'schaden', punkte: 2, themen: ['sturm'],
    text: { de: '1W8 Blitzschaden je Frist, solange du Metall trägst', en: '1d8 lightning damage each interval while you carry metal' } },
  { id: 'sturm-umgeworfen', schwere: 'schwer', spur: 'bewegung', richtung: 'debuff', punkte: 4, themen: ['sturm'],
    text: { de: 'Zu Beginn deines Zuges Stärkerettung (SG 13), sonst wirft dich der Wind 10 Fuß weit und du liegst', en: 'DC 13 Strength save at the start of your turn or the wind throws you 10 feet and knocks you prone' } },

  /* ---------- Stein ---------- */
  { id: 'stein-staub', schwere: 'leicht', spur: 'koerper', richtung: 'debuff', punkte: 1, themen: ['stein'],
    text: { de: 'Staub in den Gelenken: Nachteil auf Geschicklichkeitsrettungswürfe', en: 'Dust in the joints: disadvantage on Dexterity saving throws' } },
  { id: 'stein-schwere-beine', schwere: 'mittel', spur: 'bewegung', richtung: 'debuff', punkte: 2, themen: ['stein', 'tiefe'],
    text: { de: 'Deine Beine sind Stein: Bewegungsrate halbiert, und du kannst nicht springen', en: 'Your legs are stone: speed halved and you cannot jump' } },
  { id: 'stein-bis-zur-huefte', schwere: 'schwer', spur: 'bewegung', richtung: 'debuff', punkte: 4, themen: ['stein'],
    text: { de: 'Versteinert bis zur Hüfte: Bewegungsrate 0, Angriffe gegen dich haben Vorteil', en: 'Petrified to the waist: speed 0 and attacks against you have advantage' } },
  { id: 'stein-ganz', schwere: 'toedlich', spur: 'handlung', richtung: 'debuff', punkte: 9, themen: ['stein'],
    text: { de: 'Ganz zu Stein: handlungsunfähig, bis dich jemand mit Magie befreit', en: 'Wholly stone: incapacitated until someone frees you with magic' } },

  /* ---------- Blut ---------- */
  { id: 'blut-blutet', schwere: 'leicht', spur: 'schaden', richtung: 'schaden', punkte: 1, themen: ['blut'],
    text: { de: 'Du blutest: 1W4 Schaden je Frist, bis dir jemand mit einer Aktion hilft', en: 'You are bleeding: 1d4 damage each interval until someone tends to you with an action' } },
  { id: 'blut-geruch', schwere: 'leicht', spur: 'verteidigung', richtung: 'debuff', punkte: 1, themen: ['blut'],
    text: { de: 'Der Blutgeruch hängt an dir: Bestien greifen zuerst dich an, solange sie die Wahl haben', en: 'The smell of blood clings to you: beasts attack you first whenever they have the choice' } },
  { id: 'blut-verlust', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 3, themen: ['blut'],
    text: { de: 'Blutverlust: Trefferpunkte-Höchstgrenze um 1W8 gesenkt, bis du eine lange Rast machst', en: 'Blood loss: hit point maximum reduced by 1d8 until you take a long rest' } },
  { id: 'blut-durst', schwere: 'schwer', spur: 'geist', richtung: 'debuff', punkte: 4, themen: ['blut'],
    text: { de: 'Blutdurst: Weisheitsrettung (SG 13) zu Beginn deines Zuges, sonst greifst du das nächste Wesen an', en: 'Bloodthirst: DC 13 Wisdom save at the start of your turn or you attack the nearest creature' } },

  /* ---------- Schatten ---------- */
  { id: 'schatten-finster', schwere: 'leicht', spur: 'sinne', richtung: 'debuff', punkte: 1, themen: ['schatten'],
    text: { de: 'Alles ist finster: Du siehst nur 30 Fuß weit, auch im hellsten Licht', en: 'Everything is dim: you see only 30 feet, even in bright light' } },
  { id: 'schatten-licht-erlischt', schwere: 'mittel', spur: 'sinne', richtung: 'debuff', punkte: 2, themen: ['schatten'],
    text: { de: 'Fackeln in deiner Hand geben kein Licht', en: 'Torches in your hand shed no light' } },
  { id: 'schatten-zehrt', schwere: 'schwer', spur: 'schaden', richtung: 'schaden', punkte: 4, themen: ['schatten'],
    text: { de: '2W6 nekrotischer Schaden je Frist, solange du nicht im Sonnenlicht stehst', en: '2d6 necrotic damage each interval unless you stand in sunlight' } },
  { id: 'schatten-lichtscheu', schwere: 'schwer', spur: 'sinne', richtung: 'debuff', punkte: 3, themen: ['schatten'],
    text: { de: 'Lichtscheu: In hellem Licht hast du Nachteil auf Angriffe und auf Wahrnehmung', en: 'Light-shy: in bright light you have disadvantage on attacks and on Perception' } },

  /* ---------- Zeit ---------- */
  { id: 'zeit-zu-spaet', schwere: 'leicht', spur: 'handlung', richtung: 'debuff', punkte: 1, themen: ['zeit'],
    text: { de: 'Einen Wimpernschlag zu spät: −5 auf Initiative', en: 'A blink too late: −5 to initiative' } },
  { id: 'zeit-zuletzt', schwere: 'mittel', spur: 'handlung', richtung: 'debuff', punkte: 3, themen: ['zeit'],
    text: { de: 'Du handelst immer zuletzt in der Runde, gleich was du würfelst', en: 'You always act last in the round, whatever you roll' } },
  { id: 'zeit-gealtert', schwere: 'schwer', spur: 'koerper', richtung: 'debuff', punkte: 4, themen: ['zeit'],
    text: { de: 'Du alterst um Jahre: Nachteil auf Stärke- und Konstitutionsproben', en: 'You age years: disadvantage on Strength and Constitution checks' } },
  { id: 'zeit-verlorene-runde', schwere: 'schwer', spur: 'handlung', richtung: 'debuff', punkte: 4, themen: ['zeit'],
    text: { de: 'Jede zweite Runde beginnst du, als wäre nichts geschehen: du verlierst deine Aktion', en: 'Every other round you begin as if nothing had happened: you lose your action' } },

  /* ---------- Klang ---------- */
  { id: 'klang-ton-im-ohr', schwere: 'leicht', spur: 'sinne', richtung: 'debuff', punkte: 1, themen: ['klang'],
    text: { de: 'Ein Ton im Ohr: Nachteil auf Wahrnehmung, die auf Hören beruht', en: 'A tone in your ear: disadvantage on Perception that relies on hearing' } },
  { id: 'klang-frisst-worte', schwere: 'mittel', spur: 'geist', richtung: 'debuff', punkte: 3, themen: ['klang'],
    text: { de: 'Der Klang frisst Worte: Du kannst keine Zauber mit verbalen Bestandteilen wirken', en: 'The sound eats words: you cannot cast spells with verbal components' } },
  { id: 'klang-schallschaden', schwere: 'schwer', spur: 'schaden', richtung: 'schaden', punkte: 4, themen: ['klang'],
    text: { de: '2W8 Schallschaden je Frist; Stille beendet den Zustand', en: '2d8 thunder damage each interval; silence ends it' } },
  { id: 'klang-betaeubt', schwere: 'schwer', spur: 'sinne', richtung: 'debuff', punkte: 4, themen: ['klang'],
    text: { de: 'Ohrenklingeln bis zur Betäubung: Du bist taub und hast Nachteil auf Initiative', en: 'Ringing to the point of stunning: you are deafened and have disadvantage on initiative' } },

  /* ---------- Traum ---------- */
  { id: 'traum-schlechter-schlaf', schwere: 'leicht', spur: 'koerper', richtung: 'debuff', punkte: 1, themen: ['traum'],
    text: { de: 'Eine lange Rast gibt dir nur die Hälfte deiner Trefferwürfel zurück', en: 'A long rest returns only half your hit dice' } },
  { id: 'traum-wach-oder-nicht', schwere: 'mittel', spur: 'sinne', richtung: 'debuff', punkte: 2, themen: ['traum'],
    text: { de: 'Traum und Wachen verschwimmen: Nachteil auf Würfe, um Illusionen zu durchschauen', en: 'Dream and waking blur: disadvantage on checks to see through illusions' } },
  { id: 'traum-einschlafen', schwere: 'schwer', spur: 'handlung', richtung: 'debuff', punkte: 4, themen: ['traum'],
    text: { de: 'Weisheitsrettung (SG 13) zu Beginn deines Zuges, sonst schläfst du ein und wachst erst bei Schaden auf', en: 'DC 13 Wisdom save at the start of your turn or you fall asleep and wake only when damaged' } },

  /* ---------- Tiefe ---------- */
  { id: 'tiefe-druck', schwere: 'leicht', spur: 'koerper', richtung: 'debuff', punkte: 1, themen: ['tiefe'],
    text: { de: 'Der Druck auf den Ohren: −2 auf Konstitutionsrettungswürfe', en: 'Pressure in your ears: −2 to Constitution saving throws' } },
  { id: 'tiefe-keine-luft', schwere: 'mittel', spur: 'schaden', richtung: 'schaden', punkte: 2, themen: ['tiefe'],
    text: { de: '1W6 Schaden je Frist, bis du wieder Luft bekommst', en: '1d6 damage each interval until you can breathe again' } },
  { id: 'tiefe-truebe-sicht', schwere: 'mittel', spur: 'sinne', richtung: 'debuff', punkte: 2, themen: ['tiefe'],
    text: { de: 'Trübes Wasser vor den Augen: Du siehst nur 10 Fuß weit', en: 'Murky water before your eyes: you see only 10 feet' } },
  { id: 'tiefe-zieht-nach-unten', schwere: 'schwer', spur: 'bewegung', richtung: 'debuff', punkte: 4, themen: ['tiefe'],
    text: { de: 'Etwas zieht dich hinab: Du kannst nicht steigen und sinkst 20 Fuß je Runde', en: 'Something drags you down: you cannot rise and sink 20 feet each round' } }
];

export const WIRKUNGEN: readonly Wirkung[] = [...ALLGEMEIN, ...THEMENEIGEN];

export function wirkung(id: string): Wirkung | undefined {
  return WIRKUNGEN.find((w) => w.id === id);
}

/** Wie schwer eine Schwere ist, als Zahl. Zum Sortieren und Vergleichen. */
export function schwereWert(schwere: Schwere): number {
  return SCHWEREN.indexOf(schwere);
}

/**
 * Gehoert diese Wirkung in dieses Thema?
 *
 * Ohne `themen` gehoert sie ueberall hin. Mit `themen` nur dorthin — und ohne
 * angegebenes Thema nirgends: wer kein Thema nennt, bekommt nur die
 * allgemeinen Wirkungen. Das ist der sichere Rueckfall, denn eine
 * themengebundene Wirkung ohne ihr Thema ist genau der Fehler, den dieses
 * Feld verhindern soll.
 */
export function passtZumThema(w: Wirkung, themaId?: string): boolean {
  if (!w.themen || w.themen.length === 0) return true;
  return themaId !== undefined && w.themen.includes(themaId);
}

/** Nur die Wirkungen, die dieses Thema als eigene fuehrt. */
export function eigeneWirkungen(themaId: string): Wirkung[] {
  return WIRKUNGEN.filter((w) => w.themen?.includes(themaId));
}

/**
 * Die Wirkungen einer Schwere und Richtung.
 *
 * `richtung` ist hier kein einzelner Wert, sondern eine Liste: „gemischt"
 * zieht aus Buffs UND Debuffs, und genau das ist der Fall, den Tabellen gut
 * koennen und der sich von Hand ungern aufschreibt.
 *
 * `themaId` entscheidet ueber die themengebundenen Wirkungen. Fehlt es,
 * bleiben sie draussen.
 */
export function wirkungenFuer(
  schwere: Schwere,
  richtungen: readonly Richtung[],
  spuren?: readonly Spur[],
  themaId?: string
): Wirkung[] {
  return WIRKUNGEN.filter(
    (w) =>
      w.schwere === schwere &&
      richtungen.includes(w.richtung) &&
      passtZumThema(w, themaId) &&
      (!spuren || spuren.length === 0 || spuren.includes(w.spur))
  );
}
