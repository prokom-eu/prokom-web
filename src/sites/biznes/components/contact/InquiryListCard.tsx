'use client'

import Link from 'next/link'

import { useCart } from '@/lib/cart/store'

/**
 * „Masz listę pozycji z katalogu?” next to the Kontakt FAQ (Web-kontakt, slot `faqAside`): the
 * button carries the live count of the list „Do zapytania” and leads to `/zapytanie`. The count is
 * 0 on the server render (the list lives in the browser), then follows the list.
 */
export function InquiryListCard() {
  const cart = useCart()
  return (
    <div
      className="mt-4 flex flex-col gap-3 rounded-[22px] border border-border bg-card p-6"
      data-inquiry-list-card
    >
      <b className="font-display text-xl font-extrabold">Masz listę pozycji z katalogu?</b>
      <p className="text-ink-2">
        Wyślij ją jako zapytanie — dostaniesz wycenę na piśmie, pod swoją firmę.
      </p>
      <Link
        href="/zapytanie"
        className="inline-flex min-h-12 items-center justify-center self-start rounded-2xl bg-accent-text px-5 font-extrabold text-accent-ink hover:bg-ink hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
      >
        Twoje zapytanie ({cart.length})
      </Link>
    </div>
  )
}
