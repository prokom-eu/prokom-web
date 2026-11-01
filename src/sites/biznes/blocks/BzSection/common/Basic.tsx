import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { SectionData } from '@/lib/biznes/pages/sections'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'

import { CARD, EYEBROW, HeadingText, SectionActions, SectionShell, sectionId } from '../ui'

type Props = { block: BzSectionData }
type Item = NonNullable<BzSectionData['items']>[number]

const items = (block: BzSectionData): Item[] => block.items ?? []

/** `stats`: big numbers in one row with the producer's source under them. */
export function StatsSection({ block }: Props) {
  const dark = block.surface === 'dark'
  return (
    <SectionShell block={block} className="py-10 sm:py-14">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 min-[900px]:grid-cols-4">
        {items(block).map((item, i) => (
          <div key={item.id ?? i} className="flex flex-col-reverse gap-1.5">
            <dt className={cx('text-[15px] leading-snug', dark ? 'text-white/75' : 'text-ink-2')}>
              {item.text}
            </dt>
            <dd className="font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-none font-extrabold">
              {item.title}
            </dd>
          </div>
        ))}
      </dl>
    </SectionShell>
  )
}

/** `cards`: three or four cards with an optional icon, label and link. */
export function CardsSection({ block }: Props) {
  const list = items(block)
  return (
    <SectionShell block={block}>
      <ul
        className={cx(
          'grid gap-4 min-[640px]:grid-cols-2',
          list.length % 4 === 0 ? 'min-[1080px]:grid-cols-4' : 'min-[1080px]:grid-cols-3',
        )}
      >
        {list.map((item, i) => (
          <li key={item.id ?? i} className={cx(CARD, 'flex flex-col gap-2.5 p-6 text-ink sm:p-7')}>
            {item.icon && (
              <span
                aria-hidden="true"
                className="mb-1 flex size-11 items-center justify-center rounded-xl bg-surface-2 text-accent-text"
              >
                <Icon name={item.icon} strokeWidth={2.2} className="size-5" />
              </span>
            )}
            {item.label && <p className={cx(EYEBROW, 'text-accent-text')}>{item.label}</p>}
            <h3 className="font-display text-[1.2rem] leading-tight font-extrabold text-balance">
              {item.title}
            </h3>
            {item.text && <p className="leading-relaxed text-pretty text-ink-2">{item.text}</p>}
            {item.href && (
              <Link
                href={item.href}
                className="mt-auto pt-2 font-extrabold text-accent-text hover:underline"
              >
                Zobacz więcej →
              </Link>
            )}
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

/** `steps`: numbered steps in a row (on a phone one under another). */
export function StepsSection({ block }: Props) {
  const list = items(block)
  return (
    <SectionShell block={block}>
      <ol
        className={cx(
          'grid gap-4 min-[640px]:grid-cols-2',
          list.length >= 5 ? 'min-[1080px]:grid-cols-5' : 'min-[1080px]:grid-cols-4',
        )}
      >
        {list.map((item, i) => (
          <li key={item.id ?? i} className={cx(CARD, 'flex flex-col gap-2 p-6 text-ink')}>
            <span
              aria-hidden="true"
              className="mb-2 flex size-10 items-center justify-center rounded-full bg-accent-text font-display text-[15px] font-extrabold text-accent-ink"
            >
              {i + 1}
            </span>
            {item.label && <p className={cx(EYEBROW, 'text-ink-2')}>{item.label}</p>}
            <h3 className="font-display text-[1.1rem] leading-tight font-extrabold">
              {item.title}
            </h3>
            {item.text && <p className="text-[15px] leading-relaxed text-ink-2">{item.text}</p>}
          </li>
        ))}
      </ol>
    </SectionShell>
  )
}

/** `cases`: results of the producer's clients (label = the number, title = client · place). */
export function CasesSection({ block }: Props) {
  return (
    <SectionShell block={block}>
      <ul className="grid gap-4 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
        {items(block).map((item, i) => (
          <li
            key={item.id ?? i}
            className={cx(
              'flex flex-col gap-2 rounded-[22px] p-6',
              i === 0 ? 'bg-surface-dark text-white' : cx(CARD, 'text-ink'),
            )}
          >
            <p className="font-display text-[2.4rem] leading-none font-extrabold">{item.label}</p>
            <p className={i === 0 ? 'text-white/85' : 'text-ink-2'}>{item.text}</p>
            <p className="mt-auto pt-3 font-extrabold">{item.title}</p>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

/** `band`: closing band — heading, lead and the buttons, on navy. */
export function BandSection({ block, data }: Props & { data: SectionData<'band'> }) {
  const id = sectionId(block)
  return (
    <section
      id={id}
      aria-labelledby={block.heading ? `${id}-h` : undefined}
      className="scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[28px] bg-surface-dark px-6 py-10 text-white sm:px-10 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
        <div className="max-w-[44rem]">
          {block.eyebrow && (
            <p className={cx(EYEBROW, 'mb-3 text-accent-on-dark')}>{block.eyebrow}</p>
          )}
          {block.heading && (
            <h2
              id={`${id}-h`}
              className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] leading-tight font-extrabold text-balance"
            >
              <HeadingText block={block} />
            </h2>
          )}
          {block.lead && <p className="mt-3 leading-relaxed text-white/80">{block.lead}</p>}
        </div>
        <SectionActions actions={data.actions} onDark className="shrink-0" />
      </div>
    </section>
  )
}

/** `table`: a comparison; on a phone each column is a card in a horizontal strip. */
export function TableSection({ block, data }: Props & { data: SectionData<'table'> }) {
  const [, ...columns] = data.head
  return (
    <SectionShell block={block}>
      <div className={cx(CARD, 'hidden overflow-hidden min-[761px]:block')}>
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="bg-surface-2">
              {data.head.map((cell, i) => (
                <th key={i} scope="col" className="px-5 py-4 font-display font-extrabold text-ink">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.k} className="border-t border-border">
                <th scope="row" className="px-5 py-4 font-extrabold text-ink">
                  {row.k}
                </th>
                {row.v.map((cell, i) => (
                  <td key={i} className="px-5 py-4 text-ink-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 min-[761px]:hidden">
        {columns.map((column, c) => (
          <li key={column} className={cx(CARD, 'w-[82%] shrink-0 snap-start p-5 text-ink')}>
            <h3 className="font-display text-lg font-extrabold">{column}</h3>
            <dl className="mt-3 flex flex-col gap-3">
              {data.rows.map((row) => (
                <div key={row.k}>
                  <dt className="text-[13px] font-extrabold text-ink-2">{row.k}</dt>
                  <dd className="text-ink-2">{row.v[c] ?? '—'}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

/** `chips`: groups of labels (integrations); the rest under „Pokaż wszystkie”. */
export function ChipsSection({ block, data }: Props & { data: SectionData<'chips'> }) {
  const visible = data.visible > 0 ? data.groups.slice(0, data.visible) : data.groups
  const rest = data.visible > 0 ? data.groups.slice(data.visible) : []
  const group = (g: (typeof data.groups)[number]) => (
    <li key={g.t} className={cx(CARD, 'flex flex-col gap-3 p-5 text-ink')}>
      <h3 className="font-extrabold">{g.t}</h3>
      <ul className="flex flex-wrap gap-2">
        {g.items.map((chip) => (
          <li key={chip} className="rounded-full bg-surface-2 px-3 py-1.5 text-[14px] text-ink-2">
            {chip}
          </li>
        ))}
      </ul>
    </li>
  )
  return (
    <SectionShell block={block}>
      <ul className="grid gap-4 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
        {visible.map(group)}
        {data.total && (
          <li className="flex flex-col justify-center gap-1 rounded-[22px] bg-accent-text p-5 text-accent-ink">
            <span className="font-display text-[2.4rem] leading-none font-extrabold">
              {data.total.v}
            </span>
            <span className="font-bold">{data.total.t}</span>
          </li>
        )}
      </ul>
      {rest.length > 0 && (
        <details className="group mt-4">
          <summary className="inline-flex min-h-12 cursor-pointer list-none items-center gap-2 font-extrabold text-accent-text [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Pokaż wszystkie integracje</span>
            <span className="hidden group-open:inline">Zwiń</span>
          </summary>
          <ul className="mt-4 grid gap-4 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
            {rest.map(group)}
          </ul>
        </details>
      )}
    </SectionShell>
  )
}
