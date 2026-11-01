import { headers } from 'next/headers'

import { getEnv } from '@/lib/env'
import { getInstalacjeOffer } from '@/lib/instalacje/data'
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/seo/jsonLd'
import { siteOrigin } from '@/lib/seo/origin'
import type { InstOfferBlock as InstOfferBlockData } from '@/payload-types'

import { oferta as T } from '../../dane/oferta'
import { isInstIconName } from '../../icons'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSection'
import { JsonLd } from '../../sekcje/JsonLd'
import { PageCtaBand } from '../../sekcje/PageCtaBand'
import { SplitHero } from '../../sekcje/SplitHero'
import type { OfferArea, OfferCategory } from '../../widzety/oferta/offerModel'
import { OfferBar, OfferList } from '../../widzety/oferta/OfferWidgets'

import '../../widzety/oferta/oferta.css'

type Props = { block: InstOfferBlockData; tenantId: number }

const CATEGORIES = new Set<string>(['dom', 'apt', 'pens', 'rest', 'sklep', 'firma', 'inst', 'dev'])

/**
 * The full offer `/uslugi` (ADR-I002 §0, `Oferta.body.html`): the hero with the search and the
 * object chips, the areas with their solutions and the navigation of areas, „W każdej
 * instalacji”, the CTA band. Areas and solutions from the panel (published, this tenant); the
 * whole list is in the HTML (the filters only hide). The block carries the page's h1.
 */
export async function InstOfferBlock({ block, tenantId }: Props) {
  const [data, host] = await Promise.all([
    getInstalacjeOffer(tenantId),
    headers().then((h) => h.get('host')),
  ])
  const origin = siteOrigin(host, getEnv().SITE_ENV)
  const areas: OfferArea[] = data.map((a) => ({
    ...a,
    icon: a.icon && isInstIconName(a.icon) ? a.icon : null,
    solutions: a.solutions.map((s) => ({
      ...s,
      categories: s.categories.filter((c): c is OfferCategory => CATEGORIES.has(c)),
    })),
  }))
  const total = areas.reduce((n, a) => n + a.solutions.length, 0)
  const crumb = block.hero?.crumb || 'Pełna oferta'

  return (
    <>
      {origin && (
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: 'Start', url: `${origin}/` },
              { name: crumb, url: `${origin}/uslugi` },
            ]),
            itemListJsonLd({
              name: crumb,
              items: areas.flatMap((a) =>
                a.href ? [{ name: a.name, url: `${origin}${a.href}` }] : [],
              ),
            }),
          ]}
        />
      )}
      <SplitHero
        hero={block.hero}
        crumb={crumb}
        eyebrow={T.eyebrow(areas.length, total)}
        className="ofh"
        style={{ paddingBottom: 34 }}
      >
        <OfferBar areas={areas} />
      </SplitHero>

      <InstSection id="lista" fold foldHeight={2600} style={{ padding: '18px 0 96px' }}>
        <OfferList areas={areas} />
      </InstSection>

      <InstSection id="zawsze" style={{ padding: '0 0 104px' }}>
        <div className="wrap">
          <div className="odb ri" style={{ marginTop: 0 }} data-surface="dark">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="eye" style={{ color: 'var(--inst-dark-accent)' }}>
                {T.always.eyebrow}
              </span>
              <b className="h2" style={{ fontSize: 36 }}>
                {T.always.heading}
              </b>
              <p className="lead">{T.always.lead}</p>
            </div>
            <div className="odl">
              {T.always.items.map((o) => (
                <div key={o} className="odi">
                  <i>
                    <InstIcon name="check" size={18} strokeWidth={2.4} />
                  </i>
                  <span>{o}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InstSection>

      <PageCtaBand tenantId={tenantId} cta={block.cta} titleId="cta-offer-title" />
    </>
  )
}
