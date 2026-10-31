import { LEGAL_NOTE } from '../../dane/prawo'
import { dostep } from '../../dane/dostep'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSection'
import { SectionHead } from '../../sekcje/SectionHead'
import { IdTypes, LocksPower } from './DostepWidgets'

import './dostep.css'

const SECTION = { padding: '0 0 104px' }

/**
 * The Kontrola dostępu sections between the hero and the shared ones
 * (`zrodlo/pages/Dostep.body.html`): opening methods, apartments with booking systems, company
 * and community, identifiers, locks without power, failures and the site visit checklist.
 * Folded on a phone as in `zrodlo/fold.json` (`apartamenty`, `firma`, `awarie`; `cena` and `faq`
 * by the shared sections).
 */
export function DostepSections() {
  const { methods, apartments, company, ids, locks, failures } = dostep
  return (
    <>
      <InstSection id="metody" style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <SectionHead {...methods.head} leadWidth={440} />
          <div className="g4">
            {methods.items.map((m) => (
              <div key={m.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={m.icon} size={22} />
                </span>
                <b className="h3">{m.title}</b>
                <p>{m.text}</p>
                <span className="tag">{m.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="apartamenty" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...apartments.head} />
          <div className="aptflow ri">
            {apartments.flow.map((a) => (
              <div key={a.title} className="aptc">
                <span className="ico">
                  <InstIcon name={a.icon} size={22} />
                </span>
                <b>{a.title}</b>
                <span>{a.text}</span>
              </div>
            ))}
          </div>
          <div className="tblw ri" style={{ marginTop: 22 }}>
            <table className="tbl">
              <thead>
                <tr>
                  {apartments.columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apartments.systems.map((r) => (
                  <tr key={r.name}>
                    <th scope="row">
                      <b>{r.name}</b>
                    </th>
                    <td>{r.locks}</td>
                    <td className="mut">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="src ri" style={{ margin: '10px 0 1em' }}>
            {apartments.note}
          </p>
        </div>
      </InstSection>

      <InstSection id="firma" fold style={SECTION}>
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <div className="ri" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="eye">{company.eyebrow}</span>
            <h2 className="h2">{company.heading}</h2>
            <p className="lead">{company.lead}</p>
            <ul className="list">
              {company.list.map((f) => (
                <li key={f.title}>
                  <i>
                    <InstIcon name="check" size={14} strokeWidth={2.6} />
                  </i>
                  <div>
                    <b>{f.title}</b>
                    <span>{f.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="ri" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="note w">
              <InstIcon name="doc" size={20} />
              <span>{company.register}</span>
            </div>
            <div className="note w">
              <InstIcon name="finger" size={20} />
              <span>
                {company.biometrics} {LEGAL_NOTE}
              </span>
            </div>
            <div className="note">
              <InstIcon name="battery" size={20} />
              <span>{company.battery}</span>
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection id="identyfikatory" style={SECTION}>
        <div className="wrap">
          <SectionHead {...ids.head} />
          <IdTypes />
        </div>
      </InstSection>

      <InstSection id="zamki" style={SECTION}>
        <div className="wrap">
          <SectionHead {...locks.head} />
          <div className="card lkw ri">
            <LocksPower />
            <div className="note" style={{ margin: 0 }}>
              <InstIcon name="fire" />
              <span>
                <b>{locks.fire.title}</b> {locks.fire.text} {LEGAL_NOTE}
              </span>
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection id="awarie" fold style={SECTION}>
        <div className="wrap">
          <div style={{ display: 'grid' }}>
            <div className="card kdk ri">
              <span className="eye">{failures.eyebrow}</span>
              <h2 className="h3" style={{ fontSize: 26 }}>
                {failures.heading}
              </h2>
              <div className="kdl">
                {failures.items.map((a) => (
                  <div key={a.title}>
                    <span className="ico s">
                      <InstIcon name={a.icon} />
                    </span>
                    <span>
                      <b>{a.title}</b>
                      <span>{a.text}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card kdchk ri">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="eye">{failures.check.eyebrow}</span>
              <b className="h3" style={{ fontSize: 24 }}>
                {failures.check.heading}
              </b>
            </div>
            <div className="kdcg">
              {failures.check.items.map((c, i) => (
                <div key={c.title}>
                  <em>{i + 1}</em>
                  <span>
                    <b>{c.title}</b>
                    <span>{c.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InstSection>
    </>
  )
}
