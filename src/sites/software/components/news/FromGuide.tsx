import { IntentLink as Link } from '@/components/shared/IntentLink'

import { getPostList } from '@/lib/posts/data'
import { NEWS_PATH } from '@/lib/posts/list'

import { SectionHead } from '../ui/SectionHead'
import { PostCardList } from './PostCards'
import { SOFTWARE_NEWS_TEXTS as T } from './texts'

/** Posts shown in the section (decision 15.11: 2–3, the newest). */
const SHOWN = 3

/**
 * „Z poradnika” on `/o-firmie` and `/kontakt` of Software (request of Krystian 15.11): the three
 * newest posts of this tenant and a link to the whole list. Nothing at all without a public post
 * (same query and cache tag as the list, so publishing one shows the section).
 */
export async function FromGuide({ tenantId, id }: { tenantId: number; id: string }) {
  const posts = (await getPostList(tenantId)).slice(0, SHOWN)
  if (posts.length === 0) return null
  const headingId = `${id}-h`
  return (
    <section id={id} aria-labelledby={headingId} className="v-sec">
      <div className="v-wrap flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead
            id={headingId}
            eyebrow={T.fromGuide.eyebrow}
            title={T.fromGuide.title}
            em={T.fromGuide.em}
            lead={T.fromGuide.lead}
          />
          <Link
            href={NEWS_PATH}
            className="inline-flex min-h-12 shrink-0 items-center rounded-full border border-border bg-card px-5 font-extrabold"
          >
            {T.fromGuide.all}
          </Link>
        </div>
        <PostCardList posts={posts} headingLevel="h3" />
      </div>
    </section>
  )
}
