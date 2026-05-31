// Pure Node.js PNG icon generator — no external dependencies
// Run once: node generate-icons.mjs
import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";

function u32be(n) {
  const b = Buffer.allocUnsafe(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function crc32(buf) {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  let crc = 0xffffffff;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeB = Buffer.from(type, "ascii");
  const len = u32be(data.length);
  const crcVal = u32be(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crcVal]);
}

function makePng(size, color) {
  const [r, g, b] = color;
  // Build raw pixel rows (RGBA): each row prefixed by filter byte 0
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // filter none
    for (let x = 0; x < size * 4; x += 4) {
      // Rounded corners mask
      const cx = x / 4 - size / 2;
      const cy = y - size / 2;
      const radius = size * 0.18;
      const inCorner =
        Math.abs(cx) > size / 2 - radius && Math.abs(cy) > size / 2 - radius;
      const dist = Math.sqrt(
        (Math.abs(cx) - (size / 2 - radius)) ** 2 +
          (Math.abs(cy) - (size / 2 - radius)) ** 2
      );
      const alpha = inCorner && dist > radius ? 0 : 255;

      // Lighter inner square
      const margin = size * 0.12;
      const inner =
        x / 4 > margin &&
        x / 4 < size - margin &&
        y > margin &&
        y < size - margin;
      const [pr, pg, pb] = inner ? [r + 18, g + 20, b + 14] : [r, g, b];

      row[1 + x]     = Math.min(255, pr);
      row[1 + x + 1] = Math.min(255, pg);
      row[1 + x + 2] = Math.min(255, pb);
      row[1 + x + 3] = alpha;
    }
    rows.push(row);
  }

  // Draw a simple "graduation cap" chevron in white
  const midY = Math.floor(size * 0.38);
  const topY = Math.floor(size * 0.22);
  for (let y = topY; y <= midY; y++) {
    const frac = (y - topY) / (midY - topY);
    const halfW = Math.floor(frac * size * 0.28);
    const midX = Math.floor(size / 2);
    for (let dx = -halfW; dx <= halfW; dx++) {
      const x = midX + dx;
      if (x >= 0 && x < size) {
        rows[y][1 + x * 4]     = 255;
        rows[y][1 + x * 4 + 1] = 255;
        rows[y][1 + x * 4 + 2] = 255;
        rows[y][1 + x * 4 + 3] = 240;
      }
    }
  }

  // Draw tassel (amber bar)
  const tasselY = Math.floor(size * 0.56);
  const tasselH = Math.max(4, Math.floor(size * 0.06));
  const tasselX0 = Math.floor(size * 0.43);
  const tasselX1 = Math.floor(size * 0.57);
  for (let y = tasselY; y < tasselY + tasselH && y < size; y++) {
    for (let x = tasselX0; x <= tasselX1; x++) {
      rows[y][1 + x * 4]     = 251;
      rows[y][1 + x * 4 + 1] = 191;
      rows[y][1 + x * 4 + 2] = 36;
      rows[y][1 + x * 4 + 3] = 255;
    }
  }

  const raw = Buffer.concat(rows);
  const compressed = deflateSync(raw);

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = chunk(
    "IHDR",
    Buffer.concat([u32be(size), u32be(size), Buffer.from([8, 6, 0, 0, 0])])
  );
  const idat = chunk("IDAT", compressed);
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", makePng(192, [79, 70, 229]));
writeFileSync("public/icons/icon-512.png", makePng(512, [79, 70, 229]));
console.log("✅ PWA icons generated: public/icons/icon-192.png & icon-512.png");
