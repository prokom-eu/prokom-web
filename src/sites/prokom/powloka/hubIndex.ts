import type { HubSearchEntry } from '@/lib/prokom/searchIndex'

const INDEX_URL = '/api/hub-search-index'

export type HubIndex = { entries: HubSearchEntry[]; ok: boolean }

/** One fetch per page load, shared by the search window and the hero's search. */
let indexRequest: Promise<HubIndex> | null = null

export function loadHubIndex(): Promise<HubIndex> {
  indexRequest ??= fetch(INDEX_URL)
    .then(async (response) => {
      // A passing error (503) is not kept: the next request to search tries again.
      if (!response.ok) throw new Error(`index ${response.status}`)
      return { entries: (await response.json()) as HubSearchEntry[], ok: true }
    })
    .catch(() => {
      indexRequest = null
      return { entries: [], ok: false }
    })
  return indexRequest
}
