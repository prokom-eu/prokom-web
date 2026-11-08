'use client'

import dynamic from 'next/dynamic'

// ADR-023: the sample scan card of `/audyt` in its own client chunk (SSR stays on, no `loading`).
export const AuditScanCard = dynamic(() => import('./AuditScanCard').then((m) => m.AuditScanCard))
