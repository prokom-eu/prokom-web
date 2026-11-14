'use client'

import { useEffect } from 'react'

import { track } from '@/lib/analytics/track'

/** `/szukaj` without results: counted once per page view, never the phrase (ADR-020). */
export function NoResultsEvent() {
  useEffect(() => track('szukaj_brak_wyniku', { miejsce: 'strona' }), [])
  return null
}
