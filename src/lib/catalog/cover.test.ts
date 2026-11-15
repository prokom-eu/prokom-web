import { describe, expect, it } from 'vitest'

import type { CatalogIndex, IndexProduct } from './catalogIndex'
import {
  cardCover,
  ELECTRONIC_TERMS,
  licenceTerms,
  PERPETUAL_TERMS,
  SERVICE_VISUALS,
  SUBSCRIPTION_TERMS,
} from './cover'

const photo = { url: '/ergo.webp', alt: 'Posnet Ergo', width: 480, height: 480 }
const index = {
  products: [{ slug: 'posnet-ergo-online', image: photo } as IndexProduct],
  brands: [
    {
      slug: 'microsoft',
      name: 'Microsoft',
      status: 'none',
      logo: { url: '/ms.webp', width: 200, height: 40 },
    },
    { slug: 'eset', name: 'ESET', status: 'none' },
  ],
} as unknown as Pick<CatalogIndex, 'products' | 'brands'>

const card = (fields: Partial<Pick<IndexProduct, 'slug' | 'name' | 'kind' | 'brand'>>) => ({
  slug: 'x',
  name: 'X',
  kind: 'device' as IndexProduct['kind'],
  brand: null,
  ...fields,
})

describe('licenceTerms (runda 1411 R8)', () => {
  it('a subscription per user, a licence paid once, else an electronic licence', () => {
    expect(licenceTerms('Microsoft 365 Business Standard').terms).toBe(SUBSCRIPTION_TERMS)
    expect(licenceTerms('Adobe Acrobat Pro for teams (licencja zespołowa, 1 rok)').terms).toBe(
      SUBSCRIPTION_TERMS,
    )
    expect(licenceTerms('Office Home & Business 2024')).toEqual({
      terms: PERPETUAL_TERMS,
      perpetual: true,
    })
    expect(licenceTerms('ESET Small Business Security', 'eset').terms).toBe(ELECTRONIC_TERMS)
    // A subscription wins over „Windows” / a year in its name.
    expect(licenceTerms('Microsoft 365 Apps for business (Windows)').terms).toBe(SUBSCRIPTION_TERMS)
    // Not a licence producer (SaaS, certificates): no model on the cover.
    expect(licenceTerms('GoPOS', 'gopos').terms).toBeNull()
    // „bezterminowa”, never „dożywotnia”.
    expect(PERPETUAL_TERMS).not.toMatch(/dożywot/i)
  })
})

describe('cardCover (runda 1411 R8)', () => {
  it('a licence: logo and name of the producer, the plan without the producer, its tone', () => {
    expect(
      cardCover(
        card({ kind: 'software', brand: 'eset', name: 'ESET Small Business Security' }),
        index,
      ),
    ).toEqual({
      kind: 'licence',
      brand: 'ESET',
      logo: null,
      plan: 'Small Business Security',
      terms: ELECTRONIC_TERMS,
      perpetual: false,
      tone: 'green',
    })
    // A plan that would start with a number keeps the producer („Microsoft 365 …”).
    expect(
      cardCover(
        card({ kind: 'software', brand: 'microsoft', name: 'Microsoft 365 Business Basic' }),
        index,
      ),
    ).toMatchObject({
      plan: 'Microsoft 365 Business Basic',
      tone: 'blue',
      logo: { url: '/ms.webp' },
    })
  })

  it('a service: the photo of what it is about, the badge only at the fiscal registers', () => {
    expect(
      cardCover(
        card({ kind: 'service', brand: 'pro-kom', slug: 'przeglad-kasy-fiskalnej' }),
        index,
      ),
    ).toEqual({
      kind: 'service',
      image: photo,
      authorized: true,
      words: ['Posnet', 'Elzab', 'w Rabce'],
    })
    expect(
      cardCover(card({ kind: 'service', brand: 'pro-kom', slug: 'przeglad-it' }), index),
    ).toMatchObject({
      authorized: false,
      image: null,
      words: ['Komputery', 'Kopie', 'Aktualizacje'],
    })
  })

  it('an own-brand card gets the service cover without words; a device none', () => {
    expect(cardCover(card({ brand: 'pro-kom', slug: 'tusze-tonery' }), index)).toMatchObject({
      kind: 'service',
      image: null,
      authorized: false,
      words: null,
    })
    expect(cardCover(card({ brand: 'hp' }), index)).toBeNull()
  })

  it('gives the badge only to services of the fiscal registers', () => {
    const authorized = Object.entries(SERVICE_VISUALS)
      .filter(([, visual]) => visual.authorized)
      .map(([slug]) => slug)
    expect(authorized.sort()).toEqual([
      'fiskalizacja',
      'przeglad-kasy-fiskalnej',
      'przejecie-serwisu-kasy',
      'serwis-kas-i-drukarek-fiskalnych',
    ])
    for (const visual of Object.values(SERVICE_VISUALS)) expect(visual.words).toHaveLength(3)
  })
})
