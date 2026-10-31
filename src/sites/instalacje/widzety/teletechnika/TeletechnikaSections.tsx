import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'

import { teletechnika } from '../../dane/teletechnika'
import { InstIcon } from '../../InstIcon'
import { InstSection } from '../../sekcje/InstSection'
import { SectionHead } from '../../sekcje/SectionHead'
import { QuoteForm } from './QuoteForm'

import './teletechnika.css'

const SECTION = { padding: '0 0 104px' }

/**
 * The Teletechnika sections between the hero and the shared ones
 * (`zrodlo/pages/Teletechnika.body.html`): scope, for whom, the law and the quote form. The page
 * has no warranty, packages or price sections (the prototype's markup). Folded on a phone as in
 * `zrodlo/fold.json` (`zakres`; `faq` by the shared section).
 */
export function TeletechnikaSections() {
  const { scope, forWhom, law, quote } = teletechnika
  // Rendered per request (minimum time to fill in, ADR-003).
  const formToken = issueFormToken(getEnv().PAYLOAD_SECRET)
  return (
    <>
      <InstSection id="zakres" fold style={{ padding: '96px 0 104px' }}>
        <div className="wrap">
          <SectionHead {...scope.head} />
          <div className="g3">
            {scope.items.map((z) => (
              <div key={z.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={z.icon} size={22} />
                </span>
                <b className="h3">{z.title}</b>
                <p>{z.text}</p>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="dla-kogo" style={SECTION}>
        <div className="wrap">
          <SectionHead {...forWhom.head} />
          <div className="g4">
            {forWhom.items.map((d) => (
              <div key={d.title} className="card feat ri">
                <span className="ico">
                  <InstIcon name={d.icon} size={22} />
                </span>
                <b className="h3">{d.title}</b>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
          <div className="note ri" style={{ marginTop: 18 }}>
            <InstIcon name="build" size={20} />
            <span>{forWhom.note}</span>
          </div>
        </div>
      </InstSection>

      <InstSection id="przepisy" style={SECTION}>
        <div className="wrap">
          <div className="card dark ri tlaw" data-surface="dark">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="eye tlaweye">{law.eyebrow}</span>
              <h2 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
                {law.heading}
              </h2>
              <p className="lead">{law.lead}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {law.items.map((p) => (
                <div key={p.title} className="odi">
                  <InstIcon name="doc" size={20} />
                  <div>
                    <b style={{ display: 'block' }}>{p.title}</b>
                    <span className="tlawtx">{p.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InstSection>

      <InstSection id="zapytanie" style={SECTION}>
        <div className="wrap">
          <SectionHead {...quote.head} leadWidth={440} />
          <QuoteForm formToken={formToken} />
        </div>
      </InstSection>
    </>
  )
}
