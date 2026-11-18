'use client'

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'

import { capsuleFree, FIT_STEPS } from './capsuleFit'
import { useHideOnScroll } from './useHideOnScroll'

type Props = {
  children: ReactNode
  /** A sheet is open: the capsule does not hide on phones. */
  paused?: boolean
  /** A fixed state for the preview page (`/_wspolne`): not sticky, no observer. */
  state?: 'top' | 'scrolled'
}

/**
 * The client part of `SiteHeader` (NAGLOWEK-KAPSULA §5): a sentinel 24 px under the brand bar
 * sets `data-scrolled` through an `IntersectionObserver` (no scroll listener), and on phones the
 * capsule hides while scrolling down. The wrapper keeps a fixed height, so the smaller capsule
 * never moves the page (CLS 0).
 */
export function CapsuleShell({ children, paused, state }: Props) {
  const sentinel = useRef<HTMLSpanElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const hidden = useHideOnScroll(paused)

  useEffect(() => {
    const target = sentinel.current
    if (state || !target) return
    const observer = new IntersectionObserver(([entry]) => {
      // Above the viewport = scrolled past it; below (a short window) is still the top.
      if (entry) setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [state])

  useCapsuleFit(wrap)

  const isScrolled = state ? state === 'scrolled' : scrolled
  return (
    <>
      {!state && (
        <div className="cap-sentinel" aria-hidden="true">
          <span ref={sentinel} />
        </div>
      )}
      <div
        ref={wrap}
        className="cap-wrap"
        data-scrolled={isScrolled ? '' : undefined}
        data-hidden={hidden && !state ? '' : undefined}
        // Moved off screen on a phone: out of the Tab order and the accessibility tree too.
        inert={hidden && !state ? true : undefined}
        data-static={state ? '' : undefined}
        data-site-header
      >
        {children}
      </div>
    </>
  )
}

/**
 * Everything of the line's header must fit in the capsule (Krystian 18.11: nothing may stick out,
 * e.g. Instalacje's 7 menu entries + „Szukaj Ctrl K” + „Zaplanuj instalację” at 1440 px). From
 * 1081 px the capsule measures the free room of its row and, while it is short, gives way one step
 * at a time (`data-fit`, styles in `wspolne.css`): the theme button as an icon, search as an icon,
 * a tighter menu, the short action label. It comes back as soon as there is room (a wider window,
 * „Twój projekt” gone). Labels stay the accessible names — only hidden visually.
 */
function useCapsuleFit(wrap: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = wrap.current
    const capsule = element?.querySelector<HTMLElement>('.cap')
    if (!element || !capsule) return
    const desktop = window.matchMedia('(min-width: 1081px)')
    const fit = () => {
      element.removeAttribute('data-fit')
      if (!desktop.matches) return
      const steps: string[] = []
      for (const step of FIT_STEPS) {
        if (capsuleFree(capsule) >= 0) break
        steps.push(step)
        element.setAttribute('data-fit', steps.join(' '))
      }
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(capsule)
    for (const part of capsule.querySelectorAll('.cap__nav ul, .cap__extras'))
      observer.observe(part)
    void document.fonts?.ready.then(fit)
    return () => observer.disconnect()
  }, [wrap])
}
