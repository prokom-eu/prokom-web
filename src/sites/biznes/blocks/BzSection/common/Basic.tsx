import Image from 'next/image'
import type { CSSProperties } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { isAfterSwitch } from '@/lib/biznes/pages/ksef'
import type { SectionData } from '@/lib/biznes/pages/sections'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'

import { balancedGrid } from './grid'
import { PhaseText } from '../k4j/ClientLazy'
import {
  CARD,
  EYEBROW,
  H2,
  HeadingText,
  SectionActions,
  SectionShell,
  SiteLink,
  sectionId,
} from '../ui'

type Props = { block: BzSectionData }
type Item = NonNullable<BzSectionData['items']>[number]

const items = (block: BzSectionData): Item[] => block.items ?? []

/** `stats`: big numbers in one row with the producer's source under them. */
export function StatsSection({ block }: Props) {
  const dark = block.surface === 'dark'
  return (
    <SectionShell block={block}>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 min-[900px]:grid-cols-4">
        {items(block).map((item, i) => (
          <div key={item.id ?? i} className="flex flex-col-reverse gap-1.5">
            <dt className={cx('text-[15px] leading-snug', dark ? 'text-white/75' : 'text-ink-2')}>
              {item.text}
            </dt>
            <dd className="font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-none font-extrabold">
              {item.title}
            </dd>
            {/* An icon over the number (PRODUKCJA-BIZNES-1211 §3: not a bare white band). */}
            {item.icon && (
              <dd
                aria-hidden="true"
                className={cx(
                  'mb-2 flex size-11 items-center justify-center rounded-xl max-md:size-9',
                  dark
                    ? 'bg-white/10 text-white'
                    : 'bg-card text-accent-text shadow-[inset_0_0_0_1px_var(--border)]',
                )}
              >
                <Icon name={item.icon} strokeWidth={2.2} className="size-5 max-md:size-4" />
              </dd>
            )}
          </div>
        ))}
      </dl>
    </SectionShell>
  )
}

/**
 * Link under a card: the label is its text („Sprawdź w CEIDG”, „Zadzwoń teraz”). Another site
 * opens in a new tab; a phone, an e-mail or an anchor stays a plain link.
 */
function CardLink({ href, label }: { href: string; label: string }) {
  const className =
    'mt-auto inline-flex min-h-11 items-center pt-2 font-extrabold text-accent-text hover:underline'
  if (/^https?:/.test(href)) {
    return (
      <a href={href} rel="noopener" target="_blank" className={className}>
        {label} ↗<span className="sr-only"> (otwiera się w nowej karcie)</span>
      </a>
    )
  }
  if (/^(tel|mailto):/.test(href)) {
    return (
      <a href={href} className={className}>
        {label} →
      </a>
    )
  }
  return (
    <SiteLink href={href} className={className}>
      {label} →
    </SiteLink>
  )
}

type Shot = NonNullable<NonNullable<SectionData<'cards'>['shots']>[number]>

/**
 * A card's picture (PRODUKCJA-BIZNES-1211 §3): a screen in a drawn phone, a device photo on the
 * white plate, or a drawn invoice marked „KSeF” (an illustration, not a screenshot).
 */
