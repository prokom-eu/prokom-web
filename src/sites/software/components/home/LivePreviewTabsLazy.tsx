'use client'

import dynamic from 'next/dynamic'

// ADR-023: own client chunk, loaded only on pages that render it (SSR stays on).
export const LivePreviewTabs = dynamic(() =>
  import('./LivePreviewTabs').then((m) => m.LivePreviewTabs),
)
export const PreviewProjectButton = dynamic(() =>
  import('./LivePreviewTabs').then((m) => m.PreviewProjectButton),
)
