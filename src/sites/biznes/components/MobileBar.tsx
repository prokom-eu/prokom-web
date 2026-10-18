import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'

type Props = {
  /** `tel:` link of the main number; `null` hides the button. */
  tel: string | null
  whatsapp: string | null
}

const BUTTON =
  'inline-flex min-h-[50px] items-center justify-center gap-1.5 rounded-xl px-2.5 text-[0.9rem] font-extrabold'

/**
 * Sticky bottom bar on phones (spec. §3.3): call, WhatsApp, inquiry list. The inquiry counter
 * comes with B4. The footer leaves room for it at the bottom (`BiznesFooter`).
 */
export function MobileBar({ tel, whatsapp }: Props) {
  return (
    <nav
      aria-label="Szybki kontakt"
      className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-surface/85 px-3 pb-3.5 pt-2.5 backdrop-blur-md sm:hidden"
    >
      {tel ? (
        <a href={tel} className={`${BUTTON} flex-1 border border-border bg-surface text-ink`}>
          <Icon name="phone" className="size-[17px]" strokeWidth={2.2} />
          Zadzwoń
        </a>
      ) : null}
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener"
          className={`${BUTTON} flex-1 border border-border bg-surface text-ink`}
        >
          <Icon name="chat" className="size-[17px]" strokeWidth={2.2} />
          WhatsApp
        </a>
      ) : null}
      <Link href="/zapytanie" className={`${BUTTON} flex-[1.25] bg-accent-text text-accent-ink`}>
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
          <path
            d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
        Zapytanie
      </Link>
    </nav>
  )
}
