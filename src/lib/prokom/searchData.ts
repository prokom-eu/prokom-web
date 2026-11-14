import { getSharedData } from '@/lib/shared/getSharedData'

import { getHubData, getHubSettings } from './data'
import { buildHubSearchIndex, type HubSearchEntry } from './searchIndex'

/**
 * The hub's search index of one tenant (ADR-H002 §4): lines of `CompanyData`, content of the
 * `hub-*` collections and the pages switched on in `HubSettings` — all filtered by the tenant in
 * their loaders (`getHubData`, `getHubSettings`, `getSharedData`).
 */
export async function getHubSearchIndex(tenantId: number): Promise<HubSearchEntry[]> {
  const [shared, hub, settings] = await Promise.all([
    getSharedData(tenantId),
    getHubData(tenantId),
    getHubSettings(tenantId),
  ])
  return buildHubSearchIndex({
    lines: shared?.lines ?? [],
    services: hub.services,
    tools: hub.tools,
    help: hub.help,
    flags: settings.pages,
  })
}
