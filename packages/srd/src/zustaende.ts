/**
 * Die fuenfzehn Zustaende des SRD 5.2.1, woertlich und in beiden
 * Sprachen.
 *
 * DIESE DATEI IST ERZEUGT und wird nicht von Hand gepflegt. Der Text
 * kommt aus den beiden Sprachfassungen des Dokuments, die unter
 * `quelle/` liegen; abgetippt wurde nichts. Wer etwas aendern will,
 * aendert den Auslesevorgang und nicht diese Datei — eine Korrektur von
 * Hand waere genau die Abweichung vom Original, die hier nicht sein
 * darf.
 *
 * Der Regeltext ist woertlich uebernommen, weil er unter CC-BY-4.0
 * steht und die Namensnennung genau das erlaubt. Umformuliert waere er
 * eine Behauptung darueber, was die Regel sagt; woertlich IST er die
 * Regel.
 *
 * Nicht zu verwechseln mit `apps/zustaende`: das ist der Status Effect
 * Creator, in dem man EIGENE Zustaende baut. Hier stehen die
 * offiziellen, an denen man sich misst.
 */
import type { Paar } from './namensnennung';

export interface Zustand {
  /** Kleingeschrieben, englisch — die Kennung, unter der alles ihn kennt. */
  readonly id: string;
  readonly name: Paar;
  /** Der Regeltext, Absatz fuer Absatz, in beiden Sprachen. */
  readonly text: Paar;
}

