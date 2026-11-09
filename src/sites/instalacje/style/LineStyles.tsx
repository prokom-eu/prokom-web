'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

import type { ServiceKey } from '../dane/types'

/*
 * Stylesheets of the Instalacje line. In Next 16 a stylesheet imported anywhere in a route's
 * server modules is linked on every page of that route, and `[domain]` is shared by all lines.
 * A `next/dynamic` import inside a Client Component gets its own chunk instead: the server
 * renders its CSS as `<link rel="stylesheet" precedence>` only where the component renders,
 * React hoists it into <head> and the page paints after it loads (no flash of unstyled content).
 * All of the line's stylesheets go through here, so they share one cascade group, in render
 * order: the Tailwind sheet first (`LineSheet` in the root layout), then the frame, then the
 * page's own sheets. A new stylesheet goes into one of these modules (`style.test.ts`). That order
 * holds on a page opened directly; after client navigation React appends the next page's new
 * sheets at the end (`cascade.ts`).
 */
const Tailwind = dynamic(() => import('./tailwind'))
const Frame = dynamic(() => import('./frame'))
const Objects = dynamic(() => import('./obiekty'))
const Guide = dynamic(() => import('./poradnik'))
const Sent = dynamic(() => import('./wyslane'))

/** The line's Tailwind sheet (shared styles + line tokens) — rendered by the root `LineSheet`. */
export function TailwindStyles() {
  return <Tailwind />
}

/** Frame and shared sections — rendered by `InstalacjeFrame`, so on every Instalacje page. */
export function FrameStyles() {
  return <Frame />
}

/*
 * Page blocks and their widgets: each page kind links only the stylesheets its blocks use
 * (LCP on phones, audit 09.11 — all block sheets on every page were ~55 KB gzip of
 * render-blocking CSS). The lists come from a scan of every page (which sheets have rules that
 * match its elements, also with state classes left out) and the dependencies the sheets' headers
 * name (e.g. the /serwis form error from zaplanuj.css). A widget that starts using another sheet's
 * classes or keyframes adds that sheet to its page's module, at its place in `cascade.ts`.
 */
type BlockKind =
  'home' | 'architects' | 'offer' | 'realizations' | 'planner' | 'serviceDesk' | 'guide'
const PAGE_SHEETS = {
  home: dynamic(() => import('./glowna')),
  architects: dynamic(() => import('./architekci')),
  offer: dynamic(() => import('./uslugi')),
  realizations: dynamic(() => import('./realizacje')),
  planner: dynamic(() => import('./zaplanuj')),
  serviceDesk: dynamic(() => import('./serwis')),
  guide: dynamic(() => import('./poradnik-lista')),
  kam: dynamic(() => import('./usluga-kam')),
  alarm: dynamic(() => import('./usluga-alarm')),
  kd: dynamic(() => import('./usluga-kd')),
  wifi: dynamic(() => import('./usluga-wifi')),
  tel: dynamic(() => import('./usluga-tel')),
  smart: dynamic(() => import('./usluga-smart')),
  snd: dynamic(() => import('./usluga-snd')),
  scr: dynamic(() => import('./usluga-scr')),
  ev: dynamic(() => import('./usluga-ev')),
  ant: dynamic(() => import('./usluga-ant')),
} satisfies Record<BlockKind | ServiceKey, ComponentType>

/** A page kind with its own stylesheets: a block, or a service page by its service key (a new
 *  service without its module fails the typecheck above). */
export type PageSheetsKind = keyof typeof PAGE_SHEETS

/** The stylesheets of one page kind — rendered by its block (`InstHome`, `InstService`…). */
export function PageStyles({ kind }: { kind: PageSheetsKind }) {
  const Sheets = PAGE_SHEETS[kind]
  return <Sheets />
}

/** Rendered by the shared `RenderBlocks` for Instalacje blocks: links nothing any more — each
 *  block renders its own `PageStyles` (Contact and About use only the frame's sheets). */
export function BlockStyles() {
  return null
}

/** The „Dla kogo” pages (`ObjectPage`). */
export function ObjectPageStyles() {
  return <Objects />
}

/** A guide post (`GuidePost`). */
export function GuidePostStyles() {
  return <Guide />
}

/** The thanks page after a form (`/wyslane`). */
export function SentPageStyles() {
  return <Sent />
}
