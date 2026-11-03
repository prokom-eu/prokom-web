'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const ContactHero = dynamic(() => import('./ContactHero').then((m) => m.ContactHero))