export const ZUSTAENDE: readonly Zustand[] = [
  {
    id: 'blinded',
    name: { de: 'Blind', en: 'Blinded' },
    text: {
      de: `Wenn du den Zustand Blind hast, wirken folgende Effekte auf dich:

Nicht sehfähig: Eine blinde Kreatur kann nicht sehen, und jeder Attributswurf, der Sicht erfordert, misslingt automatisch.

Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil, und deine Angriffswürfe sind im Nachteil.`,
      en: `While you have the Blinded condition, you experience the following effects.

Can’t See. You can’t see and automatically fail any ability check that requires sight.

Attacks Affected. Attack rolls against you have Advantage, and your attack rolls have Disadvantage.`
    }
  },
  {
    id: 'charmed',
    name: { de: 'Bezaubert', en: 'Charmed' },
    text: {
      de: `Wenn du den Zustand Bezaubert hast, wirken folgende Effekte auf dich:

Kein Schaden am Zauberwirker: Du kannst den Zauberwirker weder angreifen noch als Ziel schädigender Fähigkeiten und magischer Effekte auswählen.

Sozialer Vorteil: Der Zauberwirker ist bei Attributswürfen, die soziale Interaktionen mit dir betreffen, im Vorteil.`,
      en: `While you have the Charmed condition, you experience the following effects.

Can’t Harm the Charmer. You can’t attack the charmer or target the charmer with damaging abilities or magical effects.

Social Advantage. The charmer has Advantage on any ability check to interact with you socially.`
    }
  },
  {
    id: 'deafened',
    name: { de: 'Taub', en: 'Deafened' },
    text: {
      de: `Wenn du den Zustand Taub hast, wirkt folgender Effekt auf dich:

Nicht hörfähig: Du kannst nicht hören, und jeder Attributswurf, der Hörvermögen erfordert, misslingt automatisch.`,
      en: `While you have the Deafened condition, you experience the following effect.

Can’t Hear. You can’t hear and automatically fail any ability check that requires hearing.`
    }
  },
  {
    id: 'exhaustion',
    name: { de: 'Erschöpfung', en: 'Exhaustion' },
    text: {
      de: `Wenn du den Zustand Erschöpft hast, wirken folgende Effekte auf dich:

Erschöpfungsstufen: Dieser Zustand ist kumulativ. Wann immer er auf dich wirkt, erhältst du 1 Erschöpfungsstufe hinzu. Wenn du sechs Erschöpfungsstufen hast, stirbst du.

Beeinträchtigte W20-Prüfungen: Wenn du eine W20‑Prüfung ausführst, ist das Ergebnis um einen Betrag in doppelter Höhe deiner Erschöpfungsstufen verringert.

Verringerte Bewegungsrate: Deine Bewegungsrate ist um eine Anzahl von Metern in Höhe des 1,5‑Fachen deiner Erschöpfungsstufe verringert.

Erschöpfungsstufen entfernen: Wenn du eine lange Rast abschließt, wird eine deiner Erschöpfungsstufen entfernt. Sobald du keine Erschöpfungsstufen mehr hast, endet der Zustand.`,
      en: `While you have the Exhaustion condition, you experience the following effects.

Exhaustion Levels. This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6.

D20 Tests Affected. When you make a D20 Test, the roll is reduced by 2 times your Exhaustion level.

Speed Reduced. Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level.

Removing Exhaustion Levels. Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends.`
    }
  },
  {
    id: 'frightened',
    name: { de: 'Verängstigt', en: 'Frightened' },
    text: {
      de: `Wenn du den Zustand Verängstigt hast, wirken folgende Effekte auf dich:

Beeinträchtigte Attributs- und Angriffswürfe: Du bist bei Attributs‑ und Angriffswürfen im Nachteil, solange du dich in der Sichtlinie der Quelle deiner Furcht befindest.

Keine Annäherung möglich: Du kannst dich nicht willentlich auf die Quelle deiner Furcht zubewegen.`,
      en: `While you have the Frightened condition, you experience the following effects.

Ability Checks and Attacks Affected. You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.

Can’t Approach. You can’t willingly move closer to the source of fear.`
    }
  },
  {
    id: 'grappled',
    name: { de: 'Gepackt', en: 'Grappled' },
    text: {
      de: `Wenn du den Zustand Gepackt hast, wirken folgende Effekte auf dich:

Keine Bewegungsrate: Deine Bewegungsrate beträgt 0 und kann nicht erhöht werden.

Beeinträchtigte Angriffe: Du bist bei Angriffswürfen gegen alle Ziele außer der Kreatur, die dich gepackt hält, im Nachteil.

Beweglich: Die Kreatur, die dich gepackt hält, kann dich ziehen oder tragen, wenn sie sich bewegt. Allerdings kostet sie dies doppelt so viel Bewegung, sofern du nicht winzig oder um mindestens zwei Kategorien kleiner als sie bist.`,
      en: `While you have the Grappled condition, you experience the following effects.

Speed 0. Your Speed is 0 and can’t increase.

Attacks Affected. You have Disadvantage on attack rolls against any target other than the grappler.

Movable. The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it.`
    }
  },
  {
    id: 'incapacitated',
    name: { de: 'Kampfunfähig', en: 'Incapacitated' },
    text: {
      de: `Wenn du den Zustand Kampfunfähig hast, wirken folgende Effekte auf dich:

Inaktiv: Du kannst keine Aktionen, Bonusaktionen oder Reaktionen ausführen.

Keine Konzentration: Deine Konzentration ist unterbrochen.

Stumm: Du kannst nicht sprechen.

Überrascht: Wenn du beim Auswürfeln der Initiative kampfunfähig bist, so bist du bei diesem Wurf im Nachteil.`,
      en: `While you have the Incapacitated condition, you experience the following effects.

Inactive. You can’t take any action, Bonus Action, or Reaction.

No Concentration. Your Concentration is broken.

Speechless. You can’t speak.

Surprised. If you’re Incapacitated when you roll Initiative, you have Disadvantage on the roll.`
    }
  },
  {
    id: 'invisible',
    name: { de: 'Unsichtbar', en: 'Invisible' },
    text: {
      de: `Wenn du den Zustand Unsichtbar hast, wirken folgende Effekte auf dich:

Überraschung: Wenn du beim Auswürfeln der Initiative unsichtbar bist, so bist du bei diesem Wurf im Vorteil.

Verborgen: Du bist nicht von Effekten betroffen, die erfordern, dass du gesehen wirst, sofern der Effektwirker keine Möglichkeiten hat, dich trotz deiner Unsichtbarkeit zu sehen. Ausrüstung, die du trägst oder hältst, ist ebenfalls verborgen.

Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Nachteil, und du bist bei deinen Angriffswürfen im Vorteil. Wenn eine Kreatur Möglichkeiten hat, dich trotz deiner Unsichtbarkeit zu sehen, erhältst du diesen Vorzug gegen diese Kreatur nicht.`,
      en: `While you have the Invisible condition, you experience the following effects.

Surprise. If you’re Invisible when you roll Initiative, you have Advantage on the roll.

Concealed. You aren’t affected by any effect that requires its target to be seen unless the effect’s creator can somehow see you. Any equipment you are wearing or carrying is also concealed.

Attacks Affected. Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don’t gain this benefit against that creature.`
    }
  },
  {
    id: 'paralyzed',
    name: { de: 'Gelähmt', en: 'Paralyzed' },
    text: {
      de: `Wenn du den Zustand Gelähmt hast, wirken folgende Effekte auf dich:

Kampfunfähig: Du hast den Zustand Kampfunfähig.

Keine Bewegungsrate: Deine Bewegungsrate beträgt 0 und kann nicht erhöht werden.

Beeinträchtigte Rettungswürfe: Du scheiterst bei Stärke‑ und Geschicklichkeitsrettungswürfen automatisch.

Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil.

Automatische kritische Treffer: Jeder Angriffswurf, der dich trifft, ist ein kritischer Treffer, sofern der Angreifer sich im Abstand von bis zu 1,5 Metern von dir befindet.`,
      en: `While you have the Paralyzed condition, you experience the following effects.

Incapacitated. You have the Incapacitated condition.

Speed 0. Your Speed is 0 and can’t increase.

Saving Throws Affected. You automatically fail Strength and Dexterity saving throws.

Attacks Affected. Attack rolls against you have Advantage.

Automatic Critical Hits. Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.`
    }
  },
  {
    id: 'petrified',
    name: { de: 'Versteinert', en: 'Petrified' },
    text: {
      de: `Wenn du den Zustand Versteinert hast, wirken folgende Effekte auf dich:

In unbelebte Substanz verwandelt: Du wirst mit allen nichtmagischen Gegenständen, die du trägst oder hältst, in eine massive unbelebte Substanz (normalerweise Stein) verwandelt. Dein Gewicht erhöht sich auf das Zehnfache, und du hörst auf zu altern.

Kampfunfähig: Du hast den Zustand Kampfunfähig.

Keine Bewegungsrate: Deine Bewegungsrate beträgt 0 und kann nicht erhöht werden.

Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil.

Beeinträchtigte Rettungswürfe: Du scheiterst bei Stärke‑ und Geschicklichkeitsrettungswürfen automatisch.

Resistenz gegen Schaden: Du bist gegen alle Schadensarten resistent.

Immunität gegen Gift: Du bist gegen den Zustand Vergiftet immun.`,
      en: `While you have the Petrified condition, you experience the following effects.

Turned to Inanimate Substance. You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.

Incapacitated. You have the Incapacitated condition.

Speed 0. Your Speed is 0 and can’t increase.

Attacks Affected. Attack rolls against you have Advantage.

Saving Throws Affected. You automatically fail Strength and Dexterity saving throws.

Resist Damage. You have Resistance to all damage.

Poison Immunity. You have Immunity to the Poisoned condition.`
    }
  },
  {
    id: 'poisoned',
    name: { de: 'Vergiftet', en: 'Poisoned' },
    text: {
      de: `Wenn du den Zustand Vergiftet hast, wirkt folgender Effekt auf dich:

Beeinträchtigte Attributs- und Angriffswürfe: Du bist bei Angriffs‑ und Attributswürfen im Nachteil.`,
      en: `While you have the Poisoned condition, you experience the following effect.

Ability Checks and Attacks Affected. You have Disadvantage on attack rolls and ability checks.`
    }
  },
  {
    id: 'prone',
    name: { de: 'Liegend', en: 'Prone' },
    text: {
      de: `Wenn du den Zustand Liegend hast, wirken folgende Effekte auf dich:

Eingeschränkte Bewegung: Deine einzigen Bewegungsmöglichkeiten bestehen darin, entweder zu kriechen oder Bewegung in Höhe der Hälfte deiner Bewegungsrate (abgerundet) zu verbrauchen, um aufzustehen und den Zustand damit zu beenden. Wenn deine Bewegungsrate 0 beträgt, kannst du nicht aufstehen.

Beeinträchtigte Angriffe: Du bist bei Angriffswürfen im Nachteil. Angriffswürfe gegen dich sind im Vorteil, wenn der Angreifer sich im Abstand von bis zu 1,5 Metern von dir befindet. Anderenfalls sind Angriffswürfe gegen dich im Nachteil.`,
      en: `While you have the Prone condition, you experience the following effects.

Restricted Movement. Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can’t right yourself.

Attacks Affected. You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage.`
    }
  },
  {
    id: 'restrained',
    name: { de: 'Festgesetzt', en: 'Restrained' },
    text: {
      de: `Wenn du den Zustand Festgesetzt hast, wirken folgende Effekte auf dich:

Keine Bewegungsrate: Deine Bewegungsrate beträgt 0 und kann nicht erhöht werden.

Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil, und deine Angriffswürfe sind im Nachteil.

Beeinträchtigte Rettungswürfe: Du bist bei Geschicklichkeitsrettungswürfen im Nachteil.`,
      en: `While you have the Restrained condition, you experience the following effects.

Speed 0. Your Speed is 0 and can’t increase.

Attacks Affected. Attack rolls against you have Advantage, and your attack rolls have Disadvantage.

Saving Throws Affected. You have Disadvantage on Dexterity saving throws.`
    }
  },
  {
    id: 'stunned',
    name: { de: 'Betäubt', en: 'Stunned' },
    text: {
      de: `Wenn du den Zustand Betäubt hast, wirken folgende Effekte auf dich:

Kampfunfähig: Du hast den Zustand Kampfunfähig.

Beeinträchtigte Rettungswürfe: Du scheiterst bei Stärke‑ und Geschicklichkeitsrettungswürfen automatisch.

Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil.`,
      en: `While you have the Stunned condition, you experience the following effects.

Incapacitated. You have the Incapacitated condition.

Saving Throws Affected. You automatically fail Strength and Dexterity saving throws.

Attacks Affected. Attack rolls against you have Advantage.`
    }
  },
  {
    id: 'unconscious',
    name: { de: 'Bewusstlos', en: 'Unconscious' },
    text: {
      de: `Wenn du den Zustand Bewusstlos hast, wirken folgende Effekte auf dich:

Inert: Du hast die Zustände Kampfunfähig und Liegend, und du lässt fallen, was immer du gehalten hast. Wenn dieser Zustand endet, bist du weiterhin liegend.

Keine Bewegungsrate: Deine Bewegungsrate beträgt 0 und kann nicht erhöht werden.

Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil.

Beeinträchtigte Rettungswürfe: Du scheiterst bei Stärke‑ und Geschicklichkeitsrettungswürfen automatisch.

Automatische kritische Treffer: Jeder Angriffswurf, der dich trifft, ist ein kritischer Treffer, sofern der Angreifer sich im Abstand von bis zu 1,5 Metern von dir befindet.

Ohne Bewusstsein: Du nimmst deine Umgebung nicht wahr.`,
      en: `While you have the Unconscious condition, you experience the following effects.

Inert. You have the Incapacitated and Prone conditions, and you drop whatever you’re holding. When this condition ends, you remain Prone.

Speed 0. Your Speed is 0 and can’t increase.

Attacks Affected. Attack rolls against you have Advantage.

Saving Throws Affected. You automatically fail Strength and Dexterity saving throws.

Automatic Critical Hits. Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.

Unaware. You’re unaware of your surroundings.`
    }
  }
];

export function zustandNach(id: string): Zustand | undefined {
  return ZUSTAENDE.find((zustand) => zustand.id === id);
}

/** Die Namen in einer Sprache, fuer Auswahllisten und die Suche. */
export function zustandsnamen(sprache: 'de' | 'en'): readonly string[] {
  return ZUSTAENDE.map((zustand) => zustand.name[sprache]);
}
