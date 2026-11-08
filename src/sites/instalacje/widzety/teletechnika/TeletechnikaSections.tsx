import Link from 'next/link'

import { getInstalacjeRealizations } from '@/lib/instalacje/data'
import { leadPhoto, matchRealization } from '@/lib/instalacje/realizations'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'

import { LEGAL_NOTE } from '../../dane/prawo'
import { teletechnika } from '../../dane/teletechnika'
import { InstIcon } from '../../InstIcon'
import { ProcessAxis } from '../../sekcje/glowna/ProcessAxis'
import { InstSection } from '../../sekcje/InstSectionLazy'
import { SectionHead } from '../../sekcje/SectionHead'
import { RealizationPhotos } from '../realizacje/RealizationPhotosLazy'
import { QuoteForm } from './QuoteFormLazy'

const SECTION = { padding: '0 0 104px' }

/**
 * The Teletechnika sections between the hero and the shared ones
 * (`zrodlo/pages/Teletechnika.body.html`): scope, for whom, the law and the quote form. The page
 * has no warranty, packages or price sections (the prototype's markup). Folded on a phone as in
 * `zrodlo/fold.json` (`zakres`; `faq` by the shared section). Round v5 (RUNDA-V5 §10) adds the
 * building stages, what you get at handover and the standards, the mistakes that stop a handover,
 * the common parts, how the offer is counted and the realization — all folded on a phone.
 */
export async function TeletechnikaSections({ tenantId }: { tenantId: number }) {
  const { scope, stages, handover, standards, mistakes, common, pricing, realization } =
    teletechnika
  const { forWhom, law, quote } = teletechnika
  const withPhotos = (await getInstalacjeRealizations(tenantId)).filter((r) => r.photos.length > 0)
  const match = matchRealization(realization.name, withPhotos)
  const photos = match && leadPhoto(realization.photoHint, match.photos)
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
            <b className="h3">{standards.title}</b>
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

      {photos ? (
        <InstSection id="realizacja-t" style={SECTION}>
          <div className="wrap">
            <div className="card ttreal ri">
              <div className="rlimg rlimgp">
                <RealizationPhotos
                  photos={photos}
                  title={realization.name}
                  sizes="(min-width: 1100px) 620px, 100vw"
                />
              </div>
              <div className="ttrealb">
                <span className="eye">{realization.eyebrow}</span>
                <h2 className="h2">{realization.heading}</h2>
                <span className="tag a">{realization.place}</span>
                <p>{realization.text}</p>
                <Link href={realization.all.href} className="btn btn-g">
                  {realization.all.label}
                </Link>
              </div>
            </div>
          </div>
        </InstSection>
      ) : null}

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
              <span className="tlawtx">{LEGAL_NOTE}</span>
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
