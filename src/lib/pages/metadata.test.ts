import { describe, expect, it } from 'vitest'

import { pageMetadata } from './metadata'

const page = { title: 'Kontakt', slug: 'kontakt', seo: { title: null, description: null } }
const site = { name: 'PRO-KOM Biznes', ogImage: null }

describe('pageMetadata', () => {
  it('uses the page title for subpages (the layout adds the template)', () => {
    expect(pageMetadata(page, site).title).toBe('Kontakt')
  })

  it('prefers the SEO title and description', () => {
    const metadata = pageMetadata(
      { ...page, seo: { title: 'Kontakt z nami', description: 'Zadzwoń.' } },
      site,
    )
    expect(metadata.title).toBe('Kontakt z nami')
    expect(metadata.description).toBe('Zadzwoń.')
  })

  it("keeps the layout's default title on the home page unless an SEO title is set", () => {
    expect(pageMetadata({ ...page, slug: 'home', title: 'Strona główna' }, site).title).toBe(
      undefined,
    )
    expect(pageMetadata({ ...page, slug: 'home', seo: { title: 'Serwis IT' } }, site).title).toBe(
      'Serwis IT',
    )
  })

  it('sets the canonical path, home at /', () => {
    expect(pageMetadata(page, site).alternates).toEqual({ canonical: '/kontakt' })
    expect(pageMetadata({ ...page, slug: 'home' }, site).alternates).toEqual({ canonical: '/' })
  })

  it('fills Open Graph with the page and the site defaults', () => {
    const ogImage = {
      alt: 'Logo',
      width: 1200,
      height: 630,
      sources: [
        { url: '/api/media/file/og-480x252.webp', width: 480 },
        { url: '/api/media/file/og.png', width: 1200 },
      ],
    }
    expect(pageMetadata({ ...page, slug: 'home' }, { ...site, ogImage }).openGraph).toEqual({
      type: 'website',
      locale: 'pl_PL',
      siteName: 'PRO-KOM Biznes',
      url: '/',
      title: 'PRO-KOM Biznes',
      description: undefined,
      images: [{ url: '/api/media/file/og.png', width: 1200, height: 630, alt: 'Logo' }],
    })
  })
})
