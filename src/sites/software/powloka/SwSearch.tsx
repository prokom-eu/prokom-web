'use client'

import { useEffect, useMemo, useState } from 'react'

import { SearchDialog, type SearchDialogProps } from '@/components/shared/SearchDialog'
import { softwareSearchProvider, type SearchPage } from '@/lib/software/searchEntries'
import type { SearchExtras } from '@/lib/software/searchExtras'
import type { SolutionsIndex } from '@/lib/software/solutionsIndex'

import { SearchPreview } from './SearchPreview'

export type SwSearchProps = Omit<SearchDialogProps, 'provider' | 'renderPreview'> & {
  pages: readonly SearchPage[]
  shortcuts: readonly { label: string; href: string }[]
}

/** One fetch per page load and address (the window stays mounted once opened). */
const requests = new Map<string, Promise<unknown>>()
function loadJson<T>(url: string): Promise<T | null> {
  let request = requests.get(url) as Promise<T | null> | undefined
  if (!request) {
    request = fetch(url)
      .then((response) => {
        // A passing error (503) is not kept: the next opening tries again.
        if (!response.ok) throw new Error(`${url} ${response.status}`)
        return response.json() as Promise<T>
      })
      .catch(() => {
        requests.delete(url)
        return null
      })
    requests.set(url, request)
  }
  return request
}

/**
 * The search window of Software with everything it needs (`LazySearch` loads this module at the
 * first request to search, so none of it is in a page's first JS — the start page's budget,
 * `software-wydajnosc`): the offer (`/api/solutions-index`) and the posts, industry and city
 * pages (`/api/software-search`) fetched when it mounts, the Software provider („Na skróty” with
 * the offer groups, results with prices) and the preview of the active result beside the list.
 * Until the data comes, the window shows the pages and the panel's shortcuts.
 */
export function SwSearch({ pages, shortcuts, ...dialog }: SwSearchProps) {
  const [index, setIndex] = useState<SolutionsIndex | null>(null)
  const [extras, setExtras] = useState<SearchExtras | null>(null)

  useEffect(() => {
    let alive = true
    void loadJson<SolutionsIndex>('/api/solutions-index').then(
      (loaded) => alive && loaded && setIndex(loaded),
    )
    void loadJson<SearchExtras>('/api/software-search').then(
      (loaded) => alive && loaded && setExtras(loaded),
    )
    return () => {
      alive = false
    }
  }, [])

  const provider = useMemo(
    () => softwareSearchProvider(index, extras, pages, shortcuts),
    [index, extras, pages, shortcuts],
  )

  return (
    <SearchDialog
      {...dialog}
      provider={provider}
      renderPreview={(result) => <SearchPreview result={result} index={index} extras={extras} />}
    />
  )
}
