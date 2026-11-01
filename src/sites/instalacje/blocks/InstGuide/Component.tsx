import { headers } from 'next/headers'
import Link from 'next/link'

import { getEnv } from '@/lib/env'
import { getPostList, getPostView } from '@/lib/posts/data'
import { categoryLabel } from '@/lib/posts/list'
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/seo/jsonLd'
import { siteOrigin } from '@/lib/seo/origin'
import type { InstGuideBlock as InstGuideBlockData } from '@/payload-types'

import { GUIDE_ANSWERS, GUIDE_EXTRAS, poradnik as T } from '../../dane/poradnik'
import { INST_ICONS } from '../../icons'
import { JsonLd } from '../../sekcje/JsonLd'
import { PageCtaBand } from '../../sekcje/PageCtaBand'
import { SplitHero } from '../../sekcje/SplitHero'
import { updatedLabel } from '../../widzety/poradnik/guideMeta'
import { GuideCategories, GuideGrid, type GuideCard } from '../../widzety/poradnik/GuideWidgets'

import '../../widzety/firma/firma.css'

type Props = { block: InstGuideBlockData; tenantId: number }

/**
 * The guide `/poradnik` (ADR-I002 §0, `Poradnik.body.html`): category chips in the hero, the
 * newest post as „Polecany”, then the other posts and the short answers on the service pages
 * by category, the CTA band. Posts of this tenant only (`/poradnik/<slug>`). The block carries
 * the page's h1.
 */
export async function InstGuideBlock({ block, tenantId }: Props) {
  const [posts, host] = await Promise.all([
    getPostList(tenantId, 'instalacje'),
    headers().then((h) => h.get('host')),
  ])
  const origin = siteOrigin(host, getEnv().SITE_ENV)
  const [first, ...rest] = posts
  const featured = first ? await getPostView(tenantId, first.slug, 'instalacje') : null
  const crumb = block.hero?.crumb || 'Poradnik'
  const cards: GuideCard[] = [
    ...rest.map((post) => ({
      key: post.slug,
      category: post.categoryValue,
      categoryLabel: post.category ?? '',
      title: post.title,
      text: post.lead ?? '',
      href: post.href,
      meta: T.postMeta,
    })),
    ...GUIDE_ANSWERS.map((a) => ({
      key: a.href,
      category: a.category,
      categoryLabel: categoryLabel(a.category) ?? '',
      title: a.title,
      text: a.text,
      href: a.href,
      meta: T.answerMeta,
    })),
  ]
  // The art of the „Polecany” card comes with the post (`GUIDE_EXTRAS`); without it, a book.
  const art = (featured && GUIDE_EXTRAS[featured.slug]?.featured) || {
    icon: 'book' as const,
    sign: null,
  }
  const featuredMeta = featured
    ? [T.featured.minutes(featured.minutes), updatedLabel(featured)].filter(Boolean).join(' · ')
    : null

  return (
    <>
      {origin && (
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: 'Start', url: `${origin}/` },
              { name: crumb, url: `${origin}/poradnik` },
            ]),
            itemListJsonLd({
              name: crumb,
              items: posts.map((post) => ({ name: post.title, url: `${origin}${post.href}` })),
            }),
          ]}
        />
      )}
      <SplitHero hero={block.hero} crumb={crumb} style={{ paddingBottom: 40 }}>
        <GuideCategories />
      </SplitHero>
      <section style={{ padding: '0 0 96px' }}>
        <div className="wrap">
          {featured && (
            <Link href={featured.href} className="prfeat card">
              <div className="prart">
                <svg viewBox="0 0 400 260" aria-hidden="true">
                  <rect width="400" height="260" style={{ fill: 'var(--accent-soft)' }} />
                  <g transform="translate(110 40) scale(7.5)">
                    <path
                      d={INST_ICONS[art.icon]}
                      style={{
                        fill: 'none',
                        stroke: 'var(--accent-text)',
                        strokeWidth: 1,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                      }}
                    />
                  </g>
                  {art.sign && (
                    <>
                      <rect
                        x="236"
                        y="150"
                        width="120"
                        height="70"
                        rx="10"
                        style={{ fill: 'var(--inst-il-sign-bg)' }}
                      />
                      <text
                        x="296"
                        y="192"
                        textAnchor="middle"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 900,
                          fontSize: 18,
                          fill: 'var(--inst-il-sign-c)',
                        }}
                      >
                        {art.sign}
                      </text>
                    </>
                  )}
                </svg>
              </div>
              <div className="prtx">
                <span className="tag a" style={{ alignSelf: 'flex-start' }}>
                  {[T.featured.tag, featured.category].filter(Boolean).join(' · ')}
                </span>
                <b className="h2" style={{ fontSize: 'clamp(26px, 2.6vw, 38px)' }}>
                  {featured.title}
                </b>
                {featured.lead && (
                  <p className="lead" style={{ fontSize: 17 }}>
                    {featured.lead}
                  </p>
                )}
                {featuredMeta && (
                  <span className="mut" style={{ fontSize: 14 }}>
                    {featuredMeta}
                  </span>
                )}
                <span style={{ color: 'var(--accent-text)', fontWeight: 800 }}>
                  {T.featured.read}
                </span>
              </div>
            </Link>
          )}
          <GuideGrid cards={cards} />
        </div>
      </section>
      <PageCtaBand tenantId={tenantId} cta={block.cta} titleId="cta-guide-title" />
    </>
  )
}
