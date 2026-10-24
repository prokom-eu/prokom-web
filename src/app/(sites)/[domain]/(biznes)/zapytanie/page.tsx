import type { Metadata } from 'next'
import { connection } from 'next/server'

import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import { Breadcrumbs } from '@/sites/biznes/components/Breadcrumbs'
import { InquiryPage } from '@/sites/biznes/components/inquiry/InquiryPage'

import { requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// The list is personal and lives in the browser: nothing to index.
export const metadata: Metadata = {
  title: 'Twoje zapytanie',
  robots: { index: false, follow: true },
}

// The server limit of a topic (`lib/inquiry/schema`): a longer phrase is cut, not rejected.
const MAX_PHRASE = 100

/**
 * Inquiry list `/zapytanie` (spec. §6.3): the token, the phrase of „Zapytaj o X” and the
 * contact data on the server; the list (`pk-cart`) and the form are one client island.
 */
export default async function InquiryListPage({ params, searchParams }: Props) {
  // The layout already guards; repeated here so the page never renders on its own.
  const tenant = await requireLine(params, 'biznes')
  // The token carries the render time (minimum fill time): never from a cache.
  await connection()
  const [settings, company, query] = await Promise.all([
    getSiteSettings(tenant.id),
    getCompanyData(),
    searchParams,
  ])
  const raw = query.fraza
  const phrase = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, MAX_PHRASE) || null
  const tel = settings?.phone ? toTelHref(settings.phone) : null
  const hours = hoursSummary(company?.locations[0]?.hours ?? [])

  return (
    <InquiryPage
      breadcrumbs={
        <Breadcrumbs
          items={[
            { name: 'Strona główna', href: '/' },
            { name: 'Oferta', href: '/oferta' },
            { name: 'Twoje zapytanie', href: '/zapytanie' },
          ]}
        />
      }
      formToken={issueFormToken(getEnv().PAYLOAD_SECRET)}
      phrase={phrase}
      callbackTime={settings?.biznes?.promises.callbackTime ?? null}
      hours={hours || null}
      phone={settings?.phone && tel ? { label: settings.phone, href: tel } : null}
    />
  )
}
