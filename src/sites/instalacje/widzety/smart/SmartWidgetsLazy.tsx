'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). No `loading`:
// with it next/dynamic adds a Suspense boundary and the page below streams in hidden segments,
// revealed by a script later (sections missing without JS and right after load).
export const SmartApp = dynamic(() => import('./SmartWidgets').then((m) => m.SmartApp))
export const SmartAreas = dynamic(() => import('./SmartWidgets').then((m) => m.SmartAreas))
export const SmartChecklist = dynamic(() => import('./SmartWidgets').then((m) => m.SmartChecklist))
export const SmartFailure = dynamic(() => import('./SmartWidgets').then((m) => m.SmartFailure))
export const SmartPanel = dynamic(() => import('./SmartWidgets').then((m) => m.SmartPanel))
export const SmartPlan = dynamic(() => import('./SmartWidgets').then((m) => m.SmartPlan))
export const SmartRooms = dynamic(() => import('./SmartWidgets').then((m) => m.SmartRooms))
