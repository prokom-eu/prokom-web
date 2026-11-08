'use client'

import dynamic from 'next/dynamic'

// ADR-023: the offer window in its own client chunk (catalog, price page, industry pages).
export const SolutionDialog = dynamic(() =>
  import('./SolutionDialog').then((m) => m.SolutionDialog),
)
