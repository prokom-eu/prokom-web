import { headers } from 'next/headers'

import { AboutPage } from '@/components/shared/AboutPage'
import type { AuthLogo } from '@/components/shared/CompanyCard'
import { aboutBrands } from '@/lib/biznes/aboutBrands'
import { getCatalogIndex } from '@/lib/catalog/data'
import { getEnv } from '@/lib/env'
import { partnerStatusLabel } from '@/lib/partners/badges'
import { siteOrigin } from '@/lib/seo/origin'
import { getSharedData } from '@/lib/shared/getSharedData'

import { AboutBrands } from '../../components/about/AboutBrands'
import { TalkBand } from '../../components/about/TalkBand'

type Props = { tenantId: number }

/** The four authorisations of the company card, in this order (K4-FINAL §1). */
const AUTHORISED = ['posnet', 'elzab', 'gopos', 'insert']

/**
 * `/o-firmie` of Biznes (plan 0611 §8.2, Web-o-firmie) = the shared O firmie template on
 * `shared.about`, with the logos of the four authorisations (Posnet, Elzab — serwis; GoPOS, InsERT
 * — partner) in the company card, the brands section after the rules (`AboutBrands`), the talk
 * band before the visit (`TalkBand`); a „Sprawdź nas” card without a link stays hidden, the
 * numbers count up in view. The footer's lines band is hidden here (`biznes.css`) — the page
 * already has its own lines section.
 */
export async function BzAboutPageBlock({ tenantId }: Props) {
  const env = getEnv()
  const [shared, index, host] = await Promise.all([
    getSharedData(tenantId),
    getCatalogIndex(tenantId),
    headers().then((h) => h.get('host')),
  ])
  if (!shared) return null
  const authLogos = AUTHORISED.flatMap((slug): AuthLogo[] => {
    const brand = index.brands.find((item) => item.slug === slug)
    const status = partnerStatusLabel(brand?.status)
    return brand?.logo && status?.startsWith('Autoryzowany')
      ? [{ name: brand.name, status, logo: brand.logo }]
      : []
  })
  const brands = aboutBrands(index.brands)
  return (
    <AboutPage
      shared={shared}
      line="biznes"
      origin={siteOrigin(host, env.SITE_ENV) ?? ''}
      siteEnv={env.SITE_ENV}
      authLogos={authLogos}
      verifyLinkedOnly
      countStats
      slots={{
        afterRules: <AboutBrands rows={brands.rows} others={brands.others} />,
        beforeVisit: <TalkBand phone={shared.line.phone} />,
      }}
    />
  )
}
