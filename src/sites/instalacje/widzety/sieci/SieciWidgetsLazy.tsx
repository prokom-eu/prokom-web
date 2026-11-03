'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const CableLab = dynamic(() => import('./SieciWidgets').then((m) => m.CableLab))
export const CoverageMap = dynamic(() => import('./SieciWidgets').then((m) => m.CoverageMap))
export const FailoverLab = dynamic(() => import('./SieciWidgets').then((m) => m.FailoverLab))
export const LinkLab = dynamic(() => import('./SieciWidgets').then((m) => m.LinkLab))
export const PortalCode = dynamic(() => import('./SieciWidgets').then((m) => m.PortalCode))
export const VlanButtons = dynamic(() => import('./SieciWidgets').then((m) => m.VlanButtons))
export const WallLab = dynamic(() => import('./SieciWidgets').then((m) => m.WallLab))
