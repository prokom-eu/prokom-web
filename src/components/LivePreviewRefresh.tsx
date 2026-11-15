'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/**
 * Re-renders the preview page (server side) whenever the panel saves the document.
 * Messages are accepted only from `panelOrigin` (checked by the Payload package).
 */
export function LivePreviewRefresh({ panelOrigin }: { panelOrigin: string }) {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={panelOrigin} />
}
