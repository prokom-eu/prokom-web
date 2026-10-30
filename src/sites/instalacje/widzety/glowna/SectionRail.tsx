'use client'

import { useEffect, useState } from 'react'

import { glownaSekcje } from '../../dane/glownaSekcje'
import { InstIcon } from '../../InstIcon'
import { railState } from './rail'

/**
 * Section rail of the home page (`.rail`, KOMPONENTY §1): fixed on the left from 1400 px (CSS),
 * shows after 400 px of scrolling and marks the section in view. Items whose section is not on
 * the page (e.g. a section without published data) are left out.
 */
export function SectionRail() {
  const [items, setItems] = useState<(typeof glownaSekcje.rail)[number][]>([])
  const [state, setState] = useState<{ active: string | null; visible: boolean }>({
    active: null,
    visible: false,
  })

  useEffect(() => {
    const present = glownaSekcje.rail.filter(([id]) => document.getElementById(id))
    let frame = 0
    const update = () => {
      frame = 0
      const sections = present.flatMap(([id]) => {
        const el = document.getElementById(id)
        return el ? [{ id, top: el.getBoundingClientRect().top + window.scrollY }] : []
      })
      const next = railState(sections, window.scrollY, window.innerHeight)
      setItems((items) => (items.length === present.length ? items : present))
      setState((s) => (s.active === next.active && s.visible === next.visible ? s : next))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <nav className={`rail${state.visible ? ' on' : ''}`} aria-label="Sekcje strony">
      {items.map(([id, label, icon]) => (
        <a
          key={id}
          href={`#${id}`}
          className={state.active === id ? 'act' : undefined}
          aria-label={label}
          aria-current={state.active === id ? 'location' : undefined}
          tabIndex={state.visible ? undefined : -1}
        >
          <InstIcon name={icon} size={18} />
          <span aria-hidden="true">{label}</span>
        </a>
      ))}
    </nav>
  )
}
