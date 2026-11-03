'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
export const CableLab = dynamic(() => import('./SieciWidgets').then((m) => m.CableLab), {
  loading: () => null,
})
export const CoverageMap = dynamic(() => import('./SieciWidgets').then((m) => m.CoverageMap), {
  loading: () => null,
})
export const FailoverLab = dynamic(() => import('./SieciWidgets').then((m) => m.FailoverLab), {
  loading: () => null,
})
export const LinkLab = dynamic(() => import('./SieciWidgets').then((m) => m.LinkLab), {
  loading: () => null,
})
export const PortalCode = dynamic(() => import('./SieciWidgets').then((m) => m.PortalCode), {
  loading: () => null,
})
export const VlanButtons = dynamic(() => import('./SieciWidgets').then((m) => m.VlanButtons), {
  loading: () => null,
})
export const WallLab = dynamic(() => import('./SieciWidgets').then((m) => m.WallLab), {
  loading: () => null,
})
