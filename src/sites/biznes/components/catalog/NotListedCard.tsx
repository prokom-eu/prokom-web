import { AskQuoteTile } from '../home/AskQuoteTile'

/**
 * Closing card of the phone catalog screens (boards App-Kategoria, App-Oferta): products from
 * outside the list, „Zapytaj o produkt” opens the inquiry drawer. Shown below 768 px only — the
 * full contact form stays on larger screens.
 */
export function NotListedCard() {
  return (
    <section aria-labelledby="spoza-listy-h" className="px-4 pt-2 pb-8 md:hidden">
      <div className="rounded-[22px] bg-surface-2 p-5">
        <h2 id="spoza-listy-h" className="text-[16px] leading-snug font-extrabold text-ink">
          Nie widzisz tego, czego szukasz?
        </h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">
          Dostarczamy też spoza listy. Sprawdzimy u dystrybutorów.
        </p>
        <AskQuoteTile className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-card px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)]">
          Zapytaj o produkt
        </AskQuoteTile>
      </div>
    </section>
  )
}
