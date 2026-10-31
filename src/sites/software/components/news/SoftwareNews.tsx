import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { PostListItem } from '@/lib/posts/data'
import { categoryChips, newsListHref, type PostCategory } from '@/lib/posts/list'

import { Breadcrumbs } from '../Breadcrumbs'
import { SwCallToAction } from '../SwCallToAction'
import { FeaturedPost, PostCardList } from './PostCards'
import { SOFTWARE_NEWS_TEXTS as T } from './texts'

type Props = { posts: readonly PostListItem[]; category: PostCategory | null }

/**
 * `/aktualnosci` in the Software look (board `Aktualnosci`, spec. §6.8): heading with the
 * category chips (only those with posts), the newest post big and the rest in cards; on the
 * phone a compact list. Posts of this tenant only (the route loads them).
 */
export function SoftwareNews({ posts, category }: Props) {
  const chips = categoryChips(posts.map((post) => post.categoryValue))
  const shown = category ? posts.filter((post) => post.categoryValue === category) : posts
  const [first, ...rest] = shown
  const featured = !category && first ? first : null
  const cards = featured ? rest : shown

  return (
    <>
      <section className="pt-6 pb-8 min-[641px]:pt-10 min-[641px]:pb-12">
        <Container wide>
          <Breadcrumbs current={T.title} />
          <div className="mt-3 flex flex-col gap-6 min-[1081px]:flex-row min-[1081px]:items-end min-[1081px]:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text min-[641px]:text-sm">
                {T.eyebrow}
              </p>
              <h1 className="mt-3 max-w-[760px] font-display text-[40px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-[clamp(44px,5vw,68px)]">
                {T.heading}
              </h1>
              <p className="mt-4 max-w-[56ch] text-lg text-ink-2 min-[641px]:text-xl">{T.lead}</p>
            </div>
            {chips.length > 1 ? (
              <nav aria-label="Kategorie" className="flex flex-wrap gap-2">
                {[{ value: null, label: T.all }, ...chips].map((chip) => {
                  const active = chip.value === category
                  return (
                    <Link
                      key={chip.value ?? 'all'}
                      href={newsListHref(chip.value)}
                      aria-current={active ? 'page' : undefined}
                      className={cx(
                        'inline-flex min-h-11 items-center rounded-full px-4 text-sm font-extrabold',
                        active ? 'bg-button text-accent-ink' : 'border border-border bg-card',
                      )}
                    >
                      {chip.label}
                    </Link>
                  )
                })}
              </nav>
            ) : null}
          </div>
        </Container>
      </section>
      <section aria-label="Wpisy" className="pb-6">
        <Container wide>
          {shown.length === 0 ? (
            <p className="rounded-[24px] bg-surface-2 p-6 text-lg text-ink-2 min-[641px]:p-8">
              {T.empty}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {featured ? <FeaturedPost post={featured} /> : null}
              {cards.length > 0 ? <PostCardList posts={cards} /> : null}
            </div>
          )}
        </Container>
      </section>
      <SwCallToAction
        block={{
          blockType: 'callToAction',
          heading: T.contact.heading,
          text: T.contact.text,
          link: T.contact.link,
        }}
      />
    </>
  )
}
