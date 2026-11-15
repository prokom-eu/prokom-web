import type { Metadata } from 'next'

import { getEnv } from '@/lib/env'
import { getHubSettings } from '@/lib/prokom/data'
import { isHubLine } from '@/lib/prokom/lines'
import { getHubSearchIndex } from '@/lib/prokom/searchData'
import { parseFilter, searchHub } from '@/lib/prokom/searchIndex'
import { pageRobots } from '@/lib/seo/robots'
import { getSharedData } from '@/lib/shared/getSharedData'
import type { HubLine } from '@/lib/prokom/lines'
import type { SharedLine } from '@/lib/shared/project'
import { SearchPage } from '@/sites/prokom/szukaj/SearchPage'

import { requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<{ q?: string | string[]; linia?: string | string[] }>
}

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? ''

/**
 * Spec §4: „Szukaj w PRO-KOM”, never indexed (results of any phrase are not pages). The line is
 * checked here too: metadata is resolved apart from the layout, and the hub's title must not reach
 * the 404 of a line's domain.
 */
export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  await requireLine(params, 'prokom')
  return {
    title: { absolute: 'Szukaj w PRO-KOM' },
    robots: pageRobots(getEnv().SITE_ENV, false),
  }
}

/** `/szukaj?q=&linia=` of pro-kom.eu (spec §5.6): results on the server, the shared engine. */
export default async function HubSearchRoute({ params, searchParams }: Props) {
  const tenant = await requireLine(params, 'prokom')
  const [shared, settings, index, query] = await Promise.all([
    getSharedData(tenant.id),
    getHubSettings(tenant.id),
    getHubSearchIndex(tenant.id),
    searchParams,
  ])
  // A phrase of reasonable length only: the field is for words, not for pasted text.
  const q = first(query.q).trim().slice(0, 120)
  const filter = parseFilter(first(query.linia))
  const rail = shared?.line.rail
  const lines = (shared?.lines ?? []).filter((line): line is SharedLine & { key: HubLine } =>
    isHubLine(line.key),
  )
  return (
    <SearchPage
      result={q ? searchHub(index, q, filter, rail?.synonyms ?? []) : null}
      filter={filter}
      lines={lines}
      popular={rail?.searchPopular ?? []}
      shortcuts={(rail?.searchShortcuts ?? []).map((link) => ({
        label: link.label,
        href: link.href,
      }))}
      phone={shared?.line.phone ?? null}
      hours={shared?.line.hours ?? null}
      flags={settings.pages}
    />
  )
}
