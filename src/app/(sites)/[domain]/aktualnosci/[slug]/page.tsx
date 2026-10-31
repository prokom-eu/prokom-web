import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { getCatalogIndex } from '@/lib/catalog/data'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { postOutline } from '@/lib/posts/content'
import { getPostList, getPostView } from '@/lib/posts/data'
import { NEWS_PATH } from '@/lib/posts/list'
import { articleJsonLd, breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import type { Crumb } from '@/sites/biznes/components/Breadcrumbs'
import { CatalogContactPanel } from '@/sites/biznes/components/catalog/CatalogContactPanel'
import { ProductCard } from '@/sites/biznes/components/catalog/ProductCard'
import { SectionHead } from '@/sites/biznes/components/home/SectionHead'
import { PostContent } from '@/sites/biznes/components/news/PostContent'
import { PostHeader } from '@/sites/biznes/components/news/PostHeader'
import {
  PostAside,
  PostSources,
  PostSummary,
  PostTocMobile,
} from '@/sites/biznes/components/news/PostParts'
import { NEWS_TEXTS } from '@/sites/biznes/components/news/texts'
import { SoftwarePost } from '@/sites/software/components/news/SoftwarePost'
import { SOFTWARE_NEWS_TEXTS } from '@/sites/software/components/news/texts'
import { getSolutionsIndex } from '@/lib/software/data'
import type { PostView } from '@/lib/posts/view'
import { isPostCategory } from '@/lib/posts/list'

import { requestOrigin, requireNewsTenant } from '../../tenant'

type Props = { params: Promise<{ domain: string; slug: string }> }

/** How many posts „Czytaj też” lists. */
const READ_ALSO = 3

async function load(params: Props['params']) {
  const tenant = await requireNewsTenant(params)
  // Each line with news has its own look (see `/aktualnosci`); Biznes and Software (SW11b).
  if (tenant.line !== 'biznes' && tenant.line !== 'software') notFound()
  const { slug } = await params
  // Invalid, unknown, draft, future or another site's slug → 404.
  const post = isValidSlug(slug) ? await getPostView(tenant.id, slug) : null
  return { tenant, post }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, post } = await load(params)
  if (!post) return {}
  const settings = await getSiteSettings(tenant.id)
  const title = post.seo.title ?? post.title
  const description = post.seo.description ?? post.lead ?? undefined
  return {
    title,
    description,
    alternates: { canonical: post.href },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'article',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: post.href,
      title,
      description,
      ...(post.published && { publishedTime: post.published.dateTime }),
      images: ogImages(post.cover ?? settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * A news post `/aktualnosci/[slug]` (spec. §6.9, board `Wpis`): head with sources and the
 * verification date, „W skrócie”, content with a table of contents, sources, side column
 * (CTA, day counter, „Czytaj też”), related products and the contact form. JSON-LD `Article`.
 */
export default async function PostPage({ params }: Props) {
  const { tenant, post } = await load(params)
  if (!post) notFound()
  if (tenant.line === 'software') return <SoftwarePostPage tenantId={tenant.id} post={post} />
  const [posts, index, settings, origin] = await Promise.all([
    getPostList(tenant.id),
    getCatalogIndex(tenant.id),
    getSiteSettings(tenant.id),
    requestOrigin(),
  ])

  // Same category first, then the newest of the rest.
  const others = posts.filter((item) => item.slug !== post.slug)
  const readAlso = [
    ...others.filter((item) => item.category === post.category),
    ...others.filter((item) => item.category !== post.category),
  ].slice(0, READ_ALSO)

  // Only published products of this tenant are in the index.
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const products = post.relatedProducts.flatMap((slug) => bySlug.get(slug) ?? [])
  const cardIndex: CatalogIndex = {
    ...index,
    products,
    industries: [],
    pages: [],
    search: { synonyms: {}, stopWords: [], popular: [] },
  }

  // Built here, after the cache: the outline holds the heading objects of this `content`.
  const outline = postOutline(post.content)
  const crumbs: Crumb[] = [
    { name: 'Strona główna', href: '/' },
    { name: NEWS_TEXTS.title, href: NEWS_PATH },
    { name: post.title, href: post.href },
  ]
  const coverUrl = post.cover?.sources.at(-1)?.url
  const jsonLd = [
    breadcrumbJsonLd(crumbs.map(({ name, href }) => ({ name, url: origin + href }))),
    articleJsonLd({
      headline: post.title,
      description: post.seo.description ?? post.lead,
      url: origin + post.href,
      origin,
      datePublished: post.published?.dateTime ?? null,
      dateModified: post.updated?.dateTime ?? post.published?.dateTime ?? null,
      images: coverUrl ? [new URL(coverUrl, origin).href] : [],
    }),
  ]

  return (
    <>
      {jsonLd.map((data, position) => (
        <script
          key={position}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
      <article aria-labelledby="post-h">
        <PostHeader post={post} crumbs={crumbs} />
        <Container wide className="pb-14 sm:pb-20">
          <div className="grid gap-12 min-[1080px]:grid-cols-[minmax(0,1fr)_340px] min-[1080px]:gap-24">
            <div className="max-w-[46rem]">
              <PostTocMobile outline={outline} />
              {post.summary && <PostSummary text={post.summary} />}
              <div className={post.summary ? 'mt-10' : undefined}>
                <PostContent content={post.content} outline={outline} />
              </div>
              <PostSources sources={post.sources} />
            </div>
            <PostAside post={post} outline={outline} related={readAlso} />
          </div>
        </Container>
      </article>
      {products.length > 0 && (
        <section aria-labelledby="produkty-h" className="bg-surface-2 py-14 sm:py-20">
          <Container wide>
            <SectionHead id="produkty-h" heading={NEWS_TEXTS.related} />
            <ul className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-3">
              {products.map((product, position) => (
                <li key={product.slug} className="flex">
                  <ProductCard product={product} index={cardIndex} position={position} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
      <CatalogContactPanel
        tenantId={tenant.id}
        id="kontakt"
        heading={post.contact.heading ?? NEWS_TEXTS.contactHeading}
        lead={post.contact.lead ?? NEWS_TEXTS.contactLead}
        callbackTime={settings?.biznes?.promises.callbackTime ?? null}
      />
    </>
  )
}

const WARSAW_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' })

/** The Software post (board `Wpis`, SW11b): JSON-LD like Biznes, the look of the line. */
async function SoftwarePostPage({ tenantId, post }: { tenantId: number; post: PostView }) {
  const [posts, index, origin] = await Promise.all([
    getPostList(tenantId),
    getSolutionsIndex(tenantId),
    requestOrigin(),
  ])
  const own = posts.find((item) => item.slug === post.slug)
  const category = own && isPostCategory(own.categoryValue) ? own.categoryValue : null
  // Same category first, then the newest of the rest.
  const others = posts.filter((item) => item.slug !== post.slug)
  const readMore = [
    ...others.filter((item) => item.categoryValue === category),
    ...others.filter((item) => item.categoryValue !== category),
  ].slice(0, READ_ALSO)
  const coverUrl = post.cover?.sources.at(-1)?.url
  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Strona główna', url: `${origin}/` },
      { name: SOFTWARE_NEWS_TEXTS.title, url: origin + NEWS_PATH },
      { name: post.title, url: origin + post.href },
    ]),
    articleJsonLd({
      headline: post.title,
      description: post.seo.description ?? post.lead,
      url: origin + post.href,
      origin,
      datePublished: post.published?.dateTime ?? null,
      dateModified: post.updated?.dateTime ?? post.published?.dateTime ?? null,
      images: coverUrl ? [new URL(coverUrl, origin).href] : [],
    }),
  ]
  return (
    <>
      {jsonLd.map((data, position) => (
        <script
          key={position}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
      <SoftwarePost
        post={post}
        category={category}
        readMore={readMore}
        index={index}
        today={WARSAW_DAY.format(new Date())}
      />
    </>
  )
}
