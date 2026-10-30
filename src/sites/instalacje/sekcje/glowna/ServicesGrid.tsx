import Link from 'next/link'
import type { CSSProperties } from 'react'

import type { InstMenu, MenuEntry } from '@/lib/instalacje/menu'
import { plural } from '@/lib/plural'

import { glownaSekcje, SERVICE_CARDS } from '../../dane/glownaSekcje'
import type { ServiceKey } from '../../dane/types'
import { InstIcon } from '../../InstIcon'
import { solutionsText } from '../../powloka/offerText'
import { InstSection } from '../InstSection'
import { SERVICE_SCENES } from './sceny'

const t = glownaSekcje.services

export type HomeService = MenuEntry & { group: string }

type Props = {
  services: Map<ServiceKey, HomeService>
  offer: InstMenu['offer']
  brands: number
  noPriceText: string
}

/** Label on the scene: the menu column, shortened like the prototype (`u.*.g`). */
const groupLabel = (key: ServiceKey, group: string) =>
  key === 'ev' ? 'E-mobilność' : group === 'Sieci i technika' ? 'Łączność' : group

/**
 * „Usługi” (`#uslugi`, KOMPONENTY §3): 10 service cards with their mini scenes (`sceny.ts`),
 * colour, name, icon and address from the panel, texts from `dane/glownaSekcje.ts`; the counts
 * come from the published offer. Price line = the line's „no price” text (spec §2).
 */
export function ServicesGrid({ services, offer, brands, noPriceText }: Props) {
  const cards = SERVICE_CARDS.flatMap((card) => {
    const service = services.get(card.key)
    return service ? [{ ...card, service }] : []
  })
  if (cards.length === 0) return null
  const brandsWord = plural(brands, ['marka', 'marki', 'marek'])
  return (
    <InstSection id="uslugi" className="usv2 xa-s" style={{ padding: '96px 0' }}>
      <div className="usbg" aria-hidden="true" />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="ushead xa-ushead">
          <div className="usht ri">
            <span className="eye">{t.eyebrow}</span>
            <h2 className="h2">
              {t.heading} <span className="acc">{t.accent}</span>
            </h2>
            <p className="lead">{t.lead}</p>
          </div>
          <div className="xa-uside ri">
            <div className="uskpi xa-uskpi">
              <div>
                <b>{offer.areas}</b>
                <span>{t.areas}</span>
              </div>
              <div>
                <b>{offer.solutions}</b>
                <span>{solutionsText(offer.solutions).replace(/^\d+ /, '')}</span>
              </div>
              <div>
                <b>{brands}</b>
                <span>{brandsWord}</span>
              </div>
              <div>
                <b>{t.since}</b>
                <span>{t.sinceNote}</span>
              </div>
            </div>
            <Link href="/zaplanuj" className="xa-uslink">
              {t.describe}
              <InstIcon name="arrow" size={16} strokeWidth={2.6} />
            </Link>
          </div>
        </div>
        <div className="ubn2">
          {cards.map(({ key, service, description, parts, highlights, big, wide }) => (
            <Link
              key={key}
              href={service.href}
              className={`ut2 ri ut-${key}${wide ? ' w2' : ''}`}
              style={{ '--h': service.color ?? undefined } as CSSProperties}
            >
              <div className="ust" aria-hidden="true" data-inst-sx="">
                <svg
                  viewBox="0 0 400 220"
                  preserveAspectRatio="xMidYMid meet"
                  dangerouslySetInnerHTML={{ __html: SERVICE_SCENES[key] }}
                />
                <span className="ustk">{groupLabel(key, service.group)}</span>
              </div>
              <div className="ubd">
                <div className="uh">
                  <span className="uic">
                    <InstIcon name={service.icon} size={20} />
                  </span>
                  <h3>{service.label}</h3>
                </div>
                <p>{description}</p>
                <ul className="uhl">
                  {highlights.slice(0, big ? 3 : 2).map((item) => (
                    <li key={item}>
                      <InstIcon name="check" size={13} strokeWidth={2.8} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="upt">
                  {parts.slice(0, big ? 6 : 4).map((part) => (
                    <span key={part}>{part}</span>
                  ))}
                </div>
                <div className="ufoot">
                  <span>{noPriceText}</span>
                  <b>
                    {t.details}
                    <InstIcon name="arrow" size={15} strokeWidth={2.6} />
                  </b>
                </div>
              </div>
            </Link>
          ))}
          <Link href="/uslugi" className="ucta2">
            <svg className="ucorb" viewBox="0 0 300 300" aria-hidden="true">
              <circle cx="150" cy="150" r="118" className="uco1" />
              <circle cx="150" cy="150" r="78" className="uco2" />
              <g className="ucsp">
                <circle cx="150" cy="32" r="7" className="ucd" />
                <circle cx="268" cy="150" r="5" className="ucd" />
                <circle cx="150" cy="268" r="6" className="ucd" />
                <circle cx="32" cy="150" r="4" className="ucd" />
              </g>
            </svg>
            <div className="ucdots" aria-hidden="true">
              {cards.map(({ key, service }, i) => (
                <i
                  key={key}
                  style={{
                    background: service.color ?? undefined,
                    animationDelay: `-${(i * 0.4).toFixed(1)}s`,
                  }}
                />
              ))}
            </div>
            <span className="eye" style={{ color: 'var(--inst-plan-accent)' }}>
              {t.all.eyebrow}
            </span>
            <b className="ucth">{t.all.title}</b>
            <span className="ucts">
              {offer.areas} {plural(offer.areas, ['obszar', 'obszary', 'obszarów'])} ·{' '}
              {solutionsText(offer.solutions)} · {brands} {brandsWord}. {t.all.note}
            </span>
            <span className="btn hbtn-p ucbtn">
              {t.all.button}
              <InstIcon name="arrow" size={18} strokeWidth={2.4} />
            </span>
          </Link>
        </div>
      </div>
    </InstSection>
  )
}

export function TrustBand() {
  return (
    <section className="bnd bnd-soft trust" style={{ padding: '30px 0' }}>
      <div className="wrap">
        <div className="brw">
          <span className="eye" style={{ color: 'var(--ink-2)' }}>
            {glownaSekcje.trust.eyebrow}
          </span>
          <div className="brands">
            {glownaSekcje.trust.brands.map(([name, kind], i) => (
              <div key={name} className={`brand${i > 8 ? ' hm' : ''}`}>
                <b>{name}</b>
                <span>{kind}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
