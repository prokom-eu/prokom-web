'use client'

import { useEffect } from 'react'

import { useThemeColor } from '@/components/useThemeColor'
import { track } from '@/lib/analytics/track'
import { onMenuRequest } from '@/lib/shared/menuOpen'

/** `pasek_klik` keys in the order of the shared bar (ADR-020): labels come from the panel. */
const TAB_KEYS = ['start', 'oferta', 'kreator', 'kontakt', 'menu'] as const

/**
 * What the v23 phone layer did besides drawing (SWA5): the browser bar follows the chosen theme
 * (MOBILE-APLIKACJA §5) and the statistics keep `pasek_klik` / `menu_otworz` (ADR-020) — the
 * shared bottom bar and menu sheet know no line's events, so the clicks are read here. Renders
 * nothing.
 */
export function PhoneSignals() {
  useThemeColor('software')

  useEffect(() => onMenuRequest(() => track('menu_otworz')), [])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const item = target?.closest('[data-tab-bar] > a, [data-tab-bar] > button')
      if (!item?.parentElement) return
      const index = [...item.parentElement.children].indexOf(item)
      track('pasek_klik', { pozycja: TAB_KEYS[index] ?? `pozycja-${index}` })
    }
    // Capture: before React's own handler, so „Menu” reads `pasek_klik` before `menu_otworz`.
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
