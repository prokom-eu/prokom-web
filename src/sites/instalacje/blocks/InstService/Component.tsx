import { notFound } from 'next/navigation'

import { getInstalacjeService } from '@/lib/instalacje/data'
import type { InstServiceBlock as InstServiceBlockData } from '@/payload-types'

type Props = { block: InstServiceBlockData; tenantId: number }

/**
 * Page of one Instalacje service (ADR-I002 §0). The block carries the page's h1, so a page
 * without its service (deleted, still in draft, another tenant's) is a 404, not an empty page.
 */
export async function InstServiceBlock({ block, tenantId }: Props) {
  // `null` despite the type: a deleted service (FK `set null`) or a draft saved without one.
  const serviceId = typeof block.service === 'number' ? block.service : block.service?.id
  const service = serviceId == null ? null : await getInstalacjeService(tenantId, serviceId)
  if (!service) notFound()
  const { hero } = service
  return (
    <section id="hero" className="phero">
      <div className="wrap">
        <h1>
          {hero?.eyebrow ? `${hero.eyebrow}: ` : ''}
          {hero?.h1a || service.name} {hero?.h1b}
        </h1>
      </div>
    </section>
  )
}
