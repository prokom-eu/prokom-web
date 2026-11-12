'use client'

import dynamic from 'next/dynamic'

/**
 * The mock-up for client components (AUDYT-WYDAJNOSC-1111 #6): imported statically, every client
 * component of the start page (wizard, situations, showroom, bento, price cards) carried its own
 * copy of the mock-ups in its chunk — five copies of ~37 KB. Through `next/dynamic` they share one
 * chunk. SSR stays on, so the HTML is the same; no `loading` (see `WizardLazy`).
 */
export const Mockup = dynamic(() => import('./Mockup').then((m) => m.Mockup))
