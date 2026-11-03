'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const ApartFamilies = dynamic(() =>
  import('./NaglosnienieWidgets').then((m) => m.ApartFamilies),
)
export const ChurchDemo = dynamic(() => import('./NaglosnienieWidgets').then((m) => m.ChurchDemo))
export const SignalChain = dynamic(() => import('./NaglosnienieWidgets').then((m) => m.SignalChain))
export const SpeakerCalc = dynamic(() => import('./NaglosnienieWidgets').then((m) => m.SpeakerCalc))
export const ZoneMixer = dynamic(() => import('./NaglosnienieWidgets').then((m) => m.ZoneMixer))
