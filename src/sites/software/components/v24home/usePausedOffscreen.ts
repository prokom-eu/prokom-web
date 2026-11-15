'use client'

import { useEffect, useRef } from 'react'

/**
 * Marks the section `data-paused` while it is off screen, so the looping mock-ups inside stop
 * (WCAG 2.2.2, decision 06.11 for the hero and the bento). Pointing at or focusing a mock-up
 * pauses it too — that part is plain CSS (`v24home.css`).
 */
export function usePausedOffscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      element.toggleAttribute('data-paused', !entry?.isIntersecting)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return ref
}
