import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getCatalogIndex } from '@/lib/catalog/data'
import { groupSummaries } from '@/lib/catalog/groups'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { BzHeroBlock as BzHeroBlockData } from '@/payload-types'

import { DepartmentWheel } from './DepartmentWheel'

type Props = { block: BzHeroBlockData; isFirst: boolean; tenantId: number }

/**
 * Hero of the Biznes home page (spec. §4 pkt 1, ZMIANY-v20 §2.1): H1 with a plain accent part
 * (no gradient, no glows — ADR-013), the wizard CTA, the line's phone, the callback promise and
 * the trust points; on the right the department wheel from the catalog.
 */
export async function BzHeroBlock({ block, isFirst, tenantId }: Props) {
  const [index, settings] = await Promise.all([
    getCatalogIndex(tenantId),
    getSiteSettings(tenantId),
  ])
  const groups = groupSummaries(index, { thumbs: 3 })
  const phone = block.showPhone ? (settings?.phone ?? null) : null
  const tel = phone ? toTelHref(phone) : null
  const callback = settings?.biznes?.promises.callbackTime
  const trust = [
    ...(settings?.biznes?.trustLine
      ? [{ id: 'trust-line', icon: 'shield' as const, text: settings.biznes.trustLine }]
      : []),
    ...(block.trustItems ?? []),
  ]
  const Title = isFirst ? 'h1' : 'h2'

  return (
    <section id="start" className="relative overflow-hidden pt-6 pb-20 sm:pt-10 sm:pb-24">
      <Container
        wide
        className="relative grid items-center gap-7 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]"
      >
        <div className="flex flex-col gap-6">
          {block.pill && (
            <p className="inline-flex items-center gap-2 self-start text-sm font-bold text-ink-2">
              <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
              {block.pill}
            </p>
          )}
          <Title className="font-display text-[clamp(2.5rem,4.3vw,4rem)] leading-[0.98] font-extrabold tracking-[-0.025em] font-stretch-112%">
            {block.heading}
            {block.headingAccent && (
              <>
                {' '}
                <span className="text-h1-accent">{block.headingAccent}</span>
              </>
            )}
          </Title>
          {block.lead && (
            <p className="max-w-[52ch] text-[clamp(1.0625rem,1.35vw,1.22rem)] leading-relaxed text-ink-2">
              {block.lead}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <a
              href={block.cta.href}
              className="inline-flex min-h-14 items-center gap-3 rounded-2xl bg-accent-text py-2.5 pr-6 pl-3 font-bold text-accent-ink transition-colors hover:bg-ink hover:text-surface"
            >
              <span
                aria-hidden="true"
                className="flex size-[34px] items-center justify-center rounded-[10px] bg-white/20"
              >
                <Icon name="clock" strokeWidth={2.2} />
              </span>
              {block.cta.label}
              <Icon name="arrow" strokeWidth={2.4} className="size-[18px]" />
            </a>
            {phone && tel && (
              <a
                href={tel}
                className="inline-flex min-h-14 items-center gap-2.5 rounded-2xl bg-card px-6 font-bold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] transition-colors hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]"
              >
                <Icon name="phone" className="size-[18px]" />
                {phone}
              </a>
            )}
          </div>
          {callback && (
            <p className="-mt-1 inline-flex items-center gap-2.5 text-[14.5px] font-bold text-ink-2">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-ok" />
              {/* The panel field is short („Oddzwaniamy w ciągu 60 minut”), as in HowInquiryWorks. */}
              {callback} w godzinach pracy
            </p>
          )}
          {trust.length > 0 && (
            <ul className="flex flex-wrap gap-x-5.5 gap-y-2.5 pt-1.5">
              {trust.map((item, i) => (
                <li
                  key={item.id ?? i}
                  className="flex items-center gap-2.5 text-sm font-bold text-ink-2"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-[34px] items-center justify-center rounded-[11px] bg-card text-accent-text shadow-[inset_0_0_0_1px_var(--border)]"
                  >
                    <Icon name={item.icon} className="size-[18px]" />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {groups.length > 0 && (
          <div className="flex flex-col items-center gap-2.5">
            <DepartmentWheel
              groups={groups.map(({ slug, name, icon, count, description, thumbs }) => ({
                slug,
                name,
                icon,
                count,
                description,
                thumbs,
              }))}
              total={index.products.length}
              phone={settings?.phone ?? null}
            />
            {(block.wheelHint || block.planLinkLabel) && (
              <p className="flex flex-wrap justify-center gap-2 text-center text-[13.5px] text-ink-3">
                {block.wheelHint && <span>{block.wheelHint}</span>}
                {block.wheelHint && block.planLinkLabel && <span aria-hidden="true">·</span>}
                {block.planLinkLabel && (
                  <a href="#plan" className="font-extrabold text-accent-text hover:underline">
                    {block.planLinkLabel}
                  </a>
                )}
              </p>
            )}
          </div>
        )}
      </Container>
    </section>
  )
}
