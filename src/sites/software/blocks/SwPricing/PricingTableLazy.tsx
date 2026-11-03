'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const PricingTable = dynamic(() => import('./PricingTable').then((m) => m.PricingTable))
