'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
const LAZY = { loading: () => null }
export const BrightnessPicker = dynamic(
  () => import('./EkranyWidgets').then((m) => m.BrightnessPicker),
  LAZY,
)
export const PixelPitch = dynamic(() => import('./EkranyWidgets').then((m) => m.PixelPitch), LAZY)
export const ScreenPreview = dynamic(
  () => import('./EkranyWidgets').then((m) => m.ScreenPreview),
  LAZY,
)
export const TwoSalons = dynamic(() => import('./EkranyWidgets').then((m) => m.TwoSalons), LAZY)
