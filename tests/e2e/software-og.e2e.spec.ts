import { expect, test } from '@playwright/test'

import { site } from './helpers'

// SWV8 P0 #4: every Software page shares a link with a large image — the line's file while
// the panel has no „Obraz OG”.
const HOST = 'software.localhost'

for (const path of [
  '/',
  '/rozwiazania',
  '/dobierz',
  '/kontakt',
  '/miejscowosci/rabka-zdroj',
  '/regulamin',
  '/mapa-strony',
]) {
  test(`${path} has og:image and a large Twitter card`, async ({ page }) => {
    await page.goto(site(HOST, path))
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/brand\/prokom-software_og\.png$/,
    )
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200')
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    )
  })
}

// Decision of Krystian 15.11: a shared post shows its own drawn cover — the generated card.
test('a post shares its own generated 1200 × 630 card', async ({ page, request }) => {
  const slug = 'automatyzacje-w-malej-firmie'
  const image = site(HOST, `/og/wpis/${slug}`)
  await page.goto(site(HOST, `/aktualnosci/${slug}`))
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', image)
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630')
  const response = await request.get(image)
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toBe('image/png')
  // Unknown post → 404, as the post page.
  expect((await request.get(site(HOST, '/og/wpis/nie-ma-takiego-wpisu'))).status()).toBe(404)
  // Tenant isolation: another line's post is not drawn on this domain, nor this one there.
  expect((await request.get(site(HOST, '/og/wpis/ksef-od-1-stycznia-2027'))).status()).toBe(404)
  expect((await request.get(site('biznes.localhost', `/og/wpis/${slug}`))).status()).toBe(404)
})
