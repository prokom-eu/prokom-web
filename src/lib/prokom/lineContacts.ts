import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { cacheQuery } from '../cache'
import { PAGE_CACHE_SECONDS } from '../pages/data'
import type { SisterDomain } from '../posts/sister'
import { getSharedData } from '../shared/getSharedData'
import type { SharedLine, SharedLineData } from '../shared/project'
import { HUB_LINES, type HubLine } from './lines'

/** Lines with a site (tenant) of their own; Tech and Gaming live in `CompanyData.lines` only. */
export const TENANT_LINES = [
  'biznes',
  'instalacje',
  'software',
] as const satisfies readonly HubLine[]
export type TenantLine = (typeof TENANT_LINES)[number]

export type HubLineContact = {
  key: HubLine
  name: string
  domain: string | null
  url: string | null
  phone: string | null
  email: string | null
  hours: string | null
  /** The line's promise of spec §3, as written in the panel (never in the hub's code). */
  promise: string | null
}

type LineFields = Pick<SharedLineData, 'phone' | 'email' | 'hours' | 'responsePromise'>

/**
 * Contact of the five hub lines (spec §6.1 pkt 11, ADR-H001): for Biznes, Instalacje and Software
 * the line's own `SiteSettings` wins (that is what its site shows), `CompanyData.lines` fills the
 * gaps and is the only source for Tech and Gaming. Order of the hub, unpublished lines left out.
 */
export function toHubLineContacts(
  lines: readonly SharedLine[],
  own: Partial<Record<TenantLine, LineFields | null>>,
): HubLineContact[] {
  return HUB_LINES.flatMap((key) => {
    const line = lines.find((entry) => entry.key === key)
    if (!line) return []
    const site = (TENANT_LINES as readonly string[]).includes(key) ? own[key as TenantLine] : null
    return [
      {
        key,
        name: line.name,
        domain: line.domain,
        url: line.url,
        phone: site?.phone || line.phone,
        email: site?.email || line.email,
        hours: site?.hours || line.hours,
        promise: site?.responsePromise || line.promise,
      },
    ]
  })
}

export type LineTenantRow = { id: number; line: TenantLine; domains: SisterDomain[] }

/** Active tenants of Biznes, Instalacje and Software (they change with a new site only). */
export const getLineTenantRows = (): Promise<LineTenantRow[]> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'tenants',
        where: { and: [{ line: { in: [...TENANT_LINES] } }, { active: { equals: true } }] },
        limit: 10,
        depth: 0,
        select: { line: true, domains: true },
        overrideAccess: true,
      })
      return docs.flatMap(({ id, line, domains }) =>
        (TENANT_LINES as readonly string[]).includes(line ?? '')
          ? [{ id, line: line as TenantLine, domains: domains ?? [] }]
          : [],
      )
    },
    ['hub-line-tenants'],
    { revalidate: PAGE_CACHE_SECONDS },
  )()

/**
 * Line contacts for the hub of `hubTenantId`. Reads only public contact fields of the other
 * tenants (through the cached `getSharedData`), never their content.
 */
export const getHubLineContacts = cache(async (hubTenantId: number): Promise<HubLineContact[]> => {
  const [hub, tenants] = await Promise.all([getSharedData(hubTenantId), getLineTenantRows()])
  if (!hub) return []
  const own: Partial<Record<TenantLine, LineFields | null>> = {}
  await Promise.all(
    tenants.map(async (tenant) => {
      const line = (await getSharedData(tenant.id))?.line
      own[tenant.line] = line
        ? {
            phone: line.phone,
            email: line.email,
            hours: line.hours,
            responsePromise: line.responsePromise,
          }
        : null
    }),
  )
  return toHubLineContacts(hub.lines, own)
})
