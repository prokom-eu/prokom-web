'use client'

import dynamic from 'next/dynamic'

/*
 * Stylesheets of the Instalacje line. In Next 16 a stylesheet imported anywhere in a route's
 * server modules is linked on every page of that route, and `[domain]` is shared by all lines.
 * A `next/dynamic` import inside a Client Component gets its own chunk instead: the server
 * renders its CSS as `<link rel="stylesheet" precedence>` only where the component renders,
 * React hoists it into <head> and the page paints after it loads (no flash of unstyled content).
 * Any new Instalacje stylesheet goes into `frame.tsx` or `blocks.tsx` (`style.test.ts`).
 */
const Frame = dynamic(() => import('./frame'))
const Blocks = dynamic(() => import('./blocks'))

/** Frame and shared sections — rendered by `InstalacjeFrame`, so on every Instalacje page. */
export function FrameStyles() {
  return <Frame />
}

/** Page blocks (`inst*`) and their widgets — rendered by `RenderBlocks` for such blocks. */
export function BlockStyles() {
  return <Blocks />
}
