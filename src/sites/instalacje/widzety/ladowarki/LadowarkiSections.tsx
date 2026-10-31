import { CHARGER_KEYS, ladowarki } from '../../dane/ladowarki'
import { LEGAL_NOTE } from '../../dane/prawo'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSection'
import { SectionHead } from '../../sekcje/SectionHead'
import { ChargerCards, ChargerConfigurator, ChargingCalc } from './LadowarkiWidgets'

import './ladowarki.css'

const SECTION = { padding: '0 0 104px' }

/**
 * The Ładowarki EV sections between the hero and the shared ones
 * (`zrodlo/pages/Ladowarki.body.html`): the Elzab EcoPower range, the version configurator,
 * the comparison, the charging calculator and the formalities. Folded on a phone as in
 * `zrodlo/fold.json` (`urzadzenia`, `formalnosci`; `cena` and `faq` by the shared sections).
 */
export function LadowarkiSections() {
  const { offer, config, comparison, calc, rules, models } = ladowarki
  return (
    <>
      <InstSection id="oferta" style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <SectionHead {...offer.head} leadWidth={470} />
          <ChargerCards />
          <div className="evx ri">
            <b className="evxh">{offer.extrasHeading}</b>
            {offer.extras.map((e) => (
              <div key={e.title} className="evxi">
                <span className="ico">
                  <InstIcon name={e.icon} size={18} />
                </span>
                <div>
                  <b>{e.title}</b>
                  <span>{e.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="model" style={SECTION}>
        <div className="wrap">
          <SectionHead {...config.head} leadWidth={470} />
          <ChargerConfigurator />
        </div>
      </InstSection>

      <InstSection id="urzadzenia" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...comparison.head} />
          <div className="tblw ri">
            <table className="tbl evtbl">
              <thead>
                <tr>
                  <th>
                    <span className="sr-only">{comparison.feature}</span>
                  </th>
                  {CHARGER_KEYS.map((k) => (
                    <th key={k} scope="col">
                      {models[k].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map(([k, a, b, c]) => (
                  <tr key={k}>
                    <td>
                      <b>{k}</b>
                    </td>
                    <td>{a}</td>
                    <td>{b}</td>
                    <td>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="xc-swipe" aria-hidden="true">
            {comparison.swipe}
          </p>
          <p className="src ri" style={{ marginTop: 10 }}>
            {comparison.note}
          </p>
        </div>
      </InstSection>

      <InstSection id="kalkulator" style={SECTION}>
        <div className="wrap evkalk">
          <div className="evkt ri">
            <span className="eye">{calc.eyebrow}</span>
            <h2 className="h2">{calc.heading}</h2>
            <p className="lead">{calc.lead}</p>
            <ul className="list" style={{ gap: 10, marginTop: 18 }}>
              {calc.tips.map((t) => (
                <li key={t} style={{ fontSize: 15 }}>
                  <i>
                    <InstIcon name="check" size={13} strokeWidth={2.6} />
                  </i>
                  <span className="ev-soft">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <ChargingCalc />
        </div>
      </InstSection>

      <InstSection id="formalnosci" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...rules.head} />
          <div className="g2">
            {rules.items.map((f) => (
              <div key={f.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={f.icon} size={22} />
                </span>
                <b className="h3">{f.title}</b>
                <p>{f.text}</p>
                <span className="src">{f.note}</span>
              </div>
            ))}
          </div>
          <p className="src ri" style={{ margin: '12px 0 1em' }}>
            {LEGAL_NOTE}
          </p>
        </div>
      </InstSection>
    </>
  )
}
