import { expect, test } from '@playwright/test'

import { site } from './helpers'

// SWV8 P0 #1: Software pages hydrate without React mismatches. The reveal observer used to mark
// catalog cards before the Suspense boundary around them had hydrated (`/rozwiazania`, 404).
const HOST = 'software.localhost'
// The production build (CI) reports a mismatch only as a minified error code, without „hydrat”.
const HYDRATION = /hydrat|Minified React error #(418|423|425)/i

for (const path of ['/', '/rozwiazania', '/cennik', '/nie-ma-takiej-strony']) {
  test(`${path} hydrates without errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (HYDRATION.test(message.text())) errors.push(message.text())
    })
    page.on('pageerror', (error) => {
      if (HYDRATION.test(error.message)) errors.push(error.message)
    })
    await page.goto(site(HOST, path))
    await page.waitForLoadState('networkidle')
    // Scrolling lets the observer reveal the cards below the fold, too.
    await page.mouse.wheel(0, 4000)
    await page.waitForTimeout(500)
    expect(errors).toEqual([])
  })
}
