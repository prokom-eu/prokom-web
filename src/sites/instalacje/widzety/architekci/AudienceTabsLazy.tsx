'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const AudienceTabs = dynamic(() => import('./AudienceTabs').then((m) => m.AudienceTabs))
