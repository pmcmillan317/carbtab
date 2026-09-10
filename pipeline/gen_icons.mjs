/**
 * Generate CarbTab PWA icons with zero dependencies (built-in zlib PNG encoder).
 *   node pipeline/gen_icons.mjs
 * Writes app/public/{pwa-192,pwa-512,apple-touch-icon}.png
 *
 * The mark: a folder tab (the shape of the word) holding two logged lines
 * (the running tab). All geometry is defined in a 32-unit space, matching
 * app/src/components/Logo.tsx and the favicon.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "app", "public");
mkdirSync(outDir, { recursive: true });

const TILE = [92, 154, 30]; // #5C9A1E
const CARD = [255, 255, 255];
const LINE = [124, 185, 44]; // #7CB92C

// ---- PNG encoding ----
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, "latin1");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function png(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- signed distance to a rounded rect, all args in 32-space ----
function sdRoundRect(px, py, x, y, w, h, r) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const dx = Math.abs(px - cx) - (w / 2 - r);
  const dy = Math.abs(py - cy) - (h / 2 - r);
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(dx, dy), 0) - r;
}

// sample the artwork at a point in 32-space -> [r,g,b,a]
function sample(u, v) {
  // tile
  if (sdRoundRect(u, v, 0, 0, 32, 32, 7) > 0) return [0, 0, 0, 0];
  let col = TILE;
  // folder = body + tab + a straight patch that bridges the two so the
  // left edge reads as one line (no rasterised seam at the corner overlap).
  const body = sdRoundRect(u, v, 6.5, 12, 19, 14, 2.5);
  const tab = sdRoundRect(u, v, 6.5, 7.5, 9.5, 7.5, 2.1);
  const bridge = u >= 6.5 && u <= 13 && v >= 11.5 && v <= 15.5 ? -1 : 1;
  if (Math.min(body, tab, bridge) <= 0) {
    col = CARD;
    // entry lines: the running tab
    if (
      sdRoundRect(u, v, 10, 16.2, 12, 2.7, 1.35) <= 0 ||
      sdRoundRect(u, v, 10, 20.7, 7.4, 2.7, 1.35) <= 0
    ) {
      col = LINE;
    }
  }
  return [col[0], col[1], col[2], 255];
}

function render(size) {
  const SS = 4;
  const N = size * SS;
  const hi = Buffer.alloc(N * N * 4);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const [r, g, b, a] = sample(((x + 0.5) / N) * 32, ((y + 0.5) / N) * 32);
      const i = (y * N + x) * 4;
      hi[i] = r;
      hi[i + 1] = g;
      hi[i + 2] = b;
      hi[i + 3] = a;
    }
  }
  const out = Buffer.alloc(size * size * 4);
  const n = SS * SS;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, al = 0;
      for (let dy = 0; dy < SS; dy++)
        for (let dx = 0; dx < SS; dx++) {
          const i = ((y * SS + dy) * N + (x * SS + dx)) * 4;
          r += hi[i]; g += hi[i + 1]; b += hi[i + 2]; al += hi[i + 3];
        }
      const o = (y * size + x) * 4;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
      out[o + 3] = Math.round(al / n);
    }
  }
  return png(size, size, out);
}

for (const [name, size] of [
  ["pwa-192.png", 192],
  ["pwa-512.png", 512],
  ["apple-touch-icon.png", 180],
]) {
  writeFileSync(join(outDir, name), render(size));
  console.log("wrote", name);
}
