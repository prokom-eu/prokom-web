import React from 'react'

import { requireLine } from '../tenant'

type Props = { children: React.ReactNode; params: Promise<{ domain: string }> }

/**
 * Routes of the Software line (`/dziekujemy`, later `/rozwiazania`, `/dobierz`, …, ADR-014 §2):
 * 404 on the domains of other lines. Their addresses are reserved page slugs (`lib/pages/slug`),
 * because these static routes win over `[slug]` on every domain.
 */
export default async function SoftwareLayout({ children, params }: Props) {
  await requireLine(params, 'software')
  return children
}
