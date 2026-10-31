import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { getKsefPanel, getPostList } from '@/lib/posts/data'
import { categoryChips, NEWS_PATH, parseCategory, CATEGORY_PARAM } from '@/lib/posts/list'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { CatalogContactPanel } from '@/sites/biznes/components/catalog/CatalogContactPanel'
import { KsefPanel } from '@/sites/biznes/components/news/KsefPanel'
import { NewsHero } from '@/sites/biznes/components/news/NewsHero'
import { PostCards } from '@/sites/biznes/components/news/PostCards'
import { NEWS_TEXTS } from '@/sites/biznes/components/news/texts'
import { SoftwareNews } from '@/sites/software/components/news/SoftwareNews'
import { SOFTWARE_NEWS_TEXTS } from '@/sites/software/components/news/texts'

import { requestOrigin, requireNewsTenant } from '../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const tenant = await requireNewsTenant(params)
  const [settings, query] = await Promise.all([getSiteSettings(tenant.id), searchParams])
  const filtered = Boolean(query[CATEGORY_PARAM])
  const texts = tenant.line === 'software' ? SOFTWARE_NEWS_TEXTS : NEWS_TEXTS
  return {
    title: texts.title,
    description: texts.description,
    alternates: { canonical: NEWS_PATH },
    // A category view is the list again, filtered: not indexed, the list is its canonical.
    robots:
      robotsMeta(getEnv().SITE_ENV) ?? (filtered ? { index: false, follow: true } : undefined),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: NEWS_PATH,
      title: texts.title,
      description: texts.description,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * News list `/aktualnosci` (spec. §6.9, board `Aktualnosci`) — a route of all lines with news,
 * each in its own look (Software: SW11b, spec. §6.8). Posts of this tenant only; the category
 * comes from `?kategoria=`, only one of the tenant's line.
 */
export default async function NewsPage({ params, searchParams }: Props) {
  const tenant = await requireNewsTenant(params)
  if (tenant.line === 'software') {
    const [posts, query, origin] = await Promise.all([
      getPostList(tenant.id),
      searchParams,
      requestOrigin(),
    ])
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
        <SoftwareNews posts={posts} category={parseCategory(query[CATEGORY_PARAM], tenant.line)} />
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
  const chips = categoryChips(posts.map((post) => post.categoryValue))
  const category = parseCategory(query[CATEGORY_PARAM], tenant.line)
  const shown = category ? posts.filter((post) => post.categoryValue === category) : posts

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
      <NewsHero chips={chips} current={category} />
      {panel && !category && <KsefPanel panel={panel} />}
      <section aria-label="Wpisy" className="pt-6 pb-14 sm:pt-10 sm:pb-20">
        <Container wide>
          {shown.length > 0 ? (
            <PostCards posts={shown} featureFirst={!category} />
          ) : (
            <p className="rounded-[28px] bg-surface-2 p-8 text-lg text-ink-2">{NEWS_TEXTS.empty}</p>
          )}
        </Container>
      </section>
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
