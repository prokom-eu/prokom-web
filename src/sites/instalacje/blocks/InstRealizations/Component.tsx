import { headers } from 'next/headers'

import { getEnv } from '@/lib/env'
import { getInstalacjeRealizations } from '@/lib/instalacje/data'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { siteOrigin } from '@/lib/seo/origin'
import type { InstRealizationsBlock as InstRealizationsBlockData } from '@/payload-types'

import { JsonLd } from '../../sekcje/JsonLd'
import { PageCtaBand } from '../../sekcje/PageCtaBand'
import { SplitHero } from '../../sekcje/SplitHero'
import { RealizationFilters, RealizationGrid } from '../../widzety/realizacje/RealizationsWidgets'

type Props = { block: InstRealizationsBlockData; tenantId: number }

/**
 * The realizations `/realizacje` (ADR-I002 §0, `Realizacje.body.html`): filters in the hero, the
 * cards, the CTA band. Only realizations published with the client's consent; no fictitious ones
 * and no internal note of the prototype („Lista z dotychczasowej strony… [SZEF]”). No year until
 * the panel has one (the prototype: „rok: [SZEF]”). The block carries the page's h1.
 */
export async function InstRealizationsBlock({ block, tenantId }: Props) {
  const [items, host] = await Promise.all([
    getInstalacjeRealizations(tenantId),
    headers().then((h) => h.get('host')),
  ])
  const origin = siteOrigin(host, getEnv().SITE_ENV)
  const crumb = block.hero?.crumb || 'Realizacje'
  return (
    <>
      {origin && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: 'Start', url: `${origin}/` },
            { name: crumb, url: `${origin}/realizacje` },
          ])}
        />
      )}
      <SplitHero hero={block.hero} crumb={crumb} style={{ paddingBottom: 40 }}>
        <RealizationFilters items={items} />
      </SplitHero>
      <section style={{ padding: '0 0 80px' }}>
        <div className="wrap">
          <RealizationGrid items={items} />
        </div>
      </section>
      <PageCtaBand tenantId={tenantId} cta={block.cta} titleId="cta-realizations-title" />
    </>
  )
}
