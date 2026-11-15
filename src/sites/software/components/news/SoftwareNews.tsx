import { IntentLink as Link } from '@/components/shared/IntentLink'

import { plural } from '@/lib/plural'
import type { PostListItem } from '@/lib/posts/data'
import type { PostCategory } from '@/lib/posts/list'
import { newsPageHref, type NewsListView } from '@/lib/posts/newsList'

import { Glass } from '../ui/Glass'
import { PageHero } from '../ui/PageHero'
import { SectionHead } from '../ui/SectionHead'
import { FeaturedPost, PostCardList } from './PostCards'
import { SOFTWARE_NEWS_TEXTS as T } from './texts'

type Props = { view: NewsListView<PostListItem>; category: PostCategory | null }

/** Grid cards before the band to the picker (decision 15.11: after the 6th card of a long page —
 * two full rows of the grid, so the band never leaves a row half empty). */
const BAND_AFTER = 6

const primaryButton =
  'inline-flex min-h-13 shrink-0 items-center justify-center rounded-full bg-button px-6 font-extrabold text-accent-ink'
const secondaryButton =
  'inline-flex min-h-13 shrink-0 items-center justify-center rounded-full border border-border bg-card px-6 font-extrabold'

/**
 * `/aktualnosci` in the Software v24 look (ZMIANY-v24 §9.4, board `AU-aktualnosci`): the subpage
 * hero, category chips with counts (links, `?kategoria=`), the newest post featured with the next
 * two beside it, the grid with a band to the picker after the 6th card, pages of 12 (`?strona=`,
 * plain links) and the closing CTA (picker + free audit). No client JS of its own. Posts of this
 * tenant only (the route loads them and builds `view`).
 */
export function SoftwareNews({ view, category }: Props) {
  const { chips, total, featured, latest, cards, page, pages } = view
  const before = cards.length > BAND_AFTER ? cards.slice(0, BAND_AFTER) : cards
  const after = cards.length > BAND_AFTER ? cards.slice(BAND_AFTER) : []

  return (
    <>
      <PageHero
        crumb={T.title}
        eyebrow={T.eyebrow}
        title={T.heading}
        em={T.headingEm}
        lead={T.lead}
      />
      <section aria-label="Wpisy" className="sw-after-hero">
        <div className="v-wrap">
          <div className="sw-offer-bar">
            {chips.length > 1 ? (
              <nav aria-label="Kategorie" className="v-chips v-chips-scroll">
                {[{ value: null, label: T.all, count: null }, ...chips].map((chip) => (
                  <Link
                    key={chip.value ?? 'all'}
                    href={newsPageHref(chip.value, 1)}
                    aria-current={chip.value === category ? 'page' : undefined}
                    className="sw-chip"
                  >
                    {chip.label}
                    {chip.count ? (
                      <>
                        <span className="sr-only">, </span>
                        <span className="sw-chip-n">{chip.count}</span>
                      </>
                    ) : null}
                  </Link>
                ))}
              </nav>
            ) : null}
            {total > 0 ? (
              <p className="sw-offer-count ml-auto">
                {total} {plural(total, [...T.count])}
              </p>
            ) : null}
          </div>
          {total === 0 ? (
            <Glass className="p-6 text-lg text-ink-2 min-[641px]:p-8">{T.empty}</Glass>
          ) : (
            <div className="flex flex-col gap-4">
              {featured ? (
                <div className="sw-news-lead">
                  <FeaturedPost post={featured} />
                  {latest.length > 0 ? (
                    <div className="sw-news-latest">
                      <p className="sw-eyebrow">{T.latest}</p>
                      <PostCardList posts={latest} compact label={T.latest} />
                    </div>
                  ) : null}
                </div>
              ) : null}
              {before.length > 0 ? <PostCardList posts={before} /> : null}
              {after.length > 0 ? (
                <>
                  <Glass className="sw-news-band">
                    <span className="sw-eyebrow">{T.band.eyebrow}</span>
                    <p className="sw-news-band-text">{T.band.text}</p>
                    <Link href={T.band.link.href} data-motion="button" className={primaryButton}>
                      {T.band.link.label}
                    </Link>
                  </Glass>
                  <PostCardList posts={after} />
                </>
              ) : null}
              {pages > 1 ? <Pages category={category} page={page} pages={pages} /> : null}
            </div>
          )}
        </div>
      </section>
      <section data-final-cta aria-labelledby="aktualnosci-cta-h" className="v-sec">
        <div className="v-wrap">
          <Glass featured className="sw-cta">
            <SectionHead
              id="aktualnosci-cta-h"
              eyebrow={T.listCta.eyebrow}
              title={T.listCta.title}
              em={T.listCta.em}
              lead={T.listCta.text}
            />
            <div className="sw-news-cta-actions">
              <Link href={T.listCta.link.href} data-motion="button" className={primaryButton}>
                {T.listCta.link.label}
              </Link>
              <Link href={T.listCta.audit.href} className={secondaryButton}>
                {T.listCta.audit.label}
              </Link>
            </div>
          </Glass>
        </div>
      </section>
    </>
  )
}

/** Pages of the list: newer / numbers / older, plain links (no JS); the phone keeps the arrows. */
function Pages({
  category,
  page,
  pages,
}: {
  category: PostCategory | null
  page: number
  pages: number
}) {
  const numbers = Array.from({ length: pages }, (_, index) => index + 1)
  return (
    <nav aria-label={T.pages.label} className="sw-news-pages">
      {page > 1 ? (
        <Link href={newsPageHref(category, page - 1)} rel="prev" className="sw-chip">
          {T.pages.newer}
        </Link>
      ) : null}
      <ul className="sw-news-pages-list">
        {numbers.map((number) => (
          <li key={number}>
            <Link
              href={newsPageHref(category, number)}
              aria-current={number === page ? 'page' : undefined}
              aria-label={`${T.pages.page} ${number}`}
              className="sw-chip sw-news-page"
            >
              {number}
            </Link>
          </li>
        ))}
      </ul>
      <p className="sw-news-pages-of">
        {T.pages.page} {page} {T.pages.of} {pages}
      </p>
      {page < pages ? (
        <Link href={newsPageHref(category, page + 1)} rel="next" className="sw-chip">
          {T.pages.older}
        </Link>
      ) : null}
    </nav>
  )
}
