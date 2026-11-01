import { describe, expect, it } from 'vitest'

import {
  findNames,
  findPlaceholders,
  scannableHtml,
  sitemapPaths,
} from '../../../scripts/content-scan.mjs'

// SW12: the content scan before production (spec. Software §10 pkt 9–10).

describe('findPlaceholders', () => {
  it('finds the facts left in square brackets, once each', () => {
    const html =
      '<p>Zadzwoń: [TELEFON SOFTWARE]</p><li>[ROK ZAKOPANE] salon</li><b>[X]</b><i>[OKRES PRZECHOWYWANIA]</i><p>[X]</p>'
    expect(findPlaceholders(html)).toEqual([
      '[TELEFON SOFTWARE]',
      '[ROK ZAKOPANE]',
      '[X]',
      '[OKRES PRZECHOWYWANIA]',
    ])
  })

  it('reads JSON-LD but not the scripts and styles of the page', () => {
    const html = [
      '<script>const re=/[A-Z]/;self.__next_f.push([1,"[TELEFON]"])</script>',
      '<style>a[HREF]{color:red}</style>',
      '<script type="application/ld+json">{"telephone":"[TELEFON SOFTWARE]"}</script>',
    ].join('')
    expect(findPlaceholders(html)).toEqual(['[TELEFON SOFTWARE]'])
  })

  it('ignores ordinary brackets', () => {
    expect(findPlaceholders('<p>[1] przypis, [zobacz] i [Rabka]</p>')).toEqual([])
  })
})

describe('findNames', () => {
  it('finds a name in any case and without diacritics, as a whole word only', () => {
    const html = '<p>Lepsze niż ŻÓŁW-Soft, ale nie jak Żółwik.</p>'
    expect(findNames(html, ['Żółw-Soft'])).toEqual(['Żółw-Soft'])
    expect(findNames(html, ['Żółw'])).toEqual(['Żółw'])
    expect(findNames('<p>Żółwik</p>', ['Żółw'])).toEqual([])
    expect(findNames('<p>a.b.c</p>', ['a.b'])).toEqual(['a.b'])
  })

  it('does not look into scripts', () => {
    expect(findNames('<script>"Acme"</script><p>Strona</p>', ['Acme'])).toEqual([])
  })
})

describe('scannableHtml and sitemapPaths', () => {
  it('keeps the markup a visitor sees', () => {
    expect(scannableHtml('<h1>Oferta</h1><script src="/a.js"></script>')).toBe('<h1>Oferta</h1>')
  })

  it('turns sitemap addresses into paths', () => {
    const xml =
      '<urlset><url><loc>https://prokomsoftware.pl/</loc></url><url><loc> https://prokomsoftware.pl/rozwiazania/crm </loc></url></urlset>'
    expect(sitemapPaths(xml)).toEqual(['/', '/rozwiazania/crm'])
  })
})
