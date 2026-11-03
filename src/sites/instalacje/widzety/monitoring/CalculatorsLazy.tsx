'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const DoriCalc = dynamic(() => import('./Calculators').then((m) => m.DoriCalc))
export const RecordingCalc = dynamic(() => import('./Calculators').then((m) => m.RecordingCalc))
