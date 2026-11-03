'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
export const ApartFamilies = dynamic(
  () => import('./NaglosnienieWidgets').then((m) => m.ApartFamilies),
  { loading: () => null },
)
export const ChurchDemo = dynamic(() => import('./NaglosnienieWidgets').then((m) => m.ChurchDemo), {
  loading: () => null,
})
export const SignalChain = dynamic(
  () => import('./NaglosnienieWidgets').then((m) => m.SignalChain),
  { loading: () => null },
)
export const SpeakerCalc = dynamic(
  () => import('./NaglosnienieWidgets').then((m) => m.SpeakerCalc),
  { loading: () => null },
)
export const ZoneMixer = dynamic(() => import('./NaglosnienieWidgets').then((m) => m.ZoneMixer), {
  loading: () => null,
})
