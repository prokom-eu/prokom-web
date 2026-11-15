import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ContactPage } from '@/components/shared/ContactPage'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getSharedData } from '@/lib/shared/getSharedData'

import { requestOrigin, requireTenant } from '../../tenant'
import { SlotFrame } from '../SlotFrame'

type Props = { params: Promise<{ domain: string }> }

export const metadata: Metadata = {
  title: 'Szablon Kontakt — podgląd',
  robots: { index: false, follow: false },
}

/**
 * `/_wspolne/kontakt` — the shared Kontakt template (spec §6.1) on this line's data, every slot
 * (§6.0) shown as a frame with its name. Local and staging only (404 on production), `noindex`.
 * The line's real `/kontakt` changes in D3.
 */
export default async function ContactTemplatePreview({ params }: Props) {
  const tenant = await requireTenant(params)
  const env = getEnv()
  if (env.SITE_ENV === 'production') notFound()
  const [shared, origin] = await Promise.all([getSharedData(tenant.id), requestOrigin()])
  if (!shared) notFound()
  return (
    <ContactPage
      shared={shared}
      line={tenant.line}
      origin={origin}
      now={new Date().toISOString()}
      formToken={issueFormToken(env.PAYLOAD_SECRET)}
      breadcrumbs={[
        { name: 'Strona główna', path: '/' },
        { name: 'Elementy wspólne', path: '/_wspolne' },
        { name: 'Kontakt', path: '/_wspolne/kontakt' },
      ]}
      slots={{
        heroAside: <SlotFrame name="heroAside" dark />,
        afterRoutes: <SlotFrame name="afterRoutes" />,
        formPrefill: <SlotFrame name="formPrefill" dark={false} />,
        afterForm: <SlotFrame name="afterForm" />,
        beforeFaq: <SlotFrame name="beforeFaq" />,
      }}
    />
  )
}
