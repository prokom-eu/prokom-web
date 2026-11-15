import type { SiteSetting } from '../../payload-types'
import { COMPANY_NIP, SHARED_COMPANY } from './company'

/** The `shared` group of one line's `SiteSettings` (spec §4.2). */
export type SharedGroup = NonNullable<SiteSetting['shared']>

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
