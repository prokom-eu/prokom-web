'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const OfferBar = dynamic(() => import('./OfferWidgets').then((m) => m.OfferBar))
export const OfferList = dynamic(() => import('./OfferWidgets').then((m) => m.OfferList))
