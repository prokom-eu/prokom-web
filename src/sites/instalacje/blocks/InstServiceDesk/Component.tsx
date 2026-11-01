import { headers } from 'next/headers'
import { connection } from 'next/server'
import type { CSSProperties } from 'react'

import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getInstalacjeCards } from '@/lib/instalacje/data'
import { serviceJsonLd } from '@/lib/instalacje/seo'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { siteOrigin } from '@/lib/seo/origin'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { InstServiceDeskBlock as InstServiceDeskBlockData } from '@/payload-types'

import { navigation } from '../../dane/nawigacja'
import { serwis as S } from '../../dane/serwis'
import { InstIcon } from '../../InstIcon'
import { CtaBandView } from '../../powloka/CtaBandView'
import { Faq } from '../../sekcje/Faq'
import { JsonLd } from '../../sekcje/JsonLd'
import { InstSection } from '../../sekcje/InstSection'
import { PageHero } from '../../sekcje/PageHero'
import { Related } from '../../sekcje/Related'
import { FaultForm } from '../../widzety/serwis/FaultForm'

import '../../widzety/serwis/serwis.css'

type Props = { block: InstServiceDeskBlockData; tenantId: number }

const PATH = '/serwis'

/**
 * The service desk page `/serwis` (ADR-I002 §0, `Serwis.body.html`): the hero from the panel with
 * the fault form `#zglos`, care plans, taking over another company's installation, remote help,
 * FAQ, the services we look after and the CTA band. Shared sections of the service pages
 * (`PageHero`, `Faq`, `Related`, `CtaBandView`). The block carries the page's h1.
 */
export async function InstServiceDeskBlock({ block, tenantId }: Props) {
  // The form token carries the render time (minimum fill time), so never from a cache.
  await connection()
  const [site, company, cards, host] = await Promise.all([
    getSiteSettings(tenantId),
    getCompanyData(),
    getInstalacjeCards(tenantId),
    headers().then((h) => h.get('host')),
  ])
  const formToken = issueFormToken(getEnv().PAYLOAD_SECRET)
  const origin = siteOrigin(host, getEnv().SITE_ENV)
  const telHref = site?.phone ? toTelHref(site.phone) : null
  const phone = site?.phone && telHref ? { label: site.phone, href: telHref } : null
  const salons = (company?.locations ?? []).map((l) => `${l.city}, ${l.street}`).join(' · ')
  const { hero, cta } = block
  const crumb = hero?.crumb || 'Serwis i przeglądy'
  const related = S.related.flatMap((key) => cards.services.filter((s) => s.key === key))
  const band = {
    ...navigation.ctaBand,
    eyebrow: cta?.eyebrow || navigation.ctaBand.eyebrow,
    title: cta?.heading || navigation.ctaBand.title,
    text: cta?.text || navigation.ctaBand.text,
    button: S.bandButton,
  }

  // The prototype's page hue (`sub()`: no service named „Serwis” → the line's default, the colour
  // of Monitoring): section eyebrows and odd sections take it, like on the service pages.
  const hueColor = cards.services.find((s) => s.key === 'kam')?.color ?? 'var(--accent)'

  return (
    <div className="inst-svc" style={{ '--h': hueColor } as CSSProperties}>
      {origin && (
        <>
          <JsonLd
            data={serviceJsonLd({
              origin,
              path: PATH,
              name: crumb,
              description: hero?.lead,
              serviceType: 'Serwis instalacji niskoprądowych',
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
      <PageHero
        hero={hero}
        name={crumb}
        anchors={[...S.anchors]}
        phone={phone}
        parent={null}
        widget={<FaultForm formToken={formToken} phone={phone} />}
      />

      <InstSection id="plany" style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <div className="shead ri">
            <div>
              <span className="eye">{S.plans.eyebrow}</span>
              <h2 className="h2">{S.plans.heading}</h2>
            </div>
            <p className="lead" style={{ maxWidth: 440 }}>
              {S.plans.lead}
            </p>
          </div>
          <div
            className="plans"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18 }}
          >
            {S.plans.items.map((plan) => (
              <div key={plan.name} className={'card plan ri' + (plan.hot ? ' hot' : '')}>
                {plan.hot && (
                  <span className="tag a" style={{ alignSelf: 'flex-start' }}>
                    {S.plans.hot}
                  </span>
                )}
                <h3 className="h3">{plan.name}</h3>
                <span className="mut">{plan.text}</span>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <i aria-hidden="true">
                        <InstIcon name="check" size={16} strokeWidth={2.6} />
                      </i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <span className="prc" style={{ fontSize: 22, marginTop: 'auto' }}>
                  {S.plans.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="przejecie" style={{ padding: '0 0 104px' }}>
        <div className="wrap">
          <div className="shead ri">
            <div>
              <span className="eye">{S.takeover.eyebrow}</span>
              <h2 className="h2">{S.takeover.heading}</h2>
            </div>
            <p className="lead" style={{ maxWidth: 440 }}>
              {S.takeover.lead}
            </p>
          </div>
          <ol
            className="steps"
            style={{
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              listStyle: 'none',
              padding: 0,
            }}
          >
            {S.takeover.steps.map((step) => (
              <li key={step.n} className="card step ri">
                <span className="stn" aria-hidden="true">
                  {step.n}
                </span>
                <h3 className="h3" style={{ fontSize: 18 }}>
                  {step.title}
                </h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </InstSection>

      <InstSection id="zdalnie" style={{ padding: '0 0 104px' }}>
        <div className="wrap">
          <div
            className="card dark ri"
            data-surface="dark"
            style={{
              padding: 44,
              borderRadius: 30,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
              gap: 36,
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="eye" style={{ color: 'var(--inst-plan-accent)' }}>
                {S.remote.eyebrow}
              </span>
              <h2 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
                {S.remote.heading}
              </h2>
              <p className="lead">{S.remote.lead}</p>
            </div>
            <div className="g2" style={{ gap: 12 }}>
              {S.remote.items.map((item) => (
                <div key={item.title} className="odi">
                  <InstIcon name={item.icon} size={20} />
                  <div>
                    <b style={{ display: 'block' }}>{item.title}</b>
                    <span style={{ color: 'var(--inst-dark-lead)', fontSize: 14 }}>
                      {item.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InstSection>

      {/* Folded on a phone, like the prototype (`zrodlo/fold.json`: Serwis → faq). */}
      <Faq heading={S.faqHeading} items={[...S.faq]} aside={S.faqAside} phone={phone} fold />
      <Related tenantId={tenantId} heading={S.relatedHeading} services={related} objects={[]} />
      <CtaBandView
        band={band}
        phone={phone}
        salons={salons}
        titleId="cta-service-desk-title"
        page
      />
    </div>
  )
}
