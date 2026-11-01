'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'

import { parentPath } from '@/lib/biznes/mobileNav'

/** The page's own heading on one line (a `<br>` in it becomes a space), shortened by CSS. */
const readTitle = () => {
  const heading = document.querySelector<HTMLElement>('main h1')
  return heading?.innerText.replace(/\s+/g, ' ').trim() ?? ''
}

/**
 * Left side of the phone header (MOBILE-APLIKACJA §1): the logo on the start page; on subpages
 * „←” and the screen title below 768 px (the logo from 768 px). „←” is a link one level up
 * (`parentPath`) and, after a move inside the site, the browser's back — the previous screen
 * comes back with its scroll position. The title is the page's H1, so nothing is typed twice;
 * it is hidden from screen readers, which hear the H1 itself.
 */
export function ScreenTitle({ logo }: { logo: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [title, setTitle] = useState('')
  // The header outlives the pages (layout), so its first address tells whether the visitor
  // has moved inside the site since landing — only then is „back” a page of this site.
  const [landing] = useState(pathname)
  const canGoBack = pathname !== landing

  useEffect(() => {
    const main = document.querySelector('main')
    const update = () => setTitle(readTitle())
    // Streamed pages insert the heading later; follow the content until the next address.
    const observer = new MutationObserver(update)
    if (main) observer.observe(main, { childList: true, subtree: true })
    const frame = requestAnimationFrame(update)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [pathname])

  if (pathname === '/') return logo

  return (
    <>
      <div className="hidden md:block">{logo}</div>
      <div className="flex min-w-0 flex-1 items-center gap-1 md:hidden">
        <Link
          href={parentPath(pathname)}
          onClick={(event) => {
            // „Open in a new tab” (modifier or middle button) keeps the link's own behaviour.
            const newTab =
              event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
            if (!canGoBack || newTab) return
            event.preventDefault()
            router.back()
          }}
          className="-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink hover:bg-surface-2"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="sr-only">Wstecz</span>
        </Link>
        <span aria-hidden="true" className="truncate font-display text-lg font-extrabold">
          {title}
        </span>
      </div>
    </>
  )
}
