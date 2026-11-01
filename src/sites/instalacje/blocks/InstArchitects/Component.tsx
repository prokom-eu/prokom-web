import { headers } from 'next/headers'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { getEnv } from '@/lib/env'
import { getInstalacjeCards } from '@/lib/instalacje/data'
import type { ServiceKey } from '@/lib/instalacje/options'
import { serviceJsonLd } from '@/lib/instalacje/seo'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { siteOrigin } from '@/lib/seo/origin'
import type { InstArchitectsBlock as InstArchitectsBlockData } from '@/payload-types'

import { architekci as A } from '../../dane/architekci'
import { InstIcon } from '../../InstIcon'
import { AnchorsBar } from '../../powloka/AnchorsBar'
import { ArchHouseScene } from '../../sekcje/arch/ArchHouseScene'
import { hotspotsHtml, INITIAL_ARCH_SCENE, safeHue } from '../../sekcje/arch/archScene'
import { ARCH_SCENE } from '../../sekcje/arch/scene'
import { InstSection } from '../../sekcje/InstSection'
import { JsonLd } from '../../sekcje/JsonLd'
import { SectionHead } from '../../sekcje/SectionHead'
import { AudienceTabs } from '../../widzety/architekci/AudienceTabs'
import { type ArchService, InstallationsTabs } from '../../widzety/architekci/InstallationsTabs'
import { StageTabs } from '../../widzety/architekci/StageTabs'

import '../../widzety/architekci/architekci.css'

type Props = { block: InstArchitectsBlockData; tenantId: number }

const PATH = '/dla-architektow'

/*
 * Sections built so far (I16a); I16b and I16c add the rest in the prototype's order. The anchor
 * bar lists only these until the page is complete.
 */
const BUILT = new Set(['dla-ciebie', 'problemy', 'etapy', 'wymiana', 'instalacje'])

/**
 * The page for architects and developers `/dla-architektow` (ADR-I005, `Architekci.body.html`):
 * the hero from the panel with the house cross-section, anchors and the sections in the
 * prototype's order. No CTA band: the form is the last section (meta `cta: false`). The block
 * carries the page's h1.
 */
