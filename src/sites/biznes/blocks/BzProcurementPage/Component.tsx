import { headers } from 'next/headers'
import { pruneDeadLinks } from '@/lib/biznes/procurement/deadLinks'
import { connection } from 'next/server'

import { getSectionImages } from '@/lib/biznes/pages/images'
import {
  parseProcurementPage,
  validateProcurementPage,
  type ProcurementPageData,
} from '@/lib/biznes/procurement/schema'
import { brandTarget } from '@/lib/catalog/brand'
import { getCatalogIndex } from '@/lib/catalog/data'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { log } from '@/lib/log'
import { siteOrigin } from '@/lib/seo/origin'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary } from '@/lib/site/hoursSummary'
import type { BzProcurementPageBlock as BlockData } from '@/payload-types'
import {
  ProcurementPage,
  type ProcurementContext,
} from '@/sites/biznes/components/procurement/ProcurementPage'

type Props = { block: BlockData; tenantId: number; path: string }

/** Media ids the template shows. */
function imageIds(data: ProcurementPageData): number[] {
  const ids = [
    ...data.hero.scene.map((item) => item.image),
    ...data.configurator.types.flatMap((type) => type.items.map((item) => item.image)),
    ...(data.who?.tabs.flatMap((tab) => tab.images) ?? []),
    ...(data.categories?.list.map((item) => item.image) ?? []),
    ...(data.combo?.list.map((item) => item.image) ?? []),
    ...data.brands.list.map((item) => item.image),
    ...(data.programs?.list.map((item) => item.image) ?? []),
    ...(data.cross?.images ?? []),
  ]
  return ids.filter((id): id is number => typeof id === 'number')
}

/**
 * „Zaopatrzenie firm” page (BIZ-2, ZAOPATRZENIE §2). The §0 texts show only with the boss's
 * panel entry; data that does not match the schema (or another variant) renders nothing and
 * leaves a log line, so the page keeps its title as the H1.
 */
export async function BzProcurementPageBlock({ block, tenantId, path }: Props) {
  // The form's time token is issued per request (spam protection), as on `/kontakt`.
  await connection()
  const [settings, company, index, host] = await Promise.all([
    getSiteSettings(tenantId),
    getCompanyData(),
    getCatalogIndex(tenantId),
    headers().then((h) => h.get('host')),
  ])
  const data = parseProcurementPage(
    block.data,
    {
      pickup: Boolean(block.oldEquipmentPickup),
      warranty: Boolean(block.onsiteWarranty),
      lg: Boolean(block.showLG),
      services: (block.services?.length ?? 0) > 0,
      callback: settings?.biznes?.promises.callbackTime ?? null,
    },
    block.variant,
  )
  if (!data) {
    const issue = validateProcurementPage(block.data)
    log.warn(
      {
        tenant: tenantId,
        block: block.id,
        variant: block.variant,
        issue: issue === true ? 'variant mismatch' : issue,
      },
      'Procurement page data does not match',
    )
    return null
  }
  const images = await getSectionImages(tenantId, imageIds(data))
  const counts: Record<string, number> = {}
  for (const product of index.products) {
    for (const category of product.categories) counts[category] = (counts[category] ?? 0) + 1
  }
  const hours = hoursSummary(company?.locations[0]?.hours ?? [])
  const context: ProcurementContext = {
    path,
    origin: siteOrigin(host, getEnv().SITE_ENV) ?? '',
    phone: settings?.phone ?? null,
    email: settings?.email ?? null,
    hours: hours || null,
    provider: company?.name ?? 'PRO-KOM',
    images,
    resolveBrand: ({ name, partner, image }) => {
      const brand = partner ? index.brands.find((item) => item.slug === partner) : undefined
      if (brand) return { name, logo: brand.logo ?? null, href: brandTarget(brand) }
      const media = image ? images[image] : undefined
      return {
        name,
        logo: media ? { url: media.url, width: media.width, height: media.height } : null,
        href: null,
      }
    },
    categoryCounts: counts,
    crossPublished: Boolean(
      data.cross && index.pages.some((page) => page.slug === data.cross?.page),
    ),
    classHints: (block.classHints ?? []).map((hint) => hint.brands),
    services: (block.services ?? []).map(({ label, kind }) => ({ label, kind })),
    formToken: issueFormToken(getEnv().PAYLOAD_SECRET),
  }
  // Links to categories or industries this site does not have render as plain tiles (QA BIZ-3).
  const live = pruneDeadLinks(data, {
    categories: new Set(index.categories.map((category) => category.slug)),
    industries: new Set(index.industries.filter((item) => item.active).map((item) => item.slug)),
  })
  return <ProcurementPage data={live} context={context} />
}
