import React from 'react'

import { requireLine } from '../tenant'

type Props = { children: React.ReactNode; params: Promise<{ domain: string }> }

/**
 * Routes of Biznes only (`/branze`, `/konfigurator`, `/plan-firmy`, `/zestawy`, …): 404 on the
 * domains of other lines. The catalog routes shared with Instalacje live in `(katalog)`
 * (ADR-029). Their addresses are reserved page slugs (`lib/pages/slug`), because these static
 * routes win over `[slug]` on every domain.
 */
export default async function BiznesLayout({ children, params }: Props) {
  await requireLine(params, 'biznes')
  return children
}
