import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { newsListHref, type PostCategory } from '@/lib/posts/list'

import { Breadcrumbs } from '../Breadcrumbs'
import { NEWS_TEXTS } from './texts'

type Props = {
  chips: { value: PostCategory; label: string }[]
  current: PostCategory | null
}

const CHIP =
  'inline-flex min-h-11 items-center rounded-full px-5 text-[15px] font-bold transition-[background-color,box-shadow]'

/**
 * Head of `/aktualnosci` (board `Aktualnosci`): breadcrumbs, H1, lead and the category chips.
 * Chips are links (`?kategoria=`), so a category view has its own address and works without JS.
 */
export function NewsHero({ chips, current }: Props) {
  return (
    <section className="relative overflow-hidden pt-6 pb-10 sm:pt-8 sm:pb-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_85%_30%,var(--glow),transparent_60%)]"
      />
      <Container wide className="relative">
        <Breadcrumbs
          items={[
            { name: 'Strona główna', href: '/' },
            { name: NEWS_TEXTS.title, href: newsListHref(null) },
          ]}
        />
        <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.98] font-extrabold tracking-[-0.025em] font-stretch-112%">
          {NEWS_TEXTS.heading}
        </h1>
        <p className="mt-6 max-w-[60ch] text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-relaxed text-ink-2">
          {NEWS_TEXTS.lead}
        </p>
        {chips.length > 1 && (
          <nav aria-label="Kategorie wpisów" className="mt-8">
            <ul className="flex flex-wrap gap-2.5">
              {[{ value: null, label: NEWS_TEXTS.all }, ...chips].map(({ value, label }) => {
                const active = value === current
                return (
                  <li key={value ?? 'all'}>
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
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}
      </Container>
    </section>
  )
}
