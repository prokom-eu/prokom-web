'use client'

import { requestMenu } from '@/lib/shared/menuOpen'

import { CAPSULE } from './capsule'

/** The capsule's Menu button up to 1080 px (NAGLOWEK-KAPSULA §3): opens the shared `MenuSheet`. */
export function MenuButton() {
  return (
    <button
      type="button"
      className={CAPSULE.iconButton}
      aria-label="Menu"
      aria-haspopup="dialog"
      onClick={requestMenu}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  )
}
