import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { PostListCard } from '@/lib/posts/cards'

import { categoryLook, DARK_TAG } from './look'
import { NEWS_TEXTS } from './texts'

export type NewsCardData = PostListCard & {
  categoryValue: string | null
  /** Reading time in minutes (`getPostList`). */
  minutes: number
}

type CardProps = {
  post: NewsCardData
  headingLevel?: 'h2' | 'h3'
  eager?: boolean
}

/** „Kategoria · 15.11.2026” with the date as `<time>`. */
export function PostMeta({ post, className }: { post: NewsCardData; className?: string }) {
  if (!post.category && !post.date) return null
  return (
    <p className={cx('text-[13px] font-extrabold', className)}>
      {post.category}
      {post.category && post.date && ' · '}
      {post.date && (post.dateTime ? <time dateTime={post.dateTime}>{post.date}</time> : post.date)}
    </p>
  )
}

/**
 * One post card (redesign 15.11): the category's drawn mark (or the cover from the panel),
 * „category · date”, title, lead and reading time. The whole card is the link — the title's link
 * stretched over it — so there is one link per post. On a phone a compact row: no lead (§4
 * `App-Aktualnosci-390`: „kategoria · data, tytuł”).
 */
export function PostCard({ post, headingLevel = 'h3', eager = false }: CardProps) {
  const Title = headingLevel
  const look = categoryLook(post.categoryValue)
  return (
    <article className="group/post relative flex h-full w-full flex-col rounded-[24px] bg-card p-[18px] shadow-[inset_0_0_0_1px_var(--border)] transition-[box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1px_var(--border),0_28px_50px_-30px_var(--glow)] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-accent-text motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6">
      {post.cover && (
        <div className="mb-5 flex h-[150px] items-center justify-center rounded-2xl bg-surface-2 p-5 max-sm:hidden">
          <MediaImage
            image={post.cover}
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 90vw"
            eager={eager}
            className="h-full w-auto max-w-full object-contain"
          />
        </div>
      )}
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cx(
            'grid size-10 shrink-0 place-items-center rounded-xl sm:size-11',
            look.tile,
          )}
        >
          <Icon name={look.icon} className="size-5" />
        </span>
        <PostMeta post={post} className={cx(look.tag, DARK_TAG)} />
      </div>
      <Title className="mt-3.5 font-display text-[1.125rem] leading-[1.15] font-extrabold tracking-[-0.01em] text-balance font-stretch-112% sm:mt-4 sm:text-[1.3rem]">
        <Link
          href={post.href}
          className="outline-hidden after:absolute after:inset-0 after:rounded-[24px] after:content-['']"
        >
          {post.title}
        </Link>
      </Title>
      {post.lead && (
        <p className="mt-2.5 line-clamp-3 text-[14.5px] leading-snug text-ink-2 max-sm:hidden">
          {post.lead}
        </p>
      )}
      <p className="mt-auto flex items-center justify-between gap-3 pt-4 text-[13px] font-bold text-ink-2 sm:pt-5">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="clock" className="size-4" strokeWidth={2.1} />
          {NEWS_TEXTS.minutes(post.minutes)}
        </span>
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full bg-surface-2 text-ink transition-[background-color,color,translate] duration-300 group-hover/post:translate-x-0.5 group-hover/post:bg-accent-text group-hover/post:text-accent-ink motion-reduce:transition-none"
        >
          <Icon name="arrow" className="size-4" strokeWidth={2.2} />
        </span>
      </p>
    </article>
  )
}

type GridProps = {
  posts: readonly NewsCardData[]
  headingLevel?: 'h2' | 'h3'
  /** Load the first card's cover at once: only when the grid opens the page (a category view). */
  eagerFirst?: boolean
  /**
   * Alone on the page: 3 columns from 1080 px. Next to the topics column: 3 from 1280 px, and only
   * with 3+ posts — two posts take the row in halves, no empty third slot.
   */
  wide?: boolean
}

/** Grid of post cards; on a phone a list of compact rows. */
export function PostCards({
  posts,
  headingLevel = 'h3',
  wide = true,
  eagerFirst = false,
}: GridProps) {
  return (
    <ul
      className={cx(
        'grid gap-2.5 sm:gap-3.5 min-[640px]:grid-cols-2',
        wide ? 'min-[1080px]:grid-cols-3' : posts.length >= 3 && 'min-[1280px]:grid-cols-3',
      )}
    >
      {posts.map((post, position) => (
        <li key={post.slug} className="flex">
          <PostCard post={post} headingLevel={headingLevel} eager={eagerFirst && position === 0} />
        </li>
      ))}
    </ul>
  )
}
