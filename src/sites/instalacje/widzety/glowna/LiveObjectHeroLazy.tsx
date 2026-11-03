'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const LiveObjectHero = dynamic(() =>
  import('./LiveObjectHero').then((m) => m.LiveObjectHero),
)
