import Link from 'next/link'

import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'

import { teletechnika } from '../../dane/teletechnika'
import { InstIcon } from '../../InstIcon'
import { ProcessAxis } from '../../sekcje/glowna/ProcessAxis'
import { InstSection } from '../../sekcje/InstSectionLazy'
import { SectionHead } from '../../sekcje/SectionHead'
import { QuoteForm } from './QuoteFormLazy'

const SECTION = { padding: '0 0 104px' }

/**
 * The Teletechnika sections between the hero and the shared ones
 * (`zrodlo/pages/Teletechnika.body.html`): scope, for whom and the quote form (no law: runda v6 §1.1). The page
 * has no warranty, packages or price sections (the prototype's markup). Folded on a phone as in
 * `zrodlo/fold.json` (`zakres`; `faq` by the shared section). Round v5 (RUNDA-V5 §10) adds the
 * building stages, what you get at handover and the standards, the mistakes that stop a handover,
 * the common parts and how the offer is counted — all folded on a phone. Realizations live on
 * `/realizacje` only (runda v6 §1.2).
 */
export function TeletechnikaSections() {
  const { scope, stages, handover, standards, mistakes, common, pricing } = teletechnika
  const { forWhom, quote } = teletechnika // the sections the prototype already had
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

      <InstSection
        id="etapy"
        className="bnd bnd-tint"
        fold
        foldHeight={980}
        style={{ padding: '96px 0 104px', marginBottom: 104 }}
      >
        <div className="wrap">
          <SectionHead {...stages.head} />
          <ProcessAxis steps={stages.steps} getLabel={stages.getLabel} />
        </div>
      </InstSection>

      <InstSection id="przy-odbiorze" fold style={SECTION}>
        <div className="wrap ttho">
          <div className="ri">
            <SectionHead {...handover.head} />
            <ul className="ttlist">
              {handover.items.map((item) => (
                <li key={item}>
                  <InstIcon name="check" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card ttstd ri">
            <h3 className="h3">{standards.title}</h3>
            <ul className="ttlist">
              {standards.items.map((item) => (
                <li key={item}>
                  <InstIcon name="ruler" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </InstSection>

      <InstSection id="bledy" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...mistakes.head} />
          <div className="g4">
            {mistakes.items.map((m) => (
              <div key={m.title} className="card feat ttmis ri">
                <span className="ico">
                  <InstIcon name={m.icon} size={22} />
                </span>
                <h3 className="h3">{m.title}</h3>
                <p>{m.text}</p>
                <p className="ttavoid">
                  <span>{mistakes.avoidLabel}</span>
                  {m.avoid}
                </p>
              </div>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="czesci-wspolne" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...common.head} />
          <div className="g4">
            {common.items.map((c) => (
              <Link key={c.title} href={c.href} className="card feat ttcom ri">
                <span className="ico">
                  <InstIcon name={c.icon} size={22} />
                </span>
                <h3 className="h3">
                  {c.title} <InstIcon name="arrow" size={16} />
                </h3>
                <p>{c.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </InstSection>

      <InstSection id="jak-liczymy" fold style={SECTION}>
        <div className="wrap">
          <SectionHead {...pricing.head} />
          <ProcessAxis steps={pricing.steps} />
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

      <InstSection id="zapytanie" style={SECTION}>
        <div className="wrap">
          <SectionHead {...quote.head} leadWidth={440} />
          <QuoteForm formToken={formToken} />
        </div>
      </InstSection>
    </>
  )
}
