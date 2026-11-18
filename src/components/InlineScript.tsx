'use client'

/**
 * An inline script that runs while the HTML is parsed, before the first paint (theme, closed promo
 * bar, early skip of sections). Next.js guide „Preventing flash before hydration” (16.4): on the
 * server it is `text/javascript` and runs once with the document; on the client — a client-side
 * navigation or a re-render such as a 404 — it is `text/plain`, so React does not warn
 * „Encountered a script tag while rendering React component” (it would never run there anyway).
 * `suppressHydrationWarning` accepts the type differing between the two.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
