import { naglosnienie } from '../../dane/naglosnienie'
import { LEGAL_NOTE } from '../../dane/prawo'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSection'
import { SectionHead } from '../../sekcje/SectionHead'
import { ApartFamilies, ChurchDemo, SignalChain, SpeakerCalc } from './NaglosnienieWidgets'

import './naglosnienie.css'

const SECTION = { padding: '0 0 104px' }

/**
 * The Nagłośnienie sections between the hero and the shared ones
 * (`zrodlo/pages/Naglosnienie.body.html`): venues, APART, the zone system, the church, the speaker
 * calculator, council rooms, DSO and music licences. Without the prototype's „Realizacje
 * nagłośnienia” (client references without consent, decision of I6). Folded on a phone as in
 * `zrodlo/fold.json` (`cena` and `faq` by the shared sections).
 */
export function NaglosnienieSections() {
  const { objects, apart, chain, church, council, dso, licences } = naglosnienie
  return (
    <>
      <InstSection id="obiekty" fold foldHeight={900} style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <SectionHead {...objects.head} />
          <p className="src ri" style={{ margin: '-24px 0 22px' }}>
            {objects.brands}
          </p>
          <div className="g3">
            {objects.items.map((o) => (
              <div key={o.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={o.icon} size={22} />
                </span>
                <b className="h3">{o.title}</b>
                <p>{o.text}</p>
                <div className="tags">
                  {o.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="apart" style={SECTION}>
        <div className="wrap">
          <SectionHead {...apart.head} />
          <ApartFamilies />
          <p className="src ri" style={{ marginTop: 12 }}>
            {apart.note}
          </p>
          <div className="apy ri">
            {apart.why.map((x) => (
              <div key={x.title} className="apyc">
                <span className="ico">
                  <InstIcon name={x.icon} size={22} />
                </span>
                <b>{x.title}</b>
                <p>{x.text}</p>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="jak-dziala" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...chain.head} />
          <SignalChain />
        </div>
      </InstSection>

      <InstSection id="kosciol" fold style={SECTION}>
        <div className="wrap split" style={{ alignItems: 'center' }}>
          <div className="ri" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="eye">{church.eyebrow}</span>
            <h2 className="h2">{church.heading}</h2>
            <p className="lead">{church.lead}</p>
            <ul className="list">
              {church.points.map((p) => (
                <li key={p.title}>
                  <i>
                    <InstIcon name="check" size={14} strokeWidth={2.6} />
                  </i>
                  <div>
                    <b>{p.title}</b>
                    <span>{p.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <ChurchDemo />
        </div>
      </InstSection>

      <InstSection id="ile-glosnikow" style={SECTION}>
        <div className="wrap">
          <SpeakerCalc />
        </div>
      </InstSection>

      <InstSection id="sala-obrad" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...council.head} />
          <div className="g4">
            {council.items.map((x) => (
              <div key={x.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={x.icon} size={22} />
                </span>
                <b className="h3">{x.title}</b>
                <p>{x.text}</p>
                <span className="src">{x.source}</span>
              </div>
            ))}
          </div>
          <p className="src ri" style={{ margin: '12px 0 1em' }}>
            {LEGAL_NOTE}
          </p>
        </div>
      </InstSection>

      <InstSection id="dso" fold style={SECTION}>
        <div className="wrap">
          <div className="card dark ri tlaw" data-surface="dark">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="eye tlaweye">{dso.eyebrow}</span>
              <h2 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
                {dso.heading}
              </h2>
              <p className="lead">{dso.lead}</p>
              <span className="snd-dso-tx">{dso.partner}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="snd-dso-lbl">{dso.listLabel}</span>
              {dso.items.map((d) => (
                <div key={d.text} className="odi">
                  <InstIcon name={d.icon} size={20} />
                  <span>{d.text}</span>
                </div>
              ))}
              <span className="snd-dso-tx">{LEGAL_NOTE}</span>
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection id="licencje" fold style={SECTION}>
        <div className="wrap split">
          <div className="ri" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="eye">{licences.eyebrow}</span>
            <h2 className="h2">{licences.heading}</h2>
            <p className="lead">{licences.lead}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {licences.items.map((l) => (
              <div
                key={l.title}
                className="card ri"
                style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'flex-start' }}
              >
                <span className="ico">
                  <InstIcon name={l.icon} size={22} />
                </span>
                <div>
                  <b style={{ fontSize: 17 }}>{l.title}</b>
                  <p className="mut" style={{ margin: '4px 0 0', fontSize: 15 }}>
                    {l.text}
                  </p>
                </div>
              </div>
            ))}
            <span className="src ri">
              {LEGAL_NOTE} {licences.fees}
            </span>
          </div>
        </div>
      </InstSection>
    </>
  )
}
