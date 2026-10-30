// Porównanie: wzorzec (prototyp) obok strony z kodu, sekcja po sekcji.
// Użycie (dev server Instalacji musi działać):
//   node docs/design/prokominstalacje/narzedzia/porownaj.mjs monitoring /monitoring
//   node docs/design/prokominstalacje/narzedzia/porownaj.mjs monitoring /monitoring 390 dark
// Adres bazowy: zmienna INST_URL (domyślnie http://instalacje.localhost:3002).
// Stan widżetu: zmienna INST_STAN — przyciski klikane po tekście przed zrzutem, w obu stronach
//   (np. INST_STAN="Dom,Dzień" dla hero strony głównej); nazwa pliku dostaje dopisek ze stanem.
// Wynik: tmp/porownanie/<slug>/<szerokosc>-<motyw>-<nr>-<id-sekcji>.png — po lewej WZORZEC, po prawej KOD.
// Sekcje dopasowywane po atrybucie id (<section id="...">) — w kodzie zachowaj te same id co w prototypie.
// Hero strony bez id w prototypie dostaje id „hero” (w kodzie nadaj <section id="hero">), nagłówek — „naglowek”, stopka — „stopka”.
// Elementy przyklejone (dolny pasek, arkusz) nie są tu porównywane — sprawdzaj je zrzutem ekranu 390×844 (stany-telefonu/).
// Zrzuty wzorca rób z dostępem do internetu (prototyp ładuje fonty z Google Fonts; offline wyjdą fonty zastępcze).
import { chromium } from '@playwright/test'; // w repo jest @playwright/test; przeglądarka: pnpm exec playwright install chromium
import { mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , slug = 'start', route = '/', w = '1440', theme = 'light'] = process.argv;
const width = Number(w);
const BASE = process.env.INST_URL || 'http://instalacje.localhost:3002';
const OUT = join(resolve('tmp/porownanie'), slug); mkdirSync(OUT, { recursive: true });
const STAN = (process.env.INST_STAN || '').split(',').map((s) => s.trim()).filter(Boolean);
const SUFFIX = STAN.length ? '-' + STAN.join('-').toLowerCase().normalize('NFD').replace(/[^a-z0-9-]/g, '') : '';
const browser = await chromium.launch();

async function shots(url) {
  const page = await browser.newPage({ viewport: { width, height: width > 800 ? 1000 : 844 }, deviceScaleFactor: width > 800 ? 1 : 2 });
  await page.addInitScript((t) => { try { localStorage.setItem('pk-theme', t); } catch (e) {} }, theme);
  // prototyp: zatrzymujemy liczniki (autoodtwarzanie), żeby zrzut był powtarzalny i nic nie przerysowało strony w trakcie
  await page.addInitScript(() => { if (location.protocol === 'file:') window.setInterval = () => 0; });
  // aplikacja: tryb „ogranicz ruch” — autoodtwarzanie wstrzymane, ten sam stan początkowy co w prototypie
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url));
  await page.waitForTimeout(1200);
  for (const label of STAN) {
    await page.locator('button').filter({ hasText: new RegExp('^\s*' + label + '\s*$') }).first().click();
    await page.waitForTimeout(400);
  }
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(100); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.addStyleTag({ content: '*,*:before,*:after{animation-play-state:paused!important;transition:none!important}' });
  // elementy przyklejone (dolny pasek, przyciski) ukrywamy na zrzucie całej strony — sprawdzamy je osobno na zrzucie ekranu telefonu
  await page.evaluate(() => document.querySelectorAll('body *').forEach((el) => { if (getComputedStyle(el).position === 'fixed') el.style.visibility = 'hidden'; }));
  await page.waitForTimeout(300);
  // Prostokąty sekcji liczone raz (bez zmieniania DOM — prototyp i React przerysowują elementy).
  const boxes = await page.evaluate(() => [...document.querySelectorAll('header, section[id], section.phero, section.hx, footer')].map((s, i) => {
    const id = s.id || (s.tagName === 'HEADER' ? 'naglowek' : s.tagName === 'FOOTER' ? 'stopka' : (s.classList.contains('phero') || s.classList.contains('hx') ? 'hero' : 'sekcja-' + i));
    const r = s.getBoundingClientRect();
    return { id, y: Math.round(r.top + window.scrollY), h: Math.round(r.height) };
  }).filter((b) => b.h > 20));
  const map = {};
  for (const b of boxes) {
    if (map[b.id]) continue;
    try { map[b.id] = (await page.screenshot({ fullPage: true, animations: 'disabled', clip: { x: 0, y: b.y, width, height: Math.min(b.h, 6000) } })).toString('base64'); } catch (e) { console.warn('pominięto #' + b.id + ': ' + e.message.split('\n')[0]); }
  }
  await page.close();
  return map;
}

const ref = await shots(pathToFileURL(resolve('docs/design/prokominstalacje/prototyp', slug + '.html')).href);
const app = await shots(BASE + route);
const page = await browser.newPage({ viewport: { width: width * 2 + 48, height: 800 } });
let n = 0;
for (const id of Object.keys(ref)) {
  n++;
  const right = app[id] ? `<img src="data:image/png;base64,${app[id]}">` : `<div class="miss">BRAK SEKCJI #${id} W KODZIE</div>`;
  await page.setContent(`<style>body{margin:0;background:#888;font:700 14px sans-serif}.r{display:flex;gap:16px;padding:16px;align-items:flex-start}.c{width:${width}px}.c b{display:block;padding:4px 0;color:#fff}img{width:${width}px;display:block}.miss{width:${width}px;height:200px;display:grid;place-items:center;background:#b3261e;color:#fff}</style><div class="r"><div class="c"><b>WZORZEC · #${id}</b><img src="data:image/png;base64,${ref[id]}"></div><div class="c"><b>KOD · #${id}</b>${right}</div></div>`);
  await page.screenshot({ path: join(OUT, `${width}-${theme}${SUFFIX}-${String(n).padStart(2, '0')}-${id}.png`), fullPage: true });
}
const extra = Object.keys(app).filter((id) => !ref[id]);
console.log(`${slug}: ${n} sekcji porównanych. Brak w kodzie: ${Object.keys(ref).filter((id) => !app[id]).join(', ') || '—'}. Dodatkowe w kodzie: ${extra.join(', ') || '—'}`);
await browser.close();
