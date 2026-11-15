// Pomiar płynności i baterii (raport 11.11.2026): telefon Pixel 7, procesor ×4 (CDP).
// Użycie (najlepiej na buildzie produkcyjnym: pnpm build && pnpm start):
//   node docs/design/prokominstalacje/narzedzia/pomiar-plynnosc.mjs
//   node docs/design/prokominstalacje/narzedzia/pomiar-plynnosc.mjs / /monitoring
// Adres bazowy: INST_URL (domyślnie http://instalacje.localhost:3002). INST_SZCZEGOLY=1 — działające
// animacje po przewinięciu na dół z podziałem na sekcje (main > section#id).
// Dla każdej strony:
//   cpuGora / cpuDol — procesor w bezczynności (Performance.getMetrics TaskDuration przez 5 s) z hero
//                      w kadrze i po przewinięciu na dół, w % jednego rdzenia (już z dławieniem ×4),
//   animacjeDol      — liczba animacji „running” po przewinięciu na dół, renderowanych (bez treści
//                      pominiętej przez content-visibility; cel 0 poza tym, co widać na dole),
//   klatkaSr / klatkaP95 — czas klatki (ms) w trakcie przewijania kółkiem od góry do dołu,
//   tbt              — suma (długie zadanie − 50 ms) przez 10 s od wejścia na stronę.
// Wynik: tabela markdown na stdout (do opisu PR).
import { chromium, devices } from '@playwright/test';

const BASE = process.env.INST_URL || 'http://instalacje.localhost:3002';
const DETAILS = process.env.INST_SZCZEGOLY === '1';
const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/', '/monitoring', '/dla-architektow', '/dla-kogo/pensjonaty'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();

async function taskSeconds(cdp) {
  const { metrics } = await cdp.send('Performance.getMetrics');
  return metrics.find((m) => m.name === 'TaskDuration')?.value ?? 0;
}

async function idleCpu(cdp) {
  const t0 = await taskSeconds(cdp);
  await sleep(5000);
  const t1 = await taskSeconds(cdp);
  return Math.round(((t1 - t0) / 5) * 100);
}

async function measure(route) {
  const context = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__tbt = 0;
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (performance.now() < 10000) window.__tbt += Math.max(0, e.duration - 50);
        }
      }).observe({ type: 'longtask', buffered: true });
    } catch {}
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(BASE + route, { waitUntil: 'load' });
  await sleep(10000);
  const tbt = Math.round(await page.evaluate(() => window.__tbt));

  const cpuTop = await idleCpu(cdp);

  // Scroll with the wheel from top to bottom, recording frame times in the page.
  await page.evaluate(() => {
    window.__frames = [];
    let last = performance.now();
    const loop = (t) => {
      window.__frames.push(t - last);
      last = t;
      if (window.__recording) requestAnimationFrame(loop);
    };
    window.__recording = true;
    requestAnimationFrame(loop);
  });
  await page.mouse.move(200, 400);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 300) {
    await page.mouse.wheel(0, 300);
    await sleep(60);
  }
  const frames = await page.evaluate(() => {
    window.__recording = false;
    return window.__frames.slice(1);
  });
  frames.sort((a, b) => a - b);
  const mean = frames.reduce((s, f) => s + f, 0) / Math.max(1, frames.length);
  const p95 = frames[Math.floor(frames.length * 0.95)] ?? 0;

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await sleep(1500);
  const running = await page.evaluate((details) => {
    // Rendered ones only: loops in a section skipped by `content-visibility` cost nothing.
    const list = document.getAnimations().filter((a) => {
      const t = a.effect && a.effect.target;
      return a.playState === 'running' && (!t || t.checkVisibility({ contentVisibilityAuto: true }));
    });
    if (!details) return { count: list.length };
    const by = {};
    for (const a of list) {
      const t = a.effect && a.effect.target;
      const s = t && t.closest('main > section');
      const key = s ? '#' + (s.id || s.className) : t ? t.tagName.toLowerCase() : '?';
      by[key] = (by[key] || 0) + 1;
    }
    return { count: list.length, by };
  }, DETAILS);
  const cpuBottom = await idleCpu(cdp);
  await context.close();
  return {
    route,
    cpuTop,
    cpuBottom,
    running,
    frameMean: Math.round(mean * 10) / 10,
    frameP95: Math.round(p95 * 10) / 10,
    tbt,
  };
}

const rows = [];
for (const route of routes) rows.push(await measure(route));
await browser.close();

console.log('| Strona | CPU bezczynność (góra) | CPU bezczynność (dół) | Animacje po przewinięciu | Klatka śr. / p95 | TBT |');
console.log('| --- | --- | --- | --- | --- | --- |');
for (const r of rows) {
  console.log(
    `| \`${r.route}\` | ${r.cpuTop}% | ${r.cpuBottom}% | ${r.running.count} | ${r.frameMean} / ${r.frameP95} ms | ${r.tbt} ms |`,
  );
}
if (DETAILS) for (const r of rows) console.log(r.route, JSON.stringify(r.running.by));
