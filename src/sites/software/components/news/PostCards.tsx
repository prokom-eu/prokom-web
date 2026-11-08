import Link from 'next/link'

import { cx } from '@/components/ui/cx'

import { SOFTWARE_NEWS_TEXTS as T } from './texts'

export type SoftwarePostCard = {
  slug: string
  title: string
  href: string
  category: string | null
  categoryValue: string
  date: string | null
  dateTime: string | null
  lead: string | null
}

/**
 * The picture of a news category (ZMIANY-v24 §1 pkt 4, §9.4; aurora.css `.au-pc-art`): orbs and a
 * ring in the category's colour (`--news-art-*`), no stock images. Decorative: the card's text
 * says it all.
 */
export function PostArt({ category, className }: { category: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-card-media
      data-cat={category}
      className={cx('sw-art', className)}
    >
      <i className="sw-art-ring" />
      <i className="sw-art-orb" />
      <i className="sw-art-dot" />
    </span>
  )
}

function Meta({ post, featured = false }: { post: SoftwarePostCard; featured?: boolean }) {
  const parts = [post.category, featured ? T.featured : null].filter(Boolean)
  return parts.length > 0 ? <span className="sw-eyebrow">{parts.join(' · ')}</span> : null
}

function DateLine({ post }: { post: SoftwarePostCard }) {
  return post.date && post.dateTime ? (
    <time dateTime={post.dateTime} className="text-xs text-ink-3">
      {post.date}
    </time>
  ) : null
}

/** The newest post, big (board `AU-aktualnosci`): picture on the left, text on the right. */
export function FeaturedPost({ post }: { post: SoftwarePostCard }) {
  return (
    <Link href={post.href} data-card className="sw-glass sw-post-featured">
      <PostArt category={post.categoryValue} className="sw-post-featured-art" />
      <span className="flex flex-col gap-3 p-[22px] min-[641px]:p-10">
        <Meta post={post} featured />
        <h2 className="font-display text-2xl font-black leading-tight tracking-tight min-[641px]:text-[34px]">
          {post.title}
        </h2>
        {post.lead ? <span className="text-ink-2">{post.lead}</span> : null}
        <DateLine post={post} />
        <span className="mt-2 font-extrabold text-accent-text">{T.read}</span>
      </span>
    </Link>
  )
}

/** Cards of the list and of „Powiązane poradniki”: 3 columns, 2 on a tablet, 1 on the phone. */
export function PostCardList({
  posts,
  headingLevel = 'h2',
}: {
  posts: readonly SoftwarePostCard[]
  headingLevel?: 'h2' | 'h3'
}) {
  const Title = headingLevel
  return (
    <ul className="sw-post-grid" data-rise-group>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={post.href} data-card className="sw-glass sw-post-card">
            <PostArt category={post.categoryValue} className="sw-post-card-art" />
            <span className="flex flex-col gap-2 px-1 pt-4 pb-1">
              <Meta post={post} />
              <Title className="font-display text-lg font-extrabold leading-snug">
                {post.title}
              </Title>
              {post.lead ? <span className="text-sm text-ink-2">{post.lead}</span> : null}
              <DateLine post={post} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
