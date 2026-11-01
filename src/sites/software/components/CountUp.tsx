'use client'

import { useEffect, useRef, useState } from 'react'

import { COUNT_MS, countAt, countStart, parseCount } from '@/lib/motion/countUp'

/**
 * A figure that counts up once when it comes into view (SWV7, „PRO-KOM w liczbach”): 900 ms,
 * ease-out. The server renders the final text (search engines, no JavaScript); a text that does
 * not start with a number, reduced motion or no `IntersectionObserver` — it just stays. The
 * final text is also what screen readers get (the counting copy is hidden from them).
 */
export function CountUp({ text }: { text: string }) {
  const parsed = parseCount(text)
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState<number | null>(null)

  useEffect(() => {
    const element = ref.current
    if (
      !element ||
      !parsed ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const step = (now: number) => {
          const elapsed = now - start
          setShown(countAt(parsed.value, elapsed))
          if (elapsed < COUNT_MS) frame = requestAnimationFrame(step)
          else setShown(null)
        }
        setShown(countStart(parsed.value))
        frame = requestAnimationFrame(step)
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
    // `text` from the server does not change while the page is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  if (!parsed || shown === null) return <span ref={ref}>{text}</span>
  return (
    <span ref={ref}>
      <span aria-hidden="true" className="tabular-nums">
        {shown}
        {parsed.suffix}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  )
}
