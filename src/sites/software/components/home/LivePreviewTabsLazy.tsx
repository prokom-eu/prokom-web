'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). `loading` gives
// each widget its own Suspense boundary: the rest of the page hydrates without waiting for it,
// and the server HTML stays until the widget's code arrives.
export const LivePreviewTabs = dynamic(
  () => import('./LivePreviewTabs').then((m) => m.LivePreviewTabs),
  { loading: () => null },
)
export const PreviewProjectButton = dynamic(
  () => import('./LivePreviewTabs').then((m) => m.PreviewProjectButton),
  { loading: () => null },
)
