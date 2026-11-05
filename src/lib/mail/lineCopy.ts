import type { Line } from '../tenant/lines'

/**
 * Texts and colours of a line's e-mails (spec MAILE §3, §4.2; ADR-024 pkt 4). In code, with a
 * test, because the promise must match the site. TODO(krystian): after F1 these can move to
 * `SiteSettings.shared` (separate task).
 */
export type MailTheme = {
  /** The 5 px bar and the brand mark. */
  brand: string
  /** Button background (white text, AA). */
  button: string
  /** Accent text on white (AA). */
  accentText: string
  /** Card and footer background. */
  surface: string
  border: string
}

export type LineCopy = {
  /** Name of the sender and of the logo: „PRO-KOM Biznes”. */
  label: string
  /** File in `public/brand/mail/`, or `null` (no logo for this line yet). */
  logo: string | null
  theme: MailTheme
  subject: (number: string) => string
  h1: string
  preheader: string
  lead: string
  steps: [Step, Step, Step]
}

type Step = { title: string; text?: string }

const NEUTRAL = { surface: '#ECEEE8', border: '#DCDFD8' }

/** Biznes: 60 minutes — the boss's decision of 27.10, as on the site (`homeFacts.ts`). */
const BIZNES: LineCopy = {
  label: 'PRO-KOM Biznes',
  logo: 'prokom-biznes_mail.png',
  theme: {
    brand: '#244FB0',
    button: '#244FB0',
    accentText: '#244FB0',
    surface: '#F3F5FA',
    border: '#E2E6EF',
  },
  subject: (number) => `Mamy Twoje zapytanie ${number}`,
  h1: 'Mamy Twoje zapytanie.',
  preheader: 'Oddzwonimy w 60 minut (w godzinach pracy). Co dalej — w środku.',
  lead: 'Dziękujemy. W godzinach pracy oddzwonimy w ciągu 60 minut, a potem przygotujemy wycenę na piśmie. Poza godzinami pracy odezwiemy się następnego dnia roboczego rano.',
  steps: [
    {
      title: 'Sprawdzamy dostępność i wersje',
      text: 'Dobieramy modele do Twojej firmy — bez zgadywania.',
    },
    { title: 'Dzwonimy, żeby doprecyzować', text: 'Krótko: liczba stanowisk, programy, termin.' },
    {
      title: 'Wysyłamy wycenę na piśmie',
      text: 'Z cenami, terminem i tym, co robimy na miejscu.',
    },
  ],
}

/** Instalacje: 24 h — the boss's decision of 26.10; an answer, not a technician's visit. */
const INSTALACJE: LineCopy = {
  label: 'PRO-KOM Instalacje',
  logo: 'prokom-instalacje_mail.png',
  theme: { brand: '#0093B3', button: '#007A96', accentText: '#006A82', ...NEUTRAL },
  subject: (number) => `Mamy Twoje zgłoszenie ${number}`,
  h1: 'Mamy Twoje zgłoszenie.',
  preheader: 'Odpowiemy w 24 h w dni robocze. Co dalej — w środku.',
  lead: 'Dziękujemy za kontakt. Odpowiemy na zgłoszenie w ciągu 24 godzin w dni robocze — oddzwonimy albo odpiszemy.',
  steps: [
    {
      title: 'Oddzwaniamy i dopytujemy o obiekt',
      text: 'Kilka pytań o budynek, łącze i to, co ma działać.',
    },
    {
      title: 'Wycena ze zdjęć albo wizyta',
      text: 'Często wystarczą zdjęcia — jeśli nie, umawiamy wizytę na miejscu.',
    },
    {
      title: 'Oferta z zakresem i terminem',
      text: 'Na piśmie: co montujemy, kiedy i za ile.',
    },
  ],
}

/** Software: 1 working day and 5–7 days (`software-cennik.md`). White on #8B61E3 fails AA. */
const SOFTWARE: LineCopy = {
  label: 'PRO-KOM Software',
  logo: 'prokom-software_mail.png',
  theme: { brand: '#8B61E3', button: '#6E45D4', accentText: '#5B33C4', ...NEUTRAL },
  subject: (number) => `Mamy Twoje zgłoszenie ${number}`,
  h1: 'Mamy Twoje zgłoszenie.',
  preheader: 'Odpowiemy w 1 dzień roboczy. Podgląd i wycena w 5–7 dni.',
  lead: 'Dziękujemy. Odpowiemy w ciągu 1 dnia roboczego. Zobaczysz projekt, zanim zapłacisz.',
  steps: [
    { title: 'Czytamy i dopytujemy', text: 'Odezwiemy się z kilkoma pytaniami o firmę i cele.' },
    { title: 'Podgląd i wycena w 5–7 dni', text: 'Podgląd do klikania i wycena na piśmie.' },
    { title: 'Startujemy po akceptacji', text: 'Termin i etapy ustalamy razem.' },
  ],
}

/** Software „audit” form: the free audit report (spec §4.2, the only form with its own texts). */
const SOFTWARE_AUDIT: LineCopy = {
  ...SOFTWARE,
  lead: 'Dziękujemy. Raport z bezpłatnego audytu wyślemy w ciągu 2 dni roboczych.',
  steps: [
    // Titles only (spec §4.2 gives no descriptions for the audit).
    { title: 'Sprawdzamy stronę' },
    { title: 'Raport w 2 dni robocze' },
    { title: 'Krótka rozmowa o wynikach' },
  ],
}

/**
 * The hub (pro-kom.eu) has no site with forms yet (December 2026). TODO(krystian): texts and
 * logo of pro-kom.eu with its launch; until then a neutral confirmation without a time promise.
 */
const PROKOM: LineCopy = {
  label: 'PRO-KOM',
  logo: null,
  theme: { brand: '#45A02C', button: '#2E7A1E', accentText: '#2E7A1E', ...NEUTRAL },
  subject: (number) => `Mamy Twoje zgłoszenie ${number}`,
  h1: 'Mamy Twoje zgłoszenie.',
  preheader: 'Dziękujemy za wiadomość. Co dalej — w środku.',
  lead: 'Dziękujemy za kontakt. Przekazaliśmy zgłoszenie do właściwej linii PRO-KOM.',
  steps: [
    { title: 'Czytamy zgłoszenie', text: 'Sprawdzamy, która linia się nim zajmie.' },
    { title: 'Odzywamy się', text: 'Telefonem albo e-mailem.' },
    { title: 'Ustalamy dalsze kroki', text: 'Zakres i termin na piśmie.' },
  ],
}

const COPY: Record<Line, LineCopy> = {
  prokom: PROKOM,
  biznes: BIZNES,
  instalacje: INSTALACJE,
  software: SOFTWARE,
}

/** Texts of a line's confirmation; only Software's audit form has its own. */
export function lineCopy(line: Line, type?: string): LineCopy {
  return line === 'software' && type === 'audit' ? SOFTWARE_AUDIT : COPY[line]
}

/** Sender name: „PRO-KOM Biznes”, for our notification „PRO-KOM Biznes · formularz” (§1). */
export function senderName(line: Line, kind: 'confirmation' | 'notification'): string {
  const { label } = COPY[line]
  return kind === 'notification' ? `${label} · formularz` : label
}
