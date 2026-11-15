import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { getEnv } from '@/lib/env'
import { coverIsWordmark, postDate, type PostListCard } from '@/lib/posts/cards'
import { getPostList, getSisterLinePostLinks } from '@/lib/posts/data'
import { NEWS_PATH } from '@/lib/posts/list'
import type { SisterLine } from '@/lib/posts/sister'
import { getSharedData } from '@/lib/shared/getSharedData'
import { getSiteSettings } from '@/lib/site/data'
import type { BzNewsHomeBlock as BzNewsHomeBlockData } from '@/payload-types'

import { homeNewsMix } from '@/lib/biznes/newsMix'

import { SplitHead } from '../../components/home/SplitHead'

/** The featured post plus three in the list (runda 1411, board `Aktualnosci.dc.html`). */
const LIST = 3

const LINE_NAME: Record<SisterLine | 'biznes', string> = {
  biznes: 'PRO-KOM Biznes',
  instalacje: 'PRO-KOM Instalacje',
  software: 'PRO-KOM Software',
}

const TITLE =
  'font-display leading-[1.15] font-extrabold tracking-[-0.01em] text-ink font-stretch-112%'
const STRETCH = 'outline-hidden after:absolute after:inset-0 after:content-[""]'
const CARD =
  'relative flex overflow-hidden rounded-[24px] bg-card shadow-[inset_0_0_0_1px_var(--border)] transition-shadow has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-accent-text hover:shadow-[0_24px_48px_-28px_var(--glow),inset_0_0_0_1px_var(--border)]'

/** „Linia · kategoria” with the line's coloured dot (no logo, board). */
function LineLabel({
  name,
  color,
  extra,
}: {
  name: string
  color: string | null
  extra?: string | null
}) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] font-extrabold text-ink-2">
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full"
        style={{ background: color ?? 'var(--accent)' }}
      />
      {name}
      {extra && <> · {extra}</>}
    </span>
  )
}

function Cover({ post }: { post: PostListCard }) {
  if (!post.cover) return null
  return coverIsWordmark(post.cover) ? (
    <span className="flex h-16 items-center justify-center rounded-2xl bg-white px-5 shadow-[0_14px_30px_-18px_var(--glow)]">
      <MediaImage
        image={post.cover}
        sizes="160px"
        eager={false}
        className="h-auto max-h-8 w-auto max-w-[150px] object-contain"
      />
    </span>
  ) : (
    <MediaImage
      image={post.cover}
      sizes="(min-width: 1080px) 30vw, 90vw"
      eager={false}
      className="h-full max-h-[200px] w-auto max-w-full object-contain drop-shadow-[0_24px_28px_var(--glow)]"
    />
  )
}

/**
 * „Aktualności” of the Biznes home page, `#aktualnosci` (runda 1411, board `Aktualnosci.dc.html`;
 * plan 0611 §7.1 pkt 12 before): the newest Biznes post featured — a navy cover with its picture
 * and, for a KSeF post, the deadline from `SiteSettings → KSeF` — and three posts beside it, equal
 * in height, each with the line's coloured dot and name instead of a logo: one more Biznes post,
 * the newest of Instalacje and of Software, linked to their own sites (`homeNewsMix`, 15.11). Phone (§5): the featured post on
 * top, the three as a list with a 72 px thumbnail. No post at all = nothing.
 */
