/**
 * Erzeugt build/icon.png und build/icon.ico ohne Bildbibliothek.
 * Motiv: die doppelten Klammern der Wiki-Links in Gold auf dunklem Grund.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const SIZE = 256;
const BG = [0x1f, 0x1c, 0x28, 0xff];
const GOLD = [0xc4, 0xa3, 0x5a, 0xff];
const RADIUS = 44;

const pixels = new Uint8Array(SIZE * SIZE * 4);

function set(x, y, [r, g, b, a]) {
  const offset = (y * SIZE + x) * 4;
  pixels[offset] = r;
  pixels[offset + 1] = g;
  pixels[offset + 2] = b;
  pixels[offset + 3] = a;
}

/** Abgerundetes Quadrat als Hintergrund, ausserhalb transparent. */
function insideRoundedSquare(x, y) {
  const cx = Math.min(Math.max(x, RADIUS), SIZE - 1 - RADIUS);
  const cy = Math.min(Math.max(y, RADIUS), SIZE - 1 - RADIUS);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= RADIUS * RADIUS;
}

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    set(x, y, insideRoundedSquare(x, y) ? BG : [0, 0, 0, 0]);
  }
}

const THICK = 15;
const TOP = 66;
const BOTTOM = 190;
const ARM = 38;

function fill(x0, y0, x1, y1) {
  for (let y = Math.max(0, y0); y < Math.min(SIZE, y1); y++) {
    for (let x = Math.max(0, x0); x < Math.min(SIZE, x1); x++) set(x, y, GOLD);
  }
}

/** Eine eckige Klammer. direction 1 = oeffnend, -1 = schliessend. */
function bracket(barX, direction) {
  fill(barX, TOP, barX + THICK, BOTTOM);
  const armX = direction === 1 ? barX : barX + THICK - ARM;
  fill(armX, TOP, armX + ARM, TOP + THICK);
  fill(armX, BOTTOM - THICK, armX + ARM, BOTTOM);
}

bracket(38, 1);
bracket(74, 1);
bracket(167, -1);
bracket(203, -1);

// --- PNG ---

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([length, body, crc]);
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = -1;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0; // Filtertyp "None"
  Buffer.from(pixels.buffer, y * SIZE * 4, SIZE * 4).copy(raw, y * (SIZE * 4 + 1) + 1);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // Bittiefe
ihdr[9] = 6; // RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0))
]);

// --- ICO mit eingebettetem PNG (Windows Vista und neuer) ---

const dir = Buffer.alloc(22);
dir.writeUInt16LE(0, 0);
dir.writeUInt16LE(1, 2); // Typ: Icon
dir.writeUInt16LE(1, 4); // ein Eintrag
dir[6] = 0; // Breite 0 bedeutet 256
dir[7] = 0;
dir.writeUInt16LE(1, 10); // Ebenen
dir.writeUInt16LE(32, 12); // Bit pro Pixel
dir.writeUInt32LE(png.length, 14);
dir.writeUInt32LE(22, 18);

mkdirSync('build', { recursive: true });
writeFileSync('build/icon.png', png);
writeFileSync('build/icon.ico', Buffer.concat([dir, png]));
console.log(`icon.png (${png.length} B) und icon.ico geschrieben`);
