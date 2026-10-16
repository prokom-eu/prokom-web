import type { Metadata } from 'next'
import React from 'react'

import { requireTenant } from './tenant'

type Props = { children: React.ReactNode; params: Promise<{ domain: string }> }

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const tenant = await requireTenant(params)
  return { title: tenant.name }
}

export default async function TenantLayout({ children, params }: Props) {
  await requireTenant(params)
  return <main>{children}</main>
}
