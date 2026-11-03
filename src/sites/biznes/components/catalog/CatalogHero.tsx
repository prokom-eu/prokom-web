import type { ReactNode } from 'react'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { phoneContactHref } from '@/lib/biznes/mobileNav'
import { BZ_LEAD } from '@/sites/biznes/typography'

import { Breadcrumbs, type Crumb } from '../Breadcrumbs'
import { PageLink } from '../PageLink'

type Props = {
  crumbs: Crumb[]
  /** Label with a green dot above the H1, e.g. „Kasy i sprzedaż · 11 modeli”. */
  pill: string
  title: string
  lead: string | null
  primary: { label: string; href: string }
  phone: { label: string; href: string } | null
  chips: string[]
  /** `dot`: white chips with an accent dot (board Kategoria); `plain`: grey chips (Branza). */
  chipStyle?: 'dot' | 'plain'
  /** Right column: the category stage or the industry picture. */
  visual?: ReactNode
}

/**
 * Hero of the catalog pages (boards Kategoria and Branza): breadcrumbs, the label with a dot,
 * H1, lead, the main button and the phone, chips; on the right a picture.
 */
export function CatalogHero({
  crumbs,
  pill,
  title,
  lead,
  primary,
  phone,
  chips,
  chipStyle = 'dot',
  visual,
}: Props) {
  return (
    <section className="relative overflow-hidden pt-6 pb-14 max-md:pt-4 max-md:pb-6 min-[768px]:pt-8 min-[768px]:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_90%_10%,var(--glow),transparent_60%)]"
      />
      <Container wide className="relative">
        {/* Phone (App-Branza): no breadcrumbs, the top bar names the industry. */}
        <div className="max-md:hidden">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="mt-6 grid items-center gap-10 max-md:mt-0 max-md:gap-4 min-[1080px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 max-md:gap-3.5">
            <p className="inline-flex items-center gap-2.5 self-start text-[15px] font-bold text-ink max-md:text-[13px]">
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full bg-ok shadow-[0_0_0_4px_color-mix(in_srgb,var(--ok)_25%,transparent)]"
              />
              {pill}
            </p>
            <h1 className="font-display text-[clamp(2.3rem,4.4vw,4rem)] leading-[1] font-extrabold tracking-[-0.025em] font-stretch-112% max-md:text-[30px] max-md:leading-[1.05]">
              {title}
            </h1>
            {lead && (
              <p
                className={`${BZ_LEAD} max-w-[54ch] text-ink-2 max-md:text-[14.5px] max-md:leading-relaxed`}
              >
                {lead}
              </p>
            )}
            <div className="flex flex-wrap gap-3 max-md:gap-2">
              {/* A call to the contact section: on a phone that section is not shown. */}
              <span className="contents md:hidden">
                <PageLink href={phoneContactHref(primary.href)} arrow>
                  {primary.label}
                </PageLink>
              </span>
              <span className="contents max-md:hidden">
                <PageLink href={primary.href} arrow>
                  {primary.label}
                </PageLink>
              </span>
              {phone && (
                <PageLink href={phone.href} kind="outline" className="max-md:hidden">
                  Zadzwoń: {phone.label}
                </PageLink>
              )}
            </div>
            {chips.length > 0 && (
              <ul className="flex flex-wrap gap-2.5 max-md:gap-1.5">
                {chips.map((item, position) => (
                  <li
                    key={position}
                    className={cx(
                      'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold max-md:rounded-full max-md:px-3 max-md:py-1.5 max-md:text-xs',
                      chipStyle === 'dot'
                        ? 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)]'
                        : 'bg-surface-2 text-ink-2',
                    )}
                  >
                    {chipStyle === 'dot' && (
                      <span aria-hidden="true" className="size-2 rounded-full bg-accent-text" />
                    )}
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {visual}
        </div>
      </Container>
    </section>
  )
}
