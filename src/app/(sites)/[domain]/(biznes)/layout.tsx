import React from 'react'

import { requireLine } from '../tenant'

type Props = { children: React.ReactNode; params: Promise<{ domain: string }> }

/**
 * Routes of the Biznes catalog (`/oferta`, `/produkt/…`, `/zapytanie`, …): 404 on the domains
 * of other lines. Their addresses are reserved page slugs (`lib/pages/slug`), because these
 * static routes win over `[slug]` on every domain.
 */
export default async function BiznesLayout({ children, params }: Props) {
  await requireLine(params, 'biznes')
  return children
}
