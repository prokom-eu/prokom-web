'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
const LAZY = { loading: () => null }
export const ChargerCards = dynamic(
  () => import('./LadowarkiWidgets').then((m) => m.ChargerCards),
  LAZY,
)
export const ChargerConfigurator = dynamic(
  () => import('./LadowarkiWidgets').then((m) => m.ChargerConfigurator),
  LAZY,
)
export const ChargerShowcase = dynamic(
  () => import('./LadowarkiWidgets').then((m) => m.ChargerShowcase),
  LAZY,
)
export const ChargingCalc = dynamic(
  () => import('./LadowarkiWidgets').then((m) => m.ChargingCalc),
  LAZY,
)
