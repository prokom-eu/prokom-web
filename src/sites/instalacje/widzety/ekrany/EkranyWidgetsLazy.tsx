'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const BrightnessPicker = dynamic(() =>
  import('./EkranyWidgets').then((m) => m.BrightnessPicker),
)
export const PixelPitch = dynamic(() => import('./EkranyWidgets').then((m) => m.PixelPitch))
export const ScreenPreview = dynamic(() => import('./EkranyWidgets').then((m) => m.ScreenPreview))
export const TwoSalons = dynamic(() => import('./EkranyWidgets').then((m) => m.TwoSalons))
