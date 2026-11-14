import type { Metadata } from 'next'

import { getSharedData } from '@/lib/shared/getSharedData'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { HUB_CONTAINER } from '../container'

/** Title of the start page (spec §4); SEO of every page is finished in H6-2. */
export const HOME_METADATA: Metadata = {
  title: { absolute: 'PRO-KOM Rabka-Zdrój — IT dla firm, instalacje, serwis' },
}

/**
 * The hub's start page in H1-2: a skeleton of the sections of spec §6.1 with the anchors of the
 * rail (`shared.rail.sections`, `data-rail-section`), so the shell can be tried end to end. The
 * content of each section comes in H2 (board Main).
 */
export async function HomeSkeleton({ tenant }: { tenant: SiteTenant }) {
  const shared = await getSharedData(tenant.id)
  const sections = shared?.line.rail?.sections ?? []
  return (
    <div className={`pk-home py-10 ${HUB_CONTAINER}`}>
      <h1 className="font-display text-5xl font-extrabold">PRO-KOM</h1>
      {sections.map((section, index) => (
        <section
          key={section.anchorId}
          id={section.anchorId}
          data-rail-section
          data-rail-label={section.label}
          data-rail-icon={section.icon}
          aria-labelledby={`${section.anchorId}-h`}
          className="min-h-[40vh] border-t border-border py-12"
        >
          <p className="text-sm font-extrabold text-ink-3">{String(index + 1).padStart(2, '0')}</p>
          <h2 id={`${section.anchorId}-h`} className="font-display text-3xl font-extrabold">
            {section.label}
          </h2>
        </section>
      ))}
    </div>
  )
}
