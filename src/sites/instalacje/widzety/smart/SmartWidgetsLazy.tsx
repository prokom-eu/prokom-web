'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
export const SmartApp = dynamic(() => import('./SmartWidgets').then((m) => m.SmartApp), {
  loading: () => null,
})
export const SmartAreas = dynamic(() => import('./SmartWidgets').then((m) => m.SmartAreas), {
  loading: () => null,
})
export const SmartChecklist = dynamic(
  () => import('./SmartWidgets').then((m) => m.SmartChecklist),
  { loading: () => null },
)
export const SmartFailure = dynamic(() => import('./SmartWidgets').then((m) => m.SmartFailure), {
  loading: () => null,
})
export const SmartPanel = dynamic(() => import('./SmartWidgets').then((m) => m.SmartPanel), {
  loading: () => null,
})
export const SmartPlan = dynamic(() => import('./SmartWidgets').then((m) => m.SmartPlan), {
  loading: () => null,
})
export const SmartRooms = dynamic(() => import('./SmartWidgets').then((m) => m.SmartRooms), {
  loading: () => null,
})
