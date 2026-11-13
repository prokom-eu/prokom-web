import Link from 'next/link'
import type { CSSProperties } from 'react'

import { AREA_TOWNS, areaHref } from '@/lib/instalacje/area'
import {
  getInstalacjeCards,
  getInstalacjeRealizations,
  getInstalacjeSettings,
} from '@/lib/instalacje/data'
import { SERVICE_KEYS } from '@/lib/instalacje/options'
import { townRealizations, townServiceJsonLd } from '@/lib/instalacje/townPage'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'

import { Arrow } from '../Arrow'
import { navigation } from '../dane/nawigacja'
import { type TownText, townPage } from '../dane/miejscowosci'
import { InstIcon } from '../InstIcon'
import { safeColor } from '../obiekty/objectModel'
import { CtaBandView } from '../powloka/CtaBandView'
import { salonsList, salonsNote } from '../powloka/salons'
import { Faq } from '../sekcje/Faq'
import { InstSection } from '../sekcje/InstSectionLazy'
import { JsonLd } from '../sekcje/JsonLd'
import { PageHero } from '../sekcje/PageHero'
import { SectionHead } from '../sekcje/SectionHead'
import { TrustStrip } from '../sekcje/TrustStrip'
import { ObjectPageStyles } from '../style/LineStyles'

type Props = { tenantId: number; town: TownText; name: string; origin: string }

const SECTION = { padding: '0 0 104px' } satisfies CSSProperties
const hueOf = (color: string) => ({ '--c': color }) as CSSProperties
// The ridge of the Podhale band (the same as on the object pages, `.sggm`).
const RIDGE =
  'M0 160 L0 110 L120 70 L210 98 L330 30 L420 82 L520 50 L640 104 L760 40 L860 90 L980 56 L1090 96 L1200 64 L1200 160 Z'
const ANCHORS = [
  { anchorId: 'uslugi', name: 'Usługi' },
  { anchorId: 'okolica', name: 'Okolica' },
  { anchorId: 'faq', name: 'Pytania' },
]
const townName = (slug: string) => AREA_TOWNS.find((t) => t.slug === slug)?.name ?? slug
const serviceLabel = (key: string) => SERVICE_KEYS.find((s) => s.value === key)?.label ?? key

/**
 * Page of one town (`/obszar/<slug>`, ADR-I006): hero with the way from the salon, the services
 * that matter here (names, addresses and colours from the panel), what makes the place
 * different, realizations of the town (only published ones with a photo), local FAQ, nearby towns
 * and the CTA band. The texts are the town's own (`dane/miejscowosci.ts`).
 */
