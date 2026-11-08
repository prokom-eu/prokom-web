import { headers } from 'next/headers'
import Link from 'next/link'

import { getEnv } from '@/lib/env'
import { getPostList, getPostView } from '@/lib/posts/data'
import { categoryLabel } from '@/lib/posts/list'
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/seo/jsonLd'
import { siteOrigin } from '@/lib/seo/origin'
import type { InstGuideBlock as InstGuideBlockData } from '@/payload-types'

import { GUIDE_ANSWERS, GUIDE_CATEGORIES, poradnik as T } from '../../dane/poradnik'
import { guideMinutes, guidePost } from '../../dane/wpisy'
import { INST_ICONS } from '../../icons'
import { InstIcon } from '../../InstIcon'
import { JsonLd } from '../../sekcje/JsonLd'
import { PageCtaBand } from '../../sekcje/PageCtaBand'
import { SplitHero } from '../../sekcje/SplitHero'
import { updatedLabel } from '../../widzety/poradnik/guideMeta'
import { InstSection } from '../../sekcje/InstSectionLazy'

type Props = { block: InstGuideBlockData; tenantId: number }

type Card = {
  key: string
  category: string
  categoryLabel: string
  title: string
  text: string
  href: string
  meta: string
}

/** The anchor of a category: a chip links to it, CSS shows only that category's cards. */
const target = (key: string) => `kat-${key}`

const MONTH = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Warsaw',
})

/**
 * The guide hub `/poradnik` (runda v6 §3.3, INST-6 PR5): category chips in the hero, the newest
 * post as „Polecany”, then all posts and the short answers on the service pages, each with its
 * category, reading time and update date; the CTA band. The filter works without JavaScript: a
 * chip is a link to `#kat-<category>` and CSS (`:target`, `instalacje` poradnik styles) hides the
 * cards of the other categories. Posts of this tenant only. The block carries the page's h1.
 */
export async function InstGuideBlock({ block, tenantId }: Props) {
  const [posts, host] = await Promise.all([
    getPostList(tenantId, 'instalacje'),
    headers().then((h) => h.get('host')),
  ])
  const origin = siteOrigin(host, getEnv().SITE_ENV)
  const first = posts[0]
  const featured = first ? await getPostView(tenantId, first.slug, 'instalacje') : null
  const crumb = block.hero?.crumb || 'Poradnik'
  const minutesOf = (slug: string, fallback: number | null) => {
    const data = guidePost(slug)
    return data ? guideMinutes(data) : fallback
  }
  const cards: Card[] = [
    ...posts.map((post) => {
      const minutes = minutesOf(post.slug, null)
      return {
        key: post.slug,
        category: post.categoryValue,
        categoryLabel: post.category ?? '',
        title: post.title,
        text: post.lead ?? '',
        href: post.href,
        meta: [
          minutes ? T.featured.minutes(minutes) : null,
          `${T.updated}: ${MONTH.format(new Date(post.updatedAt))}`,
        ]
          .filter(Boolean)
          .join(' · '),
      }
    }),
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
  const art = (featured && guidePost(featured.slug)?.extras.art.icon) || 'book'
  const featuredMinutes = featured ? minutesOf(featured.slug, featured.minutes) : null
  const featuredMeta = featured
    ? [featuredMinutes ? T.featured.minutes(featuredMinutes) : null, updatedLabel(featured)]
        .filter(Boolean)
        .join(' · ')
    : null
  const categories = GUIDE_CATEGORIES.filter((c) => c.key !== 'all')

  return (
    <>
      {origin && (
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: 'Strona główna', url: `${origin}/` },
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
        <nav className="zpc in d4" style={{ marginTop: 28 }} aria-label={T.categoriesLabel}>
          {GUIDE_CATEGORIES.map((c) => (
            <a
              key={c.key}
              href={c.key === 'all' ? '#wpisy' : `#${target(c.key)}`}
              className="chip"
              data-chip={c.key}
            >
              {c.label}
            </a>
          ))}
        </nav>
      </SplitHero>
      {/* Round v5 (RUNDA-V5 §9.4): the featured post and the cards come in on scroll. */}
      <InstSection id="wpisy" className="prhub" style={{ padding: '0 0 96px' }}>
        <div className="wrap">
          {categories.map((c) => (
            <span key={c.key} id={target(c.key)} className="prtgt" aria-hidden="true" />
          ))}
          {featured && (
            <Link href={featured.href} className="prfeat card ri">
              <div className="prart">
                <svg viewBox="0 0 400 260" aria-hidden="true">
                  <rect width="400" height="260" style={{ fill: 'var(--accent-soft)' }} />
                  <g transform="translate(110 40) scale(7.5)">
                    <path
                      d={INST_ICONS[art]}
                      style={{
                        fill: 'none',
                        stroke: 'var(--accent-text)',
                        strokeWidth: 1,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                      }}
                    />
                  </g>
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
          <div className="prgrid">
            {cards.map((a) => (
              <Link
                key={a.key}
                href={a.href}
                className={'card prc2 ri' + (a.key === featured?.slug ? ' prdup' : '')}
                data-cat={a.category}
              >
                <span className="svk">{a.categoryLabel}</span>
                <b className="h3">{a.title}</b>
                <p>{a.text}</p>
                <span className="mut" style={{ fontSize: 13, marginTop: 'auto' }}>
                  {a.meta}
                </span>
              </Link>
            ))}
          </div>
          {categories
            .filter((c) => !cards.some((card) => card.category === c.key))
            .map((c) => (
              <div key={c.key} className="note prnone" data-cat={c.key} style={{ marginTop: 18 }}>
                <InstIcon name="book" size={20} />
                <span>{T.empty}</span>
              </div>
            ))}
        </div>
      </InstSection>
      <PageCtaBand tenantId={tenantId} cta={block.cta} titleId="cta-guide-title" />
    </>
  )
}
