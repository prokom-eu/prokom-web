import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { isIconName } from '@/lib/catalog/options'
import { lineCards } from '@/lib/software/aboutBlocks'
import { fillText } from '@/lib/software/facts'
import type { SwLinesBlock as SwLinesBlockData } from '@/payload-types'
import { SectionHead } from '@/sites/software/components/home/SectionHead'
import { softwareTextContext } from '@/sites/software/components/textContext'

type Props = { block: SwLinesBlockData; tenantId: number }

function LineIcon({ name, className }: { name?: string | null; className?: string }) {
  if (!name || !isIconName(name)) return null
  return <Icon name={name} className={className} />
}

/**
 * The PRO-KOM lines on a Software subpage (board `Wszystko`): „Każda robi swoje…” — 5 cards in
 * a row from 1081 px (this site's card outlined, links only to sites that exist) — or „Dwa
 * przykłady z Podhala.” — per client what each line did.
 */
export async function SwLinesBlock({ block, tenantId }: Props) {
  const context = await softwareTextContext(tenantId)
  const fill = (value: string | null | undefined) => fillText(value ?? undefined, context)
  const head = (
    <SectionHead eyebrow={block.eyebrow ?? ''} title={block.heading} lead={fill(block.lead)} />
  )

  if (block.variant === 'examples') {
    const examples = block.examples ?? []
    if (examples.length === 0) return null
    return (
      <section className="py-12 min-[641px]:py-20">
        <Container wide>
          {head}
          <div className="mt-6 flex flex-col gap-3">
            {examples.map((example) => (
              <article
                key={example.id ?? example.title}
                className="grid gap-5 rounded-[26px] border border-border bg-card p-[18px] shadow-raised min-[641px]:p-8 min-[1081px]:grid-cols-[minmax(0,400px)_minmax(0,1fr)] min-[1081px]:gap-10"
              >
                <div>
                  {example.eyebrow ? (
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text">
                      {example.eyebrow}
                    </p>
                  ) : null}
                  <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight min-[641px]:text-[30px]">
                    {example.title}
                  </h3>
                  {example.text ? <p className="mt-2 text-ink-2">{example.text}</p> : null}
                </div>
                <ul className="flex flex-col gap-2">
                  {(example.rows ?? []).map((row) => (
                    <li
                      key={row.id ?? row.line}
                      className="grid gap-1 rounded-[16px] border border-border bg-surface px-4 py-3 min-[641px]:grid-cols-[150px_minmax(0,1fr)] min-[641px]:items-center min-[641px]:gap-4"
                    >
                      <span className="flex items-center gap-2 text-sm font-extrabold text-accent-text">
                        <LineIcon name={row.icon} className="size-4" />
                        {row.line}
                      </span>
                      <span className="text-sm">{row.text}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  const cards = lineCards(block.lines, fill)
  if (cards.length === 0) return null
  return (
    <section className="py-12 min-[641px]:py-20">
      <Container wide>
        {head}
        <ul className="mt-6 grid gap-3 min-[641px]:grid-cols-2 min-[1081px]:grid-cols-5">
          {cards.map((card) => (
            <li
              key={card.key}
              className={cx(
                'flex flex-col rounded-[24px] bg-card p-[18px] min-[641px]:p-5',
                card.current ? 'border-2 border-accent shadow-raised' : 'border border-border',
              )}
            >
              {card.icon ? (
                <span
                  aria-hidden="true"
                  className="grid size-12 place-items-center rounded-[14px] bg-accent-soft text-accent-text"
                >
                  <LineIcon name={card.icon} className="size-5" />
                </span>
              ) : null}
              <h3 className="mt-5 font-display text-xl font-extrabold leading-tight">
                {card.name}
              </h3>
              {card.address ? (
                card.href && !card.current ? (
                  <a
                    href={card.href}
                    className="mt-1 inline-flex min-h-11 items-center text-sm font-extrabold text-accent-text underline-offset-4 hover:underline"
                  >
                    {card.address}
                  </a>
                ) : (
                  <p className="mt-1 py-3 text-sm font-extrabold text-accent-text">
                    {card.address}
                  </p>
                )
              ) : null}
              {card.points.length > 0 ? (
                <ul className="mt-2 flex flex-col gap-2 text-sm">
                  {card.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <Icon
                        name="check"
                        strokeWidth={2.4}
                        className="mt-0.5 size-4 shrink-0 text-ok-text"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              ) : null}
              {card.cta && card.current ? (
                <Link
                  href="/rozwiazania"
                  className="mt-auto inline-flex min-h-11 items-center pt-4 font-extrabold text-accent-text"
                >
                  {card.cta}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
