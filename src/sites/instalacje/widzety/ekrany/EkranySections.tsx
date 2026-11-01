import Link from 'next/link'

import { ekrany } from '../../dane/ekrany'
import { LEGAL_NOTE } from '../../dane/prawo'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSection'
import { SectionHead } from '../../sekcje/SectionHead'
import { BrightnessPicker, PixelPitch, TwoSalons } from './EkranyWidgets'

import './ekrany.css'

const SECTION = { padding: '0 0 104px' }

/**
 * The Ekrany sections between the hero and the shared ones (`zrodlo/pages/Multimedia.body.html`):
 * where we mount screens, the two-salon demo, brightness, TV or professional screen, content,
 * LED and interactive, outdoor. Folded on a phone as in `zrodlo/fold.json` (`tv-czy-ekran`,
 * `sciany-led`, `zewnatrz`; `cena` and `faq` by the shared sections).
 */
export function EkranySections() {
  const { where, tvOrScreen, content, led, outdoor } = ekrany
  return (
    <>
      <InstSection id="gdzie" style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <SectionHead {...where.head} />
          <div className="g3">
            {where.items.map((g) => (
              <div key={g.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={g.icon} size={22} />
                </span>
                <b className="h3">{g.title}</b>
                <p>{g.text}</p>
              </div>
            ))}
          </div>
          <div className="note ri" style={{ marginTop: 18 }}>
            <InstIcon name="eye" size={20} />
            <span>
              {where.tvBefore}
              <Link href={where.tvLink.href} className="scr-link">
                {where.tvLink.label}
              </Link>
              {where.tvAfter}
              <Link href={where.realizationsLink.href} className="scr-link">
                {where.realizationsLink.label}
              </Link>
            </span>
          </div>
        </div>
      </InstSection>

      <InstSection id="dwa-ekrany" style={SECTION}>
        <div className="wrap">
          <div className="card dark ri synw" data-surface="dark">
            <TwoSalons />
          </div>
        </div>
      </InstSection>

      <InstSection id="jasnosc" style={SECTION}>
        <div className="wrap">
          <SectionHead {...ekrany.brightness.head} />
          <BrightnessPicker />
        </div>
      </InstSection>

      <InstSection id="tv-czy-ekran" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...tvOrScreen.head} />
          <div className="tblw ri">
            <table className="tbl">
              <thead>
                <tr>
                  <th>
                    <span className="sr-only">Cecha</span>
                  </th>
                  <th scope="col">{tvOrScreen.columns[0]}</th>
                  <th scope="col">{tvOrScreen.columns[1]}</th>
                </tr>
              </thead>
              <tbody>
                {tvOrScreen.rows.map(([k, a, b]) => (
                  <tr key={k}>
                    <td>
                      <b>{k}</b>
                    </td>
                    <td className="mut">{a}</td>
                    <td>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </InstSection>

      <InstSection id="tresci" style={SECTION}>
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <div className="ri" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="eye">{content.eyebrow}</span>
            <h2 className="h2">{content.heading}</h2>
            <p className="lead">{content.lead}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {content.items.map((m) => (
              <div
                key={m.title}
                className="card ri"
                style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'flex-start' }}
              >
                <span className="ico">
                  <InstIcon name={m.icon} size={22} />
                </span>
                <div>
                  <b style={{ fontSize: 17 }}>{m.title}</b>
                  <p className="mut" style={{ margin: '4px 0 0', fontSize: 15 }}>
                    {m.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="sciany-led" fold style={SECTION}>
        <div className="wrap">
          <div className="g2 ri" style={{ alignItems: 'stretch' }}>
            <PixelPitch />
            <div className="card labc">
              <span className="svk">{led.more.eyebrow}</span>
              <b className="h3">{led.more.heading}</b>
              {led.more.items.map((x) => (
                <div key={x.title} className="odi2">
                  <span className="ico" style={{ width: 40, height: 40 }}>
                    <InstIcon name={x.icon} size={19} />
                  </span>
                  <div>
                    <b>{x.title}</b>
                    <span>{x.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection id="zewnatrz" fold style={SECTION}>
        <div className="wrap">
          <div className="card dark ri tlaw scr-out" data-surface="dark">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="eye tlaweye">{outdoor.eyebrow}</span>
              <h2 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
                {outdoor.heading}
              </h2>
              <p className="lead">{outdoor.lead}</p>
            </div>
            <div className="g2" style={{ gap: 12 }}>
              {outdoor.items.map((e) => (
                <div key={e.title} className="odi">
                  <InstIcon name={e.icon} size={20} />
                  <div>
                    <b style={{ display: 'block' }}>{e.title}</b>
                    <span className="tlawtx">{e.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="note w ri" style={{ marginTop: 18 }}>
            <InstIcon name="doc" size={20} />
            <span>
              {outdoor.law} {LEGAL_NOTE}
            </span>
          </div>
        </div>
      </InstSection>
    </>
  )
}
