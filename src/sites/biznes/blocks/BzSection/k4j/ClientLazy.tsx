'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
const LAZY = { loading: () => null }
export const AddMachineButton = dynamic(
  () => import('./Client').then((m) => m.AddMachineButton),
  LAZY,
)
export const ClientTabs = dynamic(() => import('./Client').then((m) => m.ClientTabs), LAZY)
export const KsefChecklist = dynamic(() => import('./Client').then((m) => m.KsefChecklist), LAZY)
export const KsefQuizWidget = dynamic(() => import('./Client').then((m) => m.KsefQuizWidget), LAZY)
export const KsefTimeline = dynamic(() => import('./Client').then((m) => m.KsefTimeline), LAZY)
export const PhaseText = dynamic(() => import('./Client').then((m) => m.PhaseText), LAZY)
