'use client'

import { useRef, useState } from 'react'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { CompareView, Mark } from '@/lib/software/compare'
import { SlidingPill } from '@/sites/software/components/SlidingPill'

type Props = { view: CompareView; eyebrow: string; title: string; tabs: [string, string] }

const MARK_LABEL: Record<Mark, string> = { no: 'nie', maybe: 'nie zawsze', yes: 'tak' }

function MarkIcon({ mark }: { mark: Mark }) {
  return (
    <span
      className="grid size-[22px] shrink-0 place-items-center rounded-full bg-chip text-xs font-black text-ink-2"
      title={MARK_LABEL[mark]}
    >
      <span aria-hidden="true">{mark === 'no' ? '–' : mark === 'maybe' ? '?' : '✓'}</span>
      {/* „nie, …” — a comma and a space, or a screen reader runs it into the text (SWV6). */}
      <span className="sr-only">{MARK_LABEL[mark]}, </span>
    </span>
  )
}

function Ours() {
  return (
    <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-ok text-white">
      <Icon name="check" strokeWidth={2.6} className="size-3.5" />
      <span className="sr-only">{MARK_LABEL.yes}, </span>
    </span>
  )
}

/**
 * „Freelancer, agencja czy PRO-KOM?” (spec. §6.6, stany/70): a switch between the two rivals,
 * the table criterion / rival / PRO-KOM; on the phone each row is a card (criterion, rival,
 * ours highlighted). The switch is two pressed-state buttons; the table follows it.
 */
export function Compare({ view, eyebrow, title, tabs }: Props) {
  const [rival, setRival] = useState<0 | 1>(0)
  const group = useRef<HTMLDivElement>(null)
  return (
    <section id="porownanie" className="scroll-mt-24 py-12 min-[641px]:py-20">
      <Container wide>
        <div className="flex flex-col gap-5 min-[1081px]:flex-row min-[1081px]:items-end min-[1081px]:justify-between">
          <div className="flex max-w-[680px] flex-col gap-2.5">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text min-[640px]:text-sm">
              {eyebrow}
            </p>
            <h2 className="font-display text-[32px] font-extrabold leading-[1.02] tracking-tight min-[640px]:text-5xl min-[1081px]:text-[56px]">
              {title}
            </h2>
          </div>
          <div
            ref={group}
            role="group"
            aria-label="Porównaj z"
            className="group/pills relative inline-flex self-start rounded-full border border-border bg-card p-1 min-[1081px]:self-auto"
          >
            <SlidingPill container={group} active={rival} className="bg-button" radius={22} />
            {tabs.map((tab, index) => (
              <button
                key={index}
                type="button"
                aria-pressed={rival === index}
                onClick={() => setRival(index as 0 | 1)}
                className={cx(
                  'relative z-[1] min-h-11 rounded-full px-5 text-sm font-extrabold transition-colors',
                  rival === index
                    ? 'bg-button text-accent-ink group-has-[[data-sliding-pill]]/pills:bg-transparent'
                    : 'text-ink-2',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <table className="mt-6 hidden w-full table-fixed overflow-hidden rounded-[24px] border border-border bg-card text-sm min-[761px]:table">
          <thead>
            <tr className="text-left text-xs font-extrabold uppercase tracking-[0.12em]">
              <th scope="col" className="w-[36%] px-5 py-4">
                <span className="sr-only">Kryterium</span>
              </th>
              <th scope="col" className="px-5 py-4 text-ink-2">
                {view.rivals[rival]}
              </th>
              <th scope="col" className="bg-accent-soft px-5 py-4 text-accent-text">
                {view.ours}
              </th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row, index) => (
              <tr key={index} className="border-t border-border">
                <th scope="row" className="px-5 py-4 text-left font-extrabold">
                  {row.criterion}
                </th>
                <td className="px-5 py-4 text-ink-2">
                  <span className="flex items-center gap-2.5">
                    <MarkIcon mark={row.rivals[rival].mark} />
                    {row.rivals[rival].text}
                  </span>
                </td>
                <td className="bg-accent-soft px-5 py-4 font-extrabold">
                  <span className="flex items-center gap-2.5">
                    <Ours />
                    {row.ours}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="mt-6 overflow-hidden rounded-[24px] border border-border bg-card min-[761px]:hidden">
          {view.rows.map((row, index) => (
            <li key={index} className="border-t border-border first:border-t-0">
              <p className="px-4 pt-4 pb-2 font-extrabold">{row.criterion}</p>
              <p className="flex items-center gap-2.5 px-4 pb-3 text-sm text-ink-2">
                {/* Read as „Freelancer: nie, …” — the name before the mark. */}
                <span className="sr-only">{view.rivals[rival]}: </span>
                <MarkIcon mark={row.rivals[rival].mark} />
                <span>{row.rivals[rival].text}</span>
              </p>
              <p className="flex items-center gap-2.5 bg-accent-soft px-4 py-3 text-sm font-extrabold">
                <span className="sr-only">{view.ours}: </span>
                <Ours />
                <span>{row.ours}</span>
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
