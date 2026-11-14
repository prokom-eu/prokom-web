import type { Partner } from '@/payload-types'

import { categoryHref } from '../catalog/category'
import { joinNames, k4Rank, partnerBadges } from '../partners/badges'
import { FOUNDED } from '../shared/pages'

export type BiznesLlmsInput = {
  origin: string
  /** The line as it presents itself („PRO-KOM Biznes”). */
  name: string
  /** The company behind it (`CompanyData.name`). */
  company: string
  phones: readonly string[]
  email: string | null
  address: string | null
  /** „pn–pt 9:00–17:00”, from the salon's hours in the panel. */
  hours: readonly string[]
  /** Towns of `SiteSettings.biznes.serviceAreas`. */
  areas: readonly string[]
  /** Partners of the panel with a status (`getPartnerStatuses`), with or without products. */
  statuses: readonly { name: string; status: Partner['partnerStatus'] }[]
  /** Brand links as on the site map (`brandLinks`): one per salon 2.0, then brand pages. */
  brands: readonly { name: string; slug: string }[]
  groups: readonly { name: string; categories: readonly { name: string; slug: string }[] }[]
  industries: readonly { name: string; slug: string }[]
  /** Published pages but home (`/opieka-it`, `/gopos`, `/o-firmie`, …). */
  pages: readonly { title: string; slug: string }[]
}

/**
 * Statuses in the words of K4-FINAL §1, all from the panel: the footer's badges (authorized
 * service and partner) plus Optivendi „Partner” and COMEX „We współpracy”.
 */
function statusLines(brands: BiznesLlmsInput['statuses']): string[] {
  const named = (status: Partner['partnerStatus']) =>
    brands
      .filter((brand) => brand.status === status)
      .sort((a, b) => k4Rank(a.name) - k4Rank(b.name))
      .map((brand) => brand.name)
  const partners = named('partner')
  const cooperation = named('cooperation')
  return [
    ...partnerBadges([...brands]).map((badge) => badge.label),
    ...(partners.length ? [`Partner ${joinNames(partners)}`] : []),
    ...(cooperation.length ? [`We współpracy z ${joinNames(cooperation)}`] : []),
  ]
}

/**
 * `llms.txt` of the Biznes site (llmstxt.org; SEO lokalne 13.11): who we are, what we sell and do,
 * where, how to reach us and the main pages — a plain summary AI assistants read before they
 * recommend a company. Only facts the site already shows: no prices (K4-FINAL §1), statuses and
 * contact from the panel, the founding year of `FOUNDED` (footer, „O firmie”).
 */
export function biznesLlmsTxt(input: BiznesLlmsInput): string {
  const url = (path: string) => `${input.origin}${path}`
  const statuses = statusLines(input.statuses)
  const lines = [
    `# ${input.name}`,
    '',
    `> Kasy fiskalne, drukarki fiskalne, terminale płatnicze, stanowiska POS, komputery i laptopy, drukarki i urządzenia wielofunkcyjne, sieci i Wi-Fi, programy InsERT i GoPOS, Microsoft 365, KSeF i opieka IT dla firm z Rabki-Zdroju, Podhala i Małopolski. Dobór, wdrożenie i serwis z jednego salonu w Rabce-Zdroju (${input.company}, od ${FOUNDED.year} roku).`,
    '',
    '- Wycena na piśmie, po rozmowie o potrzebach firmy; strona nie podaje cen.',
    ...statuses.map((status) => `- ${status}.`),
    ...(input.areas.length
      ? [`- Obszar: ${input.areas.join(', ')} — całe Podhale i Małopolska.`]
      : ['- Obszar: Podhale i Małopolska.']),
    ...(input.address ? [`- Salon: ${input.address}.`] : []),
    ...(input.hours.length ? [`- Godziny: ${input.hours.join('; ')}.`] : []),
    ...(input.phones.length ? [`- Telefon: ${input.phones.join(', ')}`] : []),
    ...(input.email ? [`- E-mail: ${input.email}`] : []),
    '',
    '## Oferta',
    '',
    ...input.groups.flatMap((group) => [
      `### ${group.name}`,
      '',
      ...group.categories.map(
        (category) => `- [${category.name}](${url(categoryHref(category.slug))})`,
      ),
      '',
    ]),
    ...(input.brands.length
      ? [
          '## Marki',
          '',
          ...input.brands.map((brand) => `- [${brand.name}](${url(`/marki/${brand.slug}`)})`),
          '',
        ]
      : []),
    ...(input.industries.length
      ? [
          '## Branże',
          '',
          ...input.industries.map(
            (industry) => `- [${industry.name}](${url(`/branze/${industry.slug}`)})`,
          ),
          '',
        ]
      : []),
    '## Strony',
    '',
    `- [Cała oferta](${url('/oferta')})`,
    ...input.pages.map((page) => `- [${page.title}](${url(`/${page.slug}`)})`),
    '',
  ]
  return lines.join('\n')
}
