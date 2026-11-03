'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const ChargerCards = dynamic(() => import('./LadowarkiWidgets').then((m) => m.ChargerCards))
export const ChargerConfigurator = dynamic(() =>
  import('./LadowarkiWidgets').then((m) => m.ChargerConfigurator),
)
export const ChargerShowcase = dynamic(() =>
  import('./LadowarkiWidgets').then((m) => m.ChargerShowcase),
)
export const ChargingCalc = dynamic(() => import('./LadowarkiWidgets').then((m) => m.ChargingCalc))
