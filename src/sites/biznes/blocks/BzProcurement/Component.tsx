import type { CSSProperties } from 'react'

import { Container } from '@/components/ui/Container'
import { getSectionImages } from '@/lib/biznes/pages/images'
import { buildProcurementHome, type HomePage } from '@/lib/biznes/procurement/home'
import { procurementPageSchema } from '@/lib/biznes/procurement/schema'
import { SUPPLY_PAGES, type SupplyPage } from '@/lib/catalog/menu'
import { log } from '@/lib/log'
import { getPublishedPage } from '@/lib/pages/data'
import type { BzProcurementBlock as BlockData } from '@/payload-types'
import { ProcurementCalc } from '@/sites/biznes/components/home/HomeIslands'
import { SplitHead } from '@/sites/biznes/components/home/SplitHead'
import { ProcIcon } from '@/sites/biznes/components/procurement/icons'
import { ProcImage } from '@/sites/biznes/components/procurement/parts'
import { SceneParallax } from '@/sites/biznes/components/procurement/ProcurementIslands'

type Props = { block: BlockData; tenantId: number }

/** What the card needs from a published procurement page: its configurator and §0 flag. */
async function homePage(tenantId: number, slug: SupplyPage): Promise<HomePage | null> {
  const page = await getPublishedPage(tenantId, slug)
  const block = page?.layout?.find((item) => item.blockType === 'bzProcurementPage')
  if (block?.blockType !== 'bzProcurementPage') return null
  const result = procurementPageSchema.safeParse(block.data ?? null)
  if (!result.success || result.data.variant !== block.variant) return null
  const { unit, types } = result.data.configurator
  return { pickup: Boolean(block.oldEquipmentPickup), unit, types }
}

/**
 * „Zaopatrzenie firm” on the home page (ZAOPATRZENIE §8): two navy cards with a packshot scene
 * and a mini calculator leading to the procurement pages, then the bar of benefits. A card shows
 * only while its page is published; nothing renders (with a log line) when no card is left.
 */
export async function BzProcurementBlock({ block, tenantId }: Props) {
  const found = await Promise.all(SUPPLY_PAGES.map((slug) => homePage(tenantId, slug)))
  const pages: Partial<Record<SupplyPage, HomePage>> = {}
  SUPPLY_PAGES.forEach((slug, i) => {
    const page = found[i]
    if (page) pages[slug] = page
  })
  const home = buildProcurementHome(block.data, {
    pages,
    // Plan 0611 §7.1 (audit P1.6): on the home page the call-back promise shows only in the
    // hero, the commitments and the form — not in this section's benefits.
    callback: null,
  })
  if (!home) {
    log.warn(
      { tenant: tenantId, block: block.id, pages: Object.keys(pages) },
      'Home procurement section has nothing to show',
    )
    return null
  }
  const images = await getSectionImages(
    tenantId,
    home.cards.flatMap((card) => card.scene.flatMap((item) => item.image ?? [])),
  )

  return (
    <section
      id="zaopatrzenie"
      aria-labelledby="zaopatrzenie-h"
      className="zh scroll-mt-24 py-6 md:py-20"
    >
      <Container wide>
        <SplitHead
          id="zaopatrzenie-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
        />
        <div className="zh-grid" data-reveal-cards="">
          {home.cards.map((card) => (
            <article
              key={card.page}
              className="zh-card"
              data-surface="dark"
              data-variant={card.page === 'dostawy-it-dla-firm' ? 'it' : 'agd'}
            >
              <div>
                <span className="zh-badge">
                  <i aria-hidden="true" />
                  {card.badge}
                </span>
                <h3>
                  {card.title}
                  {card.titleAccent && <em> {card.titleAccent}</em>}
                </h3>
                <p className="zh-text">{card.text}</p>
              </div>
              <div className="zh-scene" aria-hidden="true">
                <div className="zh-floor" />
                <SceneParallax />
                {card.scene.map((item, i) => {
                  const { z, ...edges } = item.box
                  return (
                    <div
                      key={i}
                      className="zh-shot"
                      style={{ ...edges, '--z': z ?? 10 } as CSSProperties}
                    >
                      <ProcImage id={item.image} images={images} decorative />
                    </div>
                  )
                })}
              </div>
              <div className="zh-bottom">
                {card.pills.length > 0 && (
                  <ul className="zh-pills">
                    {card.pills.map((pill) => (
                      <li key={pill}>
                        <ProcIcon name="check" />
                        {pill}
                      </li>
                    ))}
                  </ul>
                )}
                <ProcurementCalc
                  page={card.page}
                  types={card.types}
                  count={card.count}
                  unit={card.unit}
                  cta={card.cta}
                  note={card.note}
                />
              </div>
            </article>
          ))}
        </div>
        {home.benefits.length > 0 && (
          <ul className="zh-benefits" style={{ '--zh-n': home.benefits.length } as CSSProperties}>
            {home.benefits.map((benefit) => (
              <li key={benefit.title}>
                <span className="zh-ico" aria-hidden="true">
                  <ProcIcon name={benefit.icon} />
                </span>
                <span>
                  <b>{benefit.title}</b>
                  {benefit.text && <span>{benefit.text}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  )
}
