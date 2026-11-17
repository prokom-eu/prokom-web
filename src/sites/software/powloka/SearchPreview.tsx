import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import { railIcon } from '@/lib/shared/rail'
import type { SearchResult } from '@/lib/shared/search/provider'
import { cardPrice } from '@/lib/software/cardPrice'
import type { SearchExtras } from '@/lib/software/searchExtras'
import { OFFER_ID, POST_ID } from '@/lib/software/searchEntries'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

import { PostCover } from '../components/news/PostCover'

type Props = {
  result: SearchResult
  index: SolutionsIndex | null
  extras: SearchExtras | null
}

/** Features shown in the preview of a solution; the offer window has them all. */
const FEATURES = 3

/**
 * The preview beside the results of the Software search (`SearchDialog`'s `renderPreview`, as
 * Biznes shows a product): a solution with its „od” price, term, lead and first features; a post
 * with its drawn cover, category and reading time; anything else with its icon and hint.
 */
export function SearchPreview({ result, index, extras }: Props) {
  if (result.id.startsWith(OFFER_ID) && index) {
    const solution = index.solutions.find((item) => `${OFFER_ID}${item.slug}` === result.id)
    if (solution) {
      const { head, term, ask } = cardPrice(solution, index.priceDisplay)
      return (
        <div className="flex flex-col gap-3">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-text">
            <Icon name={railIcon(result.icon)} className="size-6" strokeWidth={2} />
          </span>
          <p className="font-display text-lg leading-tight font-extrabold text-ink">
            {solution.name}
          </p>
          <p className="flex flex-wrap items-baseline gap-x-1.5 text-ink">
            {head.before && <span className="text-sm text-ink-2">{head.before}</span>}
            <span className={ask ? 'font-bold' : 'font-display text-2xl font-black'}>
              {head.amount}
            </span>
            {head.after && <span className="text-sm text-ink-2">{head.after}</span>}
          </p>
          <p className="text-sm text-ink-2">Termin: {term}</p>
          {solution.lead && <p className="text-sm text-ink-2">{solution.lead}</p>}
          {solution.features.length > 0 && (
            <ul className="flex flex-col gap-1.5 text-sm text-ink">
              {solution.features.slice(0, FEATURES).map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Icon
                    name="check"
                    className="mt-0.5 size-4 flex-none text-accent-text"
                    strokeWidth={2.4}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href={result.href} className="sdlg__cta self-start">
            Zobacz w ofercie →
          </Link>
        </div>
      )
    }
  }
  if (result.id.startsWith(POST_ID) && extras) {
    const post = extras.posts.find((item) => `${POST_ID}${item.slug}` === result.id)
    if (post) {
      return (
        <div className="flex flex-col gap-3">
          <PostCover
            slug={post.slug}
            category={post.category ?? 'poradnik'}
            className="sw-search-cover"
          />
          <p className="text-[13px] font-bold text-ink-2">
            {[post.categoryLabel, `${post.minutes} min czytania`].filter(Boolean).join(' · ')}
          </p>
          <p className="font-display text-lg leading-tight font-extrabold text-ink">{post.title}</p>
          {post.lead && <p className="line-clamp-4 text-sm text-ink-2">{post.lead}</p>}
          <Link href={post.href} className="sdlg__cta self-start">
            Czytaj →
          </Link>
        </div>
      )
    }
  }
  return (
    <div className="flex flex-col items-start gap-3">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-text">
        <Icon name={railIcon(result.icon)} className="size-6" strokeWidth={2} />
      </span>
      <p className="font-display text-lg leading-tight font-extrabold text-ink">{result.title}</p>
      {result.hint && <p className="text-sm text-ink-2">{result.hint}</p>}
      <Link href={result.href} className="font-extrabold text-accent-text hover:underline">
        Otwórz →
      </Link>
    </div>
  )
}
