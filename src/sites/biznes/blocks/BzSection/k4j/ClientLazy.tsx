'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
export const AddMachineButton = dynamic(() => import('./Client').then((m) => m.AddMachineButton), {
  loading: () => null,
})
export const ClientTabs = dynamic(() => import('./Client').then((m) => m.ClientTabs), {
  loading: () => null,
})
export const KsefChecklist = dynamic(() => import('./Client').then((m) => m.KsefChecklist), {
  loading: () => null,
})
export const KsefQuizWidget = dynamic(() => import('./Client').then((m) => m.KsefQuizWidget), {
  loading: () => null,
})
export const KsefTimeline = dynamic(() => import('./Client').then((m) => m.KsefTimeline), {
  loading: () => null,
})
export const PhaseText = dynamic(() => import('./Client').then((m) => m.PhaseText), {
  loading: () => null,
})
