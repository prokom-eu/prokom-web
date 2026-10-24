import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getLatestPosts } from '@/lib/posts/data'
import type { BzNewsBlock as BzNewsBlockData } from '@/payload-types'

type Props = { block: BzNewsBlockData; tenantId: number }

/** Board: three cards. */
const LATEST = 3

/**
 * „Ostatnio w Aktualnościach” (spec. §4 pkt 11, ZMIANY-v20 §2.7): category, date, title and
 * „Czytaj →” of the latest posts; fewer posts → fewer cards, none → no section.
 */
export async function BzNewsBlock({ block, tenantId }: Props) {
  const posts = await getLatestPosts(tenantId, LATEST)
  if (posts.length === 0) return null
  return (
    <section aria-labelledby="aktualnosci-h" className="pt-2 pb-16 sm:pb-24">
      <Container wide>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2
            id="aktualnosci-h"
            className="font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-extrabold"
          >
            {block.heading}
          </h2>
          {block.allLabel && (
            <Link
              href="/aktualnosci"
              className="inline-flex items-center gap-1.5 font-extrabold text-accent-text hover:underline"
            >
              {block.allLabel}
              <Icon name="arrow" strokeWidth={2.4} className="size-4" />
            </Link>
          )}
        </div>
        <ul className="mt-6 grid gap-3 min-[1080px]:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug} className="flex">
              <article className="flex w-full flex-col rounded-[22px] bg-card p-6 shadow-[inset_0_0_0_1px_var(--border)]">
                <p className="flex items-center gap-3 text-[13px]">
                  {post.category && (
                    <span className="rounded-md bg-accent-soft px-2 py-1 font-bold text-ink">
                      {post.category}
                    </span>
                  )}
                  {post.date && post.dateTime && (
                    <time dateTime={post.dateTime} className="text-ink-2">
                      {post.date}
                    </time>
                  )}
                </p>
                <h3 className="mt-4 text-[19px] leading-snug font-extrabold">
                  <Link href={post.href} className="text-ink hover:text-accent-text">
                    {post.title}
                  </Link>
                </h3>
                {block.readLabel && (
                  <Link
                    href={post.href}
                    aria-label={`${block.readLabel}: ${post.title}`}
                    className="mt-auto inline-flex items-center gap-1.5 self-start pt-6 font-extrabold text-accent-text hover:underline"
                  >
                    {block.readLabel}
                    <Icon name="arrow" strokeWidth={2.4} className="size-4" />
                  </Link>
                )}
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
