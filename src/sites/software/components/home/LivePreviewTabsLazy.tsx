'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on). No `loading`:
// with it next/dynamic adds a Suspense boundary and the page below streams in hidden segments,
// revealed by a script later (sections missing without JS and right after load).
export const LivePreviewTabs = dynamic(() =>
  import('./LivePreviewTabs').then((m) => m.LivePreviewTabs),
)
export const PreviewProjectButton = dynamic(() =>
  import('./LivePreviewTabs').then((m) => m.PreviewProjectButton),
)
