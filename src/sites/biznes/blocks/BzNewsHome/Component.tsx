import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { getEnv } from '@/lib/env'
import { postDate } from '@/lib/posts/cards'
import { getPostList, getSisterLinePostLinks } from '@/lib/posts/data'
import { NEWS_PATH } from '@/lib/posts/list'
import type { SisterLine } from '@/lib/posts/sister'
import type { BzNewsHomeBlock as BzNewsHomeBlockData } from '@/payload-types'

import { SplitHead } from '../../components/home/SplitHead'

/** Cards on the home page (plan 0611 §7.1 pkt 12). */
const CARDS = 3

const LINE_NAME: Record<SisterLine, string> = {
  instalacje: 'PRO-KOM Instalacje',
  software: 'PRO-KOM Software',
}

const CARD =
  'relative flex w-full flex-col overflow-hidden rounded-[28px] transition-shadow has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-accent-text hover:shadow-[0_24px_48px_-28px_var(--glow)]'
const TITLE =
  'font-display text-[1.3rem] leading-[1.12] font-extrabold tracking-[-0.01em] font-stretch-112%'
const STRETCH = 'outline-hidden after:absolute after:inset-0 after:content-[""]'

/**
 * „Aktualności” of the Biznes home page, `#aktualnosci` (plan 0611 §7.1 pkt 12, D8): the three
 * newest Biznes posts. With fewer, title-only cards link to the newest posts of Instalacje and
 * Software on their own sites — no lead, no cover (no copied text, SEO). No post at all = nothing.
 */
export async function BzNewsHomeBlock({
  block,
  tenantId,
}: {
  block: BzNewsHomeBlockData
  tenantId: number
}) {
  const own = (await getPostList(tenantId, 'biznes')).slice(0, CARDS)
  // Links to the other lines' sites in this environment (tenant domains). Locally one app serves
  // every domain on its own port; reading the request host would make the home page dynamic.
  const { SITE_ENV } = getEnv()
  const sister = await getSisterLinePostLinks(tenantId, CARDS - own.length, {
    siteEnv: SITE_ENV,
    port: SITE_ENV === 'local' ? (process.env.PORT ?? '3000') : null,
  })
  if (own.length + sister.length === 0) return null
  return (
    <section
      id="aktualnosci"
      aria-labelledby="aktualnosci-h"
      className="scroll-mt-24 py-12 sm:py-20"
    >
      <Container wide>
        <SplitHead
          id="aktualnosci-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
        >
          {block.allLabel && own.length > 0 && (
            <Link
              href={NEWS_PATH}
              className="inline-flex items-center gap-2 font-extrabold text-accent-text hover:underline"
            >
              {block.allLabel}
              <Icon name="arrow" className="size-4" />
            </Link>
          )}
        </SplitHead>
        <ul
          className="grid gap-3.5 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3"
          data-news-home
          data-reveal-cards=""
        >
          {own.map((post, position) => (
            <li key={post.slug} className="flex">
              <article className={cx(CARD, 'bg-surface-2')}>
                {post.cover && (
                  <div className="flex h-[180px] items-center justify-center p-5">
                    <MediaImage
                      image={post.cover}
                      sizes="(min-width: 1080px) 30vw, (min-width: 640px) 45vw, 90vw"
                      eager={false}
                      className="h-full w-auto max-w-full object-contain drop-shadow-[0_24px_28px_var(--glow)]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-[22px] pt-4">
                  <p className="text-[13px] font-extrabold text-accent-text">
                    {post.category && `${post.category} · `}
                    {post.dateTime && <time dateTime={post.dateTime}>{post.date}</time>}
                  </p>
                  <h3 className={TITLE}>
                    <Link href={post.href} className={STRETCH}>
                      {post.title}
                    </Link>
                  </h3>
                  {post.lead && position === 0 && (
                    <p className="text-[14px] leading-snug text-ink-2">{post.lead}</p>
                  )}
                </div>
              </article>
            </li>
          ))}
          {sister.map((link) => {
            const published = postDate(link.publishedAt)
            return (
              <li key={link.href} className="flex" data-sister-line={link.line}>
                <article className={cx(CARD, 'bg-card shadow-[inset_0_0_0_1px_var(--border)]')}>
                  <div className="flex flex-1 flex-col gap-2 p-[22px]">
                    <p className="text-[13px] font-extrabold text-ink-2">
                      {LINE_NAME[link.line]}
                      {published && (
                        <>
                          {' · '}
                          <time dateTime={published.dateTime}>{published.date}</time>
                        </>
                      )}
                    </p>
                    <h3 className={TITLE}>
                      <a href={link.href} className={STRETCH}>
                        {link.title}
                        <span className="sr-only"> (strona {LINE_NAME[link.line]})</span>
                      </a>
                    </h3>
                    <span
                      aria-hidden="true"
                      className="mt-auto pt-2 text-[14px] font-extrabold text-accent-text"
                    >
                      Czytaj na stronie linii ↗
                    </span>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