export async function BzNewsHomeBlock({
  block,
  tenantId,
}: {
  block: BzNewsHomeBlockData
  tenantId: number
}) {
  const own = (await getPostList(tenantId, 'biznes')).slice(0, LIST + 1)
  const { SITE_ENV } = getEnv()
  // Enough posts of the other lines to find one of Instalacje and one of Software (15.11).
  const sisterAll = await getSisterLinePostLinks(tenantId, (LIST + 1) * 2, {
    siteEnv: SITE_ENV,
    port: SITE_ENV === 'local' ? (process.env.PORT ?? '3000') : null,
  })
  if (own.length + sisterAll.length === 0) return null
  const [shared, settings] = await Promise.all([getSharedData(tenantId), getSiteSettings(tenantId)])
  const color = (key: string) => shared?.lines.find((line) => line.key === key)?.color ?? null
  // The featured post: the newest of Biznes, else nothing featured and four in the list.
  const [featured, ...afterFeatured] = own
  const { own: rest, sister } = homeNewsMix(afterFeatured, sisterAll, featured ? LIST : LIST + 1)
  const deadline = postDate(settings?.biznes?.ksef?.deadline)
  const ksef = Boolean(featured?.category && /ksef/i.test(featured.category))

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
              className="inline-flex items-center gap-2 font-extrabold text-accent-text hover:underline max-md:min-h-11"
            >
              {block.allLabel}
              <Icon name="arrow" className="size-4" />
            </Link>
          )}
        </SplitHead>
        <div
          className={cx(
            'grid gap-4',
            featured && 'min-[1080px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]',
          )}
          data-news-home
        >
          {featured && (
            <article className={cx(CARD, 'flex-col')} data-news-card="" data-news-featured="">
              {(featured.cover || (ksef && deadline)) && (
                <div
                  data-surface="dark"
                  className="relative flex h-[230px] items-center justify-between gap-6 overflow-hidden bg-surface-dark px-7 text-white max-md:h-[180px] max-md:px-5"
                >
                  {ksef && deadline && (
                    <span className="flex max-w-[55%] flex-col gap-1">
                      <span className="text-[12px] font-extrabold tracking-[0.16em] text-accent-on-dark uppercase">
                        Termin
                      </span>
                      <time
                        dateTime={deadline.dateTime}
                        className="font-display text-[clamp(30px,3vw,40px)] leading-none font-extrabold font-stretch-115%"
                      >
                        {deadline.date}
                      </time>
                    </span>
                  )}
                  <span className="flex h-full flex-1 items-center justify-center py-6">
                    <Cover post={featured} />
                  </span>
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2.5 p-6 max-md:p-5">
                <p className="flex flex-wrap items-center justify-between gap-2">
                  <LineLabel
                    name={LINE_NAME.biznes}
                    color={color('biznes')}
                    extra={featured.category}
                  />
                  {featured.dateTime && (
                    <time
                      dateTime={featured.dateTime}
                      className="text-[12.5px] font-bold text-ink-2"
                    >
                      {featured.date}
                    </time>
                  )}
                </p>
                <h3 className={cx(TITLE, 'text-[clamp(1.35rem,2vw,1.65rem)]')}>
                  <Link href={featured.href} className={STRETCH}>
                    {featured.title}
                  </Link>
                </h3>
                {featured.lead && (
                  <p className="line-clamp-3 text-[15px] leading-relaxed text-ink-2">
                    {featured.lead}
                  </p>
                )}
                <span
                  aria-hidden="true"
                  className="mt-auto pt-2 text-[14px] font-extrabold text-accent-text"
                >
                  Czytaj wpis →
                </span>
              </div>
            </article>
          )}
          {(rest.length > 0 || sister.length > 0) && (
            <ul className="grid auto-rows-fr content-start gap-3 self-start" data-reveal-cards="">
              {rest.map((post) => (
                <li key={post.slug} className="flex">
                  <article className={cx(CARD, 'w-full items-stretch')} data-news-card="">
                    <span className="flex w-[120px] shrink-0 items-center justify-center bg-surface-2 p-3 max-md:w-[72px]">
                      {post.cover && !coverIsWordmark(post.cover) ? (
                        <MediaImage
                          image={post.cover}
                          sizes="120px"
                          eager={false}
                          className="max-h-[84px] w-auto max-w-full object-contain"
                        />
                      ) : (
                        <Icon name="doc" className="size-7 text-accent-text" />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
                      <LineLabel
                        name={LINE_NAME.biznes}
                        color={color('biznes')}
                        extra={post.category}
                      />
                      <h3 className={cx(TITLE, 'text-[17px]')}>
                        <Link href={post.href} className={STRETCH}>
                          {post.title}
                        </Link>
                      </h3>
                      {post.lead && (
                        <p className="line-clamp-2 text-[14px] leading-snug text-ink-2 max-md:hidden">
                          {post.lead}
                        </p>
                      )}
                    </span>
                  </article>
                </li>
              ))}
              {sister.map((link) => {
                const published = postDate(link.publishedAt)
                return (
                  <li key={link.href} className="flex" data-sister-line={link.line}>
                    <article className={cx(CARD, 'w-full items-stretch')} data-news-card="">
                      <span
                        aria-hidden="true"
                        className="w-1.5 shrink-0"
                        style={{ background: color(link.line) ?? 'var(--accent)' }}
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <LineLabel name={LINE_NAME[link.line]} color={color(link.line)} />
                          {published && (
                            <time
                              dateTime={published.dateTime}
                              className="text-[12.5px] font-bold text-ink-2"
                            >
                              {published.date}
                            </time>
                          )}
                        </span>
                        <h3 className={cx(TITLE, 'text-[17px]')}>
                          <a href={link.href} className={STRETCH}>
                            {link.title}
                            <span className="sr-only"> (strona {LINE_NAME[link.line]})</span>
                          </a>
                        </h3>
                        {link.lead && (
                          <p className="line-clamp-2 text-[14px] leading-snug text-ink-2 max-md:hidden">
                            {link.lead}
                          </p>
                        )}
                        <span
                          aria-hidden="true"
                          className="text-[13.5px] font-extrabold text-accent-text"
                        >
                          Czytaj na stronie {link.line === 'instalacje' ? 'Instalacji' : 'Software'}{' '}
                          ↗
                        </span>
                      </span>
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </Container>
    </section>
  )
}
