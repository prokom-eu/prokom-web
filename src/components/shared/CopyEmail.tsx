'use client'

import { useEffect, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'

type Props = {
  email: string
  className?: string
}

/**
 * The e-mail with a „Kopiuj” button (runda 1411, KontaktHero): `navigator.clipboard` in the click
 * handler; when it is not there or refuses, the address gets selected so a long press or Ctrl C
 * copies it. „Skopiowano” is read out through `aria-live`. The address stays a `mailto:` link.
 */
export function CopyEmail({ email, className }: Props) {
  const text = useRef<HTMLAnchorElement>(null)
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const select = () => {
    const node = text.current
    const selection = window.getSelection()
    if (!node || !selection) return
    const range = document.createRange()
    range.selectNodeContents(node)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      // A second click restarts the 2 s and is announced again (`aria-live` gets a fresh text).
      window.clearTimeout(timer.current)
      setCopied(false)
      window.requestAnimationFrame(() => setCopied(true))
      timer.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      select()
    }
  }

  return (
    <span className={cx('flex min-w-0 flex-1 items-center gap-3', className)}>
      <a
        ref={text}
        href={`mailto:${email}`}
        className="min-w-0 truncate font-bold whitespace-nowrap text-line-dark-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        data-copy-email
        className="relative inline-flex min-h-8 shrink-0 items-center rounded-[9px] border border-line-dark-rule px-2.5 text-[12px] font-extrabold text-line-dark-ink transition-colors before:absolute before:-inset-y-1.5 before:inset-x-0 hover:bg-on-dark hover:text-on-dark-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text"
      >
        {copied ? 'Skopiowano' : 'Kopiuj'}
        <span className="sr-only"> adres {email}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Skopiowano adres e-mail' : ''}
      </span>
    </span>
  )
}
