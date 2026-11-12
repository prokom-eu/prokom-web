// Zdjęcia „Nowych rozwiązań” dla architektów (RUNDA-V5 §7.2): tylko z oficjalnych stron
// producentów (og:image albo główne zdjęcie produktu ze strony z tabeli §7.2).
// Użycie: node docs/design/prokominstalacje/narzedzia/nowosci-zdjecia.mjs
// Pobrane: tmp/nowosci/<poz>.bin (pomijane, jeśli są). Wynik: seed/prokominstalacje/architekci/
// media/nowosc-<poz>.webp, kadr 4:3, najwyżej 1200 × 900 (bez powiększania — Media robi mniejsze
// rozmiary). „contain” = produkt na jasnym tle dopełnionym do 4:3, „cover” = zdjęcie wnętrza
// przycięte do 4:3. Bez obrazu (zostaje ilustracja SVG): 1 Amina (strona nie dała obrazu),
// 3 KEF Ci200QSb (HTTP 429), 6 The Frame (oficjalne obrazy za małe: 330 px i banery 1440×450), 14 ColorVu (na stronie serii tylko grafika „AI”, nie kamera),
// 15 DS-KV9503-WBE1 (na ekranie urządzenia twarz osoby — zasada „bez zdjęć ludzi”), 19–20.
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const LIGHT = { r: 242, g: 243, b: 240 };
// `white`: a product shot whose white background reaches its edges (KEF round grille, Epson
// reflection) — the whole frame white instead of light grey.
const WHITE = { r: 255, g: 255, b: 255 };
export const PHOTOS = [
  { poz: 2, mode: 'contain', white: true, url: 'https://eu.kef.com/cdn/shop/files/ci200rr_sp3836a_product__front.jpg' },
  { poz: 4, mode: 'contain', url: 'https://media.sonos.com/images/znqtjj88/production/bd7cdd505832336fa3e1813773b2cc5068a806cf-2048x2048.png' },
  { poz: 5, mode: 'cover', url: 'https://www.molecule-audio.com/wp-content/uploads/2025/12/cropped-Molecule-audio_11111.jpg' },
  { poz: 7, mode: 'contain', white: true, url: 'https://i8.amplience.net/i/epsonemear/a17797-productpicture-hires-en-int-projector_eh-ls800b_01_header_2000x2000px_png' },
  { poz: 8, mode: 'cover', url: 'https://d2oo5quzpsdib.cloudfront.net/Website/Product/Range/Audio-Visual.jpg' },
  { poz: 9, mode: 'contain', url: 'https://images.samsung.com/is/image/samsung/p6pim/pl/lh55omnesgbxen/gallery/pl-smart-signage-omn-s-lh55omnesgbxen-536771728' },
  { poz: 10, mode: 'cover', url: 'https://ampio.com/assets/control/ampio-touch-panels/hero.jpg' },
  { poz: 11, mode: 'cover', url: 'https://ampio.com/assets/_common/interior_with_panel.jpg' },
  { poz: 12, mode: 'contain', url: 'https://cdn.ecomm.ui.com/products/fa8dd4e4-36c8-4c79-a928-22c7bff2ce29/ab5bc8a4-6135-402e-a695-e3ea5e16d3e6.png' },
  { poz: 13, mode: 'contain', url: 'https://cdn.ecomm.ui.com/products/9ea6158e-bc26-4ac7-946a-55eca465b059/566b1098-3514-46b6-8aee-4fde454d1205.png' },
  { poz: 16, mode: 'contain', url: 'https://media.crystallize.com/nuki-production/25/3/11/7/nuki-smart-lock_lineup.png' },
  { poz: 17, mode: 'cover', url: 'https://ajax.systems/cdn/upload/ls_1gang_share_20bbfb2926.jpg' },
  // Already in the repo (Ładowarki, I9): Elzab EcoPower CC Wall.
  { poz: 18, mode: 'contain', file: 'public/instalacje/ev/wall.webp' },
];

const RAW = resolve('tmp/nowosci');
const OUT = resolve('seed/prokominstalacje/architekci/media');
mkdirSync(RAW, { recursive: true });
mkdirSync(OUT, { recursive: true });

for (const p of PHOTOS) {
  const raw = join(RAW, `${p.poz}.bin`);
  if (p.file) copyFileSync(resolve(p.file), raw);
  else if (!existsSync(raw)) {
    const res = await fetch(p.url, { headers: { 'user-agent': 'Mozilla/5.0 PRO-KOM seed' } });
    if (!res.ok) throw new Error(`${p.poz}: HTTP ${res.status}`);
    writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
  }
  const img = sharp(raw).rotate();
  const out = join(OUT, `nowosc-${String(p.poz).padStart(2, '0')}.webp`);
  if (p.mode === 'cover') {
    const { width = 1200, height = 900 } = await img.metadata();
    const w = Math.min(1200, width, Math.round((height * 4) / 3));
    await img.resize(w, Math.round((w * 3) / 4), { fit: 'cover' }).webp({ quality: 82 }).toFile(out);
  } else {
    // The product fills ~84 % of the frame, centred on the light background; a white JPEG
    // background is trimmed first, or it would stand out as a white square.
    const { hasAlpha } = await sharp(raw).metadata();
    const product = hasAlpha ? img : sharp(await img.trim({ background: '#ffffff', threshold: 12 }).toBuffer());
    const inner = await product
      .resize(1008, 756, { fit: 'inside', withoutEnlargement: true })
      .flatten({ background: p.white ? WHITE : LIGHT })
      .toBuffer();
    await sharp({ create: { width: 1200, height: 900, channels: 3, background: p.white ? WHITE : LIGHT } })
      .composite([{ input: inner, gravity: 'center' }])
      .webp({ quality: 84 })
      .toFile(out);
  }
}
console.log(`${PHOTOS.length} zdjęć → ${OUT}`);
