import type { Metadata } from 'next'
import { IntentLink as Link } from '@/components/shared/IntentLink'
import { notFound } from 'next/navigation'

import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { getSoftwareThanks } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import { inquiryNumberParam } from '@/lib/software/pages'
import { Glass } from '@/sites/software/components/ui/Glass'
import { softwareTextContext } from '@/sites/software/components/textContext'

import { requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TITLE = 'Dziękujemy'

// After a form: personal, nothing to index, not in the sitemap (spec. §2, §6.11).
export const metadata: Metadata = {
  title: TITLE,
  // Still described (Lighthouse SEO), though never indexed.
  description: 'Dziękujemy za zapytanie. Odezwiemy się w ciągu 1 dnia roboczego.',
  robots: { index: false, follow: true },
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * `/dziekujemy?nr=PKS-…` — board `AU-dziekujemy` (ZMIANY-v24 §9.7): the cosmic layer, a check
 * mark drawing itself (reduced motion: drawn at once), the number pill, H1, three step cards and
 * the buttons with the line's phone last. Texts from `SoftwareSettings.thanks`, facts filled. No
 * CTA band; `noindex`.
 */
export default async function ThanksPage({ params, searchParams }: Props) {
  // The layout already guards; repeated here so the page never renders on its own.
  const tenant = await requireLine(params, 'software')
  const [thanks, context, settings, query] = await Promise.all([
    getSoftwareThanks(tenant.id),
    softwareTextContext(tenant.id),
    getSiteSettings(tenant.id),
    searchParams,
  ])
  if (!thanks) notFound()

  const fill = (value: string | undefined) => fillText(value, context)
  const number = inquiryNumberParam(query.nr)
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  // On production a text with a missing fact is `null`: the element goes, the page keeps an H1.
  const title = fill(thanks.title) ?? TITLE
  const accent = fill(thanks.titleAccent)
  const lead = fill(thanks.lead)
  const steps = thanks.steps.flatMap((step) => {
    const text = fill(step.text)
    return text ? [{ title: step.title, text }] : []
  })

  return (
    // `data-final-cta`: no CTA band after a sent inquiry (spec. §3.4, SWR2).
    <div data-final-cta>
      <section className="sw-sys sw-thx">
        <div className="hx-cos" aria-hidden="true">
          <div className="s1" />
          <div className="s2" />
        </div>
        <div className="v-wrap sw-sys-in">
          <div className="sw-okc" aria-hidden="true">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" />
              <path d="M24 41l11 11 21-23" />
            </svg>
          </div>
          {number ? (
            <p className="sw-eyebrow sw-sys-eb">
              {thanks.numberLabel}&nbsp;<span data-testid="inquiry-number">{number}</span>
            </p>
          ) : null}
          <h1 className="sw-h1-page">
            {title}
            {accent ? (
              <>
                {' '}
                <em className="sw-em-hero">{accent}</em>
              </>
            ) : null}
          </h1>
          {lead ? <p className="sw-sys-lead">{lead}</p> : null}
          {steps.length > 0 ? (
            <ol className="sw-thx-steps">
              {steps.map((step, index) => (
                <Glass as="li" key={`${index}-${step.title}`} featured={index === 0}>
                  <span className="sw-ln" aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                  <h2>{step.title}</h2>
                  <p>{step.text}</p>
                </Glass>
              ))}
            </ol>
          ) : null}
          <div className="sw-sys-actions">
            {thanks.actions.map((action, index) => (
              <Link
                key={`${index}-${action.href}`}
                href={action.href}
                className={index === 0 ? 'sw-sys-btn sw-sys-btn-main' : 'sw-sys-btn'}
              >
                {action.label}
              </Link>
            ))}
            {tel ? (
              <a href={tel} className="sw-sys-btn">
                {phone}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
