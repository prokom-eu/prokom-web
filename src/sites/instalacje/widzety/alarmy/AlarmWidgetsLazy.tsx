'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
export const AlarmVersions = dynamic(() => import('./AlarmWidgets').then((m) => m.AlarmVersions), {
  loading: () => null,
})
export const DoorPhone = dynamic(() => import('./AlarmWidgets').then((m) => m.DoorPhone), {
  loading: () => null,
})
export const HolidayHouse = dynamic(() => import('./AlarmWidgets').then((m) => m.HolidayHouse), {
  loading: () => null,
})
export const IntercomQuestion = dynamic(
  () => import('./AlarmWidgets').then((m) => m.IntercomQuestion),
  { loading: () => null },
)
