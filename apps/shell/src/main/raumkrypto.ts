/**
 * Die Verschluesselung des Raums (docs/austausch.md).
 *
 * Alle am Tisch kennen das Passwort des Raums; daraus wird der Schluessel.
 * Ein fremder Dienst ist nicht noetig, und das Passwort reist nie:
 *
 * 1. Beim Eroeffnen wuerfelt der Gastgeber ein Salz und leitet mit scrypt
 *    den Stammschluessel ab. Das kostet mit Absicht Zeit (rund 0,1 s), damit
 *    wer die Leitung mitschneidet, Passwoerter nicht in Massen ausprobieren
 *    kann.
 * 2. Der Gastgeber schickt Salz und eine Zufallszahl, der Gast rechnet
 *    denselben Stammschluessel, schickt einen Nachweis (HMAC) und eine
 *    eigene Zufallszahl.
 * 3. Aus Stammschluessel und beiden Zufallszahlen entstehen zwei
 *    Sitzungsschluessel, einer je Richtung (HKDF). Ab dann ist jede Zeile
 *    AES-256-GCM, die Nonce ist ein Zaehler je Richtung: eine wiederholte,
 *    vertauschte oder veraenderte Zeile laesst sich nicht entschluesseln,
 *    und die Leitung wird getrennt.
 *
 * Eine verschluesselte Zeile beginnt mit `~`, danach Base64 aus Pruefsumme
 * und Geheimtext. So bleibt das Protokoll zeilenweise wie bisher.
 *
 * Grenze: wer das Passwort kennt, kann mitlesen. Es schuetzt vor Fremden
 * auf der Leitung, nicht vor jemandem am Tisch.
 */
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

/** scrypt-Kosten: N = 2^15 braucht etwa 32 MB und 0,1 s. */
const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;

export function neuesSalz(): string {
  return randomBytes(16).toString('hex');
}

export function neueNonce(): string {
  return randomBytes(16).toString('hex');
}

/** Der Stammschluessel aus Passwort und Salz. */
export function stammschluessel(passwort: string, salz: string): Promise<Buffer> {
  return new Promise((fertig, fehler) => {
    scrypt(passwort.normalize('NFC'), `ttrpg-raum|${salz}`, 32, SCRYPT, (err, schluessel) =>
      err ? fehler(err) : fertig(schluessel)
    );
  });
}

/** Der Nachweis, dass der Gast das Passwort kennt — ohne es zu schicken. */
export function nachweis(stamm: Buffer, nonce: string, gastNonce: string): string {
  return createHmac('sha256', stamm).update(`nachweis|${nonce}|${gastNonce}`).digest('hex');
}

export function nachweisStimmt(stamm: Buffer, nonce: string, gastNonce: string, erhalten: string): boolean {
  const soll = Buffer.from(nachweis(stamm, nonce, gastNonce));
  const ist = Buffer.from(erhalten);
  return soll.length === ist.length && timingSafeEqual(soll, ist);
}

function schluessel(stamm: Buffer, nonce: string, gastNonce: string, richtung: string): Buffer {
  return Buffer.from(hkdfSync('sha256', stamm, Buffer.from(`${nonce}|${gastNonce}`), `ttrpg-raum v2 ${richtung}`, 32));
}

/**
 * Eine verschluesselte Leitung aus Sicht einer Seite. Jede Seite hat ihren
 * eigenen Zaehler fuer das, was sie schickt, und das, was sie empfaengt.
 */
export class Leitungsschutz {
  private readonly senden: Buffer;
  private readonly empfangen: Buffer;
  private zaehlerSenden = 0n;
  private zaehlerEmpfangen = 0n;

  constructor(stamm: Buffer, nonce: string, gastNonce: string, rolle: 'gastgeber' | 'gast') {
    const zumGast = schluessel(stamm, nonce, gastNonce, 'gastgeber->gast');
    const zumGastgeber = schluessel(stamm, nonce, gastNonce, 'gast->gastgeber');
    this.senden = rolle === 'gastgeber' ? zumGast : zumGastgeber;
    this.empfangen = rolle === 'gastgeber' ? zumGastgeber : zumGast;
  }

  private static iv(zaehler: bigint): Buffer {
    const iv = Buffer.alloc(12);
    iv.writeBigUInt64BE(zaehler, 4);
    return iv;
  }

  /** Eine Zeile (ohne Zeilenumbruch) zum Verschicken, mit Zeilenumbruch. */
  verpacke(zeile: string): string {
    const iv = Leitungsschutz.iv(this.zaehlerSenden);
    this.zaehlerSenden += 1n;
    const c = createCipheriv('aes-256-gcm', this.senden, iv);
    const geheim = Buffer.concat([c.update(zeile, 'utf8'), c.final()]);
    return `~${Buffer.concat([c.getAuthTag(), geheim]).toString('base64')}\n`;
  }

  /** Eine empfangene Zeile im Klartext, oder `null`, wenn sie nicht passt. */
  entpacke(zeile: string): string | null {
    if (!zeile.startsWith('~')) return null;
    const roh = Buffer.from(zeile.slice(1), 'base64');
    if (roh.length < 16) return null;
    try {
      const d = createDecipheriv('aes-256-gcm', this.empfangen, Leitungsschutz.iv(this.zaehlerEmpfangen));
      d.setAuthTag(roh.subarray(0, 16));
      const klar = Buffer.concat([d.update(roh.subarray(16)), d.final()]).toString('utf8');
      this.zaehlerEmpfangen += 1n;
      return klar;
    } catch {
      return null;
    }
  }
}
