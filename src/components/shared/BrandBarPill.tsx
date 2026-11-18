'use client'

import { useEffect, useRef } from 'react'

/**
 * The pill under the pointed or keyboard-focused line of the brand bar (MOTYW-PASEK-LINII §4
 * pkt 1). It moves by `transform` and `width` only (styles `.bbar-pill`) and goes back under the
 * focused line, else the current one, when the pointer leaves; without either it fades out.
 * Rendered inside the bar's `<nav>`, it listens there — the links stay server-rendered. Esc hides
 * the line's tooltip until the next pointing or focus (WCAG 1.4.13).
 */
export function BrandBarPill() {
  const pill = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = pill.current
    const nav = element?.parentElement
    if (!element || !nav) return
    const lineOf = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLElement>('.bbar-line') : null
    const show = (line: HTMLElement | null) => {
      if (!line) {
        element.removeAttribute('data-on')
        return
      }
      // Measured against the nav: each line sits in its own positioned `.bbar-item`.
      const left = line.getBoundingClientRect().left - nav.getBoundingClientRect().left
      element.style.transform = `translateX(${left}px)`
      element.style.width = `${line.offsetWidth}px`
      element.setAttribute('data-on', '')
    }
    const home = () =>
      show(
        lineOf(nav.contains(document.activeElement) ? document.activeElement : null) ??
          nav.querySelector<HTMLElement>('.bbar-line[aria-current="page"]'),
      )
    const onOver = (event: Event) => {
      const line = lineOf(event.target)
      if (!line) return
      nav.removeAttribute('data-tip-off')
      show(line)
    }
    const onOut = (event: FocusEvent | PointerEvent) => {
      if (!nav.contains(event.relatedTarget as Node | null)) home()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') nav.setAttribute('data-tip-off', '')
    }
    // The first placement must not slide in from the left edge: styles applied and flushed while
    // transitions are off, then switched back on.
    element.setAttribute('data-instant', '')
    home()
    element.getBoundingClientRect()
    element.removeAttribute('data-instant')
    // Fonts swapping in, zoom or a resized window all change the lines' boxes.
    const observer = new ResizeObserver(home)
    observer.observe(nav)
    nav.addEventListener('pointerover', onOver)
    nav.addEventListener('focusin', onOver)
    nav.addEventListener('pointerleave', onOut)
    nav.addEventListener('focusout', onOut)
    // On the document: a tooltip shown by pointing (focus elsewhere) must close with Esc too.
    document.addEventListener('keydown', onKey)
    return () => {
      observer.disconnect()
      nav.removeEventListener('pointerover', onOver)
      nav.removeEventListener('focusin', onOver)
      nav.removeEventListener('pointerleave', onOut)
      nav.removeEventListener('focusout', onOut)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return <span ref={pill} className="bbar-pill" aria-hidden="true" />
}
