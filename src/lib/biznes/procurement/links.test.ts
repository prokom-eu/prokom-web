import { describe, expect, it } from 'vitest'

import {
  categorySupplyBand,
  EMPTY_SUPPLY_LINKS,
  industrySupplyTiles,
  matchSupplySearch,
  productSupplyLink,
  scaleSupply,
  scaleSupplyLinks,
  supplyHrefVisible,
  supplySearch,
  type SupplyLinks,
} from './links'

const both = {
  pages: [
    { slug: 'agd-rtv-dla-firm', title: 'AGD i RTV dla firm' },
    { slug: 'dostawy-it-dla-firm', title: 'Dostawy IT dla firm' },
    { slug: 'opieka-it', title: 'Opieka IT' },
  ],
}
const itOnly = { pages: [{ slug: 'dostawy-it-dla-firm', title: 'Dostawy IT dla firm' }] }
const none = { pages: [{ slug: 'opieka-it', title: 'Opieka IT' }] }

const links: SupplyLinks = {
  ...EMPTY_SUPPLY_LINKS,
  categoryBand: 'Kupujesz 5 sztuk lub więcej?',
  categoryBandCta: 'Zobacz dostawy IT',
  itCategories: ['laptopy', 'monitory'],
  productLink: 'Potrzebujesz kilku sztuk? Policz stanowiska',
  industryTiles: [
    { industry: 'noclegi', page: 'agd', title: 'Telewizory i lodówki do pokoi', text: 'Do pokoi.' },
    { industry: 'noclegi', page: 'it', title: 'Recepcja', text: null },
    { industry: 'gastro', page: 'agd', title: 'Kuchnia zaplecza', text: null },
  ],
  scaleTitle: 'Przy tej skali zrobimy dostawę',
  scaleText: 'Jedna faktura.',
  searchAgd: ['agd', 'lodówka', 'telewizor', 'pralka', 'dla dewelopera'],
  searchIt: ['dostawa laptopów', 'hurtowo'],
}

describe('categorySupplyBand (plan 0611 §6.4 #2)', () => {
  it('shows the band on the listed IT categories while the IT page is published', () => {
    expect(categorySupplyBand(links, both, 'laptopy')).toEqual({
      text: 'Kupujesz 5 sztuk lub więcej?',
      cta: 'Zobacz dostawy IT',
      href: '/dostawy-it-dla-firm',
    })
    expect(categorySupplyBand(links, both, 'kasy-fiskalne')).toBeNull()
    expect(categorySupplyBand(links, none, 'laptopy')).toBeNull()
  })

  it('an empty text hides it; an empty link label falls back to the page title', () => {
    expect(categorySupplyBand({ ...links, categoryBand: '  ' }, both, 'laptopy')).toBeNull()
    expect(categorySupplyBand({ ...links, categoryBandCta: null }, both, 'laptopy')?.cta).toBe(
      'Dostawy IT dla firm',
    )
  })
})

describe('productSupplyLink (§6.4 #3)', () => {
  it('links the configurator of the IT page for a product of an IT category', () => {
    expect(productSupplyLink(links, both, ['monitory'])).toEqual({
      label: 'Potrzebujesz kilku sztuk? Policz stanowiska',
      href: '/dostawy-it-dla-firm#zestaw',
    })
    expect(productSupplyLink(links, both, ['kasy-fiskalne'])).toBeNull()
    expect(productSupplyLink({ ...links, productLink: null }, both, ['laptopy'])).toBeNull()
    expect(productSupplyLink(links, none, ['laptopy'])).toBeNull()
  })
})

describe('industrySupplyTiles (§6.4 #4)', () => {
  it('gives the tiles of the industry whose page is published', () => {
    expect(industrySupplyTiles(links, both, 'noclegi')).toEqual([
      {
        title: 'Telewizory i lodówki do pokoi',
        text: 'Do pokoi.',
        href: '/agd-rtv-dla-firm',
        label: 'AGD i RTV dla firm',
      },
      { title: 'Recepcja', text: null, href: '/dostawy-it-dla-firm', label: 'Dostawy IT dla firm' },
    ])
    expect(industrySupplyTiles(links, itOnly, 'noclegi').map((tile) => tile.title)).toEqual([
      'Recepcja',
    ])
    expect(industrySupplyTiles(links, both, 'handel')).toEqual([])
  })
})

describe('scaleSupply and scaleSupplyLinks (§6.4 #5)', () => {
  const supply = scaleSupply(links, both)!

  it('carries the texts and the published pages to the configurator', () => {
    expect(supply).toMatchObject({
      title: 'Przy tej skali zrobimy dostawę',
      text: 'Jedna faktura.',
    })
    expect(scaleSupply({ ...links, scaleTitle: null }, both)).toBeNull()
    expect(scaleSupply(links, none)).toBeNull()
  })

  it('only at „10+”: the IT page, and for a hotel also the AGD page with the type and count', () => {
    expect(scaleSupplyLinks(supply, 'biuro', '4')).toEqual([])
    expect(scaleSupplyLinks(supply, 'biuro', '10')).toEqual([
      { label: 'Dostawy IT dla firm', href: '/dostawy-it-dla-firm?typ=biuro&n=10#zestaw' },
    ])
    expect(scaleSupplyLinks(supply, 'hotel', '10')).toEqual([
      { label: 'Dostawy IT dla firm', href: '/dostawy-it-dla-firm?typ=recepcja&n=10#zestaw' },
      { label: 'AGD i RTV dla firm', href: '/agd-rtv-dla-firm?typ=pokoj&n=10#zestaw' },
    ])
    expect(scaleSupplyLinks(scaleSupply(links, itOnly)!, 'hotel', '10')).toHaveLength(1)
  })
})

describe('supplySearch and matchSupplySearch (§6.4 #10)', () => {
  const entries = supplySearch(links, both)
  const hrefs = (q: string) => matchSupplySearch(entries, q).map((entry) => entry.href)

  it('brings the AGD page for its phrases, also inflected or half typed', () => {
    for (const q of ['agd', 'lodówka', 'Lodówki do hotelu', 'telewizory', 'pralki', 'lodó']) {
      expect(hrefs(q), q).toEqual(['/agd-rtv-dla-firm'])
    }
    expect(hrefs('mieszkania dla dewelopera')).toEqual(['/agd-rtv-dla-firm'])
  })

  it('brings the IT page for its phrases', () => {
    expect(hrefs('dostawa laptopów')).toEqual(['/dostawy-it-dla-firm'])
    expect(hrefs('laptopy hurtowo')).toEqual(['/dostawy-it-dla-firm'])
  })

  it('stays quiet for other phrases and short tokens', () => {
    for (const q of ['laptop', 'tel', 'kasa fiskalna', 'dostawa', '']) {
      expect(hrefs(q), q).toEqual([])
    }
  })

  it('an unpublished page or empty list brings nothing', () => {
    expect(matchSupplySearch(supplySearch(links, itOnly), 'lodówka')).toEqual([])
    expect(supplySearch({ ...links, searchAgd: [], searchIt: [] }, both)).toEqual([])
  })
})

describe('supplyHrefVisible', () => {
  it('hides a link to an unpublished procurement page, keeps every other one', () => {
    expect(supplyHrefVisible('/dostawy-it-dla-firm', itOnly)).toBe(true)
    expect(supplyHrefVisible('/agd-rtv-dla-firm', itOnly)).toBe(false)
    expect(supplyHrefVisible('/agd-rtv-dla-firm?typ=pokoj#zestaw', itOnly)).toBe(false)
    expect(supplyHrefVisible('/opieka-it', none)).toBe(true)
  })
})
