'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const CareAreas = dynamic(() => import('./CareWidgets').then((m) => m.CareAreas))
export const Seats = dynamic(() => import('./CareWidgets').then((m) => m.Seats))
export const SwitchSteps = dynamic(() => import('./CareWidgets').then((m) => m.SwitchSteps))
