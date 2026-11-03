'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
const LAZY = { loading: () => null }
export const CableLab = dynamic(() => import('./SieciWidgets').then((m) => m.CableLab), LAZY)
export const CoverageMap = dynamic(() => import('./SieciWidgets').then((m) => m.CoverageMap), LAZY)
export const FailoverLab = dynamic(() => import('./SieciWidgets').then((m) => m.FailoverLab), LAZY)
export const LinkLab = dynamic(() => import('./SieciWidgets').then((m) => m.LinkLab), LAZY)
export const PortalCode = dynamic(() => import('./SieciWidgets').then((m) => m.PortalCode), LAZY)
export const VlanButtons = dynamic(() => import('./SieciWidgets').then((m) => m.VlanButtons), LAZY)
export const WallLab = dynamic(() => import('./SieciWidgets').then((m) => m.WallLab), LAZY)
