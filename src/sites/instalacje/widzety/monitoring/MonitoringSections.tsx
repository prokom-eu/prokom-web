import { monitoring } from '../../dane/monitoring'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSectionLazy'
import { SectionHead } from '../../sekcje/SectionHead'
import { DoriCalc, RecordingCalc } from './CalculatorsLazy'
import { CameraTypes } from './CameraTypesLazy'
import { SystemDiagram } from './SystemDiagramLazy'

const SECTION = { padding: '0 0 104px' }

/**
 * The Monitoring sections between the hero and the shared ones
 * (`zrodlo/pages/Monitoring.body.html`): what you get, installation versions, camera types, the
 * DORI and recording calculators, privacy (frame, masks, sign) and the brands. Folded on a phone as in
 * `zrodlo/fold.json` (`system`; `cena` and `faq` by the shared sections).
 */
export function MonitoringSections({ planHref }: { planHref: string }) {
  const { whatYouGet, system, types, dori, recording, privacy, brands } = monitoring
  return (
    <>
      <InstSection id="co-dostajesz" style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <SectionHead {...whatYouGet.head} leadWidth={440} />
          <div className="g3">
            {whatYouGet.items.map((item) => (
              <div key={item.title} className="card feat ri">
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

      <InstSection id="system" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...system.head} />
          <SystemDiagram planHref={planHref} />
        </div>
      </InstSection>

      <InstSection id="typy" style={SECTION}>
        <div className="wrap">
          <SectionHead {...types.head} />
          <CameraTypes />
        </div>
      </InstSection>

      <InstSection id="ile-widac" style={SECTION}>
        <div className="wrap">
          <SectionHead {...dori.head} />
          <DoriCalc />
        </div>
      </InstSection>

      <InstSection id="nagrania" style={SECTION}>
        <div className="wrap">
          <SectionHead {...recording.head} />
          <RecordingCalc />
        </div>
      </InstSection>

      {/* Section id kept as `rodo`: the anchor bar (seed, `lib/instalacje/anchors.ts`) points at it. */}
      <InstSection id="rodo" style={SECTION}>
        <div className="wrap">
          <SectionHead {...privacy.head} />
          <div className="privacy">
            <div className="card rz ok ri">
              <b className="h3">{privacy.yes.title}</b>
              <ul>
                {privacy.yes.items.map((item) => (
                  <li key={item}>
                    <i>
                      <InstIcon name="check" size={14} strokeWidth={2.6} />
                    </i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card rz nn ri">
              <b className="h3">{privacy.no.title}</b>
              <ul>
                {privacy.no.items.map((item) => (
                  <li key={item}>
                    <i>
                      <InstIcon name="x" size={14} strokeWidth={2.6} />
                    </i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sign ri" role="group" aria-label={privacy.sign.label}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="sgi">
                  <InstIcon name="cam" size={34} />
                </span>
                <b>{privacy.sign.title}</b>
              </div>
              <hr />
              {privacy.sign.rows.map((row) => (
                <span key={row.key}>
                  <b>{row.key}</b> {row.value}
                </span>
              ))}
              <span style={{ fontSize: 11.5, opacity: 0.75 }}>{privacy.sign.foot}</span>
            </div>
          </div>
          <div className="g4 ri" style={{ marginTop: 18 }}>
            {privacy.we.map((item) => (
              <div key={item.title} className="card feat" style={{ padding: 20 }}>
                <span className="ico s">
                  <InstIcon name={item.icon} />
                </span>
                <b>{item.title}</b>
                <p style={{ fontSize: 14.5 }}>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="note w ri" style={{ marginTop: 18 }}>
            <InstIcon name="doc" size={20} />
            <span>{privacy.neighbour}</span>
          </div>
          <div className="note w ri" style={{ marginTop: 12 }}>
            <InstIcon name="users" size={20} />
            <span>
              <b>{privacy.employees.title}</b> {privacy.employees.text}
            </span>
          </div>
        </div>
      </InstSection>

      <InstSection id="sprzet-kamery" style={SECTION}>
        <div className="wrap">
          <SectionHead {...brands.head} />
          <div className="bmg xb-bmg3 ri">
            {brands.items.map((brand) => (
              <div key={brand.name} className="card bmc">
                <div className="bmh">
                  <b className="disp" style={{ fontSize: 26 }}>
                    {brand.name}
                  </b>
                  <span className="tag a">{brand.kicker}</span>
                </div>
                <ul className="axl">
                  {brand.features.map((f) => (
                    <li key={f}>
                      <span className="axok">
                        <InstIcon name="check" size={14} strokeWidth={2.6} />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="bmd ri">
            <div className="bmdh">
              <span className="usl" style={{ width: 'auto' }}>
                {brands.how}
              </span>
            </div>
            <div className="bmdg">
              {brands.howItems.map((item) => (
                <div key={item.title} className="bmdc">
                  <span className="ico">
                    <InstIcon name={item.icon} size={20} />
                  </span>
                  <div>
                    <b>{item.title}</b>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InstSection>
    </>
  )
}
