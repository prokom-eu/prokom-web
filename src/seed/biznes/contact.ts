import type { Payload } from 'payload'

import type { CompanyDatum } from '../../payload-types'
import { hasSameValues } from '../compare'
import { SEED_CONTEXT } from '../config'

export const CONTACT_SLUG = 'kontakt'

/**
 * Towns served, from the board (FAQ „Dojeżdżacie do mnie?” and the area diagram) — into
 * `SiteSettings.biznes.serviceAreas` when empty. TODO(krystian): [SZEF] potwierdzić listę.
 */
export const SERVICE_AREAS = [
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
  whatsapp: '889 003 889',
  /** For sentences: „pn–pt 9:00–17:00”. */
  hoursText: 'pn–pt 9:00–17:00',
} as const

/**
 * The part of the shared `CompanyData` the Biznes seed keeps up to date: the company and its
 * one office (Rabka-Zdrój, Software v23 and Instalacje — one office, no salon in Zakopane).
 * Shared phones and e-mail stay as they are: Software and Instalacje show their own sample ones.
 */
export const BIZNES_COMPANY: Pick<CompanyDatum, 'name' | 'nip' | 'locations'> = {
  name: 'PRO-KOM Tadeusz Wójciak',
  nip: '7352511447',
  locations: [
    {
      name: 'Rabka-Zdrój',
      street: 'ul. Orkana 16B',
      postalCode: '34-700',
      city: 'Rabka-Zdrój',
      // Saturday and Sunday closed: days without a row.
      hours: [{ days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' }],
    },
  ],
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
    const whatsappSame = settings.biznes?.whatsapp === BIZNES_CONTACT.whatsapp
    const same = hasSameValues(settings, data) && whatsappSame
    count('site-settings contact', same ? false : 'updated')
    if (!same) {
      await payload.update({
        collection: 'site-settings',
        id: settings.id,
        data: { ...data, biznes: { ...settings.biznes, whatsapp: BIZNES_CONTACT.whatsapp } },
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
