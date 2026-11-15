import { headers } from 'next/headers'

import { AboutPage } from '@/components/shared/AboutPage'
import { getEnv } from '@/lib/env'
import { siteOrigin } from '@/lib/seo/origin'
import { getSharedData } from '@/lib/shared/getSharedData'
import type { InstAboutBlock as InstAboutBlockData } from '@/payload-types'

import { otherSalons } from '../../powloka/salons'
import { OtherSalons } from '../../sekcje/OtherSalons'

type Props = { block: InstAboutBlockData; tenantId: number }

/**
 * `/o-firmie` of Instalacje (L2-I) = the shared O firmie template (spec §6.2) on the line's
 * `shared.about` — „Ponad 20 lat na Podhalu” is a stat of the panel (since 2004, the only
 * confirmed date; no history axis), no people and no hero map. Own section: the second salon in
 * `beforeVisit`, only when published. The block's hero and band fields are no longer read.
 */
export async function InstAboutBlock({ tenantId }: Props) {
  const env = getEnv()
  const [shared, host] = await Promise.all([
    getSharedData(tenantId),
    headers().then((h) => h.get('host')),
  ])
  if (!shared) return null
  const extra = otherSalons(shared.salons, shared.line.contact?.salonKeys)
  return (
    <AboutPage
      shared={shared}
      line="instalacje"
      origin={siteOrigin(host, env.SITE_ENV) ?? ''}
      siteEnv={env.SITE_ENV}
      slots={{
        beforeVisit: extra.length ? (
          <div className="mx-auto max-w-[1344px] px-5 min-[768px]:px-8">
            <OtherSalons salons={extra} company={shared.company.name} />
          </div>
        ) : null,
      }}
    />
  )
}