export async function TownPage({ tenantId, town, name, origin }: Props) {
  const [cards, settings, site, company, realizations] = await Promise.all([
    getInstalacjeCards(tenantId),
    getInstalacjeSettings(tenantId),
    getSiteSettings(tenantId),
    getCompanyData(),
    getInstalacjeRealizations(tenantId),
  ])
  const telHref = site?.phone ? toTelHref(site.phone) : null
  const phone = site?.phone && telHref ? { label: site.phone, href: telHref } : null
  const locations = company?.locations ?? []
  const salon = locations.length ? salonsList(locations.slice(0, 1)) : null
  const path = areaHref(town.slug)

  const services = town.services.map(({ key, text }) => {
    const card = cards.services.find((s) => s.key === key)
    return {
      key,
      text,
      name: card?.name ?? serviceLabel(key),
      href: card?.slug ? `/${card.slug}` : null,
      icon: card?.icon ?? 'check',
      color: safeColor(card?.color),
    }
  })
  const local = townRealizations(realizations, town.places ?? [name]).slice(0, 3)
  const h1 = townPage.h1(name)
  const band = {
    ...navigation.ctaBand,
    eyebrow: townPage.cta.eyebrow,
    title: townPage.cta.title(town.locative),
    text: townPage.cta.text,
  }

  return (
    <div
      // Town names are long: a smaller h1 keeps the buttons above the fold on a phone.
      className="inst-svc inst-obj [&_#hero_.h1]:text-[clamp(30px,calc(3.4vw_+_14px),60px)]!"
      data-inst-sx=""
      data-inst-il=""
    >
      <ObjectPageStyles />
      <JsonLd
        data={townServiceJsonLd({
          origin,
          slug: town.slug,
          name,
          description: town.description,
          services: services.map((s) => s.name),
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Strona główna', url: `${origin}/` },
          { name: townPage.parent.label, url: `${origin}${townPage.parent.href}` },
          { name, url: `${origin}${path}` },
        ])}
      />
      <PageHero
        hero={{
          crumb: name,
          eyebrow: townPage.eyebrow(town.locative),
          h1a: h1.a,
          h1b: h1.b,
          lead: town.lead,
          tags: [...townPage.tags],
          cta: { text: 'Zaplanuj instalację', href: '/zaplanuj' },
        }}
        name={name}
        anchors={ANCHORS}
        phone={phone}
        parent={townPage.parent}
        widget={
          <aside className="card flex flex-col gap-3 p-6" aria-labelledby="dojazd-h">
            <span className="ico">
              <InstIcon name="car" size={20} />
            </span>
            <h2 id="dojazd-h" className="text-xl font-extrabold">
              {townPage.routeTitle}
            </h2>
            {salon && <p className="font-bold">{salon}</p>}
            <p className="text-ink-2">{town.route}</p>
            <p className="text-sm text-ink-2">{townPage.zoneNote[town.zone]}</p>
            <Link href={townPage.routeLink.href} className="sgchip mt-1">
              <i />
              {townPage.routeLink.label} <Arrow />
            </Link>
          </aside>
        }
      />

      <InstSection id="uslugi" style={{ padding: '104px 0 104px' }}>
        <div className="wrap">
          <SectionHead
            eyebrow={townPage.servicesEyebrow}
            heading={townPage.servicesHeading(town.locative)}
            lead={townPage.servicesLead}
          />
          <ul className="sgpg">
            {services.map((s) => (
              <li key={s.key} className="card sgpc ri" style={hueOf(s.color)}>
                <span className="sgpi">
                  <InstIcon name={s.icon} size={20} />
                </span>
                <h3 className="sgq">{s.name}</h3>
                <p>{s.text}</p>
                {s.href && (
                  <Link href={s.href} className="sgchip mt-auto">
                    <i />
                    {townPage.serviceLink}
                    <span className="sr-only">: {s.name}</span> <Arrow />
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <p className="ri mt-6">
            <Link href={townPage.allServices.href} className="font-extrabold underline">
              {townPage.allServices.label}
            </Link>
          </p>
        </div>
      </InstSection>

      <InstSection id="okolica" style={SECTION}>
        <div className="wrap">
          <div className="sggw ri">
            <svg
              className="sggm"
              viewBox="0 0 1200 160"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d={RIDGE} />
            </svg>
            <div className="sggh">
              <span className="eye" style={{ color: 'var(--inst-dark-accent)' }}>
                {townPage.traitsEyebrow}
              </span>
              <h2 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
                {townPage.traitsHeading(town.locative)}
              </h2>
            </div>
            <div className="sggg min-[1101px]:grid-cols-3!">
              {town.traits.map((t) => (
                <div key={t.title} className="sggc">
                  <span className="ico s">
                    <InstIcon name={t.icon} size={20} />
                  </span>
                  <b>{t.title}</b>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InstSection>

      {local.length > 0 && (
        <InstSection id="realizacje" style={SECTION}>
          <div className="wrap">
            <SectionHead
              eyebrow={townPage.realizationsEyebrow}
              heading={townPage.realizationsHeading}
            />
            <ul className="sgpg">
              {local.map((r) => (
                <li key={r.id} className="card sgpc ri">
                  <h3 className="sgq">{r.title}</h3>
                  {r.place && <p className="font-bold">{r.place}</p>}
                  {r.scope && <p>{r.scope}</p>}
                </li>
              ))}
            </ul>
            <p className="ri mt-6">
              <Link href={townPage.realizationsLink.href} className="font-extrabold underline">
                {townPage.realizationsLink.label}
              </Link>
            </p>
          </div>
        </InstSection>
      )}

      <Faq
        heading={townPage.faqHeading(town.locative)}
        items={[...town.faq]}
        aside={undefined}
        phone={phone}
      />

      <section aria-labelledby="okolice-h" style={SECTION}>
        <div className="wrap">
          <h2 id="okolice-h" className="eye">
            {townPage.nearbyHeading}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {town.nearby.map((slug) => (
              <li key={slug}>
                <Link href={areaHref(slug)} className="tag a">
                  <InstIcon name="pin" size={13} />
                  {townName(slug)}
                </Link>
              </li>
            ))}
            <li>
              <Link href={townPage.parent.href} className="tag">
                {townPage.allTowns}
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <TrustStrip warrantyMonths={settings.warrantyMonths} />
      <CtaBandView
        band={band}
        phone={phone}
        salons={salonsNote(locations)}
        titleId="cta-town-title"
        page
      />
    </div>
  )
}
