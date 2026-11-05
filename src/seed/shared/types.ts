import type { SiteSetting } from '../../payload-types'
import { COMPANY_NIP, SHARED_COMPANY } from './company'

/** The `shared` group of one line's `SiteSettings` (spec §4.2). */
export type SharedGroup = NonNullable<SiteSetting['shared']>

type Row<K extends keyof NonNullable<SharedGroup['contact']>> = NonNullable<
  NonNullable<SharedGroup['contact']>[K]
>

/**
 * The four contact questions of the template (spec §6.1 pkt 6). The board has no answers yet:
 * they wait for Krystian, so the marker keeps them off the pages until written in the panel.
 */
export const CONTACT_FAQ_TODO: Row<'faq'> = [
  'Gdzie zaparkować przy salonie?',
  'Czy przyjeżdżacie do klienta?',
  'Co przygotować przed rozmową?',
  'Czy mogę przyjść bez umawiania się?',
].map((question) => ({ question, answer: '[Krystian: odpowiedź do uzupełnienia]' }))

type Verify = NonNullable<NonNullable<SharedGroup['about']>['verify']>[number]

export const VERIFY_CEIDG: Verify = {
  title: 'CEIDG',
  text: `Dane firmy po numerze NIP ${COMPANY_NIP}.`,
  href: SHARED_COMPANY.ceidgUrl,
}

export const VERIFY_GOOGLE: Verify = {
  title: 'Opinie Google',
  text: 'Wizytówka PRO-KOM w Mapach Google.',
}
