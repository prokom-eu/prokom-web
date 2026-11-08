'use client'

import dynamic from 'next/dynamic'

// ADR-023: the client islands of the home sections „Zaopatrzenie firm” and „Marki” get their
// own chunks (SSR stays on). No `loading` — see `forms/ContactFormLazy.tsx`.
export const ProcurementCalc = dynamic(() =>
  import('./ProcurementCalc').then((m) => m.ProcurementCalc),
)
export const BrandStrips = dynamic(() => import('./BrandStrips').then((m) => m.BrandStrips))
