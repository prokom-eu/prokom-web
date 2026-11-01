import { smartHome } from '../../dane/smartHome'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSection'
import { SectionHead } from '../../sekcje/SectionHead'
import {
  SmartApp,
  SmartAreas,
  SmartChecklist,
  SmartFailure,
  SmartPanel,
  SmartRooms,
} from './SmartWidgets'

const SECTION = { padding: '0 0 104px' }

/**
 * The Smart home sections between the hero and the shared ones
 * (`zrodlo/pages/SmartHome.body.html`): control areas, why Ampio with the failure demo, glass
 * panels, integrations, guesthouses, modules and stages with the checklist. Folded on a phone
 * as in `zrodlo/fold.json` (`dlaczego`, `integracje`, `obiekty`, `moduly`, `etapy`; `cena` and
 * `faq` by the shared sections).
 */
export function SmartSections({ planHref }: { planHref: string }) {
  const { areas, why, integrations, objects, modules, stages } = smartHome
  return (
    <>
      <InstSection id="co-sterujesz" style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <SectionHead {...areas.head} />
          <SmartAreas />
          <p className="src ri" style={{ margin: '12px 0 1em' }}>
            {areas.footnote}
          </p>
        </div>
      </InstSection>

      <InstSection id="dlaczego" fold style={SECTION}>
        <div className="wrap split" style={{ alignItems: 'center' }}>
          <div className="ri" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <span className="eye">{why.eyebrow}</span>
            <h2 className="h2">
              {why.heading} <span className="acc">{why.accent}</span>
            </h2>
            <p className="lead">{why.lead}</p>
            <ul className="list">
              {why.list.map((w) => (
                <li key={w.title}>
                  <i>
                    <InstIcon name="check" size={14} strokeWidth={2.6} />
                  </i>
                  <div>
                    <b>{w.title}</b>
                    <span>{w.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <SmartFailure />
        </div>
      </InstSection>

      <InstSection id="panele" style={SECTION}>
        <div className="wrap">
          <SmartPanel />
        </div>
      </InstSection>

      <InstSection id="integracje" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...integrations.head} />
          <div className="intw ri">
            {integrations.groups.map((g) => (
              <div key={g.name} className="intg">
                <b>{g.name}</b>
                <div className="tags">
                  {g.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="src ri" style={{ margin: '12px 0 1em' }}>
            {integrations.note}
          </p>
        </div>
      </InstSection>

      <InstSection id="obiekty" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...objects.head} />
          <div className="hotw ri">
            <SmartRooms />
            <SmartApp />
          </div>
          <div className="axb ri">
            {objects.segments.map((x) => (
              <div key={x.name} className="card axbc">
                <span className="ico">
                  <InstIcon name={x.icon} size={22} />
                </span>
                <b style={{ fontSize: 18 }}>{x.name}</b>
                <ul className="axl">
                  {x.features.map((f) => (
                    <li key={f}>
                      <span className="axok">
                        <InstIcon name="check" size={14} strokeWidth={2.6} />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <span className="src">{x.note}</span>
              </div>
            ))}
          </div>
          <div className="refs ri">
            <span className="usl" style={{ width: 'auto' }}>
              {objects.refs.label}
            </span>
            {objects.refs.items.map((r) => (
              <div key={r.title} className="refc">
                <b>{r.title}</b>
                <span>{r.text}</span>
              </div>
            ))}
            <span className="src">{objects.refs.note}</span>
          </div>
        </div>
      </InstSection>

      <InstSection id="moduly" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...modules.head} />
          <div className="modg">
            {modules.items.map((m) => (
              <div key={m.name} className="card modc ri">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="ico" style={{ width: 42, height: 42 }}>
                    <InstIcon name={m.icon} size={20} />
                  </span>
                  <b style={{ fontSize: 17 }}>{m.name}</b>
                </div>
                <p>{m.text}</p>
                <div className="tags">
                  {m.models.map((x) => (
                    <span key={x} className="tag mono">
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="src ri" style={{ margin: '12px 0 1em' }}>
            {modules.note}
          </p>
        </div>
      </InstSection>

      <InstSection id="etapy" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...stages.head} />
          <div className="etw">
            <div className="tl7 ri">
              {stages.steps.map((s) => (
                <div key={s.n} className="tl7i">
                  <span className="stn">{s.n}</span>
                  <div>
                    <b>{s.title}</b>
                    <p>{s.text}</p>
                    <span className="tl7w">{s.who}</span>
                  </div>
                </div>
              ))}
            </div>
            <SmartChecklist planHref={planHref} />
          </div>
        </div>
      </InstSection>
    </>
  )
}

/** Note on the Ampio warranty under the shared warranty section (`.xc-gwn`). */
export function SmartWarrantyNote() {
  return (
    <div className="wrap xc-gwn">
      <div className="note">
        <InstIcon name="shield" size={20} />
        <span>{smartHome.warrantyNote}</span>
      </div>
    </div>
  )
}
