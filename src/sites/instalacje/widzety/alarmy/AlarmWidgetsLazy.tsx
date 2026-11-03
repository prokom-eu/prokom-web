'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const AlarmVersions = dynamic(() => import('./AlarmWidgets').then((m) => m.AlarmVersions))
export const DoorPhone = dynamic(() => import('./AlarmWidgets').then((m) => m.DoorPhone))
export const HolidayHouse = dynamic(() => import('./AlarmWidgets').then((m) => m.HolidayHouse))
export const IntercomQuestion = dynamic(() =>
  import('./AlarmWidgets').then((m) => m.IntercomQuestion),
)
