'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). No `loading`
// (see `ContactFormLazy`): the server HTML with the reserved boxes stays in place.
export const KsefCountdown = dynamic(() => import('./KsefCountdown').then((m) => m.KsefCountdown))
