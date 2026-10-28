/// <reference types="react/canary" />
// `ViewTransition` ships in the React of Next.js (19.3 canary); its types live in `react/canary`.
import { type ReactNode, ViewTransition } from 'react'

/**
 * Page content cross-fades on a navigation (MOBILE-APLIKACJA §5; Next.js guide „View
 * transitions”: route changes are transitions, no config). The header and the bottom bar have
 * their own `view-transition-name` (instalacje.css), so they stay still. 180 ms in CSS; without
 * browser support or with reduced motion the page simply swaps.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <ViewTransition>{children}</ViewTransition>
}
