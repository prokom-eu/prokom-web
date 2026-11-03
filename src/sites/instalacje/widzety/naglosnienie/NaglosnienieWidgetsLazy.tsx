'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). No `loading`:
// with it next/dynamic adds a Suspense boundary and the page below streams in hidden segments,
// revealed by a script later (sections missing without JS and right after load).
export const ApartFamilies = dynamic(() =>
  import('./NaglosnienieWidgets').then((m) => m.ApartFamilies),
)
export const ChurchDemo = dynamic(() => import('./NaglosnienieWidgets').then((m) => m.ChurchDemo))
export const SignalChain = dynamic(() => import('./NaglosnienieWidgets').then((m) => m.SignalChain))
export const SpeakerCalc = dynamic(() => import('./NaglosnienieWidgets').then((m) => m.SpeakerCalc))
export const ZoneMixer = dynamic(() => import('./NaglosnienieWidgets').then((m) => m.ZoneMixer))
