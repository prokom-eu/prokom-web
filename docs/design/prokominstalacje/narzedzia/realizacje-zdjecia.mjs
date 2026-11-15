// Zdjęcia realizacji (RUNDA-V5 §4): pobranie z pro-kom.eu i obróbka do seeda.
// Użycie: node docs/design/prokominstalacje/narzedzia/realizacje-zdjecia.mjs
// Lista i opisy (alt): seed/prokominstalacje/realizacje/zdjecia.json — tylko zdjęcia przejrzane
// i przyjęte (bez ludzi, twarzy i tablic). Pobrane oryginały: tmp/real/raw/<nr-z-tabeli>-<plik>.jpg
// (pomijane, jeśli już są). Wynik: seed/prokominstalacje/realizacje/media/<legacyId>/<plik>.webp.
// Oryginały mają 600×337 px: bez powiększania, tylko lekkie wyrównanie ekspozycji (normalise
// 1–99 percentyl) i WebP. Kadr 4:3 karty robi CSS (object-fit), galeria pokazuje całe zdjęcie.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const LIST = resolve('seed/prokominstalacje/realizacje/zdjecia.json');
const RAW = resolve('tmp/real/raw');
const OUT = resolve('seed/prokominstalacje/realizacje/media');
const { zdjecia } = JSON.parse(readFileSync(LIST, 'utf8'));

mkdirSync(RAW, { recursive: true });
let made = 0;
for (const [id, photos] of Object.entries(zdjecia)) {
  mkdirSync(join(OUT, id), { recursive: true });
  for (const { plik, zrodlo } of photos) {
    const raw = join(RAW, `${String(zrodlo).padStart(2, '0')}-${plik}.jpg`);
    if (!existsSync(raw)) {
      const res = await fetch(`https://pro-kom.eu/api/media/file/${plik}.jpg`);
      if (!res.ok) throw new Error(`${plik}: HTTP ${res.status}`);
      writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
    }
    await sharp(raw)
      .rotate()
      .normalise({ lower: 1, upper: 99 })
      .webp({ quality: 82 })
      .toFile(join(OUT, id, `${plik}.webp`));
    made++;
  }
}
console.log(`${made} zdjęć → ${OUT}`);
