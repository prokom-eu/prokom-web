// Hero strony głównej (RUNDA-V5 §1.6): zrzuty okna w 6 rozmiarach i kontrola układu — to samo,
// co sprawdza e2e `tests/e2e/instalacje/hero-uklad.e2e.spec.ts`, ale lokalnie i z plikami PNG
// (zrzuty „przed/po” do PR).
// Użycie (dev server Instalacji musi działać):
//   node docs/design/prokominstalacje/narzedzia/hero-uklad.mjs po
//   node docs/design/prokominstalacje/narzedzia/hero-uklad.mjs po dark
// Adres: INST_URL (domyślnie http://instalacje.localhost:3002). Wynik: tmp/hero-uklad/<etykieta>/<w>x<h>-<motyw>.png
// i w konsoli prostokąty elementów oraz kolizje (pary, które na siebie nachodzą).
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [, , label = 'po', theme = 'light'] = process.argv;
const BASE = process.env.INST_URL || 'http://instalacje.localhost:3002';
const OUT = join(resolve('tmp/hero-uklad'), label);
mkdirSync(OUT, { recursive: true });
const SIZES = [
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
  [2560, 1080],
  [4096, 1009],
];
// Nowy układ (v5) i stary (przed v5) — brakujące elementy są pomijane.
const PARTS = {
  tekst: '.hxt',
  zakladki: '.hotabs',
  pora: '.hmodes',
  kamera: '.pip',
  dok: '.hxdock',
  panel: '.hxstat',
  chipy: '.hxchips.glass',
  budynek: '[data-hx-building]',
};

const browser = await chromium.launch();
let failures = 0;
for (const [width, height] of SIZES) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('pk-theme', t);
    } catch {}
  }, theme);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' }).catch(() => page.goto(BASE + '/'));
  await page.waitForTimeout(1500);
  const rects = await page.evaluate((parts) => {
    const out = {};
    for (const [name, sel] of Object.entries(parts)) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === 'hidden') continue;
      out[name] = { x: r.left, y: r.top, r: r.right, b: r.bottom };
    }
    return out;
  }, PARTS);
  const overlap = (a, b) => a.x < b.r && b.x < a.r && a.y < b.b && b.y < a.b;
  const names = Object.keys(rects);
  const hits = [];
  // Pary z RUNDA-V5 §1.6: elementy interfejsu między sobą, budynek tylko z kamerą i dokiem
  // (kolumna tekstu jest szersza niż sam tekst, a budynek stoi w prawym dolnym rogu strefy).
  const skip = (a, b) => [a, b].includes('budynek') && [a, b].includes('tekst');
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++)
      if (!skip(names[i], names[j]) && overlap(rects[names[i]], rects[names[j]]))
        hits.push(`${names[i]}×${names[j]}`);
  const below = names.filter((n) => rects[n].b > height).map((n) => `${n} ↓${Math.round(rects[n].b - height)}px`);
  const fmt = (n) => `${n} ${Math.round(rects[n].x)},${Math.round(rects[n].y)}–${Math.round(rects[n].r)},${Math.round(rects[n].b)}`;
  console.log(`\n${width}×${height}: ${names.map(fmt).join(' | ')}`);
  console.log(`  kolizje: ${hits.join(', ') || 'brak'}; pod linią ekranu: ${below.join(', ') || 'nic'}`);
  failures += hits.length + below.length;
  await page.screenshot({ path: join(OUT, `${width}x${height}-${theme}.png`) });
  await page.close();
}
await browser.close();
console.log(`\nZrzuty: ${OUT}${failures ? `\nProblemy: ${failures}` : ''}`);
