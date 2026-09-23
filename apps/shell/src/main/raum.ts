/**
 * Der Raum im lokalen Netz (docs/austausch.md, Stufe 2): Netz und Ablauf.
 *
 * Das Protokoll steht in `@suite/austausch` (raum.ts). Hier steht, wer
 * was wann schickt:
 *
 * - **Suchen**: auf UDP `RAUM_SUCHPORT` lauschen und sammeln, welche Raeume
 *   sich ankuendigen. Ein Raum, der sich 8 Sekunden nicht meldet, faellt aus
 *   der Liste.
 * - **Eroeffnen**: einen TCP-Dienst auf einem freien Port starten und alle
 *   2 Sekunden ins Netz rufen, dass es ihn gibt. Der Gastgeber ist selbst
 *   eine Person im Raum und verteilt alle Nachrichten.
 * - **Beitreten**: sich mit dem Gastgeber verbinden, die Herausforderung
 *   mit dem Passwort beantworten, Namen bekommen.
 *
 * Der Chat lebt nur, solange der Raum offen ist (vorlaeufig; ob er
 * gespeichert wird, entscheidet die Nutzerin).
 *
 * Ohne Electron: nur node:net, node:dgram, node:crypto. So laesst sich der
 * ganze Ablauf mit zwei Diensten in einem Prozess pruefen.
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { createSocket, type Socket as UdpSocket } from 'node:dgram';
import { createServer, connect, type Server, type Socket } from 'node:net';
import { networkInterfaces } from 'node:os';
import {
  eindeutigerName,
  kodiere,
  leseAnkuendigung,
  leseNachricht,
  MAX_CHAT,
  MAX_PERSONEN,
  RAUM_SUCHPORT,
  RAUM_VERSION,
  Zeilenleser,
  type Nachricht,
  type Person
} from '@suite/austausch';

export interface GefundenerRaum {
  readonly raum: string;
  readonly gastgeber: string;
  readonly adresse: string;
  readonly port: number;
  readonly geschuetzt: boolean;
}

export interface Chatzeile {
  readonly von: Person;
  /** `null`: an alle. */
  readonly an: Person | null;
  readonly text: string;
  readonly zeit: string;
  readonly eigene: boolean;
}

export interface Raumzustand {
  readonly rolle: 'aus' | 'gastgeber' | 'gast';
  readonly raum: string;
  readonly ich: Person | null;
  readonly personen: readonly Person[];
  readonly chat: readonly Chatzeile[];
  /** Nur beim Gastgeber: wo die anderen ihn erreichen, falls die Liste nicht geht. */
  readonly port: number | null;
  /** Nur beim Gastgeber: seine Adressen im lokalen Netz (IPv4). */
  readonly adressen: readonly string[];
}

/** Die eigenen IPv4-Adressen im lokalen Netz, ohne die Schleife. */
export function eigeneAdressen(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((a): a is NonNullable<typeof a> => Boolean(a) && a!.family === 'IPv4' && !a!.internal)
    .map((a) => a.address);
}

export type Raumereignis =
  | { readonly art: 'raeume'; readonly raeume: readonly GefundenerRaum[] }
  | { readonly art: 'zustand'; readonly zustand: Raumzustand }
  | { readonly art: 'chat'; readonly zeile: Chatzeile }
  | { readonly art: 'paket'; readonly von: Person; readonly an: Person | null; readonly titel: string; readonly paket: string }
  | { readonly art: 'fehler'; readonly grund: 'passwort' | 'voll' | 'version' | 'verbindung' | 'getrennt' };

export function nachweis(passwort: string, nonce: string): string {
  return createHmac('sha256', passwort).update(nonce).digest('hex');
}