function CardShot({ shot, image }: { shot: Shot; image?: IndexImage }) {
  if (shot.frame === 'doc') {
    return (
      <div
        aria-hidden="true"
        className="relative mx-auto flex h-44 w-full max-w-[220px] flex-col gap-2 rounded-xl bg-plate p-4 text-left text-[11px] text-surface-dark shadow-[0_14px_30px_-18px_var(--plate-shadow),inset_0_0_0_1px_var(--plate-shadow)] max-md:h-32 max-md:p-3"
      >
        <span className="font-extrabold tracking-[0.08em] uppercase">Faktura VAT</span>
        <span className="h-1.5 w-3/4 rounded bg-current opacity-15" />
        <span className="h-1.5 w-1/2 rounded bg-current opacity-15" />
        <span className="mt-1 h-1.5 w-full rounded bg-current opacity-10" />
        <span className="h-1.5 w-full rounded bg-current opacity-10" />
        <span className="h-1.5 w-2/3 rounded bg-current opacity-10" />
        <span className="absolute right-3 bottom-3 rounded-md bg-surface-dark px-2 py-1 font-extrabold text-white">
          KSeF ✓
        </span>
      </div>
    )
  }
  if (!image) return null
  if (shot.frame === 'phone') {
    return (
      <div className="mx-auto h-44 w-[110px] overflow-hidden rounded-[22px] border-[5px] border-surface-dark bg-plate shadow-[0_18px_34px_-18px_var(--plate-shadow)] max-md:h-32 max-md:w-[82px] max-md:rounded-[16px] max-md:border-4">
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="120px"
          unoptimized
          className="h-full w-full object-cover object-top"
        />
      </div>
    )
  }
  return (
    <div className="flex h-44 items-center justify-center rounded-xl bg-plate p-2 max-md:h-32">
      <Image
        src={image.url}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(max-width: 768px) 45vw, 320px"
        unoptimized
        className="max-h-full w-auto object-contain"
      />
    </div>
  )
}

