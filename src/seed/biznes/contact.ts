import type { Payload } from 'payload'

import type { CompanyDatum } from '../../payload-types'
import { hasSameValues } from '../compare'
import { SEED_CONTEXT } from '../config'
import { SHARED_COMPANY } from '../shared/company'

export const CONTACT_SLUG = 'kontakt'

/**
 * Towns served — Krystian's decision of 14.11.2026: Rabka-Zdrój and around, Nowy Targ, Zakopane,
 * Kraków; the whole Podhale and Małopolska come as regions (`biznesAreaServed`, llms.txt).
 * Into `SiteSettings.biznes.serviceAreas` when empty or still the earlier default list.
 */
export const SERVICE_AREAS = ['Rabka-Zdrój', 'Nowy Targ', 'Zakopane', 'Kraków']

/** The list of the board the seed wrote before 14.11.2026 — replaced when nobody edited it. */
export const LEGACY_SERVICE_AREAS = [
  'Rabka-Zdrój',
  'Nowy Targ',
  'Zakopane',
  'Jordanów',
  'Mszana Dolna',
  'Limanowa',
  'Myślenice',
  'Nowy Sącz',
  'Szczawnica',
  'Kraków',
]

/** Areas to write: the confirmed list over an empty or untouched default one, else none. */
export function serviceAreasUpdate(current: readonly string[] | null | undefined): string[] | null {
  const list = current ?? []
  const untouched =
    list.length === LEGACY_SERVICE_AREAS.length &&
    list.every((town, index) => town === LEGACY_SERVICE_AREAS[index])
  return list.length === 0 || untouched ? [...SERVICE_AREAS] : null
}

/**
 * Contact data of prokombiznes.pl — Krystian's decision of 01.11.2026 (replaces K4-FINAL §1
 * contact and the old landline). Real data, also for local databases: the seed writes it to the
 * line's settings and the shared office to `CompanyData`. The inquiry inbox
 * (`Tenants.notificationEmail`) stays fake locally (`seed/tenants.ts`, Mailpit): the real address
 * is set in the panel only, so test inquiries never reach the customer box. The texts of the seed
 * that quote a number or address import it from here.
 */
export const BIZNES_CONTACT = {
  phone: '889 003 889',
  phoneHref: 'tel:+48889003889',
  phone2: '883 200 151',
  phone2Href: 'tel:+48883200151',
  email: 'kontakt@prokombiznes.pl',
  /** For sentences: „pn–pt 9:00–17:00”. */
  hoursText: 'pn–pt 9:00–17:00',
} as const

/**
 * The part of the shared `CompanyData` the Biznes seed keeps up to date: the company and its
 * one office (Rabka-Zdrój, Software v23 and Instalacje — one office, no salon in Zakopane).
 * Shared phones and e-mail stay as they are: Software and Instalacje show their own sample ones.
 */
export const BIZNES_COMPANY: Pick<CompanyDatum, 'name' | 'nip' | 'locations'> = {
  name: SHARED_COMPANY.name,
  nip: SHARED_COMPANY.nip,
  locations: SHARED_COMPANY.locations,
}

type Count = (name: string, result: boolean | 'updated') => void

/**
 * Writes the contact data to the Biznes settings and the shared company data — each record only
 * when a value differs, so a second run changes nothing.
 */
export async function upsertBiznesContact(
  payload: Payload,
  tenantId: number,
  count: Count,
): Promise<void> {
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const

  const {
    docs: [settings],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    ...local,
  })
  if (settings) {
    const data = {
      phone: BIZNES_CONTACT.phone,
      phone2: BIZNES_CONTACT.phone2,
      email: BIZNES_CONTACT.email,
    }
    const same = hasSameValues(settings, data)
    count('site-settings contact', same ? false : 'updated')
    if (!same) {
      await payload.update({
        collection: 'site-settings',
        id: settings.id,
        data,
        ...local,
      })
    }
  }

  const company = await payload.findGlobal({ slug: 'company-data', ...local })
  const companySame = hasSameValues(company, BIZNES_COMPANY)
  count('company-data office', companySame ? false : 'updated')
  if (!companySame) {
    await payload.updateGlobal({ slug: 'company-data', data: BIZNES_COMPANY, ...local })
  }
}
