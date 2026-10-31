import Link from 'next/link'
import type { CSSProperties } from 'react'

import { getInstalacjeCards, getInstalacjeSettings } from '@/lib/instalacje/data'
import { objectHref } from '@/lib/instalacje/menu'
import { SERVICE_KEYS } from '@/lib/instalacje/options'
import { serviceJsonLd } from '@/lib/instalacje/seo'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { InstObject } from '@/payload-types'

import { navigation } from '../dane/nawigacja'
import { type BuiltObjectKey, OBJECT_SCENES, objectPage } from '../dane/obiekty'
import { LEGAL_NOTE } from '../dane/prawo'
import type { ServiceKey } from '../dane/types'
import { InstIcon } from '../InstIcon'
import { CtaBandView } from '../powloka/CtaBandView'
import { Faq } from '../sekcje/Faq'
import { GuaranteeSection } from '../sekcje/GuaranteeSection'
import { InstSection } from '../sekcje/InstSection'
import { JsonLd } from '../sekcje/JsonLd'
import { Packages } from '../sekcje/Packages'
import { PageHero } from '../sekcje/PageHero'
import { Related } from '../sekcje/Related'
import { SectionHead } from '../sekcje/SectionHead'
import { DayTimeline } from './DayTimeline'
import { ObjectScene } from './ObjectScene'
import {
  dayHotspots,
  INITIAL_SCENE,
  objectPlanHref,
  prepareLead,
  safeColor,
  sceneHtml,
} from './objectModel'
import { OBJECT_SCENE_ART } from './sceny'
import { PrepChecklist } from './PrepChecklist'
import type { DayMoment, ObjectHotspot, ServiceChip } from './types'

import './obiekty.css'

type Props = { tenantId: number; object: InstObject; sceneKey: BuiltObjectKey; origin: string }

const SECTION = { padding: '0 0 104px' } satisfies CSSProperties
const hueOf = (color: string) => ({ '--c': color }) as CSSProperties
const WHO: Record<string, string> = { Instalator: 'i', Razem: 'r' }
// The Podhale band (`#gory`): the same ridge as the prototype's `.sggm`.
const RIDGE =
  'M0 160 L0 110 L120 70 L210 98 L330 30 L420 82 L520 50 L640 104 L760 40 L860 90 L980 56 L1090 96 L1200 64 L1200 160 Z'

const serviceLabel = (key: ServiceKey) => SERVICE_KEYS.find((s) => s.value === key)?.label ?? key

/**
 * Page of one object „Dla kogo” (`/dla-kogo/<slug>`, KOMPONENTY §5, `build_seg.py`): hero with
 * the cross-section, problems with what we do, day / year timeline, law (no sources, the legal
 * sentence), Podhale, checklist „Przed wizytą”, warranty, packages, FAQ, related services and
 * similar objects, the CTA band — all texts from the panel (`InstObjects`), hotspot titles and
 * the drawing from code. Realizations of the prototype are real clients without consent: not
 * shown (decision I6, like I9).
 */
