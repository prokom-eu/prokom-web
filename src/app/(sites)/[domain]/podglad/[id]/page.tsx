import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { LivePreviewRefresh } from '@/components/LivePreviewRefresh'
import { RenderBlocks } from '@/components/RenderBlocks'
import { getEnv } from '@/lib/env'
import { getDraftPage } from '@/lib/pages/data'
import { origin, portOf, protocolOf } from '@/lib/preview/origin'
import { verifyPreviewToken } from '@/lib/preview/token'

import { requireTenant } from '../../tenant'

type Props = {
  params: Promise<{ domain: string; id: string }>
  searchParams: Promise<{ token?: string | string[] }>
}

export const metadata: Metadata = {
  title: 'Podgląd',
  robots: { index: false, follow: false },
  // The token is in the URL; never send it on in a Referer.
  referrer: 'no-referrer',
}

/**
 * Live preview of a page draft inside the panel's iframe. Access only with a valid token
 * for this page and the tenant of this domain (`lib/preview/token`); anything else → 404.
 * Rendered per request, never cached.
 */
export default async function PreviewPage({ params, searchParams }: Props) {
  const tenant = await requireTenant(params)
  const [{ id }, { token }] = await Promise.all([params, searchParams])
  const pageId = /^\d{1,10}$/.test(id) ? Number(id) : null
  const { PAYLOAD_SECRET, PANEL_HOST } = getEnv()
  if (
    pageId === null ||
    typeof token !== 'string' ||
    !verifyPreviewToken(token, { pageId, tenantId: tenant.id, secret: PAYLOAD_SECRET })
  ) {
    notFound()
  }

  const page = await getDraftPage(pageId, tenant.id)
  if (!page) notFound()

  // Panel and sites run on one server: same protocol and port, the panel's host.
  const requestHeaders = await headers()
  const fallback = process.env.NODE_ENV === 'production' ? 'https:' : 'http:'
  const protocol = protocolOf(requestHeaders.get('x-forwarded-proto'), fallback)

  return (
    <>
      <LivePreviewRefresh
        panelOrigin={origin(protocol, PANEL_HOST, portOf(requestHeaders.get('host')))}
      />
      <RenderBlocks page={page} tenant={tenant} />
    </>
  )
}
