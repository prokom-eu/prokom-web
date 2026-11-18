'use client'

import dynamic from 'next/dynamic'

// ADR-023: the inquiry drawer and toast of the catalog (ADR-029) in their own client chunks, off
// the first render of every Instalacje page (the home LCP): both stay hidden until a product is
// added or the drawer is opened, so nothing is lost by rendering them after hydration.
export const CartDrawer = dynamic(
  () => import('@/sites/biznes/components/CartDrawer').then((m) => m.CartDrawer),
  { ssr: false },
)

export const CartToast = dynamic(
  () => import('@/sites/biznes/components/CartToast').then((m) => m.CartToast),
  { ssr: false },
)
