import { getInstalacjeRealizations } from '@/lib/instalacje/data'
import { leadPhoto, matchRealization } from '@/lib/instalacje/realizations'

import { RealizationPhotos } from '../widzety/realizacje/RealizationPhotosLazy'

export type StripItem = {
  /** Name used to find the published realization (`matchRealization`). */
  name: string
  /** What the card says about the work on this page. */
  place: string
  /** Words that pick the cover photo (`leadPhoto`). */
  hint: string
}

type Props = { tenantId: number; items: readonly StripItem[] }

/**
 * Realizations named on a service page with their photos (RUNDA-V5 §11): only those published
 * with photos and the client's consent (this tenant's `getInstalacjeRealizations`) are shown;
 * none matched → nothing, the page's sentence about them stays.
 */
export async function RealizationStrip({ tenantId, items }: Props) {
  const withPhotos = (await getInstalacjeRealizations(tenantId)).filter((r) => r.photos.length > 0)
  const cards = items.flatMap((item) => {
    const match = matchRealization(item.name, withPhotos)
    const photos = match && leadPhoto(`${item.place} ${item.hint}`, match.photos)
    return photos ? [{ ...item, photos }] : []
  })
  if (cards.length === 0) return null
  return (
    <div className="rlstrip">
      {cards.map((card) => (
        <div key={`${card.name}-${card.place}`} className="card rl ri">
          <div className="rlimg rlimgp">
            <RealizationPhotos
              photos={card.photos}
              title={card.name}
              sizes="(min-width: 1100px) 400px, (min-width: 700px) 50vw, 100vw"
            />
          </div>
          <div className="rlb">
            <b className="h3">{card.name}</b>
            <span>{card.place}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
