import React from 'react'

import { requireLine } from '../tenant'

type Props = { children: React.ReactNode; params: Promise<{ domain: string }> }

/**
 * Routes of pro-kom.eu (`/szukaj`, later the hub's own pages): 404 on the domains of the lines.
 * Their first segments are reserved page slugs (`lib/pages/slug`).
 */
export default async function ProkomLayout({ children, params }: Props) {
  await requireLine(params, 'prokom')
  return children
}
