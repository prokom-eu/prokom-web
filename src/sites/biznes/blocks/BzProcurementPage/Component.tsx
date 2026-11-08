import type { BzProcurementPageBlock as BlockData } from '@/payload-types'
import { parseProcurementPage } from '@/lib/biznes/procurement/schema'
import { getSiteSettings } from '@/lib/site/data'

type Props = { block: BlockData; tenantId: number }

/**
 * „Zaopatrzenie firm” page (BIZ-2, ZAOPATRZENIE §2). The §0 texts show only with the boss's
 * panel entry; data that does not match the schema renders nothing (the page title stays).
 */
export async function BzProcurementPageBlock({ block, tenantId }: Props) {
  const settings = await getSiteSettings(tenantId)
  const data = parseProcurementPage(block.data, {
    pickup: Boolean(block.oldEquipmentPickup),
    warranty: Boolean(block.onsiteWarranty),
    lg: Boolean(block.showLG),
    callback: Boolean(settings?.biznes?.promises.callbackTime?.trim()),
  })
  if (!data) return null
  // The full template (sections 1–18) comes in B2-1b; until then the hero text only.
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1200px] px-4">
        <h1 className="text-4xl font-bold">
          {data.hero.heading} {data.hero.headingAccent}
        </h1>
        <p className="mt-4 max-w-2xl">{data.hero.lead}</p>
      </div>
    </section>
  )
}
