import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { PostGroup } from '@/lib/posts/groups'
import { newsListHref } from '@/lib/posts/list'
import { plural } from '@/lib/plural'
import { BZ_H2 } from '@/sites/biznes/typography'

import { categoryLook } from './look'
import { PostCard, PostCards, type NewsCardData } from './PostCards'
import { CATEGORY_INTROS, NEWS_TEXTS } from './texts'

type Props = {
  groups: readonly PostGroup<NewsCardData>[]
  /** Posts per category on the whole list (with the featured ones) — the counts shown. */
  totals: Partial<Record<string, number>>
}

const count = (n: number) => `${n} ${plural(n, NEWS_TEXTS.posts)}`
const anchor = (value: string) => `temat-${value}`

/**
 * All posts by topic (redesign 15.11): on a desktop a sticky column of topics (anchors with the
 * counts) beside the sections; each section — its mark, heading, count and one line about the
 * topic, then its cards. Every post stays one click from the list (no „show more”).
 */
export function NewsGroups({ groups, totals }: Props) {
  if (groups.length === 0) return null
  return (
    <section aria-label="Wpisy" className="pt-6 pb-14 sm:pt-10 sm:pb-20">
      <Container wide>
        <div className="grid gap-10 min-[1080px]:grid-cols-[230px_minmax(0,1fr)] min-[1080px]:gap-12">
          <nav aria-label="Tematy" className="max-[1079px]:hidden">
            <ul className="sticky top-28 flex flex-col gap-1">
              {groups.map((group) => {
                const look = categoryLook(group.value)
                return (
                  <li key={group.value}>
                    <a
                      href={`#${anchor(group.value)}`}
                      className="flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 font-bold text-ink transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-accent-text"
                    >
                      <span
                        aria-hidden="true"
                        className={cx('grid size-8 place-items-center rounded-lg', look.tile)}
                      >
                        <Icon name={look.icon} className="size-4" />
                      </span>
                      <span className="flex-1">{group.label}</span>
                      <span className="text-[13px] text-ink-2 tabular-nums">
                        {totals[group.value] ?? group.posts.length}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="flex flex-col gap-12 sm:gap-16">
            {groups.map((group) => {
              const look = categoryLook(group.value)
              const intro = CATEGORY_INTROS[group.value]
              const id = anchor(group.value)
              const total = totals[group.value] ?? group.posts.length
              // One post: heading and card side by side, not one card under a wide empty row.
              const single = group.posts.length === 1
              return (
                <section
                  key={group.value}
                  aria-labelledby={`${id}-h`}
                  id={id}
                  className={cx(
                    'scroll-mt-28',
                    single && 'grid gap-5 min-[860px]:grid-cols-2 min-[860px]:gap-6',
                  )}
                >
                  <header
                    className={cx(
                      'flex flex-wrap items-end justify-between gap-x-6 gap-y-3',
                      single
                        ? 'content-start min-[860px]:flex-col min-[860px]:items-start min-[860px]:border-t min-[860px]:border-border min-[860px]:pt-6'
                        : 'mb-5 border-b border-border pb-5 sm:mb-6',
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        aria-hidden="true"
                        className={cx(
                          'grid size-12 shrink-0 place-items-center rounded-2xl sm:size-14',
                          look.tile,
                        )}
                      >
                        <Icon name={look.icon} className="size-6" />
                      </span>
                      <div>
                        <h2 id={`${id}-h`} className={BZ_H2}>
                          {group.label}
                          <span className="ml-3 align-middle text-[14px] font-bold tracking-normal text-ink-2 font-stretch-100%">
                            {count(total)}
                          </span>
                        </h2>
                        {intro && (
                          <p className="mt-2 max-w-[60ch] text-[15px] leading-snug text-ink-2">
                            {intro}
                          </p>
                        )}
                      </div>
                    </div>
                    {total > 1 && (
                      <Link
                        href={newsListHref(group.value)}
                        className="inline-flex min-h-11 items-center gap-2 text-[14px] font-extrabold text-accent-text hover:text-ink max-sm:hidden"
                      >
                        {NEWS_TEXTS.onlyCategory}
                        <span className="sr-only">: {group.label}</span>
                        <Icon name="arrow" className="size-4" strokeWidth={2.2} />
                      </Link>
                    )}
                  </header>
                  {single ? (
                    <div className="flex">
                      <PostCard post={group.posts[0]!} headingLevel="h3" />
                    </div>
                  ) : (
                    <PostCards posts={group.posts} wide={false} />
                  )}
                </section>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}
