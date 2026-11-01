import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import type { PostCard } from '@/lib/posts/cards'
import type { OutlineItem } from '@/lib/posts/content'
import type { PostView } from '@/lib/posts/view'

import { DayCount } from '../../blocks/BzKsef/DayCount'
import { STICKY_ACTION_BUTTON, StickyAction } from '../mobile/StickyAction'
import { PageLink } from '../PageLink'
import { NEWS_TEXTS } from './texts'

/** „W skrócie” box above the content (board `Wpis`; spec. §6.9 „ramka Ważne”). */
export function PostSummary({ text }: { text: string }) {
  return (
    <section
      aria-label="W skrócie"
      className="rounded-r-2xl border-l-4 border-accent-text bg-surface-2 px-5 py-4 text-[17px] leading-relaxed text-ink-2"
    >
      <b className="text-ink">{NEWS_TEXTS.summary}</b> {text}
    </section>
  )
}

/** „Źródło” box under the content: every source as a link with its verification date. */
export function PostSources({ sources }: { sources: PostView['sources'] }) {
  if (sources.length === 0) return null
  return (
    <section
      aria-labelledby="zrodla-h"
      className="mt-10 rounded-2xl bg-surface-2 px-5 py-4 text-[14px] leading-relaxed text-ink-2"
    >
      <h2 id="zrodla-h" className="font-bold text-ink">
        {NEWS_TEXTS.sources}
      </h2>
      <ul className="mt-2 flex flex-col gap-1">
        {sources.map((source) => (
          <li key={source.url + source.name}>
            <a
              href={source.url}
              rel="noopener noreferrer"
              target="_blank"
              className="font-semibold text-accent-text underline decoration-2 underline-offset-4"
            >
              {source.name}
              <span className="sr-only"> (otwiera się w nowej karcie)</span>
            </a>
            {source.verified && (
              <>
                {' '}
                · sprawdzone <time dateTime={source.verified.dateTime}>{source.verified.date}</time>
              </>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[13px] text-ink-2">{NEWS_TEXTS.disclaimer}</p>
    </section>
  )
}

/** Table of contents: the post's h2 headings as anchors (spec. §6.9). */
export function PostToc({ outline }: { outline: readonly OutlineItem[] }) {
  return (
    <ol className="flex flex-col gap-2 text-[15px]">
      {outline.map(({ id, title }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            className="font-semibold text-ink-2 hover:text-accent-text hover:underline"
          >
            {title}
          </a>
        </li>
      ))}
    </ol>
  )
}

const CARD = 'rounded-[24px] bg-card p-6 shadow-[inset_0_0_0_1px_var(--border)]'

type AsideProps = {
  post: PostView
  outline: readonly OutlineItem[]
  related: readonly PostCard[]
}

/**
 * Side column of a post (board `Wpis`): the CTA card, the day counter and „Czytaj też”; below
 * them the table of contents, which stays in view while reading (from 1080 px).
 */
export function PostAside({ post, outline, related }: AsideProps) {
  return (
    <div className="flex h-full flex-col gap-3.5">
      {post.cta && (
        <div data-surface="dark" className="rounded-[24px] bg-surface-dark p-6 text-white">
          {post.cta.eyebrow && (
            <p className="text-[13px] font-extrabold tracking-[0.08em] text-accent-on-dark uppercase">
              {post.cta.eyebrow}
            </p>
          )}
          <p className="mt-2 font-display text-[1.45rem] leading-[1.1] font-extrabold font-stretch-112%">
            {post.cta.title}
          </p>
          {post.cta.text && (
            <p className="mt-3 text-[14px] leading-snug text-white/75">{post.cta.text}</p>
          )}
          <PageLink href={post.cta.link.href} kind="light" className="mt-5 w-full">
            {post.cta.link.label}
          </PageLink>
        </div>
      )}
      {/* Phone (MOBILE-APLIKACJA §1): the post's CTA sticks to the bottom of the screen —
          outside the dark card, whose `data-surface` would recolour the bar. */}
      {post.cta && (
        <StickyAction>
          <Link href={post.cta.link.href} className={STICKY_ACTION_BUTTON}>
            {post.cta.link.label}
          </Link>
        </StickyAction>
      )}
      {post.countdown && (
        <div className={CARD}>
          <p className="font-bold text-ink">{post.countdown.label}</p>
          <DayCount
            date={post.countdown.date}
            className="mt-1 block font-display text-[3.25rem] leading-none font-extrabold text-accent-text tabular-nums font-stretch-112%"
          />
          {post.countdown.caption && (
            <p className="mt-2 text-[14px] text-ink-3">{post.countdown.caption}</p>
          )}
        </div>
      )}
      {related.length > 0 && (
        <nav aria-label={NEWS_TEXTS.readAlso} className={CARD}>
          <p className="font-bold text-ink">{NEWS_TEXTS.readAlso}</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.href}
                  className="inline font-bold text-accent-text hover:underline"
                >
                  {item.title}
                  <Icon
                    name="arrow"
                    strokeWidth={2.4}
                    className="ml-1 inline size-3.5 align-[-2px]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {outline.length > 1 && (
        <nav
          aria-label={NEWS_TEXTS.outline}
          className={`${CARD} sticky top-28 hidden min-[1080px]:block`}
        >
          <p className="mb-3 font-bold text-ink">{NEWS_TEXTS.outline}</p>
          <PostToc outline={outline} />
        </nav>
      )}
    </div>
  )
}

/** The table of contents on narrow screens: folded above the content. */
export function PostTocMobile({ outline }: { outline: readonly OutlineItem[] }) {
  if (outline.length < 2) return null
  return (
    <details className={`${CARD} mb-8 min-[1080px]:hidden`}>
      <summary className="cursor-pointer font-bold text-ink">{NEWS_TEXTS.outline}</summary>
      <nav aria-label={NEWS_TEXTS.outline} className="mt-3">
        <PostToc outline={outline} />
      </nav>
    </details>
  )
}
