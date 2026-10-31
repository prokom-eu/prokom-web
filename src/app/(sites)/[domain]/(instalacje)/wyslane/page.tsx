import type { Metadata } from 'next'
import Link from 'next/link'

import { sentNumber, sentVia, wyslane as W } from '@/sites/instalacje/dane/wyslane'

import { requireLine } from '../../tenant'

import '@/sites/instalacje/widzety/zaplanuj/zaplanuj.css'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// After a form: personal, nothing to index, not in the sitemap (ADR-I002 §0, like `/dziekujemy`).
export const metadata: Metadata = {
  title: W.metaTitle,
  robots: { index: false, follow: true },
}

/**
 * `/wyslane?nr=PKI-…&kontakt=telefon` — the thanks after an Instalacje form, in the look of the
 * planner's last step (`.zkdone`). Only a number of its own format and a known contact way are
 * shown; the address never carries personal data. No CTA band after a sent inquiry.
 */
export default async function SentPage({ params, searchParams }: Props) {
  await requireLine(params, 'instalacje')
  const query = await searchParams
  const number = sentNumber(query.nr)
  const via = sentVia(query.kontakt)
  return (
    <section id="hero" className="phero zkh" style={{ paddingBottom: 96 }}>
      <div className="hgrid" />
      <div className="hglow" />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="zkw">
          <div className="zkcard">
            <div className="zkdone">
              <span className="zkok">
                <svg viewBox="0 0 52 52" aria-hidden="true">
                  <circle cx="26" cy="26" r="24" />
                  <path d="M15 27 l7 7 l15 -16" />
                </svg>
              </span>
              <h1 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}>
                {W.title}
              </h1>
              <p className="lead" style={{ maxWidth: 560 }}>
                {via ? W.leadVia(via) : W.lead}
              </p>
              {number && (
                <p>
                  {W.number} <b data-testid="inquiry-number">{number}</b>
                </p>
              )}
              <p className="mut" style={{ maxWidth: 560 }}>
                {W.files}
              </p>
              <div className="zkdtl">
                {W.after.map((a, i) => (
                  <div key={a.title}>
                    <em>{i + 1}</em>
                    <b>{a.title}</b>
                    <span>{a.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {W.links.map((l) => (
                  <Link key={l.href} href={l.href} className="btn btn-g">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <i data-cta-page="" hidden />
    </section>
  )
}
