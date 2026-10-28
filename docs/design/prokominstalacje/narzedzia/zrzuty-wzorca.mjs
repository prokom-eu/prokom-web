// Zrzuty wzorca (prototypu) prokominstalacje.pl — do porównania z kodem.
// Użycie (z katalogu repo):
//   node docs/design/prokominstalacje/narzedzia/zrzuty-wzorca.mjs monitoring            -> 1440 i 390, jasny i ciemny
//   node docs/design/prokominstalacje/narzedzia/zrzuty-wzorca.mjs monitoring 390 light  -> tylko wybrany wariant
//   node docs/design/prokominstalacje/narzedzia/zrzuty-wzorca.mjs wszystkie             -> wszystkie 31 stron (kilka minut)
// Wynik: tmp/wzorzec/<slug>/<szerokosc>-<motyw>-<nr>.png (kawałki po 1600 px, czytelne dla Claude Code).
// Katalog tmp/ jest w .gitignore — zrzutów nie commitujemy.
import { chromium } from '@playwright/test'; // w repo jest @playwright/test; przeglądarka: pnpm exec playwright install chromium
import { mkdirSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve('docs/design/prokominstalacje/prototyp');
const OUT = resolve('tmp/wzorzec');
const [, , arg = 'start', w = '', th = ''] = process.argv;
const slugs = arg === 'wszystkie' ? readdirSync(ROOT).filter((f) => f.endsWith('.html')).map((f) => f.replace('.html', '')) : [arg];
const widths = w ? [Number(w)] : [1440, 390];
const themes = th ? [th] : ['light', 'dark'];
const SEG = 1600;

const browser = await chromium.launch();
for (const slug of slugs) {
  for (const width of widths) {
    for (const theme of themes) {
      const page = await browser.newPage({ viewport: { width, height: width > 800 ? 1000 : 844 }, deviceScaleFactor: width > 800 ? 1 : 2 });
      await page.addInitScript((t) => { try { localStorage.setItem('pk-theme', t); } catch (e) {} }, theme);
  // prototyp: zatrzymujemy liczniki (autoodtwarzanie), żeby zrzut był powtarzalny i nic nie przerysowało strony w trakcie
  await page.addInitScript(() => { if (location.protocol === 'file:') window.setInterval = () => 0; });
  // aplikacja: tryb „ogranicz ruch” — autoodtwarzanie wstrzymane, ten sam stan początkowy co w prototypie
  await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(pathToFileURL(join(ROOT, slug + '.html')).href);
      await page.waitForTimeout(1200);
      // przewinięcie całej strony uruchamia animacje „pokaż przy przewinięciu”
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += 700) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.addStyleTag({ content: '*,*:before,*:after{animation-play-state:paused!important;transition:none!important}' });
  // elementy przyklejone (dolny pasek, przyciski) ukrywamy na zrzucie całej strony — sprawdzamy je osobno na zrzucie ekranu telefonu
  await page.evaluate(() => document.querySelectorAll('body *').forEach((el) => { if (getComputedStyle(el).position === 'fixed') el.style.visibility = 'hidden'; }));
      await page.waitForTimeout(400);
      const dir = join(OUT, slug); mkdirSync(dir, { recursive: true });
      let i = 0;
      for (let y = 0; y < H; y += SEG, i++) {
        await page.screenshot({ path: join(dir, `${width}-${theme}-${String(i + 1).padStart(2, '0')}.png`), fullPage: true, clip: { x: 0, y, width, height: Math.min(SEG, H - y) } });
      }
      console.log(`${slug} ${width} ${theme}: ${H}px, ${i} kawałków`);
      await page.close();
    }
  }
}
await browser.close();