export async function InstArchitectsBlock({ block, tenantId }: Props) {
  const [cards, host] = await Promise.all([
    getInstalacjeCards(tenantId),
    headers().then((h) => h.get('host')),
  ])
  const origin = siteOrigin(host, getEnv().SITE_ENV)
  const hues: Partial<Record<ServiceKey, string>> = Object.fromEntries(
    cards.services.flatMap((s) => (s.key && s.color ? [[s.key, s.color]] : [])),
  )
  const services: ArchService[] = cards.services.flatMap((s) =>
    s.key
      ? [
          {
            key: s.key,
            name: s.name,
            caption: s.menuCaption ?? null,
            icon: s.icon ?? null,
            href: s.slug ? `/${s.slug}` : null,
            color: s.color ?? null,
          },
        ]
      : [],
  )
  const sceneHtml = ARCH_SCENE.html.replace('%hotspots%', hotspotsHtml(hues, INITIAL_ARCH_SCENE))
  const { hero } = block
  const crumb = hero?.crumb || 'Dla architektów'
  const fold = (id: string) =>
    A.fold[id] ? { fold: true, foldHeight: A.fold[id] } : { fold: false }

  return (
    // The prototype's page hue (`pkSt: --h` = the line's turquoise, Monitoring's colour):
    // section eyebrows and odd sections take it, like the service pages.
    <div className="inst-svc inst-ar" style={{ '--h': safeHue(hues.kam) } as CSSProperties}>
      {origin && (
        <>
          <JsonLd
            data={serviceJsonLd({
              origin,
              path: PATH,
              name: crumb,
              description: hero?.lead,
              serviceType: 'Projekt instalacji niskoprądowych dla architektów i deweloperów',
            })}
          />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: 'Start', url: `${origin}/` },
              { name: crumb, url: `${origin}${PATH}` },
            ])}
          />
        </>
      )}

      <section id="hero" className="phero arhero">
        <div className="hgrid" />
        <div className="hglow" />
        <div className="hglow2" />
        <div className="wrap">
          <nav className="crumb in d1" aria-label="Okruszki">
            <Link href="/">Start</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{crumb}</span>
          </nav>
          <div className="arhead">
            <h1 className="h1 in d2">
              {hero?.eyebrow && (
                <>
                  <span className="eye h1k">{hero.eyebrow}</span>
                  <span className="vh">: </span>
                </>
              )}
              {hero?.h1a || crumb} {hero?.h1b && <span className="acc">{hero.h1b}</span>}
            </h1>
            <div className="arheadr in d3">
              {hero?.lead && <p className="lead">{hero.lead}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {A.hero.buttons.map((b) => (
                  <a key={b.href} href={b.href} className={b.primary ? 'btn btn-p' : 'btn btn-g'}>
                    {b.icon && <InstIcon name={b.icon} />}
                    {b.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="arstage in d4">
            <ArchHouseScene viewBox={ARCH_SCENE.viewBox} html={sceneHtml} hues={hues} />
          </div>
          {hero?.facts && hero.facts.length > 0 && (
            <div className="arkvs in d5">
              {hero.facts.map((fact) => (
                <div key={fact.id ?? fact.value} className="kv">
                  <b>{fact.value}</b>
                  <span>{fact.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <AnchorsBar anchors={A.anchors.filter((a) => BUILT.has(a.id))} />

      <InstSection id="dla-ciebie" style={{ padding: '88px 0 0' }}>
        <div className="wrap">
          <AudienceTabs />
        </div>
      </InstSection>

      <InstSection id="problemy" style={{ padding: '104px 0 96px' }} {...fold('problemy')}>
        <div className="wrap">
          <SectionHead
            eyebrow={A.problemsSection.eyebrow}
            heading={A.problemsSection.heading}
            accent={A.problemsSection.accent}
            lead={A.problemsSection.lead}
            leadWidth={440}
          />
          <div className="g4 arpr">
            {A.problems.map((p) => (
              <div key={p.title} className="card arprc ri">
                <span className="ico">
                  <InstIcon name={p.icon} size={22} />
                </span>
                <b className="h3">{p.title}</b>
                <p className="arprd">{p.text}</p>
                <div className="arpra">
                  <em>{A.problemsSection.answer}</em>
                  <span>{p.answer}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="arbr ri">
            <div className="arbrl">
              <b>{A.problemsSection.bravasTitle}</b>
              <span>{A.problemsSection.bravasText}</span>
            </div>
            {A.bravas.map((b) => (
              <div key={b.value} className="arbri">
                <b>{b.value}</b>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="etapy" className="bnd bnd-tint" style={{ padding: '104px 0 104px' }}>
        <div className="wrap">
          <SectionHead
            eyebrow={A.stagesSection.eyebrow}
            heading={A.stagesSection.heading}
            accent={A.stagesSection.accent}
            lead={A.stagesSection.lead}
            leadWidth={440}
          />
          <StageTabs />
        </div>
      </InstSection>

      <InstSection id="wymiana" style={{ padding: '104px 0 96px' }}>
        <div className="wrap">
          <SectionHead
            eyebrow={A.exchangeSection.eyebrow}
            heading={A.exchangeSection.heading}
            accent={A.exchangeSection.accent}
            lead={A.exchangeSection.lead}
            leadWidth={420}
          />
          <div className="arwy ri">
            <div className="card arwyc">
              <span className="eye">{A.exchangeSection.fromYou}</span>
              {A.exchange.fromYou.map((x) => (
                <div key={x.title} className="arwyi">
                  <i />
                  <div>
                    <b>{x.title}</b>
                    <span>{x.text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="arwya" aria-hidden="true">
              <InstIcon name="arrow" size={28} strokeWidth={2.2} />
            </div>
            <div className="arwyc hi">
              <span className="eye">{A.exchangeSection.fromUs}</span>
              {A.exchange.fromUs.map((x) => (
                <div key={x.title} className="arwyi">
                  <span className="arok">
                    <InstIcon name="check" size={14} strokeWidth={3} />
                  </span>
                  <div>
                    <b>{x.title}</b>
                    <span>{x.text}</span>
                  </div>
                </div>
              ))}
              <p className="arwyn">{A.exchangeSection.note}</p>
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection id="instalacje" style={{ padding: '104px 0 104px' }}>
        <div className="wrap">
          <SectionHead
            eyebrow={A.installationsSection.eyebrow}
            heading={A.installationsSection.heading}
            accent={A.installationsSection.accent}
            lead={A.installationsSection.lead}
            leadWidth={440}
          />
          <InstallationsTabs services={services} />
        </div>
      </InstSection>
    </div>
  )
}
