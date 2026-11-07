import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AboutPage } from '@/components/shared/AboutPage'
import { getEnv } from '@/lib/env'
import { getSharedData } from '@/lib/shared/getSharedData'

import { requestOrigin, requireTenant } from '../../tenant'
import { SlotFrame } from '../SlotFrame'

type Props = { params: Promise<{ domain: string }> }

export const metadata: Metadata = {
  title: 'Szablon O firmie — podgląd',
  robots: { index: false, follow: false },
}

/**
 * `/_wspolne/o-firmie` — the shared O firmie template (spec §6.2) on this line's data, every slot
 * (§6.0) shown as a frame with its name. Local and staging only (404 on production), `noindex`.
 * The line's real `/o-firmie` changes in D3.
 */
export default async function AboutTemplatePreview({ params }: Props) {
  const tenant = await requireTenant(params)
  const env = getEnv()
  if (env.SITE_ENV === 'production') notFound()
  const [shared, origin] = await Promise.all([getSharedData(tenant.id), requestOrigin()])
  if (!shared) notFound()
  return (
    <AboutPage
      shared={shared}
      line={tenant.line}
      origin={origin}
      siteEnv={env.SITE_ENV}
      breadcrumbs={[
        { name: 'Strona główna', path: '/' },
        { name: 'Elementy wspólne', path: '/_wspolne' },
        { name: 'O firmie', path: '/_wspolne/o-firmie' },
      ]}
      slots={{
        afterStats: <SlotFrame name="afterStats" />,
        afterRules: <SlotFrame name="afterRules" />,
        afterSteps: <SlotFrame name="afterSteps" />,
        beforeVisit: <SlotFrame name="beforeVisit" />,
      }}
    />
  )
}
