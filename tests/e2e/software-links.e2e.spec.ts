import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SWV6 A1: no internal link of the Software start page leads to a missing page — header, mega
// menu, sections, footer and the phone menu (its links are in the page even while closed).
const HOST = 'software.localhost'

/** Internal addresses of every link on the page, without the `#…` part, each once. */
const internalHrefs = (page: Page) =>
  page.evaluate(() => [
    ...new Set(
      [...document.querySelectorAll('a[href^="/"]')]
        .map((a) => (a.getAttribute('href') ?? '').split('#')[0])
        .filter((href) => href && !href.startsWith('//')),
    ),
  ])

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
]) {
  test(`every internal link of the start page answers 200 (${viewport.name})`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto(site(HOST))
    if (viewport.name === 'phone') {
      // The menu sheet renders its links when opened.
      await page
        .getByRole('navigation', { name: 'Pasek nawigacji' })
        .getByRole('button', { name: 'Menu' })
        .click()
      await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()
    } else {
      await page
        .getByRole('button', { name: /^Oferta/ })
        .first()
        .click()
    }
    const hrefs = await internalHrefs(page)
    expect(hrefs.length).toBeGreaterThan(10)
    expect(hrefs.filter((href) => href === '/dla-branz')).toEqual([])
    for (const href of hrefs) {
      const response = await page.request.get(site(HOST, href), { maxRedirects: 0 })
      expect(response.status(), href).toBe(200)
    }
  })
}
