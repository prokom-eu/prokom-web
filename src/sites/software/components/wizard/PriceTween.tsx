'use client'

import { useEffect, useRef, useState } from 'react'

import { priceAt, splitPrice } from '@/lib/software/priceTween'

const TWEEN_MS = 450

/**
 * The wizard's price that counts to its new value (AUDYT-0811 P2 A10) instead of jumping. Screen
 * readers and reduced motion get the final text at once; a text without an amount just swaps.
 */
export function PriceTween({ text, from }: { text: string; from?: string | null }) {
  // `from`: a price mounted anew (the next offer in the window, OKNO-OFERTY-PREMIUM §2.5)
  // starts at the previous one and counts to its own — painted so from the first frame.
  const [shown, setShown] = useState(from || text)
  const last = useRef(from || text)

  useEffect(() => {
    const from = splitPrice(last.current)
    const to = splitPrice(text)
    last.current = text
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!from || !to || still || from.value === to.value) {
      const frame = requestAnimationFrame(() => setShown(text))
      return () => cancelAnimationFrame(frame)
    }
    const start = performance.now()
    let frame = 0
    const step = (now: number) => {
      const t = (now - start) / TWEEN_MS
      setShown(priceAt(from.value, to, t))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [text])

  // At rest the plain text (what tests and copying see); only the counting copy is hidden.
  if (shown === text) return text
  return (
    <>
      <span aria-hidden="true" className="tabular-nums">
        {shown}
      </span>
      <span className="sr-only">{text}</span>
    </>
  )
}
