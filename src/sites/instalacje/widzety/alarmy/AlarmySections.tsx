import { LEGAL_NOTE } from '../../dane/prawo'
import { alarmy } from '../../dane/alarmy'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSection'
import { SectionHead } from '../../sekcje/SectionHead'
import { AlarmVersions, DoorPhone, HolidayHouse, IntercomQuestion } from './AlarmWidgets'

import './alarmy.css'

const SECTION = { padding: '0 0 104px' }

/**
 * The Alarmy sections between the hero and the shared ones (`zrodlo/pages/Alarmy.body.html`):
 * how it works, alarm versions, wired or wireless, the door phone, intercoms, the holiday house
 * and the agency. Folded on a phone as in `zrodlo/fold.json` (`wersje`, `przewod`,
 * `wideodomofon`, `domofony`; `cena` and `faq` by the shared sections).
 */
export function AlarmySections() {
  const { flow, versions, compare, doorPhone, intercoms, agency } = alarmy
  return (
    <>
      <InstSection id="jak-dziala" style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <SectionHead {...flow.head} leadWidth={440} />
          <div className="flow">
            {flow.items.map((item, i) => (
              <div key={item.title} className="card flowc ri">
                <span className="stn">{String(i + 1).padStart(2, '0')}</span>
                <span className="ico">
                  <InstIcon name={item.icon} size={22} />
                </span>
                <b className="h3">{item.title}</b>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="wersje" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...versions.head} />
          <AlarmVersions />
        </div>
      </InstSection>

      <InstSection id="przewod" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...compare.head} />
          <div className="tblw ri">
            <table className="tbl">
              <thead>
                <tr>
                  <th>
                    <span className="sr-only">{compare.rowHead}</span>
                  </th>
                  {compare.columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compare.rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">
                      <b>{row.key}</b>
                    </th>
                    <td>{row.wired}</td>
                    <td>{row.wireless}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="g3" style={{ marginTop: 18 }}>
            {compare.systems.map((s) => (
              <div key={s.name} className="card feat ri">
                <b className="disp" style={{ fontSize: 22 }}>
                  {s.name}
                </b>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
          <div className="note ri" style={{ marginTop: 16 }}>
            <InstIcon name="shield" size={20} />
            <span>
              <b>{compare.grade.title}</b> {compare.grade.text}
            </span>
          </div>
        </div>
      </InstSection>

      <InstSection id="wideodomofon" fold style={SECTION}>
        <div className="wrap smw">
          <div className="ri" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <span className="eye">{doorPhone.eyebrow}</span>
            <h2 className="h2">{doorPhone.heading}</h2>
            <p className="lead">{doorPhone.lead}</p>
            <ul className="list">
              {doorPhone.list.map((item) => (
                <li key={item.title}>
                  <i>
                    <InstIcon name="check" size={14} strokeWidth={2.6} />
                  </i>
                  <div>
                    <b>{item.title}</b>
                    <span>{item.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="ri">
            <DoorPhone />
          </div>
        </div>
      </InstSection>

      <InstSection id="domofony" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...intercoms.head} />
          <div className="dmw">
            <div className="dmg">
              {intercoms.cases.map((c) => (
                <div key={c.title} className="card dmc ri">
                  <span className="ico">
                    <InstIcon name={c.icon} size={22} />
                  </span>
                  <b className="h3">{c.title}</b>
                  <ul className="list" style={{ gap: 6 }}>
                    {c.items.map((item) => (
                      <li key={item} style={{ fontSize: 14.5 }}>
                        <i>
                          <InstIcon name="check" size={13} strokeWidth={2.6} />
                        </i>
                        <span style={{ color: 'var(--ink-soft)' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <IntercomQuestion />
          </div>
        </div>
      </InstSection>

      <InstSection id="dom-letniskowy" style={SECTION}>
        <div className="wrap">
          <HolidayHouse />
        </div>
      </InstSection>

      <InstSection id="agencja" style={SECTION}>
        <div className="wrap split">
          <div className="ri" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="eye">{agency.eyebrow}</span>
            <h2 className="h2">{agency.heading}</h2>
            <p className="lead">{agency.lead}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {agency.items.map((item) => (
              <div
                key={item.title}
                className="card ri"
                style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'flex-start' }}
              >
                <span className="ico">
                  <InstIcon name={item.icon} size={22} />
                </span>
                <div>
                  <b style={{ fontSize: 17 }}>{item.title}</b>
                  <p className="mut" style={{ margin: '4px 0 0', fontSize: 15 }}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
            <div className="note ri">
              <InstIcon name="doc" size={20} />
              <span>
                {agency.licence} {LEGAL_NOTE}
              </span>
            </div>
          </div>
        </div>
      </InstSection>
    </>
  )
}
