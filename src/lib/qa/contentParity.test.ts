import { describe, expect, it } from 'vitest'

import {
  afterImportProblems,
  closedToCrawlers,
  mapPaths,
  measure,
  PAGES,
  shortfalls,
  sitemapPaths,
} from '../../../scripts/porownaj-tresc.mjs'

const page = (sections: number, words = 40) =>
  `<html><body><header><h2>Menu</h2></header><main>${Array.from(
    { length: sections },
    (_, i) => `<section><h2>Sekcja ${i}</h2><p>${'słowo '.repeat(words)}</p></section>`,
  ).join(
    '',
  )}<script>var x = "${'a'.repeat(500)}"</script></main><footer><h2>Stopka</h2></footer></body></html>`

describe('porownaj-tresc (staging = content from the code, NAPRAWA-0911)', () => {
  it('counts H2, sections and text of <main> only (frame and scripts left out)', () => {
    const m = measure(page(3))
    expect(m.h2).toBe(3)
    expect(m.sections).toBe(3)
    expect(m.text).toBeGreaterThan(3 * 40 * 5)
    expect(m.text).toBeLessThan(3 * 40 * 7 + 60)
  })

  it('the staging GoPOS of 09.11 (4 of 12 sections) fails; the same page passes', () => {
    const local = measure(page(12))
    expect(shortfalls(local, measure(page(4)))).toEqual(['h2', 'sections', 'text'])
    expect(shortfalls(local, measure(page(12)))).toEqual([])
    // 10 of 12 sections is still above 80%.
    expect(shortfalls(local, measure(page(10)))).toEqual([])
  })

  it('a page without <main> measures zero; covers the pages of the audit', () => {
    expect(measure('<html></html>')).toEqual({ h2: 0, sections: 0, text: 0 })
    for (const path of ['/gopos', '/insert', '/opieka-it', '/o-firmie', '/kontakt']) {
      expect(PAGES).toContain(path)
    }
  })
})

describe('porownaj-tresc --po-imporcie (audit 14.11 P2-8: a stale cache after the import)', () => {
  const ok = { status: 200, noindex: false }
  it('reads the addresses of sitemap.xml and of the site map’s <main>', () => {
    expect(
      sitemapPaths(
        '<urlset><url><loc>https://x.pl/produkt/a</loc></url><url><loc>https://x.pl/</loc></url></urlset>',
      ),
    ).toEqual(['/produkt/a', '/'])
    expect(
      mapPaths(
        '<header><a href="/kontakt">K</a></header><main><a href="/produkt/a">A</a><a href="/produkt/a">A</a><a href="https://x.pl">X</a></main>',
      ),
    ).toEqual(['/produkt/a'])
  })

  it('a fresh import passes', () => {
    const pages = new Map([
      ['/', ok],
      ['/produkt/a', ok],
    ])
    expect(
      afterImportProblems({ sitemap: ['/', '/produkt/a'], map: ['/', '/produkt/a'], pages }),
    ).toEqual([])
  })

  it('the old cache of 14.11: 301 addresses on the map, new cards missing, cards with noindex', () => {
    const pages = new Map([
      ['/produkt/stary', { status: 301, noindex: false }],
      ['/produkt/b', { status: 200, noindex: true }],
    ])
    expect(
      afterImportProblems({
        sitemap: ['/produkt/nowy', '/produkt/b'],
        map: ['/produkt/stary', '/produkt/b'],
        pages,
      }),
    ).toEqual([
      'brak na mapie strony: /produkt/nowy',
      'na mapie adres z przekierowaniem 301: /produkt/stary',
      'karta z noindex: /produkt/b',
    ])
    expect(
      afterImportProblems({
        sitemap: ['/produkt/b'],
        map: ['/produkt/b', '/produkt/c'],
        pages: new Map(),
      }),
    ).toEqual(['kart w sitemap 1, na mapie strony 2'])
  })

  it('recognises staging by its robots.txt (closed to every crawler)', () => {
    expect(closedToCrawlers('User-agent: *\nDisallow: /\n')).toBe(true)
    expect(closedToCrawlers('User-agent: *\nAllow: /\n\nSitemap: https://x.pl/sitemap.xml\n')).toBe(
      false,
    )
  })

  it('staging: empty sitemap and noindex on every page are by design — only redirects and errors count', () => {
    const pages = new Map([
      ['/produkt/a', { status: 200, noindex: true }],
      ['/produkt/stary', { status: 301, noindex: true }],
      ['/produkt/zly', { status: 500, noindex: false }],
    ])
    expect(
      afterImportProblems({
        sitemap: [],
        map: ['/produkt/a', '/produkt/stary', '/produkt/zly'],
        pages,
        staging: true,
      }),
    ).toEqual(['na mapie adres z przekierowaniem 301: /produkt/stary', 'HTTP 500: /produkt/zly'])
  })
})
