/**
 * Partner programmes and manufacturer certificates (boss consent 23.11.2026, documents from
 * Krystian; the same set as prokomserwis.pl). Every manufacturer status has an end date and every
 * one here has expired — shown as history with its years, never as current. The Apple programmes
 * through the AB distributor (iLeader) are current; they are about selling and deploying Apple
 * hardware, so no text may suggest an Apple service authorisation, and Apple appears as a word,
 * never its logo.
 */

export type CertificateImage = {
  /** The full document (1600 px on the long side) for the enlarged view. */
  src: string
  /** A thumbnail (640 px on the long side). */
  thumb: string
  width: number
  height: number
  thumbWidth: number
  thumbHeight: number
}

export type Certificate = {
  id: string
  brand: 'Samsung' | 'Dell'
  title: string
  /** What it confirms, in one short line. */
  scope: string
  /** Years shown next to it: „2022”, „2022–2023”. */
  period: string
  /** Last day of validity from the document (ISO date); for a training, the day it ended. */
  validTo: string
  kind: 'status' | 'szkolenie'
  image: CertificateImage
}

const image = (
  id: string,
  [width, height]: [number, number],
  [thumbWidth, thumbHeight]: [number, number],
): CertificateImage => ({
  src: `/certyfikaty/${id}.webp`,
  thumb: `/certyfikaty/${id}-min.webp`,
  width,
  height,
  thumbWidth,
  thumbHeight,
})

/** Newest first. Sizes are the WebP files in `public/certyfikaty/`. */
export const CERTIFICATES: readonly Certificate[] = [
  {
    id: 'samsung-silver-2023',
    brand: 'Samsung',
    title: 'Samsung Mobile Experience SILVER',
    scope: 'Certyfikowany partner: rozwiązania KNOX i urządzenia mobilne',
    period: '2023–2024',
    validTo: '2024-03-31',
    kind: 'status',
    image: image('samsung-silver-2023', [1600, 1131], [640, 453]),
  },
  {
    id: 'samsung-gold-2022',
    brand: 'Samsung',
    title: 'Samsung GOLD Mobility',
    scope: 'Certyfikowany partner: rozwiązania KNOX i urządzenia mobilne',
    period: '2022',
    validTo: '2022-12-31',
    kind: 'status',
    image: image('samsung-gold-2022', [1600, 1174], [640, 469]),
  },
  {
    id: 'dell-2022',
    brand: 'Dell',
    title: 'Dell Technologies Authorized Partner',
    scope: 'Authorized Solution Provider',
    period: '2022–2023',
    validTo: '2023-02-03',
    kind: 'status',
    image: image('dell-2022', [1600, 1078], [640, 431]),
  },
  {
    id: 'samsung-vd-2018',
    brand: 'Samsung',
    title: 'Szkolenie Samsung Visual Display',
    scope: 'Installation & Service · Advanced Technical',
    period: '2018',
    validTo: '2018-12-31',
    kind: 'szkolenie',
    image: image('samsung-vd-2018', [1153, 1600], [461, 640]),
  },
  {
    id: 'samsung-signage-2018',
    brand: 'Samsung',
    title: 'Szkolenie Samsung Professional Display',
    scope: 'SMART Signage i SMART Hospitality Display',
    period: '2018',
    validTo: '2018-12-31',
    kind: 'szkolenie',
    image: image('samsung-signage-2018', [1123, 1600], [449, 640]),
  },
]

/**
 * „Status partnerski · 2022–2023 (zakończony)” or „Szkolenie · 2018” — the years always next to
 * the name, and an ended status says so even on a thumbnail.
 */
export function certificateLabel(item: Certificate): string {
  return item.kind === 'status'
    ? `Status partnerski · ${item.period} (zakończony)`
    : `Szkolenie · ${item.period}`
}

const years = CERTIFICATES.flatMap((item) => item.period.split('–').map(Number))
/** Years the documents cover, e.g. „2018–2024”. */
export const CERTIFICATES_SPAN = `${Math.min(...years)}–${Math.max(...years)}`

