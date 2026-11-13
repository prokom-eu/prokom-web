'use client'

import dynamic from 'next/dynamic'

// ADR-023: the offer window in its own client chunk (catalog, price page, industry pages).
const load = () => import('./SolutionDialog')

export const SolutionDialog = dynamic(() => load().then((m) => m.SolutionDialog))

/**
 * Fetches the window's chunk on intent (a pointer over a card, its focus), so a click only
 * renders it: the panel is in within 300 ms of the click (SWA14 §2). Once is enough.
 */
export function preloadSolutionDialog(): void {
  void load()
}
