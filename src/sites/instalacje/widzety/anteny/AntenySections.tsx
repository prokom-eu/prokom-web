import type { CSSProperties } from 'react'

import { anteny } from '../../dane/anteny'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSection'
import { SectionHead } from '../../sekcje/SectionHead'
import { FilterSpectrum } from './FilterSpectrum'
import { TvQuiz } from './TvQuiz'

import './anteny.css'

const SECTION = { padding: '0 0 104px' }

function Features({
  items,
  grid,
}: {
  items: readonly { icon: string; title: string; text: string }[]
  grid: string
}) {
  return (
    <div className={grid}>
      {items.map((item) => (
        <div key={item.title} className="card feat ri">
          <span className="ico">
            <InstIcon name={item.icon} size={22} />
          </span>
          <b className="h3">{item.title}</b>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  )
}

/** Icon list of the guesthouse cards (`.kdl`). */
function IconList({
  items,
  dark = false,
}: {
  items: readonly { icon: string; title: string; text: string }[]
  dark?: boolean
}) {
  return (
    <div className={dark ? 'kdl dk' : 'kdl'}>
      {items.map((item) => (
        <div key={item.title}>
          <span className="ico s">
            <InstIcon name={item.icon} />
          </span>
          <span>
            <b>{item.title}</b>
            <span>{item.text}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * The Anteny sections between the hero and the shared ones (`zrodlo/pages/Anteny.body.html`):
 * what we do, mountains, multiplexes with the TV quiz, the LTE/5G filter, satellite set-ups and
 * TV in a guesthouse. Folded on a phone as in `zrodlo/fold.json`.
 */
export function AntenySections() {
  const { whatWeDo, mountains, multiplexes, quiz, filter, satellite, guesthouse } = anteny
  return (
    <>
      <InstSection id="co-robimy" style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <SectionHead {...whatWeDo.head} />
          <Features items={whatWeDo.items} grid="g3" />
        </div>
      </InstSection>

      <InstSection id="gory" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...mountains.head} />
          <Features items={mountains.items} grid="g4" />
        </div>
      </InstSection>

      <InstSection id="multipleksy" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...multiplexes.head} />
          <div className="mxs ri">
            {multiplexes.items.map((mux) => (
              <div key={mux.name} className={mux.old ? 'mxc2 old' : 'mxc2'}>
                <b>{mux.name}</b>
                <span className="mxstd">{mux.standard}</span>
                <span>{mux.text}</span>
              </div>
            ))}
          </div>
          <div className="card tvc ri">
            <div>
              <span className="eye">{quiz.eyebrow}</span>
              <b className="h3">{quiz.title}</b>
              <p className="mut">{quiz.text}</p>
            </div>
            <TvQuiz />
          </div>
        </div>
      </InstSection>

      <InstSection id="filtr-5g" style={SECTION}>
        <div className="wrap">
          <SectionHead {...filter.head} />
          <div className="card spw ri">
            <FilterSpectrum />
            <p className="src">{filter.note}</p>
          </div>
        </div>
      </InstSection>

      <InstSection id="satelita" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...satellite.head} />
          <div className="g3">
            {satellite.items.map((item) => (
              <div
                key={item.title}
                className="card satc ri"
                style={{ '--h': item.hue } as CSSProperties}
              >
                <div className="satv">
                  <svg viewBox="0 0 200 90" aria-hidden="true">
                    <path d="M24 20 Q14 52 44 66 Q58 46 24 20Z" className="satd" />
                    <circle cx="44" cy="40" r="4" className="satl" />
                    <path d={item.cable} className="satc2" />
                    {item.tvs.map((x) => (
                      <rect key={x} x={x} y="62" width="22" height="16" rx="2" className="sattv" />
                    ))}
                  </svg>
                </div>
                <span className="wfg">{item.kicker}</span>
                <b className="h3">{item.title}</b>
                <p>{item.text}</p>
                <span className="wfn">{item.forWhom}</span>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="pensjonat-tv" fold style={SECTION}>
        <div className="wrap">
          <div className="g2" style={{ gap: 18, alignItems: 'stretch' }}>
            <div className="card kdk ri">
              <span className="eye">{guesthouse.eyebrow}</span>
              <h2 className="h3">{guesthouse.heading}</h2>
              <IconList items={guesthouse.items} />
            </div>
            <div className="card dark kdk ri" data-surface="dark">
              <span className="eye kdeye">{guesthouse.fees.eyebrow}</span>
              <b className="h3">{guesthouse.fees.heading}</b>
              <IconList items={guesthouse.fees.items} dark />
              <span className="kdnote">{guesthouse.fees.note}</span>
            </div>
          </div>
        </div>
      </InstSection>
    </>
  )
}
