import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'PRO-KOM',
  description: 'PRO-KOM — strona w budowie.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
