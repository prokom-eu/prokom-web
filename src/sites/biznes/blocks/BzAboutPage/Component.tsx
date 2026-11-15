import { headers } from 'next/headers'

import { brandTarget } from '@/lib/catalog/brand'
import { aboutBrands } from '@/lib/biznes/aboutBrands'
import { getCatalogIndex } from '@/lib/catalog/data'
import { brandCount } from '@/lib/catalog/filters'
import { getEnv } from '@/lib/env'
import { K4_ORDER, partnerStatusLabel } from '@/lib/partners/badges'
import { siteOrigin } from '@/lib/seo/origin'
import { getSharedData } from '@/lib/shared/getSharedData'

import { type AboutAuth, BzAboutView } from '../../components/about/BzAboutView'

type Props = { tenantId: number }

/** Brands that lead the wall of the other brands (formerly with their badge, §1 „/marki”). */
const WALL_LEAD = ['optivendi', 'comex']

/**
 * One sentence on each authorisation (board `OFirmie.dc.html`) — the facts the site already says
 * on the brands' pages, no new promise. TODO(krystian): potwierdzić zdania (PRZEKAZANIE §7 pkt 3).
 */
const AUTH_TEXT: Record<string, string> = {
  posnet: 'Sprzedaż, fiskalizacja, przeglądy i naprawy kas Posnet.',
  elzab: 'Kasy i drukarki fiskalne Elzab — od doboru po serwis.',
  gopos: 'System sprzedaży dla gastronomii i handlu, wdrożenie na miejscu.',
  insert: 'Subiekt nexo i programy InsERT — instalacja i szkolenie.',
}

/**
 * `/o-firmie` of Biznes (runda 1411 R6, board `OFirmie.dc.html`): its own layout (`BzAboutView`)
 * on the shared data — the company card with both numbers and the four authorisations (Posnet,
 * Elzab — serwis; GoPOS, InsERT — partner, from `Partners`), the brands with Optivendi and COMEX
 * in the wall of the others, no CEIDG and no „Sprawdź nas”. The shared O firmie template stays
 * as it is for the other lines.
 */
export async function BzAboutPageBlock({ tenantId }: Props) {
  const env = getEnv()
  const [shared, index, host] = await Promise.all([
    getSharedData(tenantId),
    getCatalogIndex(tenantId),
    headers().then((h) => h.get('host')),
  ])
  if (!shared) return null
  // The four authorisations, in the order of K4-FINAL §1.
  const auth = K4_ORDER.flatMap((slug): AboutAuth[] => {
    const brand = index.brands.find((item) => item.slug === slug)
    const status = partnerStatusLabel(brand?.status)
    const authorized =
      brand?.status === 'authorized-service' || brand?.status === 'authorized-partner'
    return brand?.logo && authorized && status
      ? [
          {
            slug,
            name: brand.name,
            status,
            logo: brand.logo,
            text: AUTH_TEXT[slug] ?? '',
            href: brandTarget(brand),
          },
        ]
      : []
  })
  const { others } = aboutBrands(index.brands)
  // Optivendi and COMEX lead the wall, without the „Partner” / „We współpracy” badges (decision
  // of Krystian 15.11); the rest by name.
  const lead = (slug: string) =>
    WALL_LEAD.includes(slug) ? WALL_LEAD.indexOf(slug) : WALL_LEAD.length
  const wall = [...others].sort((a, b) => lead(a.slug) - lead(b.slug))
  return (
    <BzAboutView
      shared={shared}
      origin={siteOrigin(host, env.SITE_ENV) ?? ''}
      now={new Date().toISOString()}
      siteEnv={env.SITE_ENV}
      auth={auth}
      others={wall}
      brandTotal={brandCount(index)}
    />
  )
}
