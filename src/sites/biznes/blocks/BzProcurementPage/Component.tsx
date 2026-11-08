import { Container } from '@/components/ui/Container'
import type { BzProcurementPageBlock as BlockData } from '@/payload-types'
import { parseProcurementPage, validateProcurementPage } from '@/lib/biznes/procurement/schema'
import { log } from '@/lib/log'
import { getSiteSettings } from '@/lib/site/data'

type Props = { block: BlockData; tenantId: number }

/**
 * „Zaopatrzenie firm” page (BIZ-2, ZAOPATRZENIE §2). The §0 texts show only with the boss's
 * panel entry; data that does not match the schema (or another variant) renders nothing and
 * leaves a log line, so the page keeps its title as the H1.
 */
export async function BzProcurementPageBlock({ block, tenantId }: Props) {
  const settings = await getSiteSettings(tenantId)
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
  // The full template (sections 1–18) comes in B2-1b; until then the hero text only.
  return (
    <section className="py-16">
      <Container>
        <h1 className="text-4xl font-bold">
          {data.hero.heading} {data.hero.headingAccent}
        </h1>
        <p className="mt-4 max-w-2xl">{data.hero.lead}</p>
      </Container>
    </section>
  )
}
