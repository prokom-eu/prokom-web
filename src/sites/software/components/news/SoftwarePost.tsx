import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { MediaImage } from '@/components/MediaImage'
import { postOutline, type RichTextData } from '@/lib/posts/content'
import type { PostListItem } from '@/lib/posts/data'
import { newsListHref, NEWS_PATH, type PostCategory } from '@/lib/posts/list'
import type { PostView } from '@/lib/posts/view'
import { cardPrice } from '@/lib/software/cardPrice'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'
import { PostContent } from '@/sites/biznes/components/news/PostContent'

import { Breadcrumbs } from '../Breadcrumbs'
import { SectionHead } from '../home/SectionHead'
import { SwCallToAction } from '../SwCallToAction'
import { PostCardList } from './PostCards'
import { SOFTWARE_NEWS_TEXTS as T } from './texts'

type Props = {
  post: PostView
  category: PostCategory | null
  readMore: readonly PostListItem[]
  index: SolutionsIndex
  /** Today (`YYYY-MM-DD`, Polish time): a source is never „checked” on a later day. */
  today: string
}

// Prefixed: a heading „Krótko” or „Źródła” in the text gets the plain anchor (`postOutline`).
const SUMMARY_ID = 'wpis-krotko'
const SOURCES_ID = 'wpis-zrodla'

const WARSAW_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' })

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/** Part of the post's text: the same object shape with fewer top-level nodes. */
function part(content: RichTextData, nodes: unknown[]): RichTextData {
  return { root: { ...content.root, children: nodes } } as RichTextData
}

/**
 * A post in the Software look (board `Wpis`, spec. §6.8): category · reading time · one date,
 * author, „W tym tekście” beside the text from 1081 px, „Krótko”, the text with the audit CTA in
 * the middle, sources with their check dates (never a future day), the author box, 3 related
 * posts and the related solutions of this tenant.
 */
