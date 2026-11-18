'use client'

import { useEffect, useRef } from 'react'

/**
 * The pill under the pointed or keyboard-focused line of the brand bar (MOTYW-PASEK-LINII §4
 * pkt 1). It moves by `transform` and `width` only (styles `.bbar-pill`) and goes back under the
 * current line when the pointer or focus leaves; without a current line it fades out. Rendered
 * inside the bar's `<nav>`, it listens there — the links stay server-rendered.
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
      element.style.transform = `translateX(${line.offsetLeft}px)`
      element.style.width = `${line.offsetWidth}px`
      element.setAttribute('data-on', '')
    }
    const home = () => show(nav.querySelector<HTMLElement>('.bbar-line[aria-current="page"]'))
    const onOver = (event: Event) => {
      const line = lineOf(event.target)
      if (line) show(line)
    }
    const onOut = (event: FocusEvent | PointerEvent) => {
      if (!nav.contains(event.relatedTarget as Node | null)) home()
    }
    // The first placement must not slide in from the left edge.
    element.setAttribute('data-instant', '')
    home()
    requestAnimationFrame(() => element.removeAttribute('data-instant'))
    nav.addEventListener('pointerover', onOver)
    nav.addEventListener('focusin', onOver)
    nav.addEventListener('pointerleave', onOut)
    nav.addEventListener('focusout', onOut)
    window.addEventListener('resize', home)
    return () => {
      nav.removeEventListener('pointerover', onOver)
      nav.removeEventListener('focusin', onOver)
      nav.removeEventListener('pointerleave', onOut)
      nav.removeEventListener('focusout', onOut)
      window.removeEventListener('resize', home)
    }
  }, [])

  return <span ref={pill} className="bbar-pill" aria-hidden="true" />
}
