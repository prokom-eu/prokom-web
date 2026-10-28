import React from 'react'

import { requireLine } from '../tenant'

type Props = { children: React.ReactNode; params: Promise<{ domain: string }> }

/**
 * Routes of the Instalacje line (`/dla-kogo/…`, `/wyslane`, `/poradnik/[slug]`, ADR-I002 §0):
 * 404 on the domains of other lines. Their first segments are reserved page slugs
 * (`lib/pages/slug`), except `poradnik`, whose list is a page of `Pages`.
 */
export default async function InstalacjeLayout({ children, params }: Props) {
  await requireLine(params, 'instalacje')
  return children
}