export function SoftwarePost({ post, category, readMore, index, today }: Props) {
  // The CTA goes before the heading of the middle section (`postOutline` holds the very heading
  // objects, so `PostContent` finds their anchors in both halves).
  const outline = postOutline(post.content)
  const children = post.content.root.children as unknown[]
  const middle = outline[Math.ceil(outline.length / 2)]?.node
  const cut = middle ? children.indexOf(middle) : children.length
  const before = children.slice(0, cut)
  const after = children.slice(cut)
  const toc = [
    ...(post.summary ? [{ id: SUMMARY_ID, title: T.summary }] : []),
    ...outline,
    ...(post.sources.length > 0 ? [{ id: SOURCES_ID, title: T.sources }] : []),
  ]
  const cta = post.cta
    ? { heading: post.cta.title, text: post.cta.text, link: post.cta.link }
    : { heading: T.audit.title, text: T.audit.text, link: T.audit.link }
  const date = post.updated ?? post.published
  // Compared as days in Polish time, the way the date is shown.
  const checked = (value: { date: string; dateTime: string } | null) =>
    value && WARSAW_DAY.format(new Date(value.dateTime)) <= today ? value : null
  const lastChecked = checked(post.verified)
  const bySlug = new Map(index.solutions.map((solution) => [solution.slug, solution]))
  const solutions = post.relatedSolutions.flatMap((slug) => bySlug.get(slug) ?? [])

  const parents = [
    { name: T.title, href: NEWS_PATH },
    ...(post.category && category ? [{ name: post.category, href: newsListHref(category) }] : []),
  ]

  return (
    <>
      <article aria-labelledby="post-h">
        <header className="pt-6 pb-8 min-[641px]:pt-10 min-[641px]:pb-12">
          <Container wide>
            <div className="mx-auto max-w-[980px]">
              <Breadcrumbs current={post.title} parents={parents} />
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-ink-2">
                {post.category ? (
                  <span className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-extrabold text-accent-text">
                    {post.category}
                  </span>
                ) : null}
                <span>
                  {post.minutes} {T.minutes}
                </span>
                {date ? (
                  <time dateTime={date.dateTime}>
                    {post.updated ? `${T.updated} ` : ''}
                    {date.date}
                  </time>
                ) : null}
              </p>
              <h1
                id="post-h"
                className="mt-4 font-display text-[34px] font-extrabold leading-[1.05] tracking-tight min-[641px]:text-[clamp(40px,4.4vw,60px)]"
              >
                {post.title}
              </h1>
              {post.lead ? (
                <p className="mt-4 max-w-[62ch] text-lg text-ink-2 min-[641px]:text-xl">
                  {post.lead}
                </p>
              ) : null}
              {post.author ? (
                <p className="mt-6 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-11 place-items-center rounded-xl bg-cta text-sm font-extrabold text-white"
                  >
                    {initials(post.author.name)}
                  </span>
                  <span className="flex flex-col text-sm">
                    <span className="font-extrabold">{post.author.name}</span>
                    {post.author.role ? (
                      <span className="text-ink-2">{post.author.role}</span>
                    ) : null}
                  </span>
                </p>
              ) : null}
            </div>
          </Container>
        </header>

        <Container wide className="pb-12 min-[641px]:pb-20">
          <div className="grid gap-6 min-[1081px]:grid-cols-[240px_minmax(0,720px)] min-[1081px]:gap-12">
            {toc.length > 1 ? (
              <nav
                aria-labelledby="w-tekscie-h"
                className="min-w-0 min-[1081px]:sticky min-[1081px]:top-28 min-[1081px]:self-start min-[1081px]:rounded-[22px] min-[1081px]:border min-[1081px]:border-border min-[1081px]:bg-card min-[1081px]:p-[18px]"
              >
                <h2
                  id="w-tekscie-h"
                  className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-2"
                >
                  {T.outline}
                </h2>
                <ol className="-mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 min-[1081px]:mx-0 min-[1081px]:flex-col min-[1081px]:gap-0 min-[1081px]:overflow-visible min-[1081px]:px-0 min-[1081px]:pb-0">
                  {toc.map((item) => (
                    <li key={item.id} className="shrink-0 snap-start min-[1081px]:shrink">
                      <a
                        href={`#${item.id}`}
                        className="flex min-h-11 items-center whitespace-nowrap rounded-full border border-border bg-card px-3.5 text-sm font-bold min-[1081px]:whitespace-normal min-[1081px]:rounded-xl min-[1081px]:border-0 min-[1081px]:bg-transparent min-[1081px]:px-2.5 min-[1081px]:hover:bg-surface-2"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : (
              <span />
            )}
            <div className="min-w-0">
              {post.summary ? (
                <aside
                  id={SUMMARY_ID}
                  aria-label={T.summary}
                  className="scroll-mt-28 rounded-[22px] border border-accent-line bg-accent-soft p-[18px] min-[641px]:p-6"
                >
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text">
                    {T.summary}
                  </p>
                  <p className="mt-2">{post.summary}</p>
                </aside>
              ) : null}
              <div className={post.summary ? 'mt-8' : undefined}>
                <PostContent content={part(post.content, before)} outline={outline} />
              </div>
              <div className="my-8 flex flex-col items-start gap-3 rounded-[24px] bg-cta p-[22px] text-white shadow-raised min-[641px]:p-7">
                <p className="font-display text-xl font-extrabold">{cta.heading}</p>
                {cta.text ? <p className="text-white/90">{cta.text}</p> : null}
                <Link
                  href={cta.link.href}
                  className="mt-1 inline-flex min-h-[52px] items-center rounded-2xl bg-card px-6 font-extrabold text-ink transition-transform active:scale-[0.98]"
                >
                  {cta.link.label}
                </Link>
              </div>
              {after.length > 0 ? (
                <PostContent content={part(post.content, after)} outline={outline} />
              ) : null}

              {post.sources.length > 0 ? (
                <section
                  id={SOURCES_ID}
                  aria-labelledby="zrodla-h"
                  className="mt-10 scroll-mt-28 rounded-[22px] border border-border bg-surface-2 p-[18px] min-[641px]:p-6"
                >
                  <h2
                    id="zrodla-h"
                    className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text"
                  >
                    {T.sources}
                  </h2>
                  <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm">
                    {post.sources.map((source) => {
                      const verified = checked(source.verified)
                      return (
                        <li key={source.url + source.name}>
                          <a
                            href={source.url}
                            rel="noopener noreferrer"
                            className="font-bold underline underline-offset-4"
                          >
                            {source.name}
                          </a>
                          {verified ? (
                            <span className="block text-ink-2">
                              {T.checkedOn} {verified.date}
                            </span>
                          ) : null}
                        </li>
                      )
                    })}
                  </ol>
                  {lastChecked ? (
                    <p className="mt-3 text-sm font-bold text-ink-2">
                      {T.lastChecked} {lastChecked.date}.
                    </p>
                  ) : null}
                </section>
              ) : null}

              {post.author ? (
                <section
                  aria-label={T.author}
                  className="mt-4 grid gap-4 rounded-[24px] border border-border bg-card p-3 min-[641px]:grid-cols-[150px_minmax(0,1fr)]"
                >
                  {post.author.photo ? (
                    <MediaImage
                      image={post.author.photo}
                      sizes="150px"
                      className="aspect-square w-full rounded-[18px] object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="hidden aspect-square place-items-center rounded-[18px] bg-cta font-display text-4xl font-extrabold text-white min-[641px]:grid"
                    >
                      {initials(post.author.name)}
                    </span>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-2">
                      {T.author}
                    </p>
                    <p className="mt-1 font-display text-xl font-extrabold">{post.author.name}</p>
                    {post.author.role ? (
                      <p className="text-sm font-extrabold text-accent-text">{post.author.role}</p>
                    ) : null}
                    {post.author.bio ? (
                      <p className="mt-2 text-sm text-ink-2">{post.author.bio}</p>
                    ) : null}
                    <Link
                      href="/o-firmie"
                      className="mt-1 inline-flex min-h-11 items-center font-extrabold text-accent-text"
                    >
                      {T.aboutLink}
                    </Link>
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </Container>
      </article>

      {readMore.length > 0 ? (
        <section className="py-12 min-[641px]:py-20">
          <Container wide>
            <SectionHead eyebrow={T.readMoreEyebrow} title={T.readMore} lead={null} />
            <div className="mt-6">
              <PostCardList posts={readMore} headingLevel="h3" />
            </div>
          </Container>
        </section>
      ) : null}

      {solutions.length > 0 ? (
        <section className="pb-12 min-[641px]:pb-20">
          <Container wide>
            <SectionHead eyebrow={T.solutionsEyebrow} title={T.solutions} lead={null} />
            <ul className="mt-6 grid gap-3 min-[761px]:grid-cols-3">
              {solutions.map((solution) => {
                const price = cardPrice(solution, index.priceDisplay)
                return (
                  <li key={solution.slug}>
                    <Link
                      href={`/rozwiazania/${solution.slug}`}
                      className="flex h-full flex-col gap-2 rounded-[22px] border border-border bg-card p-5 transition-transform active:scale-[0.99]"
                    >
                      <h3 className="font-display text-lg font-extrabold">{solution.name}</h3>
                      {solution.lead ? <p className="text-sm text-ink-2">{solution.lead}</p> : null}
                      <p className="mt-auto pt-2 text-sm font-extrabold text-accent-text">
                        {[price.head.before, price.head.amount, price.head.after]
                          .filter(Boolean)
                          .join(' ')}
                        {' · '}
                        {price.term}
                      </p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      ) : null}

      <SwCallToAction
        block={{
          blockType: 'callToAction',
          heading: post.contact.heading ?? T.contact.heading,
          text: post.contact.lead ?? T.contact.text,
          link: T.contact.link,
        }}
      />
    </>
  )
}
