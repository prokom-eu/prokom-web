import Link from 'next/link'

import { OFFER_GROUPS, offerGroup } from '@/lib/software/catalog'
import { getOfferViews, getPricingSource, getSolutionsIndex } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import { solutionCard } from '@/lib/software/priceCards'
import { findLevelSolution, levelAccusative, levelPlans } from '@/lib/software/pricing'
import type { SwPricingBlock as SwPricingData } from '@/payload-types'
import { PriceGrid } from '@/sites/software/components/catalog/PriceGridLazy'
import { LevelCards } from '@/sites/software/components/pricing/LevelCards'
import { softwareTextContext } from '@/sites/software/components/textContext'
import { PageHero } from '@/sites/software/components/ui/PageHero'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'

type Props = { block: SwPricingData; tenantId: number; isFirst: boolean }

type LinkField = { label?: string | null; href?: string | null } | null | undefined
const linkOf = (link: LinkField) =>
  link?.label && link.href ? { label: link.label, href: link.href } : null

const GROUP_SHORT = new Map(OFFER_GROUPS.map(({ value, short }) => [value, short]))

/**
 * `/cennik` of the Software line (ZMIANY-v24 §6.3): the subpage hero, every published solution as
 * a price card (the four offer groups as filters, a card opens the offer window), the care levels
 * and the audit kinds; the FAQ is the next block. Everything with a price comes from the tenant's
 * published `Solutions`. A hero block (`HERO_BLOCKS`): it carries the page's H1.
 */
export async function SwPricingBlock({ block, tenantId }: Props) {
  const [{ solutions, display }, index, offers, context] = await Promise.all([
    getPricingSource(tenantId),
    getSolutionsIndex(tenantId),
    getOfferViews(tenantId),
    softwareTextContext(tenantId),
  ])
  const fill = (text: string | null | undefined) => (text ? fillText(text, context) : null)
  const title = fill(block.title)
  if (!title) return null

  // Group by group as on the board; the index keeps the catalog order within a group.
  const cards = OFFER_GROUPS.flatMap(({ value }) =>
    index.solutions
      .filter((solution) => offerGroup(solution) === value)
      .map((solution) => solutionCard(solution, display, GROUP_SHORT.get(value) ?? '')),
  )

  const care = findLevelSolution(solutions, 'care')
  const audit = findLevelSolution(solutions, 'audit')
  const carePlans = care && block.careTitle ? levelPlans(care) : []
  const auditPlans = audit && block.auditTitle ? levelPlans(audit) : []
  const auditLink =
    block.auditButton && block.auditHref
      ? { label: block.auditButton, href: block.auditHref }
      : null
  const buttons = [linkOf(block.primary), linkOf(block.secondary)]

  return (
    <>
      <PageHero
        crumb="Cennik"
        eyebrow={fill(block.eyebrow) ?? ''}
        title={title}
        em={block.titleAccent}
        lead={block.lead ? fill(block.lead.replaceAll('{liczba}', String(cards.length))) : null}
      >
        {buttons.some(Boolean) ? (
          <div className="mt-7 flex flex-col gap-2.5 min-[641px]:flex-row">
            {buttons.map((link, i) =>
              link ? (
                <Link
                  key={link.href}
                  href={link.href}
                  data-motion={i === 0 ? 'button' : 'button-outline'}
                  className={
                    i === 0
                      ? 'inline-flex min-h-13 items-center justify-center rounded-full bg-button px-6 font-extrabold text-accent-ink'
                      : 'inline-flex min-h-13 items-center justify-center rounded-full border border-border bg-card px-6 font-extrabold'
                  }
                >
                  {link.label}
                </Link>
              ) : null,
            )}
          </div>
        ) : null}
      </PageHero>

      {cards.length > 0 ? (
        <section aria-labelledby="cennik-h" className="v-sec v-sec-first">
          <div className="v-wrap">
            <h2 id="cennik-h" className="sr-only">
              Cennik rozwiązań
            </h2>
            <PriceGrid cards={cards} offers={offers} label="Grupy cennika" />
          </div>
        </section>
      ) : null}

      {carePlans.length > 0 && block.careTitle ? (
        <section id="opieka" aria-labelledby="opieka-h" className="v-sec">
          <div className="v-wrap flex flex-col gap-10">
            <SectionHead
              id="opieka-h"
              width="max-w-[1000px]"
              eyebrow={block.careEyebrow ?? ''}
              title={block.careTitle}
              lead={fill(block.careLead)}
            />
            <LevelCards
              plans={carePlans}
              note={block.careNote}
              button={(plan) =>
                plan.href
                  ? {
                      label: `${block.careButton ?? 'Zapytaj o opiekę'} ${levelAccusative(plan.name)} →`,
                      href: plan.href,
                    }
                  : null
              }
            />
          </div>
        </section>
      ) : null}

      {auditPlans.length > 0 && block.auditTitle ? (
        <section id="audyt" aria-labelledby="audyt-h" className="v-sec">
          <div className="v-wrap flex flex-col gap-10">
            <SectionHead
              id="audyt-h"
              width="max-w-[1000px]"
              eyebrow={block.auditEyebrow ?? ''}
              title={block.auditTitle}
              lead={fill(block.auditLead)}
            />
            <LevelCards plans={auditPlans} button={() => auditLink} />
          </div>
        </section>
      ) : null}
    </>
  )
}