export type AppleProgram = {
  key: 'dep' | 'cto' | 'applecare'
  title: string
  /** One line: what it gives. */
  lead: string
  /** Two sentences for a company (prokombiznes.pl). */
  text: string
}

/** Current Apple programmes through the AB distributor (iLeader): sales and deployments. */
export const APPLE_PROGRAMS: readonly AppleProgram[] = [
  {
    key: 'dep',
    title: 'Apple DEP',
    lead: 'Wdrożenie z MDM bez ręcznej konfiguracji',
    text: 'Sprzęt kupiony u nas przypiszemy do Twojej firmy w programie DEP. Pracownik włącza Maca, iPhone’a albo iPada, a ustawienia, konta i aplikacje przychodzą same z Twojego systemu MDM.',
  },
  {
    key: 'cto',
    title: 'Mac w konfiguracji CTO',
    lead: 'Mac złożony na zamówienie',
    text: 'Zamówimy Maca z pamięcią, dyskiem i procesorem dobranymi do pracy, a nie z półki. Podpowiemy, co ma sens przy grafice, księgowości czy programowaniu.',
  },
  {
    key: 'applecare',
    title: 'AppleCare+',
    lead: 'Dłuższa ochrona i pomoc Apple',
    text: 'Do zamawianych urządzeń dodamy AppleCare+, czyli rozszerzoną ochronę i pomoc Apple. Zamówisz go od razu razem ze sprzętem.',
  },
]

/** Says what the Apple programmes are — next to them wherever they are shown. */
export const APPLE_PROGRAM_NOTE =
  'Partner programu iLeader dystrybutora AB. DEP, CTO i AppleCare+ dotyczą sprzedaży i wdrożeń sprzętu Apple.'

export type SamsungOffer = {
  key: 'galaxy' | 'knox' | 'naprawy'
  title: string
  lead: string
  text: string
}

/**
 * „Samsung dla firm” (Krystian 24.11.2026): what we do with Samsung for companies today — Galaxy
 * for a team, Samsung Knox with an MDM system, repairs at PRO-KOM Tech. We are not a Samsung
 * partner today: the statuses are history (`SAMSUNG_HISTORY`), never in the present tense, and no
 * Samsung programme that nobody confirmed (e.g. Knox Mobile Enrollment) is promised.
 */
export const SAMSUNG_OFFERS: readonly SamsungOffer[] = [
  {
    key: 'galaxy',
    title: 'Galaxy dla zespołu',
    lead: 'Telefony i tablety dobrane do pracy',
    text: 'Dobierzemy smartfony i tablety Galaxy do pracy w biurze, w terenie i na sali sprzedaży. Przygotujemy je do pracy i przekażemy zespołowi gotowe do użycia.',
  },
  {
    key: 'knox',
    title: 'Samsung Knox',
    lead: 'Bezpieczeństwo i zarządzanie urządzeniami',
    text: 'Skonfigurujemy zabezpieczenia Knox i zarządzanie służbowymi urządzeniami przez system MDM: blokada zgubionego telefonu, aktualizacje, aplikacje i dane firmy oddzielone od prywatnych.',
  },
  {
    key: 'naprawy',
    title: 'Naprawy Samsung',
    lead: 'W salonie PRO-KOM Tech',
    text: 'Uszkodzony telefon albo tablet Galaxy naprawimy w salonie PRO-KOM Tech w Rabce-Zdroju. Bezpłatna diagnoza i wycena, naprawy też kurierem.',
  },
]

/** The Samsung partner statuses, always in the past tense with their years. */
export const SAMSUNG_HISTORY =
  'W latach 2022–2024 byliśmy certyfikowanym partnerem Samsung w obszarze KNOX i urządzeń mobilnych (GOLD Mobility 2022, Mobile Experience SILVER 2023–2024).'
