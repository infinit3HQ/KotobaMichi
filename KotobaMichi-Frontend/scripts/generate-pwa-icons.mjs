// Renders the install icons in public/icons from one SVG.
// Run from KotobaMichi-Frontend: node scripts/generate-pwa-icons.mjs
// Needs a Japanese font on the machine (Hiragino on macOS, Noto Sans CJK on Linux).
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const RED = "#D9363E"; // --primary in globals.css
const OUT = new URL("../public/icons/", import.meta.url);

/** `inset` is the share of the canvas the glyph tile fills. Maskable icons need a safe zone. */
function svg(size, { inset = 1, rounded = true } = {}) {
  const tile = size * inset;
  const offset = (size - tile) / 2;
  const radius = rounded ? tile * 0.22 : 0;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${rounded ? "none" : RED}"/>
  <rect x="${offset}" y="${offset}" width="${tile}" height="${tile}" rx="${radius}" fill="${RED}"/>
  <text x="50%" y="50%" dy="0.36em" text-anchor="middle" fill="#ffffff"
    font-family="Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans CJK JP, Noto Sans JP, sans-serif"
    font-weight="700" font-size="${tile * 0.62}">言</text>
</svg>`);
}

const icons = [
  ["icon-192.png", 192, {}],
  ["icon-512.png", 512, {}],
  ["maskable-512.png", 512, { inset: 0.8, rounded: false }],
  ["apple-touch-icon.png", 180, { rounded: false }],
];

await mkdir(OUT, { recursive: true });
for (const [name, size, options] of icons) {
  await sharp(svg(size, options)).png().toFile(new URL(name, OUT).pathname);
  console.log(`wrote public/icons/${name}`);
}
