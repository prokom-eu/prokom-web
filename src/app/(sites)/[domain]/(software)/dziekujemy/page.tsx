import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { TextLink } from '@/components/ui/TextLink'
import { getEnv } from '@/lib/env'
import { getSiteSettings } from '@/lib/site/data'
import { splitBold } from '@/lib/site/emphasis'
import { toTelHref } from '@/lib/site/link'
import { getSoftwareFacts, getSoftwareThanks } from '@/lib/software/data'
import { fillText, type TextContext } from '@/lib/software/facts'
import { inquiryNumberParam } from '@/lib/software/pages'

import { requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TITLE = 'Dziękujemy'

// After a form: personal, nothing to index, not in the sitemap (spec. §2, §6.11).
export const metadata: Metadata = {
  title: TITLE,
  robots: { index: false, follow: true },
}

function Bold({ text }: { text: string }) {
  return splitBold(text).map((part, index) =>
    part.bold ? <strong key={index}>{part.text}</strong> : <span key={index}>{part.text}</span>,
  )
}

/**
 * `/dziekujemy?nr=PKS-…` — minimal version of SW2a (texts from `SoftwareSettings.thanks`, facts
 * filled, the number only in its own format). The look of the board `Dziekujemy` comes in SW11b.
 */
export default async function ThanksPage({ params, searchParams }: Props) {
  // The layout already guards; repeated here so the page never renders on its own.
  const tenant = await requireLine(params, 'software')
  const [thanks, facts, settings, query] = await Promise.all([
    getSoftwareThanks(tenant.id),
    getSoftwareFacts(tenant.id),
    getSiteSettings(tenant.id),
    searchParams,
  ])
  if (!thanks) notFound()

  const context: TextContext = {
    tenantId: tenant.id,
    facts,
    prices: {},
    strict: getEnv().SITE_ENV === 'production',
  }
  const fill = (value: string | undefined) => fillText(value, context)
  const number = inquiryNumberParam(query.nr)
  const steps = thanks.steps.map(fill).filter((step): step is string => Boolean(step))
  const tel = settings?.phone ? toTelHref(settings.phone) : null
  const hours = fill(thanks.hours)
  // On production a text with a missing fact is `null`: the element goes, the page keeps an H1.
  const title = fill(thanks.title) ?? TITLE
  const lead = fill(thanks.lead)
  const stepsTitle = fill(thanks.stepsTitle)
  const urgent = fill(thanks.urgent)

  return (
    <Section>
      <div className="max-w-2xl">
        <Heading level={1} size="xl">
          {title}
        </Heading>
        {lead && <p className="mt-4 text-lg text-ink-2">{lead}</p>}
        {number && (
          <p className="mt-6 font-semibold">
            {thanks.numberLabel}: <span data-testid="inquiry-number">{number}</span>
          </p>
        )}
        {stepsTitle && steps.length > 0 && (
          <>
            <Heading level={2} size="md" className="mt-10">
              {stepsTitle}
            </Heading>
            <ol className="mt-4 list-decimal space-y-2 pl-6">
              {steps.map((step, index) => (
                <li key={index}>
                  <Bold text={step} />
                </li>
              ))}
            </ol>
          </>
        )}
        {tel && urgent && settings?.phone && (
          <p className="mt-10">
            {urgent} <TextLink href={tel}>{settings.phone}</TextLink>
            {hours && <span className="text-ink-2"> · {hours}</span>}
          </p>
        )}
      </div>
    </Section>
  )
}
