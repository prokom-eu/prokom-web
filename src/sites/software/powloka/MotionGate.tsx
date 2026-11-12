'use client'

import { useEffect } from 'react'

import { createMotionGate, type GateElement } from '@/lib/software/motionGate'

/** A mock-up starts moving a little before it comes into view. */
const MARGIN = '120px 0px'

/**
 * Endless motion only where the visitor looks (AUDYT-PROD-TELEFON §1 #1): mock-ups away from the
 * screen stand still (`data-still`), and on a hidden tab the whole page does (`data-tab-hidden` on
 * `<html>`, `mockups.css`, `hero.css`). One observer for the page; mock-ups added later (the offer
 * window, the next page of the frame) join it as they appear. Renders nothing.
 */
export function MotionGate() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        gate.sync(
          entries.map((entry) => ({
            target: entry.target as unknown as GateElement,
            isIntersecting: entry.isIntersecting,
          })),
        ),
      { rootMargin: MARGIN },
    )
    const gate = createMotionGate({
      observe: (target) => observer.observe(target as unknown as Element),
      unobserve: (target) => observer.unobserve(target as unknown as Element),
    })
    gate.add(document.body as unknown as GateElement)
    const changes = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => gate.add(node as unknown as GateElement))
        record.removedNodes.forEach((node) => gate.remove(node as unknown as GateElement))
      }
    })
    changes.observe(document.body, { childList: true, subtree: true })

    const root = document.documentElement
    const syncTab = () => root.toggleAttribute('data-tab-hidden', document.hidden)
    syncTab()
    document.addEventListener('visibilitychange', syncTab)
    return () => {
      observer.disconnect()
      changes.disconnect()
      document.removeEventListener('visibilitychange', syncTab)
      root.removeAttribute('data-tab-hidden')
    }
  }, [])

  return null
}
