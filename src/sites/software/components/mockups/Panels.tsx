import type { CSSProperties } from 'react'

import type { DashVariant, FlowVariant } from '@/lib/software/mockups'

import { CARE, DASHES, FLOWS } from './data'

const DAYS = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd']
/** The highlighted bar of the week: Friday. */
const PEAK_DAY = 4

/**
 * A system panel: side menu, three KPIs (four on the company dashboard), bars rising one by one,
 * the latest rows with status. The company dashboard (`live`) also has a „na żywo” badge and
 * parts the points of „W cenie” light (`data-spot`: kpi, wykres, uwaga, raport — SWA14 §4.4).
 */
export function MockDash({ variant }: { variant: DashVariant }) {
  const dash = DASHES[variant]
  const max = Math.max(...dash.bars, 1)
  const live = Boolean(dash.live)
  const spot = (name: string) => (live ? name : undefined)
  return (
    <div className="mk-frame mk-dash">
      <div className="mk-side">
        <b>
          <i />
          Twoja Firma
        </b>
        {dash.nav.map((item, i) => (
          <span
            key={item}
            data-on={i === 1 || undefined}
            data-spot={i === 1 ? 'modul' : undefined}
            data-spot-at={i === 1 ? 'end' : undefined}
          >
            {item}
          </span>
        ))}
        <span className="mk-user" data-spot="uzytkownicy" data-spot-at="above">
          <i>AN</i>Anna · biuro<small>+4</small>
        </span>
      </div>
      <div className="mk-main">
        <div className="mk-main-head">
          <div>
            <small>{dash.crumb}</small>
            <b>{dash.title}</b>
          </div>
          {dash.live && (
            // The flow mock-ups' „działa” badge; here its dot blinks (SWA14 §4.2).
            <span className="mk-live">
              <i />
              {dash.live}
            </span>
          )}
          <i className="mk-device" data-spot="mobile" data-spot-at="before">
            Telefon
          </i>
          <span
            className={live ? 'mk-report' : undefined}
            data-spot={spot('raport')}
            data-spot-at={spot('end')}
          >
            {dash.button}
          </span>
        </div>
        <div className="mk-kpis" data-n={dash.kpi.length} data-spot={spot('kpi')}>
          {dash.kpi.map(([label, value, delta]) => (
            <div key={label} className="mk-card mk-kpi">
              <small>{label}</small>
              <div>
                <b>{value}</b>
                {delta && <span>{delta}</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="mk-panels">
          <div className="mk-card mk-chart" data-spot={spot('wykres')}>
            <div className="mk-panel-head">
              <span>{dash.chart}</span>
              <span>ten tydzień</span>
            </div>
            <div className="mk-bars">
              {dash.bars.map((value, i) => {
                const style: CSSProperties = {
                  height: `${Math.max(4, Math.round((value / max) * 100))}%`,
                  animationDelay: `calc(${i} * var(--mk-step-bar))`,
                }
                return (
                  <div key={DAYS[i]}>
                    <i style={style} data-peak={i === PEAK_DAY || undefined} />
                    <small>{DAYS[i]}</small>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mk-card mk-list" data-spot={spot('uwaga')}>
            <div>{dash.list}</div>
            {dash.rows.map(([title, note, tag, tone]) => (
              <div key={title} className="mk-list-row">
                <span>
                  <b>{title}</b>
                  <small>{note}</small>
                </span>
                <span className="mk-tag" data-tone={tone}>
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Left edges of the three nodes and of the two wires between them (board px). */
const NODE_LEFT = [0, 223, 446]
const WIRE_LEFT = [150, 373]

/** An automation: when → automat → effect with a dot running on the wire, today's history. */
export function MockFlow({ variant }: { variant: FlowVariant }) {
  const flow = FLOWS[variant]
  return (
    <div className="mk-frame mk-flow">
      <div className="mk-flow-head">
        <b>{flow.title}</b>
        <span className="mk-live">
          <i />
          działa
        </span>
      </div>
      <div className="mk-nodes">
        {WIRE_LEFT.map((left) => (
          <div key={left} className="mk-wire" style={{ left }}>
            <i />
          </div>
        ))}
        {flow.nodes.map(([icon, step, text], i) => (
          <div key={step} className="mk-node" style={{ left: NODE_LEFT[i] }}>
            <span>
              <i>{icon}</i>
              {step}
            </span>
            <b>{text}</b>
          </div>
        ))}
      </div>
      <div className="mk-card mk-history">
        <div>
          <span>Historia · dziś</span>
          <span>{flow.count}</span>
        </div>
        {flow.logs.map(([text, status], i) => (
          <div
            key={text}
            className="mk-log"
            style={{ animationDelay: `calc(${i} * var(--mk-step-log))` }}
          >
            <span>{text}</span>
            <b>{status}</b>
          </div>
        ))}
      </div>
      <div className="mk-promises">
        <div className="mk-card mk-promise">
          <i>⟳</i>
          <span>
            <b>Działa 24/7</b>także w weekend
          </span>
        </div>
        <div className="mk-card mk-promise">
          <i>✓</i>
          <span>
            <b>Pod kontrolą</b>Ty ustalasz reguły
          </span>
        </div>
        <div className="mk-card mk-promise">
          <i>≡</i>
          <span>
            <b>Pełna historia</b>każdy krok zapisany
          </span>
        </div>
      </div>
    </div>
  )
}

/** Care of a site or system: online, 30 days of uptime, backups and updates. */
export function MockCare() {
  return (
    <div className="mk-frame mk-care">
      <div className="mk-care-head">
        <div>
          <small>{CARE.eyebrow}</small>
          <b>{CARE.title}</b>
        </div>
        <span className="mk-online">
          <i />
          online
        </span>
      </div>
      <div className="mk-care-label">Dostępność · ostatnie 30 dni</div>
      <div className="mk-uptime">
        {Array.from({ length: 30 }, (_, day) => (
          <i key={day} data-slow={day === CARE.slowDay || undefined} />
        ))}
      </div>
      <div className="mk-care-grid">
        {CARE.rows.map(([label, value]) => (
          <div key={label}>
            <small>{label}</small>
            <b>{value}</b>
          </div>
        ))}
      </div>
    </div>
  )
}
