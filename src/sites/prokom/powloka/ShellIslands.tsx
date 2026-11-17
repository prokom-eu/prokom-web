'use client'

import dynamic from 'next/dynamic'

// ADR-023, like `home/HomeIslands`: the hub's header and side rail are own chunks, loaded only on
// pro-kom.eu — not in the shared `[domain]` layout entry every line downloads (the Software JS
// budget, 17.11). SSR stays on; no `loading` (it would add a Suspense boundary).
export const ProkomHeader = dynamic(() => import('./ProkomHeader').then((m) => m.ProkomHeader))
export const ProkomRail = dynamic(() => import('./ProkomRail').then((m) => m.ProkomRail))
