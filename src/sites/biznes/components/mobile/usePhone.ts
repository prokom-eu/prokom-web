'use client'

import { useSyncExternalStore } from 'react'

/** The phone layout of Biznes: below 768 px (MOBILE-APLIKACJA, Tailwind `max-md:`). */
const PHONE_QUERY = '(max-width: 767px)'

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
const isPhone = () => window.matchMedia(PHONE_QUERY).matches

/**
 * Whether the screen is a phone, for logic CSS cannot do (e.g. 10 cards a page instead of 24).
 * The server and the first render say „no”, so the desktop markup hydrates first.
 */
export function usePhone(): boolean {
  return useSyncExternalStore(subscribe, isPhone, () => false)
}
