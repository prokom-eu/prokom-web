import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { newsListHref, type PostCategory } from '@/lib/posts/list'
import { plural } from '@/lib/plural'
import { BZ_H1, BZ_LEAD } from '@/sites/biznes/typography'

import { Breadcrumbs } from '../Breadcrumbs'
import { NEWS_TEXTS } from './texts'

type Props = {
  chips: { value: PostCategory; label: string; count: number }[]
  current: PostCategory | null
  /** All public posts and the date of the newest — the facts under the lead. */
  total: number
  last: { date: string; dateTime: string } | null
}

const CHIP =
  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[15px] font-bold whitespace-nowrap transition-[background-color,box-shadow]'

/**
 * Head of `/aktualnosci` (board `Aktualnosci`, redesign 15.11): breadcrumbs, H1, lead, the facts
 * counted from the posts and the category chips with their counts. Chips are links
 * (`?kategoria=`), so a category view has its own address and works without JS. On a phone the
 * chips stick to the top and scroll sideways (MOBILE-APLIKACJA §2) — outside the hero, whose
 * `overflow-hidden` would stop `sticky`.
 */
export function NewsHero({ chips, current, total, last }: Props) {
  const all = chips.reduce((sum, chip) => sum + chip.count, 0)
  return (
    <>
      <section className="relative overflow-hidden pt-6 pb-6 sm:pt-8 sm:pb-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,var(--glow),transparent_60%)] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
        />
        <Container wide className="relative">
          <Breadcrumbs
            items={[
              { name: 'Strona główna', href: '/' },
              { name: NEWS_TEXTS.title, href: newsListHref(null) },
            ]}
          />
          <h1 className={`${BZ_H1} mt-6 max-w-[16ch]`}>{NEWS_TEXTS.heading}</h1>
          <p className={`${BZ_LEAD} mt-6 max-w-[60ch] text-ink-2`}>{NEWS_TEXTS.lead}</p>
          {total > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-ink-2">
              <li>
                <strong className="font-display text-xl font-extrabold text-ink tabular-nums">
                  {total}
                </strong>{' '}
                {plural(total, NEWS_TEXTS.posts)}
              </li>
              {chips.length > 0 && (
                <li>
                  <strong className="font-display text-xl font-extrabold text-ink tabular-nums">
                    {chips.length}
                  </strong>{' '}
                  {plural(chips.length, NEWS_TEXTS.categories)}
                </li>
              )}
              {last && (
                <li>
                  {NEWS_TEXTS.lastPost}{' '}
                  <time dateTime={last.dateTime} className="font-bold text-ink">
                    {last.date}
                  </time>
                </li>
              )}
            </ul>
          )}
        </Container>
      </section>
      {chips.length > 1 && (
        <nav
          aria-label="Kategorie wpisów"
          className="z-20 pb-6 max-sm:sticky max-sm:top-0 max-sm:border-b max-sm:border-border max-sm:bg-surface/90 max-sm:py-2.5 max-sm:backdrop-blur-md sm:pb-10"
        >
          <Container wide>
            <ul className="flex gap-2.5 max-sm:-mx-4 max-sm:overflow-x-auto max-sm:px-4 max-sm:[scrollbar-width:none] sm:flex-wrap">
              {[{ value: null, label: NEWS_TEXTS.all, count: all }, ...chips].map(
                ({ value, label, count }) => {
                  const active = value === current
                  return (
                    <li key={value ?? 'all'} className="flex">
                      <Link
                        href={newsListHref(value)}
                        aria-current={active ? 'page' : undefined}
                        className={cx(
                          CHIP,
                          active
                            ? 'bg-ink text-surface'
                            : 'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]',
                        )}
                      >
                        {label}
                        <span
                          className={cx(
                            'text-[13px] tabular-nums',
                            active ? 'text-surface/70' : 'text-ink-2',
                          )}
                        >
                          {count}
                        </span>
                      </Link>
                    </li>
                  )
                },
              )}
            </ul>
          </Container>
        </nav>
      )}
    </>
  )
}
