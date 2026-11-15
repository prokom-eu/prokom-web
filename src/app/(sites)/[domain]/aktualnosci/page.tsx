import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { getKsefPanel, getPostList } from '@/lib/posts/data'
import { postGroups, splitFeatured } from '@/lib/posts/groups'
import { NEWS_PATH, parseCategory, CATEGORY_PARAM } from '@/lib/posts/list'
import { newsListView, newsPageHref, PAGE_PARAM, parsePage } from '@/lib/posts/newsList'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { CatalogContactPanel } from '@/sites/biznes/components/catalog/CatalogContactPanel'
import { KsefPanel } from '@/sites/biznes/components/news/KsefPanel'
import { NewsFeatured } from '@/sites/biznes/components/news/NewsFeatured'
import { NewsGroups } from '@/sites/biznes/components/news/NewsGroups'
import { NewsHero } from '@/sites/biznes/components/news/NewsHero'
import { PostCards } from '@/sites/biznes/components/news/PostCards'
import { NEWS_TEXTS } from '@/sites/biznes/components/news/texts'
import { SoftwareNews } from '@/sites/software/components/news/SoftwareNews'
import { SOFTWARE_NEWS_TEXTS } from '@/sites/software/components/news/texts'

import { requestOrigin, requireNewsTenant } from '../tenant'

/** Posts in the „Najnowsze” row of the full list (one large, two beside it). */
const FEATURED = 3

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const tenant = await requireNewsTenant(params)
  const [settings, query] = await Promise.all([getSiteSettings(tenant.id), searchParams])
  const filtered = Boolean(query[CATEGORY_PARAM])
  const texts = tenant.line === 'software' ? SOFTWARE_NEWS_TEXTS : NEWS_TEXTS
  const listTitle = 'seoTitle' in texts ? texts.seoTitle : texts.title
  // Software pages its list (`?strona=`): a page from 2 up is its own address with its own
  // canonical and title (not the first page again); a category view stays `noindex`.
  const page = tenant.line === 'software' ? (parsePage(query[PAGE_PARAM]) ?? 1) : 1
  const title = page > 1 ? `${listTitle} – strona ${page}` : listTitle
  const canonical = filtered ? NEWS_PATH : newsPageHref(null, page)
  const description = page > 1 ? `Strona ${page}. ${texts.description}` : texts.description
  return {
    title,
    description,
    alternates: { canonical },
    // A category view is the list again, filtered: not indexed, the list is its canonical.
    robots:
      robotsMeta(getEnv().SITE_ENV) ?? (filtered ? { index: false, follow: true } : undefined),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: canonical,
      title,
      description,
      // Biznes opted in to the line's mark when no picture is set (audit 0611 P1-9).
      images: ogImages(
        settings?.seo.ogImage ?? null,
        tenant.line === 'biznes' ? 'biznes' : undefined,
      ),
    },
  }
}

/**
 * News list `/aktualnosci` (spec. §6.9, board `Aktualnosci`) — a route of all lines with news,
 * each in its own look (Software: SW11b, spec. §6.8). Posts of this tenant only; the category
 * comes from `?kategoria=`, only one of the tenant's line; Software pages the list (`?strona=`).
 */
export default async function NewsPage({ params, searchParams }: Props) {
  const tenant = await requireNewsTenant(params)
  if (tenant.line === 'software') {
    const [posts, query, origin] = await Promise.all([
      getPostList(tenant.id),
      searchParams,
      requestOrigin(),
    ])
    const category = parseCategory(query[CATEGORY_PARAM], tenant.line)
    const page = parsePage(query[PAGE_PARAM])
    // A page that is not there (`?strona=9`, `?strona=abc`) is 404, not the first page again.
    const view = page === null ? null : newsListView(posts, category, page)
    if (!view) notFound()
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              breadcrumbJsonLd([
                { name: 'Strona główna', url: `${origin}/` },
                { name: SOFTWARE_NEWS_TEXTS.title, url: origin + NEWS_PATH },
              ]),
            ),
          }}
        />
        <SoftwareNews view={view} category={category} />
      </>
    )
  }
  // Every line in `NEWS_LINES` has its own look; one added without it stays 404 instead of
  // borrowing the Biznes one.
  if (tenant.line !== 'biznes') notFound()
  const [posts, panel, settings, query, origin] = await Promise.all([
    getPostList(tenant.id),
    getKsefPanel(tenant.id),
    getSiteSettings(tenant.id),
    searchParams,
    requestOrigin(),
  ])
  const groups = postGroups(posts)
  const chips = groups.map(({ value, label, posts: own }) => ({ value, label, count: own.length }))
  const category = parseCategory(query[CATEGORY_PARAM], tenant.line)
  const shown = category ? posts.filter((post) => post.categoryValue === category) : posts
  // The full list: the newest three on top, every other post in its topic below the KSeF panel.
  const { featured, rest } = splitFeatured(category ? [] : posts, FEATURED)
  const newest = posts[0]
  const last =
    newest?.date && newest.dateTime ? { date: newest.date, dateTime: newest.dateTime } : null

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Strona główna', url: `${origin}/` },
    { name: NEWS_TEXTS.title, url: origin + NEWS_PATH },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }}
      />
      <NewsHero chips={chips} current={category} total={posts.length} last={last} />
      {category ? (
        <section aria-label="Wpisy" className="pb-14 sm:pb-20">
          <Container wide>
            {shown.length > 0 ? (
              <PostCards posts={shown} headingLevel="h2" eagerFirst />
            ) : (
              <p className="rounded-[28px] bg-surface-2 p-8 text-lg text-ink-2">
                {NEWS_TEXTS.empty}
              </p>
            )}
          </Container>
        </section>
      ) : (
        <>
          <NewsFeatured posts={featured} />
          {panel && <KsefPanel panel={panel} />}
          <NewsGroups
            groups={postGroups(rest)}
            totals={Object.fromEntries(chips.map((chip) => [chip.value, chip.count]))}
          />
          {posts.length === 0 && (
            <Container wide className="pb-14">
              <p className="rounded-[28px] bg-surface-2 p-8 text-lg text-ink-2">
                {NEWS_TEXTS.emptyAll}
              </p>
            </Container>
          )}
        </>
      )}
      <CatalogContactPanel
        tenantId={tenant.id}
        id="kontakt"
        heading={NEWS_TEXTS.contactHeading}
        lead={NEWS_TEXTS.contactLead}
        callbackTime={settings?.biznes?.promises.callbackTime ?? null}
      />
    </>
  )
}
