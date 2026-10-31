import { type CSSProperties, Fragment, type ReactNode } from 'react'

import { LEGAL_NOTE } from '../../dane/prawo'
import { sieci } from '../../dane/sieci'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSection'
import { SectionHead } from '../../sekcje/SectionHead'
import { CableLab, FailoverLab, LinkLab, PortalCode, VlanButtons, WallLab } from './SieciWidgets'

import './sieci.css'

const SECTION = { padding: '0 0 104px' }

function Checks({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={className ? `uhl ${className}` : 'uhl'}>
      {items.map((x) => (
        <li key={x}>
          <InstIcon name="check" size={13} strokeWidth={2.8} />
          {x}
        </li>
      ))}
    </ul>
  )
}

function LabCard({
  kicker,
  title,
  children,
}: {
  kicker: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="card labc ri">
      <span className="svk">{kicker}</span>
      <b className="h3">{title}</b>
      {children}
    </div>
  )
}

/**
 * The Sieci i Wi-Fi sections between the hero and the shared ones
 * (`zrodlo/pages/Sieci.body.html`): why Wi-Fi fails, separate networks, the guest portal,
 * cabling, the four „Sprawdź sam” tools, the hardware, Wi-Fi standards and NIS2. Folded on a
 * phone as in `zrodlo/fold.json` (`podzial`, `portal`, `okablowanie`, `sprzet` to 900 px,
 * `standardy`; `cena` and `faq` by the shared sections).
 */
export function SieciSections() {
  const { why, split, portal, cabling, lab, hardware, standards, nis2 } = sieci
  const S = portal.screen
  return (
    <>
      <InstSection id="dlaczego" style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <SectionHead {...why.head} leadWidth={440} />
          <div className="g4">
            {why.items.map((w) => (
              <div key={w.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={w.icon} size={22} />
                </span>
                <b className="h3">{w.title}</b>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="podzial" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...split.head} />
          <div className="netd ri">
            {split.nodes.map((n, i) => (
              <Fragment key={n.title}>
                <div className={i === 0 ? 'netn root' : 'netn'}>
                  <InstIcon name={n.icon} size={22} />
                  <b>{n.title}</b>
                  <span>{n.text}</span>
                </div>
                <div className={i === split.nodes.length - 1 ? 'netl split4' : 'netl'} />
              </Fragment>
            ))}
            <VlanButtons />
          </div>
        </div>
      </InstSection>

      <InstSection id="portal" fold style={SECTION}>
        <div className="wrap smw">
          <div className="ri" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <span className="eye">{portal.eyebrow}</span>
            <h2 className="h2">{portal.heading}</h2>
            <p className="lead">{portal.lead}</p>
            <ul className="list">
              {portal.list.map((p) => (
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
            <div className="note">
              <InstIcon name="doc" size={20} />
              <span>{portal.uke}</span>
            </div>
            <div className="note">
              <InstIcon name="lock" size={20} />
              <span>
                {portal.rodo} {LEGAL_NOTE}
              </span>
            </div>
          </div>
          <div className="ri">
            <div className="phone">
              <div className="phs ptphs">
                <div className="phh">
                  <span>{S.title}</span>
                  <span>{S.time}</span>
                </div>
                <div className="pthead">
                  <span className="ptlogo">{S.logo}</span>
                  <b className="pht" style={{ textAlign: 'center' }}>
                    {S.welcome}
                  </b>
                  <span className="ptsub">{S.sub}</span>
                </div>
                <div className="tile on" style={{ gap: 8 }}>
                  <span>{S.codeLabel}</span>
                  <PortalCode />
                </div>
                <div className="tile ptrow">
                  <span>{S.until}</span>
                  <b>{S.untilValue}</b>
                </div>
                <div className="tile ptrow">
                  <span>{S.speed}</span>
                  <b>{S.speedValue}</b>
                </div>
                <div className="ptbtn">{S.connect}</div>
                <span className="ptterms">{S.terms}</span>
                <div className="phcap">{S.caption}</div>
              </div>
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection id="okablowanie" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...cabling.head} />
          <div className="g3">
            {cabling.items.map((b) => (
              <div key={b.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={b.icon} size={22} />
                </span>
                <b className="h3">{b.title}</b>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
          <div className="note ri" style={{ marginTop: 18 }}>
            <InstIcon name="globe" size={20} />
            <span>{cabling.uke}</span>
          </div>
        </div>
      </InstSection>

      <InstSection id="narzedzia" style={SECTION}>
        <div className="wrap">
          <SectionHead {...lab.head} />
          <div className="labg">
            <LabCard kicker={lab.walls.kicker} title={lab.walls.title}>
              <WallLab />
            </LabCard>
            <LabCard kicker={lab.cable.kicker} title={lab.cable.title}>
              <CableLab />
            </LabCard>
            <LabCard kicker={lab.link.kicker} title={lab.link.title}>
              <LinkLab />
            </LabCard>
            <LabCard kicker={lab.failover.kicker} title={lab.failover.title}>
              <FailoverLab />
            </LabCard>
          </div>
        </div>
      </InstSection>

      <InstSection id="sprzet" fold foldHeight={900} style={SECTION}>
        <div className="wrap">
          <SectionHead {...hardware.head} />
          <div className="hwflow ri">
            {hardware.roles.map((r, i) => (
              <div key={r.title} className="card hwrole">
                <span className="hwno">{String(i + 1).padStart(2, '0')}</span>
                <span className="ico">
                  <InstIcon name={r.icon} size={22} />
                </span>
                <b className="h3">{r.title}</b>
                <p>{r.text}</p>
                <span className="hwtip">
                  <b>{hardware.careful}</b> {r.tip}
                </span>
              </div>
            ))}
          </div>
          <div className="hwcmp xb-hw2 ri">
            <div className="card hwk">
              <span className="eye">{hardware.brands.eyebrow}</span>
              <b className="h3">{hardware.brands.title}</b>
              <p className="hwkp">{hardware.brands.text}</p>
            </div>
            <div className="card dark hwk" data-surface="dark">
              <span className="eye hwkeye">{hardware.always.eyebrow}</span>
              <b className="h3">{hardware.always.title}</b>
              <Checks items={hardware.always.items} />
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection id="standardy" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...standards.head} />
          <div className="g3">
            {standards.items.map((w) => (
              <div key={w.gen} className="card wfc ri" style={{ '--h': w.hue } as CSSProperties}>
                <span className="wfg">{w.gen}</span>
                <b className="h3">{w.title}</b>
                <Checks items={w.list} />
                <span className="wfn">{w.note}</span>
              </div>
            ))}
          </div>
          <div className="note ri" style={{ marginTop: 16 }}>
            <InstIcon name="doc" size={20} />
            <span>
              <b>{standards.band.title}</b> {standards.band.text} {LEGAL_NOTE}
            </span>
          </div>
        </div>
      </InstSection>

      <InstSection id="zapas" style={SECTION}>
        <div className="wrap">
          <div style={{ display: 'grid' }}>
            <div className="card dark bkc ri" data-surface="dark">
              <span className="eye hwkeye">{nis2.eyebrow}</span>
              <h2 className="h3" style={{ fontSize: 26 }}>
                {nis2.heading}
              </h2>
              <p className="bkp">{nis2.text}</p>
              <Checks items={nis2.items} className="bkl" />
              <span className="bknote">
                {nis2.note} {LEGAL_NOTE}
              </span>
            </div>
          </div>
        </div>
      </InstSection>
    </>
  )
}
