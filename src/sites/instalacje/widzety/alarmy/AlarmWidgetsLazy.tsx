'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
const LAZY = { loading: () => null }
export const AlarmVersions = dynamic(
  () => import('./AlarmWidgets').then((m) => m.AlarmVersions),
  LAZY,
)
export const DoorPhone = dynamic(() => import('./AlarmWidgets').then((m) => m.DoorPhone), LAZY)
export const HolidayHouse = dynamic(
  () => import('./AlarmWidgets').then((m) => m.HolidayHouse),
  LAZY,
)
export const IntercomQuestion = dynamic(
  () => import('./AlarmWidgets').then((m) => m.IntercomQuestion),
  LAZY,
)
