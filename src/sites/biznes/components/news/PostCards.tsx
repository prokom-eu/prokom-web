import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { cx } from '@/components/ui/cx'
import type { PostListCard } from '@/lib/posts/cards'

type Props = {
  posts: readonly PostListCard[]
  /** The first card as the featured post (navy, board `Aktualnosci`). */
  featureFirst?: boolean
  /** Heading level of the card titles under the section's own heading. */
  headingLevel?: 'h2' | 'h3'
}

/**
 * Grid of post cards: cover on a light stage, „category · date”, title and lead. The whole
 * card is the link (the title's link stretched over it), so there is one link per post.
 */
export function PostCards({ posts, featureFirst = false, headingLevel = 'h2' }: Props) {
  const Title = headingLevel
  return (
    <ul className="grid gap-3.5 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3">
      {posts.map((post, position) => {
        const featured = featureFirst && position === 0
        const meta = [post.category, post.date].filter(Boolean).join(' · ')
        return (
          <li key={post.slug} className="flex">
            <article
              {...(featured && { 'data-surface': 'dark' })}
              className={cx(
                'relative flex w-full flex-col overflow-hidden rounded-[28px] transition-shadow has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-accent-text hover:shadow-[0_24px_48px_-28px_var(--glow)]',
                featured ? 'bg-surface-dark text-white' : 'bg-surface-2',
              )}
            >
              {post.cover && (
                <div className="flex h-[220px] items-center justify-center p-6">
                  <MediaImage
                    image={post.cover}
                    sizes="(min-width: 1080px) 30vw, (min-width: 640px) 45vw, 90vw"
                    eager={position === 0}
                    className="h-full w-auto max-w-full object-contain drop-shadow-[0_24px_28px_var(--glow)]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-[22px] pt-4">
                {meta && (
                  <p
                    className={cx(
                      'text-[13px] font-extrabold',
                      featured ? 'text-accent-on-dark' : 'text-accent-text',
                    )}
                  >
                    {post.dateTime ? (
                      <>
                        {post.category && `${post.category} · `}
                        <time dateTime={post.dateTime}>{post.date}</time>
                      </>
                    ) : (
                      meta
                    )}
                  </p>
                )}
                <Title className="font-display text-[1.4rem] leading-[1.1] font-extrabold tracking-[-0.01em] font-stretch-112%">
                  <Link
                    href={post.href}
                    className="outline-hidden after:absolute after:inset-0 after:content-['']"
                  >
                    {post.title}
                  </Link>
                </Title>
                {post.lead && (
                  <p
                    className={cx(
                      'text-[14px] leading-snug',
                      featured ? 'text-white/75' : 'text-ink-2',
                    )}
                  >
                    {post.lead}
                  </p>
                )}
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
