import { headers } from 'next/headers'
import React from 'react'

import { getTenantByHost } from '@/lib/tenant/byHost'
import { normalizeHost } from '@/lib/tenant/host'

import { archivo, manrope } from './fonts'
import './globals.css'

/**
 * Root shell for all public sites; the tenant is resolved one level down, in `[domain]`.
 * The line colour still has to be set here, on `<html>` (ADR-007): the same cached lookup by
 * `Host` gives the tenant's line. Unknown host → no attribute → the main PRO-KOM colour.
 */
export default async function SitesRootLayout({ children }: { children: React.ReactNode }) {
  const host = normalizeHost((await headers()).get('host'))
  const tenant = host ? await getTenantByHost(host) : null
  return (
    <html lang="pl" data-line={tenant?.line} className={`${archivo.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  )
}
