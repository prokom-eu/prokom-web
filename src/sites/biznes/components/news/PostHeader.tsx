import { Container } from '@/components/ui/Container'
import type { PostView } from '@/lib/posts/view'
import { BZ_H1, BZ_LEAD } from '@/sites/biznes/typography'

import { Breadcrumbs, type Crumb } from '../Breadcrumbs'
import { NEWS_TEXTS } from './texts'

type Props = { post: PostView; crumbs: Crumb[] }

const CHIP = 'rounded-xl bg-surface-2 px-3.5 py-2 text-[13px] font-bold text-ink-2'

/**
 * Head of a post (board `Wpis`): breadcrumbs, „category · date · reading time”, H1, lead and the
 * chips with the sources and the verification date (spec. §6.9).
 */
export function PostHeader({ post, crumbs }: Props) {
  const minutes = `${post.minutes} min czytania`
  return (
    <header className="relative overflow-hidden pt-6 pb-10 sm:pt-8 sm:pb-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_at_80%_35%,var(--glow),transparent_60%)]"
      />
      <Container wide className="relative">
        <div className="mx-auto max-w-[920px]">
          <Breadcrumbs items={crumbs} />
          <p className="mt-6 inline-flex flex-wrap items-center gap-x-2 text-[15px] font-bold text-ink-2">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full bg-ok shadow-[0_0_0_4px_color-mix(in_srgb,var(--ok)_25%,transparent)]"
            />
            {[
              post.category,
              post.published && (
                <time key="published" dateTime={post.published.dateTime}>
                  {post.published.date}
                </time>
              ),
              minutes,
              post.updated && (
                <span key="updated">
                  aktualizacja <time dateTime={post.updated.dateTime}>{post.updated.date}</time>
                </span>
              ),
            ]
              .filter(Boolean)
              .flatMap((item, position) => (position > 0 ? [' · ', item] : [item]))}
          </p>
          <h1 id="post-h" className={`${BZ_H1} mt-4`}>
            {post.title}
          </h1>
          {post.lead && <p className={`${BZ_LEAD} mt-6 max-w-[62ch] text-ink-2`}>{post.lead}</p>}
          {(post.sources.length > 0 || post.verified) && (
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {post.sources.length > 0 && (
                <li className={CHIP}>
                  {NEWS_TEXTS.sources}: {post.sources.map(({ name }) => name).join(', ')}
                </li>
              )}
              {post.verified && (
                <li className={CHIP}>
                  Sprawdzono <time dateTime={post.verified.dateTime}>{post.verified.date}</time>
                </li>
              )}
            </ul>
          )}
        </div>
      </Container>
    </header>
  )
}
