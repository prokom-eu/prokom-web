import { headers } from 'next/headers'

import { getEnv } from '@/lib/env'
import { getInstalacjeHome, getInstalacjeMenu, getInstalacjeSettings } from '@/lib/instalacje/data'
import { websiteJsonLd } from '@/lib/instalacje/seo'
import { SERVICE_KEYS } from '@/lib/instalacje/options'
import { siteOrigin } from '@/lib/seo/origin'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref, toWhatsAppHref } from '@/lib/site/link'
import type { InstHomeBlock as InstHomeBlockData } from '@/payload-types'

import { glownaSekcje } from '../../dane/glownaSekcje'
import type { ObjectKey, ServiceKey } from '../../dane/types'
import { InstIcon } from '../../InstIcon'
import { ArchTeaser } from '../../sekcje/arch/ArchTeaser'
import { Faq } from '../../sekcje/Faq'
import { ForWhoGrid } from '../../sekcje/glowna/ForWhoGrid'
import {
  MountainsSection,
  ProcessSteps,
  RealizationsTeaser,
  ServiceTeaser,
} from '../../sekcje/glowna/HomeSections'
import { PlanSection } from '../../sekcje/glowna/PlanSection'
import { type HomeService, ServicesGrid, TrustBand } from '../../sekcje/glowna/ServicesGrid'
import { JsonLd } from '../../sekcje/JsonLd'
import { HeroBackdrop } from '../../widzety/glowna/HeroBackdrop'
import { LiveObjectHero } from '../../widzety/glowna/LiveObjectHero'
import { SectionRail } from '../../widzety/glowna/SectionRail'

type Props = { block: InstHomeBlockData; tenantId: number }

/** Where „Zaplanuj instalację” leads: the planner with the hero's starting set (spec §5.1). */
export const HOME_PLAN_HREF = '/zaplanuj#obiekt=pens&uslugi=kam,wifi'

const SITE_NAME = 'PRO-KOM Instalacje'

/**
 * Home page of the Instalacje line (ADR-I002 §0, KOMPONENTY §3): the hero „Twój obiekt na
 * żywo” (I5) and the sections below it (I6) in the order of the design. The hero's text column
 * and the fixed backdrop are rendered on the server (SEO, LCP from the h1). Services and objects
 * come from the panel (published, this tenant), texts from `dane/glownaSekcje.ts`.
 */
export async function InstHomeBlock({ block, tenantId }: Props) {
  const { hero } = block
  const [site, menu, home, settings, company, host] = await Promise.all([
    getSiteSettings(tenantId),
    getInstalacjeMenu(tenantId),
    getInstalacjeHome(tenantId),
    getInstalacjeSettings(tenantId),
    getCompanyData(),
    headers().then((h) => h.get('host')),
  ])
  const origin = siteOrigin(host, getEnv().SITE_ENV)
  const telHref = site?.phone ? toTelHref(site.phone) : null
  const phone = site?.phone && telHref ? { label: site.phone, href: telHref } : null
  const whatsapp = settings.whatsapp ? toWhatsAppHref(settings.whatsapp) : null
  const services = new Map<ServiceKey, HomeService>(
    menu.services.flatMap((column) =>
      column.items.map((item) => [item.key as ServiceKey, { ...item, group: column.label }]),
    ),
  )
  const objects = new Map(
    menu.objects.flatMap((column) => column.items.map((item) => [item.key as ObjectKey, item])),
  )
  // The form lists the services in the panel's order (prototype `c.SV`), not the menu's.
  const order = SERVICE_KEYS.map((s) => s.value as string)
  const planServices = [...services.values()]
    .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
    .map(({ key, label, icon, color }) => ({
      key: key as ServiceKey,
      label,
      icon,
      color,
    }))
  const salons = (company?.locations ?? []).map((l) => ({
    name: l.city,
    address: `${l.street}, ${l.postalCode} ${l.city}`,
  }))
  const t = glownaSekcje.faq
  const firstHours = company?.locations?.[0]?.hours
  const hours = firstHours?.length ? hoursSummary(firstHours) : null

  return (
    <>
      {origin && <JsonLd data={websiteJsonLd({ origin, name: SITE_NAME })} />}
      <SectionRail />
      <LiveObjectHero backdrop={<HeroBackdrop />}>
        <div className="hxt">
          <span className="hpill in d1">
            <span className="live" aria-hidden="true" />
            {hero.eyebrow}
          </span>
          <h1 className="disp in d2">
            <span className="hxs">{hero.kicker}</span>
            <span className="sr-only">. </span>
            {hero.h1a} <span className="hxk">{hero.h1b}</span>
          </h1>
          <p className="lead in d3">{hero.lead}</p>
          <div className="hxcta in d4">
            <a href={HOME_PLAN_HREF} className="btn hbtn-p">
              <InstIcon name="home" strokeWidth={2.2} />
              Zaplanuj instalację
            </a>
            {phone ? (
              <a href={phone.href} className="btn hbtn-g">
                <InstIcon name="phone" />
                {phone.label}
              </a>
            ) : null}
          </div>
          {hero.trust?.length ? (
            <div className="htrust in d5">
              {hero.trust.map((point) => (
                <span key={point.id ?? point.text}>
                  <i>
                    <InstIcon name={point.icon} size={14} strokeWidth={2.4} />
                  </i>
                  {point.text}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </LiveObjectHero>
      <TrustBand />
      <ForWhoGrid objects={objects} />
      <ServicesGrid
        services={services}
        offer={menu.offer}
        brands={home.brands}
        noPriceText={settings.noPriceText}
      />
      <ArchTeaser tenantId={tenantId} />
      <RealizationsTeaser items={home.realizations} />
      <MountainsSection />
      <ProcessSteps />
      <ServiceTeaser />
      <Faq
        heading={t.heading}
        eyebrow={t.eyebrow}
        headLink={{ label: t.guide, href: '/poradnik' }}
        items={t.items}
        aside={{
          title: t.aside.title,
          text: t.aside.text,
          button: whatsapp ? t.aside.button : t.aside.buttonNoWhatsapp,
          href: whatsapp ?? '/kontakt',
        }}
        phone={phone}
        fold
        className="bnd bnd-soft xa-s"
        style={{ padding: '100px 0 104px' }}
      />
      <PlanSection
        services={planServices}
        phone={phone}
        email={site?.email ?? null}
        salons={salons}
        whatsapp={whatsapp}
        hours={hours}
      />
    </>
  )
}
