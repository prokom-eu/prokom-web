'use client'

import type { ReactNode } from 'react'

import { planHref } from '@/lib/catalog/floorPlan'
import { requestPlanScene } from '@/lib/site/planScene'

/**
 * An industry tile that shows its scene on the plan (K4: „Firmy każdej wielkości” set the scene
 * and scroll to the plan). With the plan on the page it switches it and scrolls to `#plan`;
 * without one (or without JavaScript) it is a link to `/plan-firmy?scena=…`.
 */
export function PlanSceneLink({
  scene,
  className,
  children,
}: {
  scene: string
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href={planHref(scene)}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
        if (!requestPlanScene(scene)) return
        event.preventDefault()
        const plan = document.getElementById('plan')
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        plan?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
        plan?.focus({ preventScroll: true })
      }}
    >
      {children}
    </a>
  )
}
