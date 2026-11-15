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
import type { ServiceKey } from '../../dane/types'
import { CtaBandView } from '../../powloka/CtaBandView'
import { architekci } from '../../dane/architekci'
import { Faq } from '../../sekcje/Faq'
import { FromGuide } from '../../sekcje/FromGuide'
import { TrustStrip } from '../../sekcje/TrustStrip'
import { IlDefs } from '../../sekcje/IlDefs'
import { JsonLd } from '../../sekcje/JsonLd'
import { Packages } from '../../sekcje/Packages'
import { PageHero } from '../../sekcje/PageHero'
import { PriceFactors } from '../../sekcje/PriceFactors'
import { Related } from '../../sekcje/Related'
import { AntennaAim } from '../../widzety/anteny/AntennaAimLazy'
import { AlarmySections } from '../../widzety/alarmy/AlarmySections'
import { HouseDemo } from '../../widzety/alarmy/HouseDemoLazy'
import { AntenySections } from '../../widzety/anteny/AntenySections'
import { DostepSections } from '../../widzety/dostep/DostepSections'
import { LockDemo } from '../../widzety/dostep/DostepWidgetsLazy'
import { SieciSections } from '../../widzety/sieci/SieciSections'
import { CoverageMap } from '../../widzety/sieci/SieciWidgetsLazy'
import { BuildingScene } from '../../widzety/teletechnika/BuildingSceneLazy'
import { TeletechnikaSections } from '../../widzety/teletechnika/TeletechnikaSections'
import { teletechnika } from '../../dane/teletechnika'
import { MonitoringSections } from '../../widzety/monitoring/MonitoringSections'
import { NvrDemoLazy } from '../../widzety/monitoring/NvrDemoLazy'
import { SmartSections, SmartWarrantyNote } from '../../widzety/smart/SmartSections'
import { SmartPlan } from '../../widzety/smart/SmartWidgetsLazy'
import { EkranySections } from '../../widzety/ekrany/EkranySections'
import { ScreenPreview } from '../../widzety/ekrany/EkranyWidgetsLazy'
import { LadowarkiSections } from '../../widzety/ladowarki/LadowarkiSections'
import { ChargerShowcase } from '../../widzety/ladowarki/LadowarkiWidgetsLazy'
import { NaglosnienieSections } from '../../widzety/naglosnienie/NaglosnienieSections'
import { ZoneMixer } from '../../widzety/naglosnienie/NaglosnienieWidgetsLazy'
import { AreaStrip } from '../../obszar/AreaStrip'
import { salonsNote } from '../../powloka/salons'
import { PageStyles } from '../../style/LineStyles'

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
  /** Under the warranty section (Smart home: the Ampio warranty note). */
  /** Right under the trust band (Smart home: the Ampio warranty note). */
  afterTrust?: ReactNode
}
type LayoutContext = { planHref: string }

/** Pages built so far (I4, I7–I9); the other services show the shared sections until theirs. */
const LAYOUTS: Partial<Record<string, (ctx: LayoutContext) => ServiceLayout>> = {
  kam: ({ planHref }) => ({
    widget: <NvrDemoLazy />,
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
  smart: ({ planHref }) => ({
    widget: <SmartPlan />,
    sections: <SmartSections planHref={planHref} />,
    folded: ['cena', 'faq'],
    afterTrust: <SmartWarrantyNote />,
  }),
  snd: () => ({
    widget: <ZoneMixer />,
    sections: <NaglosnienieSections />,
    folded: ['cena', 'faq'],
  }),
  scr: () => ({
    widget: <ScreenPreview />,
    sections: <EkranySections />,
    folded: ['cena', 'faq'],
  }),
  ev: () => ({
    widget: <ChargerShowcase />,
    sections: <LadowarkiSections />,
    folded: ['cena', 'faq'],
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
  const salons = salonsNote(company?.locations ?? [])
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
      <PageStyles kind={service.key} />
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
              { name: 'Strona główna', url: `${origin}/` },
              { name: 'Usługi', url: `${origin}/uslugi` },
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
      <FromGuide tenantId={tenantId} service={service.key as ServiceKey} path={path} />
      <Related
        tenantId={tenantId}
        heading={service.relatedHeading}
        services={service.relatedServices}
        objects={service.similarObjects}
        extraLink={architekci.related}
      />
      <AreaStrip service={service.name} />
      {/* Runda v6 §1.3: the trust band right above the CTA band (Teletechnika has none). */}
      {layout?.guarantee !== false && <TrustStrip warrantyMonths={settings.warrantyMonths} />}
      {layout?.afterTrust}
      <CtaBandView band={band} phone={phone} salons={salons} titleId="cta-service-title" page />
    </div>
  )
}
