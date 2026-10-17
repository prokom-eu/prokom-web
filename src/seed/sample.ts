import { HOME_SLUG } from '../lib/pages/slug'
import type { CompanyDatum, Page, SiteSetting } from '../payload-types'

/**
 * SAMPLE data for local development — not real contact details. Real values are entered
 * in the panel; the seed never overwrites a global or settings that already exist.
 * Phone numbers are deliberately fake (+48 000 …), the NIP has a valid check digit only.
 */
export const SAMPLE_COMPANY: Omit<CompanyDatum, 'id'> = {
  name: 'PRO-KOM (dane przykładowe)',
  nip: '1234563218',
  email: 'biuro@example.test',
  phones: [
    { label: 'Biuro (przykład)', number: '+48 000 000 001' },
    { label: 'Serwis (przykład)', number: '+48 000 000 002' },
  ],
  locations: [
    {
      name: 'Rabka-Zdrój (przykład)',
      street: 'ul. Przykładowa 1',
      postalCode: '00-000',
      city: 'Rabka-Zdrój',
      hours: [
        { days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '08:00', closes: '16:00' },
        { days: ['sat'], opens: '09:00', closes: '13:00' },
      ],
    },
    {
      name: 'Zakopane (przykład)',
      street: 'ul. Przykładowa 2',
      postalCode: '00-000',
      city: 'Zakopane',
      hours: [{ days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' }],
    },
  ],
  promoBar: {},
}

type SampleSettings = Omit<SiteSetting, 'id' | 'tenant' | 'updatedAt' | 'createdAt'>

/** Per-line SAMPLE settings; each line gets its own fake phone so isolation is visible. */
export function sampleSiteSettings(tenant: { name: string; slug: string }, index: number) {
  const settings: SampleSettings = {
    phone: `+48 000 000 1${String(index + 1).padStart(2, '0')}`,
    email: `${tenant.slug}@example.test`,
    navigation: [{ label: 'Kontakt', href: '/kontakt' }],
    footer: { text: `${tenant.name} — dane przykładowe.`, links: [] },
    seo: { titleTemplate: `%s | ${tenant.name}`, description: null },
  }
  return settings
}

type SamplePage = Pick<Page, 'title' | 'slug' | 'layout'>

/**
 * Per-line SAMPLE pages: a start page and the contact page the sample navigation links to.
 * Texts name only their own line, so the isolation tests can tell the domains apart.
 * The hero gets the line's sample image (`seed/media.ts`), when there is one.
 */
export function samplePages(tenant: { name: string }, heroImageId?: number): SamplePage[] {
  return [
    {
      title: 'Strona główna',
      slug: HOME_SLUG,
      layout: [
        {
          blockType: 'hero',
          heading: tenant.name,
          lead: `Przykładowa strona główna (${tenant.name}) — treść do zastąpienia w panelu.`,
          cta: { label: 'Kontakt', href: '/kontakt' },
          image: heroImageId,
        },
        { blockType: 'partners', heading: 'Partnerzy (przykład)' },
      ],
    },
    {
      title: 'Kontakt',
      slug: 'kontakt',
      layout: [{ blockType: 'contact', heading: 'Dane kontaktowe', showLocations: true }],
    },
  ]
}

/** Alt of the per-line sample image; the seed finds an existing one by it. */
export const sampleImageAlt = (tenant: { name: string }) => `Obraz przykładowy — ${tenant.name}`

/** One SAMPLE partner shown on every line, with a generated placeholder logo. */
export const SAMPLE_PARTNER_NAME = 'Partner przykładowy'
