'use client'

import { usePathname } from 'next/navigation'

import { type CtaBandProps, CtaBandView } from './CtaBandView'

/**
 * The frame's band above the footer. Not on the start page: it ends with its own plan form
 * (prototype `cta: false` in `Main.meta.json`). A page with its own texts renders `CtaBandView`
 * with `page` (service pages, prototype `ctaEye/ctaH/ctaP`) and this one hides.
 */
export function CtaBand(props: Omit<CtaBandProps, 'titleId' | 'page'>) {
  const pathname = usePathname()
  if (pathname === '/') return null
  return <CtaBandView {...props} titleId="cta-band-title" />
}
