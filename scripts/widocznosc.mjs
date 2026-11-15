// What a visitor sees, not what the HTML has (PRODUKCJA-BIZNES-1211, Część I P0): a section can be
// in the HTML — so H2 counts (porownaj-tresc, smoke, e2e) pass — and still never show, e.g. a CSS
// rule meant for the side rail's labels kept every K4 section with an anchor at opacity 0 (08–12.11).
// Shared by the e2e `biznes-widocznosc`, `scripts/zrzuty-pelne.mjs` and `porownaj-tresc --widocznosc`.

/** Pages of prokombiznes.pl checked for visibility (one of each kind; a ready bundle). */
export const PAGES = [
  '/',
  '/gopos',
  '/insert',
  '/opieka-it',
  '/automaty-vendingowe',
  '/ksef',
  '/ulga-na-kase-fiskalna',
  '/o-firmie',
  '/kontakt',
  '/zestawy',
  '/zestawy/zestaw-sklep-spozywczy-program-waga-etykiet',
  '/marki/posnet',
  '/marki/polcard',
  '/oferta',
  '/oferta/kasy-fiskalne',
  '/produkt/posnet-ergo-online',
  '/agd-rtv-dla-firm',
  '/dostawy-it-dla-firm',
  '/branze/gastronomia',
  '/aktualnosci',
]

/** Pause after each scroll step: the reveal observer and lazy islands get their turn. */
const STEP_MS = 250
/** After the last step: at least this long, so the last rise-ins have started. */
const SETTLE_MS = 600
/** …and then until no finite animation runs (a rise-in with the card queue: ≤ ~0.8 s). */
const ANIMATIONS_MS = 5000

/**
 * Scrolls `page` (a Playwright page) like a visitor — three quarters of a window at a time, top to
 * bottom — then lists what still does not show: `main section`, `[data-reveal]` and the children
 * of `[data-reveal-cards]` with opacity < 0.99 or visibility other than visible, and sections or
 * reveal targets moved off the screen sideways. Elements without a box (closed tabs, `details`,
 * `hidden`) are skipped. Each problem names the element and the CSS rule that set opacity 0.
 */
export async function hiddenAfterScroll(page) {
  let y = 0
  for (let step = 0; step < 200; step++) {
    const { height, inner } = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      inner: window.innerHeight,
    }))
    if (y >= height) break
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await page.waitForTimeout(STEP_MS)
    // Not a whole window: the reveal observer ignores the bottom 8%, and a short tile inside
    // that band would never be „seen” by steps of a full height (a visitor scrolls smoothly).
    y += Math.round(inner * 0.75)
  }
  await page.waitForTimeout(SETTLE_MS)
  // Not a bare sleep: on a busy CI runner a rise-in may still be at opacity 0.9 after 1 s.
  await page
    .waitForFunction(
      () =>
        !document
          .getAnimations()
          .some(
            (animation) =>
              animation.playState === 'running' &&
              animation.effect?.getComputedTiming().iterations !== Infinity,
          ),
      undefined,
      { timeout: ANIMATIONS_MS },
    )
    .catch(() => {})
  return page.evaluate(collectHidden)
}

/** Runs in the page (serialized by Playwright): no closures over module scope. */
function collectHidden() {
  const rules = []
  const walk = (list) => {
    for (const rule of list) {
      if (rule instanceof CSSStyleRule) {
        if (rule.style.opacity === '0' || rule.style.visibility === 'hidden') rules.push(rule)
      }
      if ('cssRules' in rule && rule.cssRules) walk(rule.cssRules)
    }
  }
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules)
    } catch {
      // A cross-origin sheet (none expected — fonts and styles are local).
    }
  }
  const ruleFor = (element) => {
    const found = rules.filter((rule) => {
      try {
        return element.matches(rule.selectorText)
      } catch {
        return false
      }
    })
    return found.map((rule) => rule.selectorText).join(' | ') || '(styl inline lub animacja)'
  }
  const describe = (element) => {
    const label =
      element.id ||
      element.getAttribute('aria-label') ||
      (element.getAttribute('aria-labelledby') &&
        document.getElementById(element.getAttribute('aria-labelledby'))?.textContent?.trim()) ||
      element.querySelector('h2, h3')?.textContent?.trim() ||
      element.textContent?.trim().slice(0, 40) ||
      '?'
    return `<${element.tagName.toLowerCase()}> ${label.replace(/\s+/g, ' ').slice(0, 60)}`
  }

  // The page's content only: a reveal target in a closed menu panel is not something missed.
  const offscreen = new Set([
    ...document.querySelectorAll('main section'),
    ...document.querySelectorAll('main [data-reveal]'),
  ])
  const targets = new Set([
    ...offscreen,
    ...[...document.querySelectorAll('main [data-reveal-cards]')].flatMap((list) => [
      ...list.children,
    ]),
  ])
  /** Opacity as seen: the element's times every ancestor's (opacity is not inherited). */
  const seen = (element) => {
    let opacity = 1
    let faintest = element
    let faintestOpacity = 1
    for (let node = element; node && node !== document.body; node = node.parentElement) {
      const own = Number(getComputedStyle(node).opacity)
      opacity *= own
      if (own < faintestOpacity) {
        faintestOpacity = own
        faintest = node
      }
    }
    return { opacity, faintest }
  }
  const problems = []
  for (const element of targets) {
    if (element.getClientRects().length === 0) continue
    const style = getComputedStyle(element)
    const { opacity, faintest } = seen(element)
    if (opacity < 0.99) {
      problems.push({
        element: describe(element),
        why: `opacity ${Math.round(opacity * 100) / 100}${faintest === element ? '' : ` (przez ${describe(faintest)})`}`,
        rule: ruleFor(faintest),
      })
      continue
    }
    if (style.visibility !== 'visible') {
      problems.push({
        element: describe(element),
        why: `visibility ${style.visibility}`,
        rule: ruleFor(element),
      })
      continue
    }
    if (offscreen.has(element)) {
      const box = element.getBoundingClientRect()
      if (box.right <= 0 || box.left >= window.innerWidth)
        problems.push({
          element: describe(element),
          why: `poza ekranem (left ${Math.round(box.left)})`,
          rule: `translate ${style.translate}, transform ${style.transform}`,
        })
    }
  }
  return problems
}