function gleich(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

interface Gastverbindung {
  person: Person | null;
  socket: Socket;
  nonce: string;
}

export class Raumdienst {
  private rolle: Raumzustand['rolle'] = 'aus';
  private raumName = '';
  private ich: Person | null = null;
  private personen: Person[] = [];
  private chat: Chatzeile[] = [];

  // Gastgeber
  private server: Server | null = null;
  private gaeste = new Set<Gastverbindung>();
  private passwort = '';
  private rufer: UdpSocket | null = null;
  private rufTakt: NodeJS.Timeout | null = null;

  // Gast
  private leitung: Socket | null = null;

  // Suche
  private lauscher: UdpSocket | null = null;
  private gefunden = new Map<string, GefundenerRaum & { gesehen: number }>();
  private suchTakt: NodeJS.Timeout | null = null;

  constructor(
    private readonly melde: (ereignis: Raumereignis) => void,
    private readonly optionen: { suchport?: number; rufziel?: string } = {}
  ) {}

  private get suchport(): number {
    return this.optionen.suchport ?? RAUM_SUCHPORT;
  }

  zustand(): Raumzustand {
    return {
      rolle: this.rolle,
      raum: this.raumName,
      ich: this.ich,
      personen: this.personen,
      chat: this.chat,
      port: this.server ? ((this.server.address() as { port: number } | null)?.port ?? null) : null,
      adressen: this.server ? eigeneAdressen() : []
    };
  }

  private meldeZustand(): void {
    this.melde({ art: 'zustand', zustand: this.zustand() });
  }

  /* ---------------------------------------------------------------- Suche */

  suche(): void {
    if (this.lauscher) return;
    const s = createSocket({ type: 'udp4', reuseAddr: true });
    s.on('error', () => {
      // Port belegt oder kein Netz: die Liste bleibt leer, Beitreten ueber
      // die Adresse geht weiter.
      s.close();
      if (this.lauscher === s) this.lauscher = null;
    });
    s.on('message', (daten, woher) => {
      const a = leseAnkuendigung(daten.toString('utf8'));
      if (!a || a.version !== RAUM_VERSION) return;
      const schluessel = `${woher.address}:${a.port}`;
      this.gefunden.set(schluessel, {
        raum: a.raum,
        gastgeber: a.gastgeber,
        adresse: woher.address,
        port: a.port,
        geschuetzt: a.geschuetzt,
        gesehen: Date.now()
      });
      this.meldeRaeume();
    });
    s.bind(this.suchport);
    this.lauscher = s;
    this.suchTakt = setInterval(() => {
      const vorher = this.gefunden.size;
      for (const [k, r] of this.gefunden) if (Date.now() - r.gesehen > 8000) this.gefunden.delete(k);
      if (this.gefunden.size !== vorher) this.meldeRaeume();
    }, 2000);
  }

  raeume(): GefundenerRaum[] {
    return [...this.gefunden.values()].map(({ gesehen: _g, ...r }) => r);
  }

  private meldeRaeume(): void {
    this.melde({ art: 'raeume', raeume: this.raeume() });
  }

  beendeSuche(): void {
    if (this.suchTakt) clearInterval(this.suchTakt);
    this.suchTakt = null;
    this.lauscher?.close();
    this.lauscher = null;
    this.gefunden.clear();
  }

  /* ------------------------------------------------------------ Gastgeber */

  async eroeffne(raum: string, passwort: string, name: string): Promise<number> {
    this.verlasse();
    this.passwort = passwort;
    this.raumName = raum.trim().slice(0, 40) || name;
    this.ich = { id: 'gastgeber', name: eindeutigerName(name, []) };
    this.personen = [this.ich];
    this.chat = [];
    this.rolle = 'gastgeber';
    const server = createServer((socket) => this.nimmGastAuf(socket));
    this.server = server;
    await new Promise<void>((fertig, fehler) => {
      server.once('error', fehler);
      server.listen(0, () => fertig());
    });
    const port = (server.address() as { port: number }).port;
    this.starteRuf(port);
    this.meldeZustand();
    return port;
  }

  private starteRuf(port: number): void {
    const rufer = createSocket({ type: 'udp4', reuseAddr: true });
    rufer.on('error', () => undefined);
    rufer.bind(() => {
      try {
        rufer.setBroadcast(true);
      } catch {
        // Ohne Broadcast kein Eintrag in der Liste; Beitreten ueber die
        // Adresse geht trotzdem.
      }
    });
    this.rufer = rufer;
    const rufe = () => {
      if (!this.ich) return;
      const text = kodiere({
        typ: 'ttrpg-raum',
        version: RAUM_VERSION,
        raum: this.raumName,
        gastgeber: this.ich.name,
        port,
        geschuetzt: this.passwort.length > 0
      });
      rufer.send(text, this.suchport, this.optionen.rufziel ?? '255.255.255.255', () => undefined);
    };
    setTimeout(rufe, 100);
    this.rufTakt = setInterval(rufe, 2000);
  }

  private nimmGastAuf(socket: Socket): void {
    socket.setEncoding('utf8');
    const gast: Gastverbindung = { person: null, socket, nonce: randomBytes(16).toString('hex') };
    const leser = new Zeilenleser();
    if (this.gaeste.size >= MAX_PERSONEN - 1) {
      socket.end(kodiere({ typ: 'abgelehnt', grund: 'voll' }));
      return;
    }
    this.gaeste.add(gast);
    socket.write(kodiere({ typ: 'herausforderung', raum: this.raumName, nonce: gast.nonce }));
    socket.on('data', (stueck: string) => {
      let zeilen: string[];
      try {
        zeilen = leser.schiebe(stueck);
      } catch {
        socket.destroy();
        return;
      }
      for (const zeile of zeilen) {
        const n = leseNachricht(zeile);
        if (n) this.vonGast(gast, n);
      }
    });
    const weg = () => {
      if (!this.gaeste.delete(gast)) return;
      if (gast.person) {
        this.personen = this.personen.filter((p) => p.id !== gast.person?.id);
        this.verteilePersonen();
      }
    };
    socket.on('close', weg);
    socket.on('error', weg);
  }

  private vonGast(gast: Gastverbindung, n: Nachricht): void {
    if (!gast.person) {
      if (n.typ !== 'hallo') return;
      if (n.version !== RAUM_VERSION) {
        gast.socket.end(kodiere({ typ: 'abgelehnt', grund: 'version' }));
        return;
      }
      if (this.passwort && !gleich(n.nachweis, nachweis(this.passwort, gast.nonce))) {
        gast.socket.end(kodiere({ typ: 'abgelehnt', grund: 'passwort' }));
        return;
      }
      gast.person = {
        id: randomBytes(6).toString('hex'),
        name: eindeutigerName(n.name, this.personen.map((p) => p.name))
      };
      this.personen = [...this.personen, gast.person];
      gast.socket.write(kodiere({ typ: 'willkommen', du: gast.person, personen: this.personen }));
      this.verteilePersonen();
      return;
    }
    // Absender ist, wer die Leitung haelt — nicht, wer im Feld steht.
    if (n.typ === 'chat') this.verteile({ ...n, von: gast.person.id, zeit: new Date().toISOString() });
    if (n.typ === 'paket') this.verteile({ ...n, von: gast.person.id, zeit: new Date().toISOString() });
  }

  private verteilePersonen(): void {
    const n = kodiere({ typ: 'personen', personen: this.personen });
    for (const g of this.gaeste) if (g.person) g.socket.write(n);
    this.meldeZustand();
  }

  /** Beim Gastgeber: an alle oder an eine Person, und an den Absender zurueck. */
  private verteile(n: Extract<Nachricht, { typ: 'chat' | 'paket' }>): void {
    const text = kodiere(n);
    for (const g of this.gaeste) {
      if (!g.person) continue;
      if (n.an === null || g.person.id === n.an || g.person.id === n.von) g.socket.write(text);
    }
    if (n.an === null || n.an === this.ich?.id || n.von === this.ich?.id) this.empfange(n);
  }

  /* ----------------------------------------------------------------- Gast */

  trittBei(adresse: string, port: number, passwort: string, name: string): Promise<void> {
    this.verlasse();
    return new Promise((fertig) => {
      const socket = connect({ host: adresse, port });
      socket.setEncoding('utf8');
      this.leitung = socket;
      const leser = new Zeilenleser();
      let erledigt = false;
      const ende = () => {
        if (!erledigt) {
          erledigt = true;
          fertig();
        }
      };
      socket.on('data', (stueck: string) => {
        let zeilen: string[];
        try {
          zeilen = leser.schiebe(stueck);
        } catch {
          socket.destroy();
          return;
        }
        for (const zeile of zeilen) {
          const n = leseNachricht(zeile);
          if (!n) continue;
          if (n.typ === 'herausforderung') {
            this.raumName = n.raum;
            socket.write(
              kodiere({ typ: 'hallo', name, nachweis: passwort ? nachweis(passwort, n.nonce) : '', version: RAUM_VERSION })
            );
          } else if (n.typ === 'willkommen') {
            this.rolle = 'gast';
            this.ich = n.du;
            this.personen = [...n.personen];
            this.chat = [];
            this.meldeZustand();
            ende();
          } else if (n.typ === 'abgelehnt') {
            this.melde({ art: 'fehler', grund: n.grund });
            ende();
          } else if (n.typ === 'personen') {
            this.personen = [...n.personen];
            this.meldeZustand();
          } else if (n.typ === 'chat' || n.typ === 'paket') {
            this.empfange(n);
          }
        }
      });
      const zu = (grund: 'verbindung' | 'getrennt') => {
        if (this.leitung !== socket) return;
        const warDrin = this.rolle === 'gast';
        this.leitung = null;
        this.setzeZurueck();
        this.melde({ art: 'fehler', grund: warDrin ? 'getrennt' : grund });
        this.meldeZustand();
        ende();
      };
      socket.on('error', () => zu('verbindung'));
      socket.on('close', () => zu('getrennt'));
    });
  }

  /* ------------------------------------------------------------ Beide Seiten */

  private person(id: string): Person {
    return this.personen.find((p) => p.id === id) ?? { id, name: '?' };
  }

  private empfange(n: Extract<Nachricht, { typ: 'chat' | 'paket' }>): void {
    const von = this.person(n.von);
    const an = n.an === null ? null : this.person(n.an);
    if (n.typ === 'chat') {
      const zeile: Chatzeile = { von, an, text: n.text, zeit: n.zeit, eigene: von.id === this.ich?.id };
      this.chat = [...this.chat, zeile].slice(-500);
      this.melde({ art: 'chat', zeile });
    } else if (von.id !== this.ich?.id) {
      this.melde({ art: 'paket', von, an, titel: n.titel, paket: n.paket });
    }
  }

  /** Eine Chatnachricht an alle (`an` = null) oder an eine Person. */
  chatte(text: string, an: string | null): boolean {
    const sauber = text.trim().slice(0, MAX_CHAT);
    if (!sauber || !this.ich) return false;
    const n = { typ: 'chat' as const, von: this.ich.id, an, text: sauber, zeit: new Date().toISOString() };
    if (this.rolle === 'gastgeber') this.verteile(n);
    else if (this.leitung) this.leitung.write(kodiere(n));
    else return false;
    return true;
  }

  /** Ein Paket (als Text) an alle oder an eine Person. */
  sende(paket: string, titel: string, an: string | null): boolean {
    if (!this.ich) return false;
    const n = { typ: 'paket' as const, von: this.ich.id, an, titel: titel.slice(0, 500), paket, zeit: new Date().toISOString() };
    if (this.rolle === 'gastgeber') this.verteile(n);
    else if (this.leitung) this.leitung.write(kodiere(n));
    else return false;
    return true;
  }

  private setzeZurueck(): void {
    this.rolle = 'aus';
    this.ich = null;
    this.personen = [];
    this.chat = [];
    this.raumName = '';
  }

  verlasse(): void {
    if (this.rufTakt) clearInterval(this.rufTakt);
    this.rufTakt = null;
    this.rufer?.close();
    this.rufer = null;
    for (const g of this.gaeste) g.socket.destroy();
    this.gaeste.clear();
    this.server?.close();
    this.server = null;
    const leitung = this.leitung;
    this.leitung = null;
    leitung?.destroy();
    const war = this.rolle !== 'aus';
    this.setzeZurueck();
    if (war) this.meldeZustand();
  }

  beende(): void {
    this.verlasse();
    this.beendeSuche();
  }
}
