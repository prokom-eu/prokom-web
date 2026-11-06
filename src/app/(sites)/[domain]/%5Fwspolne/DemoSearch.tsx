'use client'

import { useMemo } from 'react'

import { SearchDialog, type SearchDialogProps } from '@/components/shared/SearchDialog'
import {
  buildLineProvider,
  type LineSearchEntry,
  type LineSearchSettings,
} from '@/lib/shared/search/lineProvider'

type Props = Omit<SearchDialogProps, 'provider'> & {
  entries: LineSearchEntry[]
  settings: LineSearchSettings
}

/**
 * The shared search window on the preview page, over a test index made of the line's data (home
 * page sections and footer links). The real line indexes (solutions, services, FAQ…) come in D3.
 */
export function DemoSearch({ entries, settings, ...props }: Props) {
  const provider = useMemo(() => buildLineProvider(entries, settings), [entries, settings])
  return <SearchDialog provider={provider} {...props} />
}
