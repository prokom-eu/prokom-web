'use client'

import { useEffect, useRef } from 'react'

/** Fixed flake positions (no `Math.random`: the server and the browser must draw the same). */
const FLAKES = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 2 + (i % 3),
  delay: -((i * 1.7) % 9),
  duration: 7 + (i % 5) * 1.3,
}))

/**
 * Light snowfall behind the „Na Podhalu…” band (RUNDA-V5 §5). CSS only animates while the band
 * is on screen (`data-on`); with reduced motion the layer is hidden (`podhale-proces.css`).
 */
export function GorSnow() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.on = entry?.isIntersecting ? '1' : '0'
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className="gorsnow" aria-hidden="true" data-on="0">
      {FLAKES.map((f, i) => (
        <i
          key={i}
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
