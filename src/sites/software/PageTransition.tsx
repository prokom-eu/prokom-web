/// <reference types="react/canary" />
// `ViewTransition` ships in the React of Next.js (19.3 canary); its types live in `react/canary`.
import { type ReactNode, ViewTransition } from 'react'

/**
 * Page content of Software cross-fades on a navigation (SWV5, ZMIANY-v23 §5; Next.js guide
 * „View transitions”: route changes are transitions, no config flag). `default="sw-page"` gives
 * the content the class its animation is written for (`::view-transition-*(.sw-page)`). Header and bottom bar have
 * their own `view-transition-name` (globals.css), so they stay still. Without browser support or
 * with reduced motion the page simply swaps. The same as Instalacje's `PageTransition`, kept
 * apart so the two lines do not share a file.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <ViewTransition default="sw-page">{children}</ViewTransition>
}
