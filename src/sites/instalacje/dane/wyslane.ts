/*
 * Texts of `/wyslane` — the page after an Instalacje form (I11, ADR-I002 §0). 1:1 with step 5
 * of the planner prototype (`Zaplanuj.body.html`, `.zkdone`) except the customer's name: the
 * address carries no personal data, only the inquiry number and how we get back in touch.
 */

export const wyslane = {
  metaTitle: 'Zgłoszenie wysłane',
  title: 'Dziękujemy! Zgłoszenie jest u nas.',
  /** „…tak jak wybrałeś: telefonem.” — the way from `?kontakt=`. */
  leadVia: (via: string) =>
    `Odezwiemy się do 24 h w dni robocze, tak jak wybrałeś: ${via}. Wtedy dopytamy o szczegóły i umówimy wizję lokalną.`,
  lead: 'Odezwiemy się do 24 h w dni robocze. Wtedy dopytamy o szczegóły i umówimy wizję lokalną.',
  via: { phone: 'telefonem', whatsapp: 'na WhatsAppie', email: 'e-mailem' },
  number: 'Numer zgłoszenia:',
  files: 'Zdjęcia, rzuty albo przedmiar prześlij w odpowiedzi na naszą wiadomość.',
  after: [
    {
      title: 'Odezwiemy się',
      text: 'Do 24 h w dni robocze. Dopytamy o szczegóły i umówimy termin.',
    },
    { title: 'Wizja lokalna', text: 'Oglądamy obiekt, mierzymy, sprawdzamy kable.' },
    { title: 'Wycena na piśmie', text: 'Zwykle w wariantach do wyboru.' },
  ],
  links: [
    { label: 'Wróć na stronę główną', href: '/' },
    // `/poradnik` comes with I12 (404 until then, like `/zaplanuj` links before I11).
    { label: 'Poczytaj poradnik', href: '/poradnik' },
  ],
} as const

/** The inquiry number of an Instalacje form (`PKI-2026-0007`), or `null`. */
export function sentNumber(value: string | string[] | undefined): string | null {
  const nr = Array.isArray(value) ? value[0] : value
  return nr && /^PKI-\d{4}-\d{4,9}$/.test(nr) ? nr : null
}

/** How we get back in touch (`?kontakt=`), or `null` for anything else. */
export function sentVia(value: string | string[] | undefined): string | null {
  const via = Array.isArray(value) ? value[0] : value
  return via && Object.hasOwn(wyslane.via, via)
    ? wyslane.via[via as keyof typeof wyslane.via]
    : null
}
