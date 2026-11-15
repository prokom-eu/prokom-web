'use client'

import dynamic from 'next/dynamic'

// ADR-023: own Suspense boundary (`loading`) — the rest of the page hydrates without waiting.

/**
 * NvrDemo loaded as its own client chunk (ADR-023, option A). SSR stays on, so the
 * HTML is unchanged; the widget code is fetched only on pages that render it,
 * instead of sitting in the route entry shared by every line.
 */
export const NvrDemoLazy = dynamic(() => import('./NvrDemo').then((m) => m.NvrDemo))
