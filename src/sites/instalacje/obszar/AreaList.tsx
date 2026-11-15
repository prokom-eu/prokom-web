import Link from 'next/link'
import type { CSSProperties } from 'react'

import { AREA_PATH, AREA_TOWNS, areaHref } from '@/lib/instalacje/area'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'

import { Arrow } from '../Arrow'
import { navigation } from '../dane/nawigacja'
import { TOWNS, type TownText, townPage } from '../dane/miejscowosci'
import { InstIcon } from '../InstIcon'
import { CtaBandView } from '../powloka/CtaBandView'
import { salonsNote } from '../powloka/salons'
import { InstSection } from '../sekcje/InstSectionLazy'
import { JsonLd } from '../sekcje/JsonLd'
import { PageHero } from '../sekcje/PageHero'
import { SectionHead } from '../sekcje/SectionHead'
import { ObjectPageStyles } from '../style/LineStyles'

type Props = { tenantId: number; origin: string }

const nameOf = (slug: string) => AREA_TOWNS.find((t) => t.slug === slug)?.name ?? slug
const ZONES = ['podhale', 'dalej'] as const

/**
 * `/obszar` (ADR-I006): every town with a page, by travel zone, each with its own one-line
 * summary — the hub the footer, the service pages and the site map link to.
 */
export async function AreaList({ tenantId, origin }: Props) {
  const [site, company] = await Promise.all([getSiteSettings(tenantId), getCompanyData()])
  const telHref = site?.phone ? toTelHref(site.phone) : null
  const phone = site?.phone && telHref ? { label: site.phone, href: telHref } : null
  const { list } = townPage
  const byZone = (zone: TownText['zone']) => TOWNS.filter((t) => t.zone === zone)

  return (
    <div
      // Town names are long: a smaller h1 keeps the buttons above the fold on a phone.
      className="inst-svc inst-obj [&_#hero_.h1]:text-[clamp(30px,calc(3.4vw_+_14px),60px)]!"
      data-inst-sx=""
      data-inst-il=""
    >
      <ObjectPageStyles />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Strona główna', url: `${origin}/` },
          { name: townPage.parent.label, url: `${origin}${AREA_PATH}` },
        ])}
      />
      <PageHero
        hero={{
          crumb: townPage.parent.label,
          eyebrow: list.eyebrow,
          h1a: list.h1a,
          h1b: list.h1b,
          lead: list.lead,
          tags: [...townPage.tags],
          cta: { text: 'Zaplanuj instalację', href: '/zaplanuj' },
        }}
        name={list.title}
        anchors={[]}
        phone={phone}
        parent={null}
      />
      {ZONES.map((zone, index) => (
        <InstSection
          key={zone}
          id={`strefa-${zone}`}
          style={{ padding: index === 0 ? '104px 0 104px' : '0 0 104px' }}
        >
          <div className="wrap">
            <SectionHead eyebrow={townPage.parent.label} heading={list.zones[zone]} />
            <ul className="sgpg">
              {byZone(zone).map((town) => (
                <li key={town.slug} className="card sgpc ri">
                  <span
                    className="sgpi"
                    style={{ '--c': 'var(--inst-plan-send-to)' } as CSSProperties}
                  >
                    <InstIcon name="pin" size={20} />
                  </span>
                  <h3 className="sgq">
                    <Link href={areaHref(town.slug)}>{nameOf(town.slug)}</Link>
                  </h3>
                  <p>{town.summary}</p>
                  <Link
                    href={areaHref(town.slug)}
                    className="sgchip mt-auto"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <i />
                    Instalacje {town.locative} <Arrow />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </InstSection>
      ))}
      <CtaBandView
        band={navigation.ctaBand}
        phone={phone}
        salons={salonsNote(company?.locations ?? [])}
        titleId="cta-area-title"
        page
      />
    </div>
  )
}
