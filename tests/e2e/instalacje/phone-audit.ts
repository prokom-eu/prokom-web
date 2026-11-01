import type { Page } from '@playwright/test'

// Phone checks of MOBILE-APLIKACJA §10 for one page at the current viewport (I14). Shared by
// `telefon.e2e.spec.ts` (CI) and `audyt-telefon.mjs` (local report) — one definition of „passes”.
// Plain TypeScript without path aliases or enums: Node.js runs it as is.

export type PhoneProblem = {
  /** overflow · target · tabbar · header · anchors · fold · form — fail the test; carousel,
   * scene — notes. */
  kind: string
  detail: string
}

export const PHONE_WIDTHS = [360, 390, 414] as const
export const THEMES = ['light', 'dark'] as const
/** Hard rules; the rest are notes for the report. */
export const FAILING = new Set([
  'overflow',
  'target',
  'tabbar',
  'header',
  'anchors',
  'fold',
  'form',
])

/** Sets the theme as the theme button does (`html[data-theme]` wins over the system). */
export async function setTheme(page: Page, theme: string): Promise<void> {
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
}

/**
 * Runs every check on the open page. Scrolls the whole page first (lazy and revealed parts are
 * laid out), then measures; leaves the page scrolled to the top.
 */
export async function auditPhone(page: Page): Promise<PhoneProblem[]> {
  return page.evaluate(async () => {
    const problems: { kind: string; detail: string }[] = []
    const add = (kind: string, detail: string) => problems.push({ kind, detail })
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
    const html = document.documentElement
    const vw = window.innerWidth
    const label = (el: Element) => {
      const id = el.id ? `#${el.id}` : ''
      const cls =
        typeof el.className === 'string' && el.className.trim()
          ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
          : ''
      const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 28)
      const section = el.closest('section[id]')?.id
      return `${el.tagName.toLowerCase()}${id}${cls}${text ? ` „${text}”` : ''}${section ? ` (#${section})` : ''}`
    }
    const shown = (el: Element) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && el.checkVisibility({ visibilityProperty: true })
    }

    // Lay out the whole page once.
    for (let y = 0; y < html.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await wait(30)
    }
    window.scrollTo(0, 0)
    await frame()
    // Where the anchor bar starts (below the hero) before it sticks.
    const anchorsStart = document.querySelector('nav.anchors')?.getBoundingClientRect().top ?? 0

    // 1. No horizontal scroll; name the outermost elements that stick out.
    if (html.scrollWidth > vw) {
      const clips = (el: Element | null): boolean => {
        for (let p = el?.parentElement; p && p !== document.body; p = p.parentElement) {
          if (getComputedStyle(p).overflowX !== 'visible') return true
        }
        return false
      }
      const out = [...document.body.querySelectorAll('*')].filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.right > vw + 0.5 && !clips(el)
      })
      const outer = out.filter((el) => !out.some((o) => o !== el && o.contains(el)))
      add(
        'overflow',
        `${html.scrollWidth} px > ${vw} px: ${outer.slice(0, 4).map(label).join('; ') || '?'}`,
      )
    }

    // 2. Touch targets ≥ 44 px (buttons, chips, tabs, scene points, fields); checkbox and
    // radio labels ≥ 24 px like links in text.
    const targets = document.querySelectorAll(
      'main :is(button, a.btn, [role="tab"], [role="button"], [role="radio"], [role="switch"], select, textarea, input:not([type="hidden"], [type="checkbox"], [type="radio"], [type="range"], [type="submit"]))',
    )
    // A honeypot (`aria-hidden`, out of the tab order) is not for people.
    const hidden = (el: Element) => el.closest('[aria-hidden="true"]') !== null
    for (const el of targets) {
      if (!shown(el) || hidden(el)) continue
      // A field inside its label: the whole label is what the thumb hits.
      const area = el.matches('input, select, textarea') ? (el.closest('label') ?? el) : el
      const r = area.getBoundingClientRect()
      if (r.height >= 43.5 && r.width >= 43.5) continue
      const size = `${Math.round(r.width)}×${Math.round(r.height)} ${label(el)}`
      // Points drawn in an SVG scene scale with the drawing; each scene with them also has
      // 44 px buttons doing the same (arrows, list) — a note, WCAG 2.5.8 „equivalent control”.
      add(el.closest('svg') ? 'scene' : 'target', size)
    }
    for (const box of document.querySelectorAll(
      'main input:is([type="checkbox"], [type="radio"])',
    )) {
      const owner = (box as HTMLInputElement).labels?.[0] ?? box
      if (!shown(owner)) continue
      const h = owner.getBoundingClientRect().height
      if (h < 23.5) add('target', `etykieta ${Math.round(h)} px ${label(owner)}`)
    }

    // 3. Fields: 16 px (no iOS zoom), a label, the right type for phone and e-mail.
    for (const el of document.querySelectorAll<HTMLInputElement>(
      'main :is(input:not([type="hidden"], [type="checkbox"], [type="radio"], [type="range"], [type="submit"]), select, textarea)',
    )) {
      if (!el.checkVisibility() || hidden(el)) continue
      const size = parseFloat(getComputedStyle(el).fontSize)
      if (size < 16) add('form', `czcionka ${size} px ${label(el)}`)
      const named =
        el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
      if (!named) add('form', `bez etykiety ${label(el)} [name=${el.name}]`)
      const key = `${el.name} ${el.autocomplete}`.toLowerCase()
      if (el.tagName === 'INPUT') {
        if (/tel|phone|telefon/.test(key) && el.type !== 'tel')
          add('form', `telefon bez type=tel [name=${el.name}]`)
        if (/mail/.test(key) && el.type !== 'email')
          add('form', `e-mail bez type=email [name=${el.name}]`)
      }
    }

    // 4. Folded sections announce their state.
    for (const b of document.querySelectorAll('main button')) {
      if (
        /Pokaż całą sekcję|Zwiń sekcję/.test(b.textContent ?? '') &&
        !b.hasAttribute('aria-expanded')
      )
        add('fold', `bez aria-expanded ${label(b)}`)
    }

    // 5. Carousels snap (note only: tables and the anchor bar scroll without snapping).
    for (const el of document.querySelectorAll('main *')) {
      const s = getComputedStyle(el)
      if (!/auto|scroll/.test(s.overflowX) || el.scrollWidth <= el.clientWidth + 1) continue
      if (el.querySelector('table') || el.closest('.anchors')) continue
      if (s.scrollSnapType === 'none')
        add('carousel', `przewijane w bok bez scroll-snap ${label(el)}`)
    }

    // 6. The phone header hides scrolling down and comes back scrolling up; the anchor bar
    // then sits at the top with no gap.
    const header = document.getElementById('naglowek')
    if (header && html.scrollHeight > window.innerHeight + 1200) {
      window.scrollTo(0, 400)
      await wait(80)
      window.scrollTo(0, 1100)
      await wait(450)
      if (!html.hasAttribute('data-hdr-hidden'))
        add('header', 'nie chowa się po przewinięciu w dół')
      // The anchor bar sits under the hero: scroll well past where it starts, then it is stuck.
      const anchors = document.querySelector('nav.anchors')
      if (anchors && shown(anchors) && getComputedStyle(anchors).position === 'sticky') {
        const start = anchorsStart
        window.scrollTo(0, start + 600)
        await wait(80)
        window.scrollTo(0, start + 1200)
        await wait(450)
        const top = anchors.getBoundingClientRect().top
        if (html.hasAttribute('data-hdr-hidden') && Math.abs(top) > 1)
          add('anchors', `pasek kotwic ${Math.round(top)} px od góry przy schowanym nagłówku`)
        window.scrollTo(0, start + 800)
      } else {
        window.scrollTo(0, 700)
      }
      await wait(450)
      if (html.hasAttribute('data-hdr-hidden')) add('header', 'nie wraca po przewinięciu w górę')
    }

    // 7. Nothing hides under the bottom bar: at the very end the footer's content ends above it.
    const bar = document.querySelector('nav.bnav')
    const footer = document.querySelector('footer')
    if (bar && footer && shown(bar)) {
      window.scrollTo(0, html.scrollHeight)
      await wait(450)
      const barTop = bar.getBoundingClientRect().top
      let bottom = 0
      for (const el of footer.querySelectorAll('a, button, p, span, li, small, h2, h3')) {
        if (!shown(el)) continue
        bottom = Math.max(bottom, el.getBoundingClientRect().bottom)
      }
      if (bottom > barTop + 0.5)
        add('tabbar', `stopka kończy się ${Math.round(bottom - barTop)} px pod dolnym paskiem`)
    }

    window.scrollTo(0, 0)
    await wait(450)
    return problems
  })
}
