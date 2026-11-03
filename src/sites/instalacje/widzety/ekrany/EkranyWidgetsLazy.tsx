'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). No `loading`:
// with it next/dynamic adds a Suspense boundary and the page below streams in hidden segments,
// revealed by a script later (sections missing without JS and right after load).
export const BrightnessPicker = dynamic(() =>
  import('./EkranyWidgets').then((m) => m.BrightnessPicker),
)
export const PixelPitch = dynamic(() => import('./EkranyWidgets').then((m) => m.PixelPitch))
export const ScreenPreview = dynamic(() => import('./EkranyWidgets').then((m) => m.ScreenPreview))
export const TwoSalons = dynamic(() => import('./EkranyWidgets').then((m) => m.TwoSalons))
