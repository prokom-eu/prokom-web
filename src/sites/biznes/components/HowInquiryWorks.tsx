import { BZ_H2 } from '@/sites/biznes/typography'

/** Fallback of step 3 while the call-back promise is empty in the panel ([SZEF], spec. §13). */
const CALLBACK_FALLBACK = 'Oddzwaniamy z wyceną'

type Props = {
  /** `SiteSettings.biznes.promises.callbackTime`, e.g. „Oddzwonimy w 60 minut”. */
  callbackTime: string | null
}

function inquirySteps(callbackTime: string | null) {
  return [
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
}

/**
 * The same three steps as the heading of a contact form (audit 0611 P1-2: categories showed the
 * offer three times — side card, „Jedna lista…”, the form). `tone`: the navy column of the form
 * or the light card on a phone.
 */
export function InquirySteps({ callbackTime, tone = 'dark' }: Props & { tone?: 'dark' | 'light' }) {
  const dark = tone === 'dark'
  return (
    <ol aria-label="Jak wysłać zapytanie" className="flex flex-col gap-2.5">
      {inquirySteps(callbackTime).map((step, position) => (
        <li key={position} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={
              dark
                ? 'flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-text text-sm font-extrabold text-accent-ink'
                : 'flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-sm font-extrabold text-accent-text'
            }
          >
            {position + 1}
          </span>
          <p
            className={
              dark ? 'text-sm leading-snug text-white/80' : 'text-sm leading-snug text-ink-2'
            }
          >
            <b className={dark ? 'font-bold text-white' : 'font-bold text-ink'}>{step.title}.</b>{' '}
            {step.text}
          </p>
        </li>
      ))}
    </ol>
  )
}

/**
 * „Jedna lista, jeden formularz, wycena na piśmie” (spec. §5.4): three steps under the
 * catalog, the category and the product page. Texts of the board `Katalog`; the call-back
 * time comes only from the panel.
 */
export function HowInquiryWorks({ callbackTime }: Props) {
  const steps = inquirySteps(callbackTime)
  return (
    <section aria-labelledby="jak-zapytac" className="pb-16 sm:pb-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-surface="dark"
          className="relative isolate grid gap-8 overflow-hidden rounded-[26px] bg-surface-dark bg-[radial-gradient(circle_at_10%_110%,var(--glow),transparent_55%)] p-7 text-white sm:rounded-[32px] sm:p-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-center lg:gap-10"
        >
          <div className="flex flex-col gap-3.5">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-accent-on-dark">
              Bez cen na stronie. I dobrze.
            </p>
            <h2 id="jak-zapytac" className={`${BZ_H2} text-white`}>
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
