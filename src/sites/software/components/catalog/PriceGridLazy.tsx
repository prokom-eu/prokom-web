'use client'

import dynamic from 'next/dynamic'

// ADR-023: the price grid of `/cennik` in its own client chunk (SSR stays on, no `loading`).
export const PriceGrid = dynamic(() => import('./PriceGrid').then((m) => m.PriceGrid))
