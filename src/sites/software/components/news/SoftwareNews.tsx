import { IntentLink as Link } from '@/components/shared/IntentLink'

import { plural } from '@/lib/plural'
import type { PostListItem } from '@/lib/posts/data'
import { categoryChips, newsListHref, type PostCategory } from '@/lib/posts/list'

import { Glass } from '../ui/Glass'
import { PageHero } from '../ui/PageHero'
import { SectionHead } from '../ui/SectionHead'
import { FeaturedPost, PostCardList } from './PostCards'
import { SOFTWARE_NEWS_TEXTS as T } from './texts'

type Props = { posts: readonly PostListItem[]; category: PostCategory | null }

/**
 * `/aktualnosci` in the Software v24 look (ZMIANY-v24 §9.4, board `AU-aktualnosci`): the subpage
 * hero, category chips (links, `?kategoria=`; only categories with posts, from two up) with the
 * count, the newest post featured, the rest in three columns, and the free audit CTA instead of
 * the band above the footer. Posts of this tenant only (the route loads them).
 */
export function SoftwareNews({ posts, category }: Props) {
  const chips = categoryChips(posts.map((post) => post.categoryValue))
  const shown = category ? posts.filter((post) => post.categoryValue === category) : posts
  const [first, ...rest] = shown
  const featured = !category && first ? first : null
  const cards = featured ? rest : shown

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
                {[{ value: null, label: T.all }, ...chips].map((chip) => (
                  <Link
                    key={chip.value ?? 'all'}
                    href={newsListHref(chip.value)}
                    aria-current={chip.value === category ? 'page' : undefined}
                    className="sw-chip"
                  >
                    {chip.label}
                  </Link>
                ))}
              </nav>
            ) : null}
            {shown.length > 0 ? (
              <p className="sw-offer-count ml-auto">
                {shown.length} {plural(shown.length, [...T.count])}
              </p>
            ) : null}
          </div>
          {shown.length === 0 ? (
            <Glass className="p-6 text-lg text-ink-2 min-[641px]:p-8">{T.empty}</Glass>
          ) : (
            <div className="flex flex-col gap-4">
              {featured ? <FeaturedPost post={featured} /> : null}
              {cards.length > 0 ? <PostCardList posts={cards} /> : null}
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
            <Link
              href={T.listCta.link.href}
              data-motion="button"
              className="inline-flex min-h-13 shrink-0 items-center justify-center rounded-full bg-button px-6 font-extrabold text-accent-ink"
            >
              {T.listCta.link.label}
            </Link>
          </Glass>
        </div>
      </section>
    </>
  )
}
