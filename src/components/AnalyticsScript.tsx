import Script from 'next/script'

import { umamiScriptAttributes, umamiWebsiteId } from '@/lib/analytics/config'
import { getEnv } from '@/lib/env'
import type { Line } from '@/lib/tenant/lines'

/**
 * The Umami script of a line (ADR-020), loaded from the site's own domain and sending there too
 * (`/_s`, forwarded by `proxy.ts`). Nothing is rendered when the line is not counted. Page views,
 * including `/dziekujemy` (the conversion), are counted by the script itself.
 */
export function AnalyticsScript({ line }: { line: Line }) {
  const websiteId = umamiWebsiteId(getEnv(), line)
  if (!websiteId) return null
  return <Script strategy="afterInteractive" {...umamiScriptAttributes(websiteId)} />
}
