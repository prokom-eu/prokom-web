'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const AddMachineButton = dynamic(() => import('./Client').then((m) => m.AddMachineButton))
export const ClientTabs = dynamic(() => import('./Client').then((m) => m.ClientTabs))
export const KsefChecklist = dynamic(() => import('./Client').then((m) => m.KsefChecklist))
export const KsefQuizWidget = dynamic(() => import('./Client').then((m) => m.KsefQuizWidget))
export const KsefTimeline = dynamic(() => import('./Client').then((m) => m.KsefTimeline))
export const PhaseText = dynamic(() => import('./Client').then((m) => m.PhaseText))
