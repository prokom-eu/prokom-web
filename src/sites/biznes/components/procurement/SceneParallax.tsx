'use client'

import { useEffect, useRef } from 'react'

const QUERY = '(pointer: fine) and (prefers-reduced-motion: no-preference)'

/**
 * Depth behind the mouse (ZAOPATRZENIE §7): sets `--mx` / `--my` (−0.5…0.5) on the hero scene
 * while the pointer moves over the hero; each packshot shifts by its own `--z` in CSS. Only with
 * a mouse and without reduced motion; renders nothing.
 */
export function SceneParallax() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const scene = ref.current?.parentElement
    const hero = scene?.parentElement
    if (!scene || !hero || !window.matchMedia(QUERY).matches) return
    let frame = 0
    const set = (mx: number, my: number) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        scene.style.setProperty('--mx', mx.toFixed(3))
        scene.style.setProperty('--my', my.toFixed(3))
      })
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const box = hero.getBoundingClientRect()
      set(
        (event.clientX - box.left) / box.width - 0.5,
        (event.clientY - box.top) / box.height - 0.5,
      )
    }
    const onLeave = () => set(0, 0)
    hero.addEventListener('pointermove', onMove)
    hero.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <span ref={ref} hidden />
}
