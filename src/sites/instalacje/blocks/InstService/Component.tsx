import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { CSSProperties, ReactNode } from 'react'

import { getEnv } from '@/lib/env'
import { getInstalacjeService, getInstalacjeSettings } from '@/lib/instalacje/data'
import { serviceJsonLd } from '@/lib/instalacje/seo'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { siteOrigin } from '@/lib/seo/origin'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { InstServiceBlock as InstServiceBlockData } from '@/payload-types'

import { navigation } from '../../dane/nawigacja'
import { CtaBandView } from '../../powloka/CtaBandView'
import { Faq } from '../../sekcje/Faq'
import { GuaranteeSection } from '../../sekcje/GuaranteeSection'
import { IlDefs } from '../../sekcje/IlDefs'
import { JsonLd } from '../../sekcje/JsonLd'
import { Packages } from '../../sekcje/Packages'
import { PageHero } from '../../sekcje/PageHero'
import { PriceFactors } from '../../sekcje/PriceFactors'
import { Related } from '../../sekcje/Related'
import { AntennaAim } from '../../widzety/anteny/AntennaAim'
import { AlarmySections } from '../../widzety/alarmy/AlarmySections'
import { HouseDemo } from '../../widzety/alarmy/HouseDemo'
import { AntenySections } from '../../widzety/anteny/AntenySections'
import { DostepSections } from '../../widzety/dostep/DostepSections'
import { LockDemo } from '../../widzety/dostep/DostepWidgets'
import { SieciSections } from '../../widzety/sieci/SieciSections'
import { CoverageMap } from '../../widzety/sieci/SieciWidgets'
import { BuildingScene } from '../../widzety/teletechnika/BuildingScene'
import { TeletechnikaSections } from '../../widzety/teletechnika/TeletechnikaSections'
import { teletechnika } from '../../dane/teletechnika'
import { MonitoringSections } from '../../widzety/monitoring/MonitoringSections'
import { NvrDemo } from '../../widzety/monitoring/NvrDemo'

type Props = { block: InstServiceBlockData; tenantId: number }

/** What a service page adds to the shared sections: its widget and its own sections. */
type ServiceLayout = {
  widget: ReactNode
  sections: ReactNode
  folded: readonly string[]
  /** Without the warranty section (Teletechnika: not in the prototype's page). */
  guarantee?: false
  /** Button of the CTA band instead of the planner (Teletechnika: to the quote form). */
  bandButton?: { label: string; href: string }
}
type LayoutContext = { planHref: string }

/** Pages built so far (I4, I7, I8); the other services show the shared sections until I9. */
const LAYOUTS: Partial<Record<string, (ctx: LayoutContext) => ServiceLayout>> = {
  kam: ({ planHref }) => ({
    widget: <NvrDemo />,
    sections: <MonitoringSections planHref={planHref} />,
    folded: ['cena', 'faq'],
  }),
  alarm: () => ({
    widget: <HouseDemo />,
    sections: <AlarmySections />,
    folded: ['cena', 'faq'],
  }),
  kd: () => ({
    widget: <LockDemo />,
    sections: <DostepSections />,
    folded: ['cena', 'faq'],
  }),
  wifi: () => ({
    widget: <CoverageMap />,
    sections: <SieciSections />,
    folded: ['cena', 'faq'],
  }),
  tel: () => ({
    widget: <BuildingScene />,
    sections: <TeletechnikaSections />,
    folded: ['faq'],
    guarantee: false,
    bandButton: teletechnika.bandButton,
  }),
  ant: () => ({
    widget: <AntennaAim />,
    sections: <AntenySections />,
    folded: ['cena', 'faq'],
  }),
}

/**
 * Page of one Instalacje service (ADR-I002 §0, KOMPONENTY §2): hero with the service's widget,
 * its own sections, then warranty, packages, price factors, FAQ and related, and the CTA band
 * with the service's texts. The block carries the page's h1, so a page without its service
 * (deleted, still in draft, another tenant's) is a 404, not an empty page.
 */
export async function InstServiceBlock({ block, tenantId }: Props) {
  // `null` despite the type: a deleted service (FK `set null`) or a draft saved without one.
  const serviceId = typeof block.service === 'number' ? block.service : block.service?.id
  const service = serviceId == null ? null : await getInstalacjeService(tenantId, serviceId)
  if (!service) notFound()

  const [settings, site, company, host] = await Promise.all([
    getInstalacjeSettings(tenantId),
    getSiteSettings(tenantId),
    getCompanyData(),
    headers().then((h) => h.get('host')),
  ])
  const origin = siteOrigin(host, getEnv().SITE_ENV)
  const telHref = site?.phone ? toTelHref(site.phone) : null
  const phone = site?.phone && telHref ? { label: site.phone, href: telHref } : null
  const salons = (company?.locations ?? []).map((l) => `${l.city}, ${l.street}`).join(' · ')
  const path = `/${service.slug}`
  const planHref = `/zaplanuj?usluga=${service.key}`
  const layout = LAYOUTS[service.key]?.({ planHref })
  const folded = new Set(layout?.folded ?? [])
  const crumb = service.hero?.crumb || service.name
  const band = {
    ...navigation.ctaBand,
    eyebrow: service.cta?.eyebrow || navigation.ctaBand.eyebrow,
    title: service.cta?.heading || navigation.ctaBand.title,
    text: service.cta?.text || navigation.ctaBand.text,
    button: layout?.bandButton ?? navigation.ctaBand.button,
  }

  return (
    // Scene palettes of the illustrations (tokens.css: `--sx-*`, `--il-*`) and the shared
    // gradients they paint with.
    <div
      className="inst-svc"
      data-inst-sx=""
      data-inst-il=""
      style={{ '--h': service.color || undefined } as CSSProperties}
    >
      <IlDefs />
      {origin && (
        <>
          <JsonLd
            data={serviceJsonLd({
              origin,
              path,
              name: crumb,
              description: service.hero?.lead,
              serviceType: service.name,
            })}
          />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: 'Start', url: `${origin}/` },
              { name: 'Usługi', url: `${origin}/#uslugi` },
              { name: crumb, url: `${origin}${path}` },
            ])}
          />
        </>
      )}
      <PageHero
        hero={service.hero}
        name={service.name}
        anchors={service.anchors}
        phone={phone}
        widget={layout?.widget}
      />
      {layout?.sections}
      {layout?.guarantee !== false && (
        <GuaranteeSection
          warrantyMonths={settings.warrantyMonths}
          responseText={settings.responseText}
        />
      )}
      <Packages
        intro={service.packagesIntro}
        packages={service.packages}
        prices={settings}
        planHref={planHref}
      />
      <PriceFactors
        intro={service.priceIntro}
        factors={service.priceFactors}
        planHref={planHref}
        fold={folded.has('cena')}
      />
      <Faq
        heading={service.faqHeading}
        items={service.faq}
        aside={service.faqAside}
        phone={phone}
        fold={folded.has('faq')}
      />
      <Related
        tenantId={tenantId}
        heading={service.relatedHeading}
        services={service.relatedServices}
        objects={service.similarObjects}
      />
      <CtaBandView band={band} phone={phone} salons={salons} titleId="cta-service-title" page />
    </div>
  )
}
