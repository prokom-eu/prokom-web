'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { SearchDialog, type SearchDialogProps } from '@/components/shared/SearchDialog'
import {
  buildLineProvider,
  type LineSearchEntry,
  type LineSearchSettings,
} from '@/lib/shared/search/lineProvider'
import type { SearchResult } from '@/lib/shared/search/provider'

type Props = Omit<SearchDialogProps, 'provider'> & {
  entries: LineSearchEntry[]
  settings: LineSearchSettings
}

/** The preview slot (`renderPreview`) as a line fills it: here the title, the hint and a link. */
function DemoPreview({ result }: { result: SearchResult }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase">Podgląd</p>
      <p className="font-display text-lg font-extrabold">{result.title}</p>
      {result.hint && <p className="text-sm text-ink-2">{result.hint}</p>}
      <Link href={result.href} className="sdlg__cta self-start">
        Otwórz
      </Link>
    </div>
  )
}

/**
 * The shared search window on the preview page, over a test index made of the line's data (home
 * page sections and footer links), with the preview slot. The real line indexes come in D3.
 */
export function DemoSearch({ entries, settings, ...props }: Props) {
  const provider = useMemo(() => buildLineProvider(entries, settings), [entries, settings])
  return (
    <SearchDialog
      provider={provider}
      renderPreview={(result) => <DemoPreview result={result} />}
      {...props}
    />
  )
}
