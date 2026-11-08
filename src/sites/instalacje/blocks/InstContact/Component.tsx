import { headers } from 'next/headers'
import { connection } from 'next/server'

import { ContactPage } from '@/components/shared/ContactPage'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { siteOrigin } from '@/lib/seo/origin'
import { getSharedData } from '@/lib/shared/getSharedData'
import type { InstContactBlock as InstContactBlockData } from '@/payload-types'

import { otherSalons } from '../../powloka/salons'
import { OtherSalons } from '../../sekcje/OtherSalons'

type Props = { block: InstContactBlockData; tenantId: number }

/**
 * `/kontakt` of Instalacje (L2-I) = the shared Kontakt template (spec §6.1) on the line's
 * `shared.contact`: „Zaplanuj instalację”, „Zgłoś awarię” and „Dla architektów” as the routes,
 * the shared form, the service zones map and FAQ. Own section: the second salon in `heroAside`,
 * only when published. No CTA band — the template ends with FAQ (decision D5, 06.11). The block's
 * hero and band fields from the panel are no longer read (removing them = a migration, later).
 */
export async function InstContactBlock({ tenantId }: Props) {
  // The form token carries the render time (minimum fill time), so never from a cache.
  await connection()
  const env = getEnv()
  const [shared, host] = await Promise.all([
    getSharedData(tenantId),
    headers().then((h) => h.get('host')),
  ])
  // Without the shared data (fresh database before `pnpm seed`) there is nothing to show.
  if (!shared) return null
  const extra = otherSalons(shared.salons, shared.line.contact?.salonKeys)
  return (
    <ContactPage
      shared={shared}
      line="instalacje"
      origin={siteOrigin(host, env.SITE_ENV) ?? ''}
      now={new Date().toISOString()}
      formToken={issueFormToken(env.PAYLOAD_SECRET)}
      slots={{
        heroAside: <OtherSalons salons={extra} company={shared.company.name} />,
      }}
    />
  )
}
