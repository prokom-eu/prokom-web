import React from 'react'

/** Root shell for all public sites; the tenant is resolved one level down, in `[domain]`. */
export default function SitesRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}
