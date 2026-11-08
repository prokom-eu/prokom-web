import Link from 'next/link'

import type { HomeRealization } from '@/lib/instalacje/data'

import { glownaSekcje } from '../../dane/glownaSekcje'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../InstSectionLazy'
import { SectionHead } from '../SectionHead'
import { RealizationPhotos } from '../../widzety/realizacje/RealizationPhotosLazy'
import { GorScene } from './GorScene'
import { GorSnow } from './GorSnow'
import { ProcessAxis } from './ProcessAxis'

/**
 * „Realizacje” (`#realizacje`): up to 4 published, featured realizations with a photo (runda v6
 * D2: without one a card is hidden, the loader filters them). The
 * prototype shows four real clients, but a realization is published only with the client's
 * consent (I2) — without any the section is left out, no placeholders on the page.
 */
export function RealizationsTeaser({ items }: { items: HomeRealization[] }) {
  if (items.length === 0) return null
  const t = glownaSekcje.realizations
  return (
    <InstSection id="realizacje" className="xa-s xa-t0" style={{ padding: '0 0 96px' }}>
      <div className="wrap">
        <div className="shead ri">
          <div>
            <span className="eye">{t.eyebrow}</span>
            <h2 className="h2">{t.heading}</h2>
          </div>
          <Link href="/realizacje" className="btn btn-g">
            {t.all}
          </Link>
        </div>
        <div className="g4">
          {items.map((item) => (
            // Round v5 (RUNDA-V5 §4): the cover opens the gallery, the name leads to the list.
            <div key={item.id} className="card rl ri">
              <div className="rlimg rlimgp">
                <RealizationPhotos
                  photos={item.photos}
                  title={item.title}
                  sizes="(min-width: 1100px) 320px, (min-width: 700px) 50vw, 100vw"
                />
                {item.category && <span className="tag rlt">{item.category}</span>}
              </div>
              <Link href="/realizacje" className="rlb">
                <b style={{ fontSize: 17 }}>{item.title}</b>
                {item.place && <span>{item.place}</span>}
                {item.scope && <span style={{ color: 'var(--ink-soft)' }}>{item.scope}</span>}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </InstSection>
  )
}

// Three ridges of the „Na Podhalu…” band, back to front (viewBox 1280 × 200).
const GOR_LAYERS = [
  '0,200 0,96 120,52 210,80 330,24 420,66 520,30 610,72 720,18 820,60 930,34 1040,74 1150,40 1280,70 1280,200',
  '0,200 0,126 80,96 170,118 260,70 350,106 450,84 540,120 640,76 740,112 830,90 930,124 1030,86 1130,116 1210,98 1280,112 1280,200',
  '0,200 0,150 90,110 150,136 240,70 300,110 360,92 430,136 520,60 590,104 650,84 720,130 800,80 880,116 960,70 1040,124 1120,96 1200,130 1280,100 1280,200',
] as const

/**
 * „Na Podhalu instalacja ma trudniej” (`#gory`, RUNDA-V5 §5): a band with three ridges that
 * drift apart while scrolling (scroll-driven, static without support), light snowfall, and six
 * cards with mini scenes — the first pair larger. On a phone the cards form a snapping row.
 */
export function MountainsSection() {
  const t = glownaSekcje.mountains
  const rows = [t.cards.slice(0, 3), t.cards.slice(3)]
  return (
    <InstSection id="gory" className="xa-s xa-t0" style={{ padding: '0 0 100px' }}>
      <div className="wrap">
        <div className="gorband">
          <svg
            className="gorridge"
            viewBox="0 0 1280 200"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {GOR_LAYERS.map((points, i) => (
              <polygon key={i} points={points} className={`gormt gl${i + 1}`} />
            ))}
          </svg>
          <GorSnow />
          <div className="gorin">
            <SectionHead eyebrow={t.eyebrow} heading={t.heading} lead={t.lead} leadWidth={420} />
            <div className="gorg">
              {rows.map((row, r) => (
                <div key={r} className={`gorrow gorrow${r + 1}`}>
                  {row.map((card) => (
                    <div key={card.title} className="card gor ri">
                      <span className="gsc" data-inst-sx="">
                        <GorScene name={card.scene} />
                      </span>
                      <h3 className="h3">{card.title}</h3>
                      <p>{card.text}</p>
                      {card.fact ? (
                        <p className="gorfact">
                          <b>{card.fact.value}</b> <span>{card.fact.label}</span>
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </InstSection>
  )
}

/**
 * „Jak pracujemy” (`#proces`, RUNDA-V5 §6): six steps on an axis that draws itself while
 * scrolling (scroll-driven, fully drawn without support or with reduced motion); every step
 * says what you get. Vertical on a phone, folded after about three steps. Not `.steps` — `/serwis` keeps that card row.
 */
export function ProcessSteps({ warrantyMonths }: { warrantyMonths: number }) {
  const t = glownaSekcje.process
  return (
    <InstSection
      id="proces"
      className="bnd bnd-tint xa-s"
      style={{ padding: '100px 0 104px' }}
      fold
      foldHeight={980}
    >
      <div className="wrap">
        <SectionHead eyebrow={t.eyebrow} heading={t.heading} lead={t.lead} leadWidth={430} />
        <ProcessAxis
          getLabel={t.getLabel}
          steps={t.steps.map((step) => ({
            ...step,
            get: step.get.replace('{n}', String(warrantyMonths)),
          }))}
        />
        <div className="proctr">
          <p>{t.trust}</p>
          <Link href="/zaplanuj" className="btn btn-p">
            {t.cta} <InstIcon name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </InstSection>
  )
}

/** „Serwis i przeglądy” (`#serwis`): the dark service band, the same in both themes. */
export function ServiceTeaser() {
  const t = glownaSekcje.service
  return (
    <InstSection id="serwis" className="xa-s" style={{ padding: '100px 0 104px' }}>
      <div className="wrap">
        <div className="srvb ri" data-surface="dark">
          <div className="srvt">
            <span className="eye" style={{ color: 'var(--inst-plan-accent)' }}>
              {t.eyebrow}
            </span>
            <h2 className="h2" style={{ fontSize: 'clamp(30px, 3vw, 44px)' }}>
              {t.heading}
            </h2>
            <p className="lead">{t.lead}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link href="/serwis" className="btn hbtn-p">
                {t.primary}
              </Link>
              <Link href="/serwis" className="btn hbtn-g">
                {t.secondary}
              </Link>
            </div>
          </div>
          <div className="srvg">
            {t.tiles.map((tile) => (
              <div key={tile.title} className="srvc">
                <span className="sci">
                  <InstIcon name={tile.icon} size={18} />
                </span>
                <div>
                  <b>{tile.title}</b>
                  <span>{tile.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InstSection>
  )
}
