import { describe, expect, it } from 'vitest'

import { pageMetadata } from './metadata'

const page = { title: 'Kontakt', slug: 'kontakt', seo: { title: null, description: null } }

describe('pageMetadata', () => {
  it('uses the page title for subpages (the layout adds the template)', () => {
    expect(pageMetadata(page)).toEqual({ title: 'Kontakt' })
  })

  it('prefers the SEO title and description', () => {
    expect(
      pageMetadata({ ...page, seo: { title: 'Kontakt z nami', description: 'Zadzwoń.' } }),
    ).toEqual({ title: 'Kontakt z nami', description: 'Zadzwoń.' })
  })

  it("keeps the layout's default title on the home page unless an SEO title is set", () => {
    expect(pageMetadata({ ...page, slug: 'home', title: 'Strona główna' })).toEqual({})
    expect(pageMetadata({ ...page, slug: 'home', seo: { title: 'Serwis IT' } })).toEqual({
      title: 'Serwis IT',
    })
  })
})
