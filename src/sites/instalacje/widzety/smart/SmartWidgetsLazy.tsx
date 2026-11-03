'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
const LAZY = { loading: () => null }
export const SmartApp = dynamic(() => import('./SmartWidgets').then((m) => m.SmartApp), LAZY)
export const SmartAreas = dynamic(() => import('./SmartWidgets').then((m) => m.SmartAreas), LAZY)
export const SmartChecklist = dynamic(
  () => import('./SmartWidgets').then((m) => m.SmartChecklist),
  LAZY,
)
export const SmartFailure = dynamic(
  () => import('./SmartWidgets').then((m) => m.SmartFailure),
  LAZY,
)
export const SmartPanel = dynamic(() => import('./SmartWidgets').then((m) => m.SmartPanel), LAZY)
export const SmartPlan = dynamic(() => import('./SmartWidgets').then((m) => m.SmartPlan), LAZY)
export const SmartRooms = dynamic(() => import('./SmartWidgets').then((m) => m.SmartRooms), LAZY)
