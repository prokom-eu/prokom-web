import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SWV7 (Definition of Done): every clickable element of Software changes smoothly — none may
// have a transition of 0 s (before SWV7 about 60 of 118 had none). `src/styles/motion.css` §1.
const HOST = 'software.localhost'

/** Visible clickable elements whose every transition lasts 0 s, as short descriptions. */
const withoutTransition = (page: Page) =>
  page.evaluate(() => {
    const selector =
      'a[href], button, summary, [role="tab"], input:not([type="hidden"]), select, textarea, label'
    return [...document.querySelectorAll<HTMLElement>(selector)]
      .filter((element) => element.getClientRects().length > 0)
      .filter((element) =>
        getComputedStyle(element)
          .transitionDuration.split(',')
          .every((duration) => Number.parseFloat(duration) === 0),
      )
      .map(
        (element) =>
          `${element.tagName.toLowerCase()} „${(element.textContent ?? '').trim().slice(0, 40)}”`,
      )
  })

for (const path of ['/', '/rozwiazania', '/kontakt', '/o-firmie']) {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'phone', width: 390, height: 844 },
  ]) {
    test(`every clickable element has a transition: ${path} (${viewport.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(site(HOST, path))
      expect(await withoutTransition(page)).toEqual([])
    })
  }
}
