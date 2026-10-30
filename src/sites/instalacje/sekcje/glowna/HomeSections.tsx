import Link from 'next/link'

import type { HomeRealization } from '@/lib/instalacje/data'

import { glownaSekcje } from '../../dane/glownaSekcje'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../InstSection'
import { SectionHead } from '../SectionHead'
import { ShowAll } from './ShowAll'

// Line art of the realization cards (`Main.js → ART`, `ART2`), by category of the work.
const ART = {
  conf: 'M60 150h180M90 150V70h120v80M110 90h80v40h-80zM150 150v20M120 170h60',
  snd: 'M60 120v-40h28l34-26v92l-34-26zM150 70a40 40 0 0 1 0 60M175 50a70 70 0 0 1 0 100M200 30a100 100 0 0 1 0 140',
  ch: 'M150 30v26M138 42h24M100 160V96l50-40 50 40v64M136 160v-34h28v34M60 160h180',
  wed: 'M150 40l20 30h-40zM150 70v90M110 160h80M100 100c20-20 80-20 100 0',
}
const artOf = (index: number) => Object.values(ART)[index % 4]

/**
 * „Realizacje” (`#realizacje`): up to 4 published, featured realizations of this tenant. The
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
          {items.map((item, index) => (
            <Link key={item.id} href="/realizacje" className="card rl ri">
              <div className="rlimg dots" aria-hidden="true">
                <svg viewBox="0 0 300 190" preserveAspectRatio="xMidYMid slice">
                  <rect width="300" height="190" style={{ fill: 'var(--accent-soft)' }} />
                  <path
                    d={artOf(index)}
                    style={{
                      fill: 'none',
                      stroke: 'var(--accent-text)',
                      strokeWidth: 2.4,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    }}
                  />
                </svg>
                {item.category && (
                  <span
                    className="tag"
                    style={{ position: 'absolute', left: 12, top: 12, background: 'var(--card)' }}
                  >
                    {item.category}
                  </span>
                )}
              </div>
              <div className="rlb">
                <b style={{ fontSize: 17 }}>{item.title}</b>
                {item.place && <span>{item.place}</span>}
                {item.scope && <span style={{ color: 'var(--ink-soft)' }}>{item.scope}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </InstSection>
  )
}

/** „Góry i zima” (`#gory`): the mountain band with 6 challenges; on a phone 2, the rest behind a button. */
export function MountainsSection() {
  const t = glownaSekcje.mountains
  return (
    <InstSection id="gory" className="xa-s xa-t0" style={{ padding: '0 0 100px' }}>
      <div className="wrap">
        <div className="gorband">
          <svg
            viewBox="0 0 1280 160"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: 160,
            }}
          >
            <polygon
              points="0,160 0,110 90,70 150,96 240,30 300,70 360,52 430,96 520,20 590,64 650,44 720,90 800,40 880,76 960,30 1040,84 1120,56 1200,90 1280,60 1280,160"
              className="gormt"
            />
          </svg>
          <div style={{ position: 'relative', padding: '0 44px' }}>
            <SectionHead eyebrow={t.eyebrow} heading={t.heading} lead={t.lead} leadWidth={420} />
            <ShowAll className="g3 gorg" more={t.showAll} less={t.collapse}>
              {t.cards.map((card) => (
                <div key={card.title} className="card gor ri">
                  <span className="ico">
                    <InstIcon name={card.icon} size={24} />
                  </span>
                  <h3 className="h3">{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              ))}
            </ShowAll>
          </div>
        </div>
      </div>
    </InstSection>
  )
}

/** „Jak pracujemy” (`#proces`): six numbered steps on the tinted band. */
export function ProcessSteps() {
  const t = glownaSekcje.process
  return (
    <InstSection id="proces" className="bnd bnd-tint xa-s" style={{ padding: '100px 0 104px' }}>
      <div className="wrap">
        <SectionHead eyebrow={t.eyebrow} heading={t.heading} lead={t.lead} leadWidth={430} />
        <div className="steps">
          {t.steps.map((step, i) => (
            <div key={step.title} className="card step ri">
              <span className="stn">{String(i + 1).padStart(2, '0')}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <b style={{ fontSize: 17 }}>{step.title}</b>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
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
