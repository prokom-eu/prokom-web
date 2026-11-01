/** Fallback of step 3 while the call-back promise is empty in the panel ([SZEF], spec. §13). */
const CALLBACK_FALLBACK = 'Oddzwaniamy z wyceną'

type Props = {
  /** `SiteSettings.biznes.promises.callbackTime`, e.g. „Oddzwonimy w 60 minut”. */
  callbackTime: string | null
}

/**
 * „Jedna lista, jeden formularz, wycena na piśmie” (spec. §5.4): three steps under the
 * catalog, the category and the product page. Texts of the board `Katalog`; the call-back
 * time comes only from the panel.
 */
export function HowInquiryWorks({ callbackTime }: Props) {
  const steps = [
    {
      title: 'Dodaj do zapytania',
      text: 'Produkty i usługi z katalogu, ile chcesz, z różnych działów.',
    },
    {
      title: 'Wyślij listę',
      // True since B8b: the list form asks for a name and a phone, notes are optional.
      text: 'Imię i telefon wystarczą. Możesz dopisać uwagi do każdej pozycji.',
    },
    {
      title: callbackTime?.trim() || CALLBACK_FALLBACK,
      text: 'W godzinach pracy. Dopytamy o szczegóły i wyślemy wycenę z wariantami.',
    },
  ]
  return (
    <section aria-labelledby="jak-zapytac" className="pb-16 sm:pb-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-surface="dark"
          className="relative isolate grid gap-8 overflow-hidden rounded-[26px] bg-surface-dark bg-[radial-gradient(circle_at_10%_110%,var(--glow),transparent_55%)] p-7 text-white sm:rounded-[32px] sm:p-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-center lg:gap-10"
        >
          <div className="flex flex-col gap-3.5">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-accent-on-dark">
              Bez cen na stronie i dobrze
            </p>
            <h2
              id="jak-zapytac"
              className="font-display text-[clamp(1.75rem,3vw,2.625rem)] font-extrabold leading-[1.05] text-white font-stretch-110%"
            >
              Jedna lista, jeden formularz, jedna wycena.
            </h2>
            <p className="leading-relaxed text-white/80">
              Ceny kas, programów i usług zależą od konfiguracji, ilości i tego, co już masz.
              Dlatego nie pokazujemy cen z sufitu. Przygotowujemy wycenę pod Twoją firmę.
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {steps.map((step, position) => (
              <li
                key={position}
                className="flex flex-col gap-2 rounded-[20px] bg-white/5 p-5 ring-1 ring-inset ring-white/10"
              >
                <span
                  aria-hidden="true"
                  className="flex size-[38px] items-center justify-center rounded-xl bg-accent-text font-display text-[1.05rem] font-extrabold text-accent-ink"
                >
                  {position + 1}
                </span>
                <h3 className="text-[1.03rem] font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-normal text-white/80">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
