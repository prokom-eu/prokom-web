'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { openCartDrawer } from '@/lib/cart/store'

/** The shared shell's own places of the line action: capsule, bottom bar, side rail. */
const SHELL = '.cap-cta, [data-tab-bar], [data-site-rail]'

/**
 * „Zapytanie” in the shared shell is a plain link to the inquiry page (it works without
 * JavaScript); with it, a click opens the inquiry drawer instead, as the K4 header did. Links in
 * the page itself and clicks with a modifier (new tab) stay links; on the inquiry page the link
 * does nothing new.
 */
export function DrawerLinks({ href }: { href: string }) {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname === href) return
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element | null)?.closest('a')
      if (!link || link.getAttribute('href') !== href || !link.closest(SHELL)) return
      event.preventDefault()
      openCartDrawer()
    }
    // Capture phase: React (and `next/link`) listen on the document and would navigate first.
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [href, pathname])
  return null
}
