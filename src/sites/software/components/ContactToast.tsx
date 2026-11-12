'use client'

import { useEffect, useState } from 'react'

import { Icon } from '@/components/ui/Icon'

const SHOW_MS = 2400

/** `decodeURIComponent` that never throws (a broken `%` in a link from the panel). */
function decode(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

/** Text of the toast for a phone or e-mail link, or `null` for any other link. */
export function contactToastText(href: string): string | null {
  if (href.startsWith('tel:')) return `Łączę z numerem ${decode(href.slice(4))}`
  if (href.startsWith('mailto:')) {
    const address = decode(href.slice(7).split('?')[0] ?? '')
    return address ? `Otwieram e-mail do ${address}` : null
  }
  return null
}

/**
 * A short confirmation after a tap on a phone number or an e-mail address anywhere on the page
 * (SWV7): it slides up from the bottom and goes after a moment — the phone or mail app may take
 * a second to open. Announced politely (`role="status"`). One listener for the whole page.
 */
export function ContactToast() {
  const [text, setText] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.(
        'a[href^="tel:"], a[href^="mailto:"]',
      )
      const message = link ? contactToastText(link.getAttribute('href') ?? '') : null
      if (!message) return
      setText(message)
      setKey((value) => value + 1)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (!text) return
    const timer = window.setTimeout(() => setText(null), SHOW_MS)
    return () => window.clearTimeout(timer)
  }, [text, key])

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 min-[1081px]:bottom-7"
    >
      {text ? (
        <p
          key={key}
          data-toast
          className="flex max-w-full items-center gap-3 rounded-2xl bg-ink py-3 pl-3.5 pr-4 text-[0.95rem] text-surface shadow-raised"
        >
          <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
            <Icon name="check" strokeWidth={3} className="size-4" />
          </span>
          {text}
        </p>
      ) : null}
    </div>
  )
}
