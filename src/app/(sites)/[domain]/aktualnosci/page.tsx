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

import { requestOrigin, requireNewsTenant } from '../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const tenant = await requireNewsTenant(params)
  const [settings, query] = await Promise.all([getSiteSettings(tenant.id), searchParams])
  const filtered = Boolean(query[CATEGORY_PARAM])
  return {
    title: NEWS_TEXTS.title,
    description: NEWS_TEXTS.description,
    alternates: { canonical: NEWS_PATH },
    // A category view is the list again, filtered: not indexed, the list is its canonical.
    robots:
      robotsMeta(getEnv().SITE_ENV) ?? (filtered ? { index: false, follow: true } : undefined),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: NEWS_PATH,
      title: NEWS_TEXTS.title,
      description: NEWS_TEXTS.description,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * News list `/aktualnosci` (spec. §6.9, board `Aktualnosci`) — a route of all lines with news;
 * today only Biznes has them, so the Biznes look is the only one (Software adds its own in
 * SW11b). Posts of this tenant only; the category comes from `?kategoria=`.
 */
export default async function NewsPage({ params, searchParams }: Props) {
  const tenant = await requireNewsTenant(params)
  // Only the Biznes look exists; a line added to `NEWS_LINES` without its own look stays 404
  // instead of borrowing this one (Software adds its look in SW11b).
  if (tenant.line !== 'biznes') notFound()
  const [posts, panel, settings, query, origin] = await Promise.all([
    getPostList(tenant.id),
    getKsefPanel(tenant.id),
    getSiteSettings(tenant.id),
    searchParams,
    requestOrigin(),
  ])
  const chips = categoryChips(posts.map((post) => post.categoryValue))
  const category = parseCategory(query[CATEGORY_PARAM])
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
