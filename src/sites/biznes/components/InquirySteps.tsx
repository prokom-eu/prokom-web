/**
 * The three steps of an inquiry (spec. §5.4, board `Katalog`), shown as the heading of the
 * contact form under the catalog pages (BIZ-3: one help block instead of a section of its own).
 */
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
