import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'

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
 * Each category has its own picture (spec. §6.8): one flat accent background (ADR-015 v23) and
 * the category's icon — no stock images.
 */
const SCENES: Record<string, { icon: IconName }> = {
  poradnik: { icon: 'doc' },
  nowosci: { icon: 'star' },
  realizacje: { icon: 'brief' },
}
const FALLBACK = { icon: 'doc' as IconName }

/** The category picture of a post card. Decorative: the card's text says it all. */
export function PostScene({ category, className }: { category: string; className?: string }) {
  const scene = SCENES[category] ?? FALLBACK
  return (
    // `data-card-media`: grows a little when its card is hovered; the card clips it (SWV7).
    <div
      aria-hidden="true"
      data-card-media
      className={cx('relative overflow-hidden bg-accent-soft', className)}
    >
      <span className="absolute top-[18%] left-[8%] h-[120%] w-[46%] rotate-[-6deg] rounded-xl bg-white/85 p-3 shadow-raised">
        <span className="block h-1.5 w-1/2 rounded-full bg-accent" />
        {[0, 1, 2, 3, 4].map((line) => (
          <span key={line} className="mt-2 block h-1 rounded-full bg-chip" />
        ))}
      </span>
      <span className="absolute right-4 bottom-4 grid size-12 place-items-center rounded-2xl bg-card text-ink shadow-raised">
        <Icon name={scene.icon} className="size-5" />
      </span>
    </div>
  )
}

function Meta({ post }: { post: SoftwarePostCard }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
      {post.category ? (
        <span className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-extrabold text-accent-text">
          {post.category}
        </span>
      ) : null}
      {post.date && post.dateTime ? (
        <time dateTime={post.dateTime} className="font-bold">
          {post.date}
        </time>
      ) : null}
    </p>
  )
}

/** The first post of the list, big (board `Aktualnosci`); a regular card on the phone. */
export function FeaturedPost({ post }: { post: SoftwarePostCard }) {
  return (
    <Link
      href={post.href}
      data-card
      className="group grid overflow-hidden rounded-[28px] border border-border bg-card shadow-raised min-[861px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
    >
      <PostScene category={post.categoryValue} className="aspect-[16/9] min-[861px]:aspect-auto" />
      <span className="flex flex-col gap-3 p-[22px] min-[641px]:p-10">
        <Meta post={post} />
        <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight min-[641px]:text-[34px]">
          {post.title}
        </h2>
        {post.lead ? <span className="text-ink-2">{post.lead}</span> : null}
        <span className="mt-1 font-extrabold text-accent-text">Czytaj →</span>
      </span>
    </Link>
  )
}

/**
 * Cards of the list and of „Powiązane poradniki”: 3 columns from 1081 px; on the phone a
 * compact row with a small picture (spec. §6.8).
 */
export function PostCardList({
  posts,
  headingLevel = 'h2',
}: {
  posts: readonly SoftwarePostCard[]
  headingLevel?: 'h2' | 'h3'
}) {
  const Title = headingLevel
  return (
    <ul
      data-reveal-cards
      className="grid gap-2.5 min-[641px]:grid-cols-2 min-[641px]:gap-3 min-[1081px]:grid-cols-3"
    >
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={post.href}
            data-card
            className="grid h-full grid-cols-[88px_minmax(0,1fr)] overflow-hidden rounded-[22px] border border-border bg-card min-[641px]:flex min-[641px]:flex-col"
          >
            <PostScene category={post.categoryValue} className="min-[641px]:aspect-[16/6]" />
            <span className="flex flex-col gap-2 p-3.5 min-[641px]:p-5">
              <Meta post={post} />
              <Title className="font-display text-base font-extrabold leading-snug min-[641px]:text-lg">
                {post.title}
              </Title>
              {post.lead ? (
                <span className="hidden text-sm text-ink-2 min-[641px]:block">{post.lead}</span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
