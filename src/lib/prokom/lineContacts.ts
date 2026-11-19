import { cache } from 'react'

import { getLineTenantRows } from '../posts/data'
import { getSharedData } from '../shared/getSharedData'
import type { SharedLine, SharedLineData } from '../shared/project'
import { HUB_LINES, type HubLine } from './lines'
import { getHubSettings } from './data'
import { hubPhone } from './phone'
import { techPoints, type TechPoint } from './techPoints'

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
  /** Phones of the line's points (Tech: Rabka, Zakopane, infoline — runda 1811 D5); none = `[]`. */
  points?: TechPoint[]
}

const isTenantLine = (value: unknown): value is TenantLine =>
  (TENANT_LINES as readonly unknown[]).includes(value)

export { hubPhone } from './phone'

type LineFields = Pick<SharedLineData, 'phone' | 'email' | 'hours' | 'responsePromise'>

/**
 * Contact of the five hub lines (spec §6.1 pkt 11, ADR-H001): for Biznes, Instalacje and Software
 * the line's own `SiteSettings` wins (that is what its site shows), `CompanyData.lines` fills the
 * gaps and is the only source for Tech and Gaming. (The e-mail of a line site never comes from
 * `CompanyData.lines`: `getSharedData` already falls back to the company e-mail.) Order of the hub, unpublished lines left out.
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
        phone: hubPhone(site?.phone || line.phone),
        email: site?.email || line.email,
        hours: site?.hours || line.hours,
        promise: site?.responsePromise || line.promise,
      },
    ]
  })
}

/**
 * Line contacts for the hub of `hubTenantId`. Reads only public contact fields of the other
 * tenants (through the cached `getSharedData`), never their content.
 */
export const getHubLineContacts = cache(async (hubTenantId: number): Promise<HubLineContact[]> => {
  const [hub, tenants] = await Promise.all([
    getSharedData(hubTenantId),
    getLineTenantRows(TENANT_LINES),
  ])
  if (!hub) return []
  const own: Partial<Record<TenantLine, LineFields | null>> = {}
  // Two active tenants of one line (a mistake in the panel): the older one (lower id) wins.
  const first = [...tenants]
    .sort((a, b) => a.id - b.id)
    .filter((tenant, index, all) => all.findIndex((t) => t.line === tenant.line) === index)
  await Promise.all(
    first.map(async (tenant) => {
      if (!isTenantLine(tenant.line)) return
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
  const contacts = toHubLineContacts(hub.lines, own)
  // Tech's points (runda 1811 D5) from the hub's settings; the infoline is Tech's own number.
  const settings = await getHubSettings(hubTenantId)
  return contacts.map((contact) =>
    contact.key === 'tech' ? { ...contact, points: techPoints(settings, contact.phone) } : contact,
  )
})
