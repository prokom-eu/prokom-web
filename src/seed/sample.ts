import { HOME_SLUG } from '../lib/pages/slug'
import type { CompanyDatum, Page, SiteSetting } from '../payload-types'

/**
 * Data for local development. The seed never overwrites a global or settings that already exist;
 * staging and production get theirs in the panel. The company name, NIP and the Rabka office
 * (address, hours pn–pt 9:00–17:00) are real (prokomsoftware ZMIANY-v23 §1); phone numbers and
 * e-mails stay deliberately fake (+48 000 …, example.test), like the Zakopane salon.
 */
export const SAMPLE_COMPANY: Omit<CompanyDatum, 'id'> = {
  name: 'PRO-KOM Tadeusz Wójciak',
  nip: '7352511447',
  email: 'biuro@example.test',
  phones: [
    { label: 'Biuro (przykład)', number: '+48 000 000 001' },
    { label: 'Serwis (przykład)', number: '+48 000 000 002' },
  ],
  locations: [
    {
      name: 'Rabka-Zdrój',
      street: 'ul. Orkana 16B',
      postalCode: '34-700',
      city: 'Rabka-Zdrój',
      hours: [{ days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' }],
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
      layout: [
        { blockType: 'contact', heading: 'Dane kontaktowe', showLocations: true },
        {
          blockType: 'inquiryForm',
          heading: 'Napisz do nas',
          text: 'Przykładowy formularz — zapytanie trafi do skrzynki w panelu.',
        },
      ],
    },
  ]
}

/**
 * Sample blocks a page seeded earlier does not have yet (by block type), so a new block
 * (e.g. the S8b form) reaches existing local databases without touching what is there.
 */
export function missingSampleBlocks<T extends { blockType: string }>(
  existing: readonly { blockType: string }[] | null | undefined,
  sample: readonly T[],
): T[] {
  const present = new Set((existing ?? []).map((block) => block.blockType))
  return sample.filter((block) => !present.has(block.blockType))
}

/** Alt of the per-line sample image; the seed finds an existing one by it. */
export const sampleImageAlt = (tenant: { name: string }) => `Obraz przykładowy — ${tenant.name}`

/** One SAMPLE partner shown on every line, with a generated placeholder logo. */
export const SAMPLE_PARTNER_NAME = 'Partner przykładowy'
