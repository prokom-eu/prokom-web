import Link from 'next/link'

import { getPostList } from '@/lib/posts/data'

import { poradnik as T } from '../dane/poradnik'
import type { ServiceKey } from '../dane/types'
import { guideMinutes, guidePostsForService } from '../dane/wpisy'
import { Arrow } from '../Arrow'
import { InstSection } from './InstSectionLazy'
import { SectionHead } from './SectionHead'

type Props = { tenantId: number; service: ServiceKey; path: string }

/**
 * „Z Poradnika” on a service page (runda v6 §3.3): up to 3 guide posts of the service's category
 * or linking to the page — only the ones published on this site. Nothing without such posts.
 */
export async function FromGuide({ tenantId, service, path }: Props) {
  const published = await getPostList(tenantId, 'instalacje')
  const bySlug = new Map(published.map((post) => [post.slug, post]))
  const posts = guidePostsForService(service, path, 6)
    .filter((post) => bySlug.has(post.slug))
    .slice(0, 3)
  if (posts.length === 0) return null
  return (
    <InstSection id="z-poradnika" style={{ padding: '72px 0' }}>
      <div className="wrap">
        <SectionHead eyebrow={T.fromGuide.eyebrow} heading={T.fromGuide.heading} />
        <div className="prgrid">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={bySlug.get(post.slug)?.href ?? '/poradnik'}
              className="card prc2 ri"
            >
              <span className="svk">{bySlug.get(post.slug)?.category}</span>
              <b className="h3">{post.title}</b>
              <p>{post.lead.split('. ')[0]}.</p>
              <span className="mut" style={{ fontSize: 13, marginTop: 'auto' }}>
                {T.featured.minutes(guideMinutes(post))}
              </span>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: 18 }}>
          <Link href="/poradnik" style={{ color: 'var(--accent-text)', fontWeight: 800 }}>
            {T.fromGuide.all} <Arrow />
          </Link>
        </p>
      </div>
    </InstSection>
  )
}
