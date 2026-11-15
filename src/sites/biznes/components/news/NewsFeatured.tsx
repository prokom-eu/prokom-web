import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'

import { categoryLook } from './look'
import { PostCard, PostMeta, type NewsCardData } from './PostCards'
import { NEWS_TEXTS } from './texts'

type Props = { posts: readonly NewsCardData[] }

/**
 * „Najnowsze” (redesign 15.11): the newest post as a large navy card — its category's mark drawn
 * big behind the text, or the cover from the panel — and the next two stacked beside it.
 */
export function NewsFeatured({ posts }: Props) {
  const [lead, ...side] = posts
  if (!lead) return null
  const look = categoryLook(lead.categoryValue)
  return (
    <section aria-labelledby="najnowsze-h" className="pt-2 pb-8 sm:pb-12">
      <Container wide>
        <h2
          id="najnowsze-h"
          className="mb-4 text-[13px] font-extrabold tracking-[0.12em] text-ink-2 uppercase"
        >
          {NEWS_TEXTS.featured}
        </h2>
        <div className="grid gap-2.5 sm:gap-3.5 min-[1080px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <article
            data-surface="dark"
            className="group/lead relative isolate flex min-h-[360px] flex-col overflow-hidden rounded-[32px] bg-surface-dark p-6 text-white has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-accent-on-dark sm:p-10 min-[1080px]:min-h-[480px] min-[1080px]:p-12"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_15%,color-mix(in_srgb,var(--accent-on-dark)_30%,transparent),transparent_55%),radial-gradient(ellipse_at_0%_100%,color-mix(in_srgb,var(--accent-on-dark)_14%,transparent),transparent_50%)]"
            />
            {lead.cover ? (
              <div className="mb-8 flex h-[140px] items-center justify-start sm:h-[170px]">
                <MediaImage
                  image={lead.cover}
                  sizes="(min-width: 1080px) 40vw, 90vw"
                  eager
                  className="h-full w-auto max-w-full object-contain drop-shadow-[0_24px_28px_rgba(0,0,0,0.35)]"
                />
              </div>
            ) : (
              <Icon
                name={look.icon}
                strokeWidth={0.9}
                className="pointer-events-none absolute -right-10 -bottom-12 -z-10 size-[260px] text-accent-on-dark/15 transition-transform duration-700 group-hover/lead:-translate-y-2 group-hover/lead:rotate-[-4deg] motion-reduce:transition-none sm:size-[340px] min-[1080px]:size-[400px]"
              />
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-extrabold tracking-[0.06em] text-white uppercase ring-1 ring-white/15 ring-inset">
                {NEWS_TEXTS.featuredLabel}
              </span>
              <PostMeta post={lead} className="text-accent-on-dark" />
            </div>
            <h3 className="mt-5 max-w-[22ch] font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.04] font-extrabold tracking-[-0.025em] text-balance font-stretch-112%">
              <Link
                href={lead.href}
                className="outline-hidden after:absolute after:inset-0 after:content-['']"
              >
                {lead.title}
              </Link>
            </h3>
            {lead.lead && (
              <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-white/75 sm:text-[17px]">
                {lead.lead}
              </p>
            )}
            <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-8">
              <span
                aria-hidden="true"
                className="inline-flex min-h-[52px] items-center gap-2.5 rounded-2xl bg-white px-6 font-extrabold text-surface-dark transition-colors group-hover/lead:bg-white/85"
              >
                {NEWS_TEXTS.read}
                <Icon
                  name="arrow"
                  className="size-4 transition-transform group-hover/lead:translate-x-1 motion-reduce:transition-none"
                  strokeWidth={2.2}
                />
              </span>
              <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-white/70">
                <Icon name="clock" className="size-4" strokeWidth={2.1} />
                {NEWS_TEXTS.minutes(lead.minutes)}
              </span>
            </div>
          </article>
          {side.length > 0 && (
            <ul className="grid gap-2.5 sm:gap-3.5 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-1">
              {side.map((post) => (
                <li key={post.slug} className="flex">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  )
}
