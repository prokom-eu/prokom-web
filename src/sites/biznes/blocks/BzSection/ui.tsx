import Link from 'next/link'
import type { ReactNode } from 'react'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { SectionAction } from '@/lib/biznes/pages/sections'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'
import { BZ_H2, BZ_LEAD } from '@/sites/biznes/typography'

import type { Crumb } from '../../components/Breadcrumbs'

import { AddActionButton } from './AddActionButton'

/** Keys a K4 tab list handles: they move the selection, not the page. */
export const TAB_KEYS: ReadonlySet<string> = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
])

// Whole class names, so Tailwind finds them.
export const BTN =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[15.5px] font-extrabold transition-colors'
export const BTN_PRIMARY = cx(
  BTN,
  'bg-accent-text text-accent-ink shadow-[0_14px_30px_-16px_var(--accent-text)] hover:bg-ink hover:text-surface',
)
export const BTN_OUTLINE = cx(
  BTN,
  'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink)]',
)
export const BTN_ON_DARK = cx(BTN, 'bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20')
export const CARD = 'rounded-[22px] bg-card shadow-[inset_0_0_0_1px_var(--border)]'
export const EYEBROW = 'text-[13px] font-extrabold tracking-[0.08em] uppercase'
/** Section heading of the K4 pages: the board `.h2` (`typography.ts`); 22 px on a phone (App-*). */
export const H2 = cx(BZ_H2, 'max-md:text-[22px] max-md:leading-[1.1]')

const SURFACE: Record<BzSectionData['surface'], string> = {
  default: '',
  muted: 'bg-surface-2',
  dark: 'bg-surface-dark text-white',
}

/** Section padding; phone (boards App-*): a tighter rhythm. */
export const SECTION_PADDING = 'py-14 max-md:py-7 sm:py-20'

/** Page breadcrumbs with the hero's middle items: Strona główna / …trail / page. */
export function withTrail(crumbs: readonly Crumb[], trail: readonly Crumb[]): Crumb[] {
  if (crumbs.length < 2) return [...crumbs]
  return [crumbs[0]!, ...trail, ...crumbs.slice(1)]
}

/** Section id: the panel's anchor, or one made from the block id (for `aria-labelledby`). */
export const sectionId = (block: BzSectionData) => block.anchor || `sekcja-${block.id ?? 'k4'}`

/** Heading with the accented second part („… <em>Jeden system.</em>”). */
/** H2 text with the accented part; `onDark`: on navy (the light accent reads only on white). */
export function HeadingText({ block, onDark = false }: { block: BzSectionData; onDark?: boolean }) {
  return (
    <>
      {block.heading}
      {block.headingAccent && (
        <>
          {' '}
          <em className={cx(onDark ? 'text-accent-on-dark' : 'text-accent-text', 'not-italic')}>
            {block.headingAccent}
          </em>
        </>
      )}
    </>
  )
}

/**
 * Frame of a K4 section: background, page width, the head (label, H2, lead on the right) and the
 * source line under the content. `head={false}` when the kind lays out its own head.
 */
export function SectionShell({
  block,
  children,
  head = true,
  aside,
  className,
  padding = SECTION_PADDING,
}: {
  block: BzSectionData
  children: ReactNode
  head?: boolean
  /** Next to the heading on the right (e.g. „bez cen — wycena na piśmie”). */
  aside?: ReactNode
  className?: string
  /**
   * Vertical padding as one string: `cx` does not merge classes, so a second `py-*` passed in
   * `className` would win or lose by CSS order, not by intent.
   */
  padding?: string
}) {
  const id = sectionId(block)
  const dark = block.surface === 'dark'
  const labelled = head && Boolean(block.heading)
  return (
    <section
      id={id}
      aria-labelledby={labelled ? `${id}-h` : undefined}
      aria-label={labelled ? undefined : (block.eyebrow ?? undefined)}
      // Phone (boards App-*): the head is the H2 alone (no label, no lead).
      className={cx('scroll-mt-28', padding, SURFACE[block.surface], className)}
    >
      {/* The content rises in once when it starts below the screen (`RevealObserver`, prompt 4
          R1); the section's own background stays still. */}
      <Container wide data-reveal="">
        {head && (block.heading || block.eyebrow) && (
          // Folded on a phone (`FoldOnPhone`, `data-folded`): its row is the heading there.
          <div className="mb-9 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 max-md:mb-4 max-md:flex-nowrap max-md:items-center max-md:gap-x-3 max-md:in-data-[folded]:hidden">
            <div className="max-w-[46rem] min-w-0 grow basis-[34rem]">
              {block.eyebrow && (
                <p
                  className={cx(
                    EYEBROW,
                    'mb-3 max-md:hidden',
                    dark ? 'text-accent-on-dark' : 'text-accent-text',
                  )}
                >
                  {block.eyebrow}
                </p>
              )}
              {block.heading && (
                <h2 id={`${id}-h`} className={H2}>
                  <HeadingText block={block} onDark={dark} />
                </h2>
              )}
            </div>
            {block.lead && (
              <p
                className={cx(
                  BZ_LEAD,
                  'max-w-[44ch] min-w-0 basis-[22rem] text-pretty max-md:hidden',
                  dark ? 'text-white/80' : 'text-ink-2',
                )}
              >
                {block.lead}
              </p>
            )}
            {aside}
          </div>
        )}
        {children}
        <SourceLine block={block} />
      </Container>
    </section>
  )
}

/** „Źródło: … · stan na …” — a link when the panel has the address (sources only with a link). */
export function SourceLine({ block, className }: { block: BzSectionData; className?: string }) {
  if (!block.source) return null
  const dark = block.surface === 'dark'
  return (
    <p
      className={cx(
        'mt-6 text-[13px] leading-relaxed max-md:mt-4 max-md:text-xs',
        dark ? 'text-white/70' : 'text-ink-2',
        className,
      )}
    >
      {block.sourceUrl ? (
        <a
          href={block.sourceUrl}
          rel="noopener"
          target="_blank"
          className="underline-offset-2 hover:underline"
        >
          {block.source}
          <span className="sr-only"> (otwiera się w nowej karcie)</span>
        </a>
      ) : (
        block.source
      )}
    </p>
  )
}

/** A link inside the site: `#…` on the page stays a plain anchor, a path goes through `Link`. */
export function SiteLink({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: ReactNode
}) {
  return href.startsWith('#') ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

/** Buttons of a section: links and „add to the inquiry”. */
export function SectionActions({
  actions,
  onDark = false,
  className,
}: {
  actions: readonly SectionAction[]
  onDark?: boolean
  className?: string
}) {
  if (actions.length === 0) return null
  return (
    <div className={cx('flex flex-wrap gap-3', className)}>
      {actions.map((action) => {
        const style = action.primary ? BTN_PRIMARY : onDark ? BTN_ON_DARK : BTN_OUTLINE
        if ('add' in action) {
          return (
            <AddActionButton
              key={action.label}
              slug={action.add}
              label={action.label}
              note={action.note}
              className={style}
            />
          )
        }
        const external = /^https?:/.test(action.href)
        return external || /^(tel|mailto):/.test(action.href) ? (
          <a key={action.label} href={action.href} className={style}>
            {action.label}
          </a>
        ) : (
          <SiteLink key={action.label} href={action.href} className={style}>
            {action.label}
          </SiteLink>
        )
      })}
    </div>
  )
}
