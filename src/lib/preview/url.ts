import type { LivePreviewConfig } from 'payload'

import { getEnv } from '../env'
import { tenantIdOf } from '../tenant/id'
import { environmentFor, hostForEnvironment, origin, portOf, protocolOf } from './origin'
import { createPreviewToken } from './token'

type PreviewUrl = NonNullable<Exclude<LivePreviewConfig['url'], string | null>>

/**
 * Live preview address of a page, computed in the panel: the page's own tenant domain
 * (never another line's) + `/podglad/<id>` + a signed token. No URL until the page is saved
 * (autosave does that within a second) or when the tenant has no domain for this environment.
 */
export const pagePreviewUrl: PreviewUrl = async ({ data, req }) => {
  const pageId = typeof data.id === 'number' ? data.id : null
  const tenantId = tenantIdOf(data.tenant)
  if (pageId === null || tenantId === null) return null

  const tenant = await req.payload
    .findByID({ collection: 'tenants', id: tenantId, depth: 0, overrideAccess: true, req })
    .catch(() => null)
  const host = hostForEnvironment(tenant?.domains, environmentFor(process.env.NODE_ENV))
  if (!host) return null

  const protocol = protocolOf(req.headers.get('x-forwarded-proto'), req.protocol ?? '')
  const token = createPreviewToken({ pageId, tenantId, secret: getEnv().PAYLOAD_SECRET })
  return `${origin(protocol, host, portOf(req.headers.get('host')))}/podglad/${pageId}?token=${token}`
}
