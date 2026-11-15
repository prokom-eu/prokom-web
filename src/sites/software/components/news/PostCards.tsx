import { IntentLink as Link } from '@/components/shared/IntentLink'

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
  /** Reading time (the list); missing → only the date. */
  minutes?: number
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

/** „15.11.2026 · 6 min czytania” — the date and the reading time, whichever the post has. */
function MetaLine({ post }: { post: SoftwarePostCard }) {
  const date = post.date && post.dateTime ? <time dateTime={post.dateTime}>{post.date}</time> : null
  const minutes = post.minutes ? `${post.minutes} ${T.minutes}` : null
  if (!date && !minutes) return null
  return (
    <span className="sw-post-meta">
      {date}
      {date && minutes ? <span aria-hidden="true"> · </span> : null}
      {minutes}
    </span>
  )
}

/** The newest post, big (board `AU-aktualnosci`): picture on the left, text on the right. */
export function FeaturedPost({ post }: { post: SoftwarePostCard }) {
  return (
    <Link href={post.href} data-card className="sw-glass sw-glass-featured sw-post-featured">
      <PostArt category={post.categoryValue} className="sw-post-featured-art" />
      <span className="sw-post-featured-body">
        <Meta post={post} featured />
        <h2 className="sw-post-featured-title font-display font-black leading-tight tracking-tight">
          {post.title}
        </h2>
        {post.lead ? <span className="sw-post-lead text-ink-2">{post.lead}</span> : null}
        <MetaLine post={post} />
        <span className="sw-post-more font-extrabold text-accent-text">{T.read}</span>
      </span>
    </Link>
  )
}

/**
 * Cards of the list and of „Powiązane poradniki”: 3 columns, 2 on a tablet; on the phone a list
 * of rows like an app (small picture, title, date and time, no lead). `compact` = the two posts
 * beside the featured one: rows on every width.
 */
export function PostCardList({
  posts,
  headingLevel = 'h2',
  compact = false,
  label,
}: {
  posts: readonly SoftwarePostCard[]
  headingLevel?: 'h2' | 'h3'
  compact?: boolean
  label?: string
}) {
  const Title = headingLevel
  return (
    <ul
      className={cx('sw-post-grid', compact && 'sw-post-grid-compact')}
      aria-label={label}
      data-rise-group
    >
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={post.href} data-card className="sw-glass sw-post-card">
            <PostArt category={post.categoryValue} className="sw-post-card-art" />
            <span className="sw-post-card-body">
              <Meta post={post} />
              <Title className="sw-post-card-title font-display font-extrabold leading-snug">
                {post.title}
              </Title>
              {post.lead ? (
                <span className="sw-post-lead text-sm text-ink-2">{post.lead}</span>
              ) : null}
              <MetaLine post={post} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
