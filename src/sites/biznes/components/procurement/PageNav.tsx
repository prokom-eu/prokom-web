'use client'

import { useEffect, useRef, useState } from 'react'

type Link = { anchor: string; label: string }

/**
 * „Na tej stronie” (ZAOPATRZENIE §2 pkt 3, §7): sticky anchors of the sections that exist, the
 * one in view marked, „Wyślij zapytanie” to the form and a thin line of the scroll progress
 * (`scaleX`, no re-render while scrolling). The links work without JavaScript.
 */
export function PageNav({ links, cta }: { links: Link[]; cta: Link | null }) {
  const [current, setCurrent] = useState<string | null>(null)
  const progressRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const targets = links
      .map((link) => document.getElementById(link.anchor))
      .filter((element): element is HTMLElement => element !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setCurrent(visible.target.id)
      },
      { rootMargin: '-35% 0px -55% 0px' },
    )
    targets.forEach((target) => observer.observe(target))

    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      progressRef.current?.style.setProperty('transform', `scaleX(${p.toFixed(4)})`)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [links])

  return (
    <nav className="zp-pnav" aria-label="Na tej stronie">
      <div className="zp-wrap zp-pnav-row">
        <b className="zp-pnav-title" aria-hidden="true">
          Na tej stronie
        </b>
        {links.map((link) => (
          <a
            key={link.anchor}
            href={`#${link.anchor}`}
            className="zp-pnav-link"
            aria-current={current === link.anchor ? 'location' : undefined}
          >
            {link.label}
          </a>
        ))}
        {cta && (
          <a href={`#${cta.anchor}`} className="zp-pnav-link zp-pnav-go">
            {cta.label}
          </a>
        )}
      </div>
      <span ref={progressRef} className="zp-pnav-progress" aria-hidden="true" />
    </nav>
  )
}