export async function ObjectPage({ tenantId, object, sceneKey, origin }: Props) {
  const [cards, settings, site, company] = await Promise.all([
    getInstalacjeCards(tenantId),
    getInstalacjeSettings(tenantId),
    getSiteSettings(tenantId),
    getCompanyData(),
  ])
  const telHref = site?.phone ? toTelHref(site.phone) : null
  const phone = site?.phone && telHref ? { label: site.phone, href: telHref } : null
  const salons = (company?.locations ?? []).map((l) => `${l.city}, ${l.street}`).join(' · ')
  const planHref = objectPlanHref(object.key)
  const path = objectHref(object.slug)
  const crumb = object.hero?.crumb || object.name

  // Services by key: the panel's name, address and colour (the line accent without a valid one).
  const chip = (key: ServiceKey): ServiceChip => {
    const card = cards.services.find((s) => s.key === key)
    return {
      key,
      name: card?.name ?? serviceLabel(key),
      href: card?.slug ? `/${card.slug}` : null,
      color: safeColor(card?.color),
    }
  }
  const scene = OBJECT_SCENES[sceneKey]
  const hotspots: ObjectHotspot[] = scene.hotspots.map((h, i) => {
    const s = chip(h.service)
    return {
      ...h,
      description: object.hotspots?.[i]?.description ?? null,
      color: s.color,
      serviceName: s.name,
      serviceHref: s.href,
    }
  })
  const art = OBJECT_SCENE_ART[sceneKey]
  const html = sceneHtml(art.html, INITIAL_SCENE, scene.hotspots, (key) => chip(key).color)
  const moments: DayMoment[] = (object.day ?? []).map((d) => {
    const services = d.services ?? []
    return {
      time: d.time,
      name: d.name,
      description: d.description ?? null,
      icon: d.icon ?? null,
      chips: services.map(chip),
      hotspots: dayHotspots(services, scene.hotspots),
    }
  })
  // Only objects with a page: no card to a 404 (the pensjonat page comes in its own PR).
  const similar = scene.similar
    .filter((key) => key in OBJECT_SCENES)
    .flatMap((key) => cards.objects.filter((o) => o.key === key))
  const fold = new Map((object.foldOnPhone ?? []).map((f) => [f.anchorId, f.maxHeight]))
  const foldOf = (id: string) => ({
    fold: fold.has(id),
    foldHeight: fold.get(id) ?? undefined,
  })
  const band = {
    ...navigation.ctaBand,
    eyebrow: object.cta?.eyebrow || navigation.ctaBand.eyebrow,
    title: object.cta?.heading || navigation.ctaBand.title,
    text: object.cta?.text || navigation.ctaBand.text,
    button: { ...navigation.ctaBand.button, href: planHref },
  }

  return (
    <div
      className="inst-svc inst-obj"
      data-inst-sx=""
      data-inst-il=""
      style={{ '--h': object.color || undefined } as CSSProperties}
    >
      <JsonLd
        data={serviceJsonLd({
          origin,
          path,
          name: crumb,
          description: object.hero?.lead,
          serviceType: object.forWhom ? `Instalacje dla ${object.forWhom}` : object.name,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Start', url: `${origin}/` },
          { name: objectPage.parent.label, url: `${origin}${objectPage.parent.href}` },
          { name: crumb, url: `${origin}${path}` },
        ])}
      />
      <PageHero
        hero={{ ...object.hero, cta: { text: object.hero?.cta?.text, href: planHref } }}
        name={object.name}
        anchors={object.anchors}
        phone={phone}
        parent={objectPage.parent}
        widget={
          <ObjectScene
            title={object.sceneTitle}
            viewBox={art.viewBox}
            html={html}
            hotspots={hotspots}
          />
        }
      />

      {object.problems && object.problems.length > 0 && (
        <InstSection id="problemy" style={{ padding: '104px 0 104px' }} {...foldOf('problemy')}>
          <div className="wrap">
            <SectionHead
              eyebrow={object.problemsIntro?.eyebrow ?? ''}
              heading={object.problemsIntro?.heading ?? ''}
              accent={object.problemsIntro?.headingAccent ?? undefined}
              lead={object.problemsIntro?.text ?? undefined}
            />
            <div className="sgpg">
              {object.problems.map((p) => {
                const s = p.service ? chip(p.service) : null
                return (
                  <article
                    key={p.id ?? p.quote}
                    className="card sgpc ri"
                    style={s ? hueOf(s.color) : undefined}
                  >
                    <span className="sgpi">
                      <InstIcon name={p.icon} size={20} />
                    </span>
                    <b className="sgq">{p.quote}</b>
                    {p.description && <p>{p.description}</p>}
                    {p.fix && (
                      <div className="sgfix">
                        <span>{objectPage.problems.fixLabel}</span>
                        <p>{p.fix}</p>
                      </div>
                    )}
                    {s?.href && (
                      <Link href={s.href} className="sgchip">
                        <i />
                        {s.name} →
                      </Link>
                    )}
                  </article>
                )
              })}
            </div>
          </div>
        </InstSection>
      )}

      {moments.length > 0 && (
        <InstSection id="rok" style={SECTION} {...foldOf('rok')}>
          <div className="wrap">
            <SectionHead
              eyebrow={object.dayIntro?.eyebrow ?? ''}
              heading={object.dayIntro?.heading ?? ''}
              lead={object.dayIntro?.text ?? undefined}
            />
            <DayTimeline moments={moments} hotspotColors={hotspots.map((h) => h.color)} />
          </div>
        </InstSection>
      )}

      {object.law && object.law.length > 0 && (
        <InstSection id="przepisy" style={SECTION} {...foldOf('przepisy')}>
          <div className="wrap">
            <SectionHead
              eyebrow={objectPage.law.eyebrow}
              heading={object.lawIntro?.heading ?? ''}
              lead={object.lawIntro?.text ?? undefined}
            />
            <div className="sglg">
              {object.law.map((l) => (
                <article key={l.id ?? l.title} className="card sglc ri">
                  <div className="sglt">
                    {l.who && <span className={`sgwho ${WHO[l.who] ?? 'o'}`}>{l.who}</span>}
                    {l.article && <code>{l.article}</code>}
                  </div>
                  <b className="h3">{l.title}</b>
                  {l.description && <p>{l.description}</p>}
                </article>
              ))}
            </div>
            <p className="src ri" style={{ marginTop: 12, marginBottom: '1em' }}>
              {LEGAL_NOTE}
            </p>
          </div>
        </InstSection>
      )}

      {object.mountains && object.mountains.length > 0 && (
        <InstSection id="gory" style={SECTION} {...foldOf('gory')}>
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
                  {objectPage.mountains.eyebrow}
                </span>
                <h2 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
                  {object.mountainsIntro?.heading}
                </h2>
              </div>
              <div className="sggg">
                {object.mountains.map((g) => (
                  <div key={g.id ?? g.title} className="sggc">
                    <span className="ico s">
                      <InstIcon name={g.icon} size={20} />
                    </span>
                    <b>{g.title}</b>
                    {g.description && <span>{g.description}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </InstSection>
      )}

      {object.prepare && object.prepare.length > 0 && (
        <InstSection id="przygotuj" style={SECTION} {...foldOf('przygotuj')}>
          <div className="wrap">
            <PrepChecklist
              eyebrow={object.prepareIntro?.eyebrow || objectPage.prepare.eyebrow}
              lead={prepareLead(object.key, object.prepareIntro?.text)}
              items={object.prepare}
              planHref={planHref}
            />
          </div>
        </InstSection>
      )}

      <GuaranteeSection
        warrantyMonths={settings.warrantyMonths}
        responseText={settings.responseText}
      />
      <Packages
        intro={{
          eyebrow: object.forWhom
            ? `${objectPage.packages.eyebrowPrefix} ${object.forWhom}`
            : undefined,
          heading: object.packagesHeading,
          note: objectPage.packages.note,
        }}
        packages={object.packages}
        prices={settings}
        planHref={planHref}
      />
      <Faq
        heading={object.faqHeading || objectPage.faqHeading}
        items={object.faq}
        aside={undefined}
        phone={phone}
        {...foldOf('faq')}
      />
      <Related
        tenantId={tenantId}
        heading={objectPage.relatedHeading}
        services={object.relatedServices}
        objects={similar}
        objectsHeading={objectPage.similarHeading}
      />
      <CtaBandView band={band} phone={phone} salons={salons} titleId="cta-object-title" page />
    </div>
  )
}
