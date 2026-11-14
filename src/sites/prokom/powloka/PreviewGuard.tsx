'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** The preview of the shared elements (`/_wspolne`, local and staging only). */
const PREVIEW_PATH = '/_wspolne'

/**
 * Leaves out the hub's rail, search window, bottom bar and menu sheet on `/_wspolne`, which renders
 * one instance of each shared component itself (the same guard as `sites/instalacje`; a line's
 * sheet may not import another line's files, ADR-023).
 */
export function PreviewGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname === PREVIEW_PATH || pathname.startsWith(`${PREVIEW_PATH}/`)) return null
  return children
}
