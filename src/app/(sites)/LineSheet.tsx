'use client'

import dynamic from 'next/dynamic'

import type { Line } from '@/lib/tenant/lines'
import { TailwindStyles as InstalacjeSheet } from '@/sites/instalacje/style/LineStyles'

/*
 * One Tailwind stylesheet per line (ADR-023 „CSS per linia”). `[domain]` serves every line, and in
 * Next 16 a stylesheet imported by a route's server modules is linked on all its pages, so the
 * root layout imports none. A `next/dynamic` import in a Client Component gets its own chunk: the
 * server links only the sheet it renders, React hoists it into <head> and the page paints after
 * it loads (the same mechanism as the Instalacje styles, `LineStyles.tsx`).
 */
const BiznesSheet = dynamic(() => import('@/sites/biznes/style/sheet'))
const SoftwareSheet = dynamic(() => import('@/sites/software/style/sheet'))
const BaseSheet = dynamic(() => import('./baseSheet'))

/** The stylesheet of the page's line; no line (hub, unknown domain) → the shared styles only. */
export function LineSheet({ line }: { line: Line | undefined }) {
  switch (line) {
    case 'biznes':
      return <BiznesSheet />
    case 'software':
      return <SoftwareSheet />
    case 'instalacje':
      return <InstalacjeSheet />
    default:
      return <BaseSheet />
  }
}
