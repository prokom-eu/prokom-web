'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** The preview of the shared elements (`/_wspolne`, local and staging only). */
const PREVIEW_PATH = '/_wspolne'

/**
 * Leaves out the frame's own rail, search window, bottom bar and menu sheet on `/_wspolne`: that
 * page renders one instance of each shared component itself (unique dialogs and landmarks for its
 * e2e and axe), so a second copy from the line's frame would answer Ctrl K, open a second „Menu”
 * sheet and lie over the preview's rail. Every other page gets the children unchanged.
 */
export function PreviewGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname === PREVIEW_PATH || pathname.startsWith(`${PREVIEW_PATH}/`)) return null
  return children
}