/** `cards`: three or four cards with an optional icon (or picture), label and link. */
export function CardsSection({
  block,
  shots = [],
  images = {},
}: Props & { shots?: SectionData<'cards'>['shots']; images?: Record<string, IndexImage> }) {
  const list = items(block)
  // A picture that did not load (Media removed) gives the card its icon back, not an empty box.
  const hasShot = (i: number) => {
    const shot = shots?.[i]
    if (!shot) return false
    return shot.frame === 'doc' || (shot.image !== undefined && !!images[String(shot.image)])
  }
  // Phone (boards App-*): cards with a link swipe in one row (App-Kontakt, App-OFirmie); plain
  // cards sit two by two in small tiles (App-GoPOS).
  const row = list.some((item) => item.href)
  // Columns from the number of cards, the last row centred (audit 14.11 P1-4: 5 cards were 3 + 2).
  const grid = balancedGrid(list.length, { phone: 2 })
  return (
    <SectionShell block={block}>
      <ul
        className={cx(
          grid.list,
          'gap-4',
          row
            ? 'max-md:-mx-4 max-md:-my-2 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-px-4 max-md:gap-3 max-md:overflow-x-auto max-md:px-4 max-md:py-2 max-md:[scrollbar-width:none]'
            : 'max-md:gap-2.5',
        )}
      >
        {list.map((item, i) => (
          <li
            key={item.id ?? i}
            className={cx(
              CARD,
              grid.item(i),
              'flex flex-col gap-2.5 p-6 text-ink sm:p-7 max-md:gap-1.5',
              row
                ? 'max-md:relative max-md:w-[66%] max-md:shrink-0 max-md:snap-start max-md:p-4'
                : 'max-md:min-w-0 max-md:rounded-[18px] max-md:p-3.5',
            )}
          >
            {hasShot(i) && (
              <div className="mb-2">
                <CardShot
                  shot={shots[i]!}
                  image={
                    shots[i]!.image !== undefined ? images[String(shots[i]!.image)] : undefined
                  }
                />
              </div>
            )}
            {item.icon && !hasShot(i) && (
              <span
                aria-hidden="true"
                className="mb-1 flex size-11 items-center justify-center rounded-xl bg-surface-2 text-accent-text max-md:size-9"
              >
                <Icon name={item.icon} strokeWidth={2.2} className="size-5 max-md:size-4" />
              </span>
            )}
            {item.label && !item.href && (
              <p className={cx(EYEBROW, 'text-accent-text max-md:text-[11px]')}>{item.label}</p>
            )}
            <h3 className="font-display text-[1.2rem] leading-tight font-extrabold text-balance max-md:text-[15px]">
              {item.title}
            </h3>
            {item.text && (
              <p className="leading-relaxed text-pretty text-ink-2 max-md:text-[13px] max-md:leading-snug">
                {item.text}
              </p>
            )}
            {item.href && <CardLink href={item.href} label={item.label || 'Zobacz więcej'} />}
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

/** `steps`: numbered steps in a row (on a phone one under another); `axis` — on one line. */
export function StepsSection({ block, axis = false }: Props & { axis?: boolean }) {
  const list = items(block)
  if (axis) return <StepsAxis block={block} list={list} />
  return (
    <SectionShell block={block}>
      {/* Phone (App-Ulga, App-GoPOS): a numbered column, the circle left, the text right. */}
      <ol
        className={cx(
          'grid gap-4 max-md:gap-3 min-[768px]:grid-cols-2',
          list.length >= 5 ? 'min-[1080px]:grid-cols-5' : 'min-[1080px]:grid-cols-4',
        )}
      >
        {list.map((item, i) => (
          <li
            key={item.id ?? i}
            className={cx(
              CARD,
              'flex flex-col gap-2 p-6 text-ink max-md:grid max-md:grid-cols-[2.25rem_minmax(0,1fr)] max-md:gap-x-3 max-md:gap-y-0.5 max-md:rounded-none max-md:bg-transparent max-md:p-0 max-md:shadow-none',
            )}
          >
            <span
              aria-hidden="true"
              className="mb-2 flex size-10 items-center justify-center rounded-full bg-accent-text font-display text-[15px] font-extrabold text-accent-ink max-md:row-span-3 max-md:mb-0 max-md:size-9 max-md:text-sm"
            >
              {i + 1}
            </span>
            {item.label && (
              <p className={cx(EYEBROW, 'text-ink-2 max-md:text-[10.5px]')}>{item.label}</p>
            )}
            <h3 className="font-display text-[1.1rem] leading-tight font-extrabold max-md:text-base">
              {item.title}
            </h3>
            {item.text && (
              <p className="text-[15px] leading-relaxed text-ink-2 max-md:text-[13px] max-md:leading-snug">
                {item.text}
              </p>
            )}
          </li>
        ))}
      </ol>
    </SectionShell>
  )
}

/**
 * Steps on one axis (PRODUKCJA-BIZNES-1211 §3 pkt 7, GoPOS rollout): numbered stops on a line,
 * the text under each — on a phone the line runs down the left with the text beside it.
 */
function StepsAxis({ block, list }: { block: BzSectionData; list: Item[] }) {
  return (
    <SectionShell block={block}>
      <div className="relative" data-steps-axis>
        <span
          aria-hidden="true"
          className="absolute top-5 right-[8%] left-[8%] h-0.5 bg-accent-text/35 max-md:top-2 max-md:bottom-2 max-md:left-[1.1rem] max-md:right-auto max-md:h-auto max-md:w-0.5"
        />
        <ol
          className="relative grid gap-5 max-md:pl-12 min-[768px]:gap-4 min-[768px]:[grid-template-columns:repeat(var(--steps),minmax(0,1fr))]"
          style={{ '--steps': list.length } as CSSProperties}
        >
          {list.map((item, i) => (
            <li
              key={item.id ?? i}
              className="relative flex flex-col gap-2 text-ink min-[768px]:items-center min-[768px]:text-center"
            >
              <span
                aria-hidden="true"
                className="relative z-[1] flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-text font-display text-[15px] font-extrabold text-accent-ink ring-8 ring-surface max-md:absolute max-md:top-0 max-md:-left-12 max-md:size-9 max-md:text-sm"
              >
                {i + 1}
              </span>
              <h3 className="font-display text-[1.1rem] leading-tight font-extrabold max-md:text-base min-[768px]:mt-2">
                {item.title}
              </h3>
              {item.text && (
                <p className="text-[15px] leading-relaxed text-pretty text-ink-2 max-md:text-[13px] max-md:leading-snug">
                  {item.text}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  )
}

/** `cases`: results of the producer's clients (label = the number, title = client · place). */
export function CasesSection({ block }: Props) {
  return (
    <SectionShell block={block}>
      {/* Phone (App-GoPOS „Wyniki klientów”): the results in one row to swipe. */}
      <ul className="grid gap-4 max-md:-mx-4 max-md:-my-2 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-px-4 max-md:gap-3 max-md:overflow-x-auto max-md:px-4 max-md:py-2 max-md:[scrollbar-width:none] min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
        {items(block).map((item, i) => (
          <li
            key={item.id ?? i}
            className={cx(
              'flex flex-col gap-2 rounded-[22px] p-6 max-md:w-[52%] max-md:shrink-0 max-md:snap-start max-md:gap-1 max-md:p-4',
              i === 0 ? 'bg-surface-dark text-white' : cx(CARD, 'text-ink'),
            )}
          >
            <p className="font-display text-[2.4rem] leading-none font-extrabold max-md:text-[30px]">
              {item.label}
            </p>
            <p className={cx('max-md:text-[13px]', i === 0 ? 'text-white/85' : 'text-ink-2')}>
              {item.text}
            </p>
            <p className="mt-auto pt-3 font-extrabold max-md:pt-1.5 max-md:text-[13px]">
              {item.title}
            </p>
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
      className="scroll-mt-28 px-4 py-12 max-md:py-6 sm:px-6 sm:py-16 lg:px-8"
    >
      {/* Phone (App-OFirmie, App-GoPOS): a compact card, the buttons across it. */}
      <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[28px] bg-surface-dark px-6 py-10 text-white max-md:gap-4 max-md:rounded-[24px] max-md:px-[18px] max-md:py-6 sm:px-10 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
        <div className="max-w-[44rem]">
          {block.eyebrow && (
            <p className={cx(EYEBROW, 'mb-3 text-accent-on-dark max-md:hidden')}>{block.eyebrow}</p>
          )}
          {block.heading && (
            <h2 id={`${id}-h`} className={H2}>
              {data.after ? (
                <PhaseText
                  date={data.after.date}
                  serverAfter={isAfterSwitch(data.after.date, new Date())}
                  before={<HeadingText block={block} onDark />}
                  after={data.after.heading}
                />
              ) : (
                <HeadingText block={block} onDark />
              )}
            </h2>
          )}
          {block.lead && (
            <p className="mt-3 leading-relaxed text-white/80 max-md:mt-2 max-md:text-[13.5px]">
              {block.lead}
            </p>
          )}
        </div>
        <SectionActions
          actions={data.actions}
          onDark
          className="shrink-0 max-md:grid max-md:grid-cols-1 max-md:gap-2"
        />
      </div>
    </section>
  )
}

/** `table`: a comparison; on a phone each column is a card in a horizontal strip. */
/** `contrast` tables (board `Web-opieka-it`): the „without” column in red, the „with” in green. */
const CONTRAST_HEAD = [
  'bg-[color-mix(in_srgb,var(--c-biznes-tone-red)_12%,transparent)] text-ink',
  'bg-ok/15 text-ok-text',
]
const CONTRAST_CELL = ['text-ink-2', 'bg-ok/5 font-bold text-ink']

export function TableSection({ block, data }: Props & { data: SectionData<'table'> }) {
  const [, ...columns] = data.head
  const contrast = data.contrast === true && columns.length === 2
  return (
    <SectionShell block={block}>
      <div className={cx(CARD, 'hidden overflow-hidden min-[761px]:block')}>
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="bg-surface-2">
              {data.head.map((cell, i) => (
                <th
                  key={i}
                  scope="col"
                  className={cx(
                    'px-5 py-4 font-display font-extrabold text-ink',
                    contrast && i > 0 && CONTRAST_HEAD[i - 1],
                  )}
                >
                  {contrast && i > 0 ? (
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden="true">{i === 1 ? '✕' : '✓'}</span>
                      {cell}
                    </span>
                  ) : (
                    cell
                  )}
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
                  <td
                    key={i}
                    className={cx('px-5 py-4', contrast ? CONTRAST_CELL[i] : 'text-ink-2')}
                  >
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
            <h3
              className={cx(
                'font-display text-lg font-extrabold',
                contrast && cx('-mx-5 -mt-5 mb-1 rounded-t-[22px] px-5 py-3', CONTRAST_HEAD[c]),
              )}
            >
              {contrast && (
                <span aria-hidden="true" className="mr-2">
                  {c === 0 ? '✕' : '✓'}
                </span>
              )}
              {column}
            </h3>
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
      {data.lines && <TableLines lines={data.lines} />}
    </SectionShell>
  )
}

/** `chips`: groups of labels (integrations); the rest under „Pokaż wszystkie”. */
export function ChipsSection({ block, data }: Props & { data: SectionData<'chips'> }) {
  const visible = data.visible > 0 ? data.groups.slice(0, data.visible) : data.groups
  const rest = data.visible > 0 ? data.groups.slice(data.visible) : []
  const group = (g: (typeof data.groups)[number]) => (
    <li key={g.t} className={cx(CARD, 'flex flex-col gap-3 p-5 text-ink max-md:gap-2 max-md:p-4')}>
      <div className="flex items-center gap-3">
        {g.ic && (
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-accent-text max-md:size-8"
          >
            <Icon name={g.ic} strokeWidth={2.2} className="size-5 max-md:size-4" />
          </span>
        )}
        <h3 className="flex-1 font-extrabold max-md:text-[13px]">{g.t}</h3>
        {/* How many in the group (PRODUKCJA-BIZNES-1211 §3: tiles with a count). */}
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[13px] font-extrabold text-ink-2">
          {g.items.length}
        </span>
      </div>
      <ul className="flex flex-wrap gap-2 max-md:gap-1.5">
        {g.items.map((chip) => (
          <li
            key={chip}
            className="rounded-full bg-surface-2 px-3 py-1.5 text-[14px] text-ink-2 max-md:px-2.5 max-md:py-1 max-md:text-[13px]"
          >
            {chip}
          </li>
        ))}
      </ul>
    </li>
  )
  return (
    <SectionShell
      block={block}
      // Phone (App-GoPOS „Integracje 30+”): the count as a pill next to the heading.
      aside={
        data.total ? (
          <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-extrabold text-ink-2 md:hidden">
            {data.total.v}
          </span>
        ) : null
      }
    >
      <ul className="grid gap-4 max-md:gap-2 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
        {visible.map(group)}
        {data.total && (
          // Phone: the count is the pill next to the heading (`aside`), not a big card.
          <li className="flex flex-col justify-center gap-1 rounded-[22px] bg-accent-text p-5 text-accent-ink max-md:hidden">
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

/**
 * „Linie InsERT” under the comparison (PREMIUM-1011, `insert.lines`): a card per line with its
 * tagline and who it is for — the step after „123, GT czy nexo?”. Facts of the package only.
 */
function TableLines({ lines }: { lines: NonNullable<SectionData<'table'>['lines']> }) {
  return (
    <div className="mt-10 max-md:mt-6" data-table-lines>
      <h3 className="font-display text-xl font-extrabold">{lines.t}</h3>
      <ul
        className="mt-4 grid gap-3 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4"
        data-reveal-cards=""
      >
        {lines.items.map((line) => (
          <li key={line.t} className={cx(CARD, 'flex flex-col gap-2 p-5 text-ink')}>
            <b className="font-display text-lg font-extrabold">{line.t}</b>
            <span className="text-[13px] font-extrabold tracking-[0.04em] text-accent-text uppercase">
              {line.s}
            </span>
            <ul className="mt-1 flex flex-col gap-1.5 text-[15px] text-ink-2">
              {line.b.map((point) => (
                <li key={point} className="flex gap-2">
                  <span aria-hidden="true" className="text-ok-text">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {lines.source && <p className="mt-3 text-[13px] text-ink-2">{lines.source}</p>}
    </div>
  )
}
