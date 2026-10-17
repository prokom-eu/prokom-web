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
  return (
    <html
      lang="pl"
      data-line={host ? await lineFor(host) : undefined}
      className={`${archivo.variable} ${manrope.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}

/**
 * Line of the tenant, or `undefined` when the lookup fails (e.g. database down). The root
 * layout must not throw: an error here would bypass every error and not-found page below it.
 * The `[domain]` layout runs the same lookup and surfaces the failure there.
 */
async function lineFor(host: string) {
  try {
    return (await getTenantByHost(host))?.line
  } catch {
    return undefined
  }
}
