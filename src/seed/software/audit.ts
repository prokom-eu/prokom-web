import type { Payload } from 'payload'

import type { Page } from '../../payload-types'
import { upsertSoftwarePage } from './page'

type Block = NonNullable<Page['layout']>[number]
type AuditBlock = Extract<Block, { blockType: 'swAuditForm' }>
type FaqBlock = Extract<Block, { blockType: 'faq' }>

export const SOFTWARE_AUDIT_SLUG = 'audyt'

/**
 * `/audyt` of the Software line (spec. §6.5) — texts of the board `Audyt`. The form has „Imię”
 * besides the board's fields (ADR-014 rozstrz. SW0 6). Prices and terms of the kinds come from
 * the audit solution (`Solutions.levels`), never from here.
 */
export const SW_AUDIT: AuditBlock = {
  blockType: 'swAuditForm',
  eyebrow: 'Darmowy audyt strony · raport w 2 dni robocze',
  title: 'Sprawdzimy Twoją stronę.',
  titleAccent: 'Za darmo.',
  lead: 'Wpisz adres. Sprawdzimy szybkość, wygodę na telefonie, widoczność w Google i w AI, bezpieczeństwo i dostępność. Dostajesz raport z listą, co poprawić, a co jest w porządku.',
  formLabel: 'Szybki audyt · {cena:audyt-strony-lub-programu} · raport w ciągu [CZAS]',
  urlLabel: 'Adres strony',
  urlPlaceholder: 'np. twojafirma.pl',
  nameLabel: 'Imię',
  namePlaceholder: 'np. Anna',
  contactLabel: 'E-mail albo telefon',
  contactPlaceholder: 'np. jan@firma.pl',
  submit: 'Zamów darmowy audyt',
  submitNote: 'Bez zobowiązań. Nie wysyłamy ofert, o które nie prosisz. Dane tylko do tego audytu.',
  reportTitle: 'Audyt strony',
  reportSubtitle: 'twojafirma.pl · raport',
  reportBadge: 'Przykład',
  reportRows: [
    { icon: 'clock', title: 'Szybkość', text: 'główna treść po 4,1 s na telefonie', status: 'fix' },
    { icon: 'phone', title: 'Telefon', text: 'przyciski i tekst czytelne', status: 'good' },
    {
      icon: 'search',
      title: 'Google i AI',
      text: 'brak danych o firmie i godzinach',
      status: 'fix',
    },
    {
      icon: 'shield',
      title: 'Bezpieczeństwo',
      text: 'certyfikat SSL, aktualny system',
      status: 'good',
    },
    { icon: 'users', title: 'Dostępność', text: 'zbyt słaby kontrast przycisków', status: 'fix' },
  ],
  checksEyebrow: 'Co sprawdzamy',
  checksTitle: 'Pięć rzeczy, które decydują, czy strona zarabia.',
  checksLead:
    'Wynik każdej z nich trafia do raportu na piśmie. Możesz z nim pójść do nas albo do kogokolwiek.',
  checks: [
    {
      icon: 'clock',
      title: 'Szybkość',
      text: 'Wynik Core Web Vitals na telefonie. Google podaje próg: główna treść w mniej niż 2,5 s.',
    },
    {
      icon: 'phone',
      title: 'Telefon',
      text: 'Czy da się wygodnie przeczytać, kliknąć i zadzwonić. Klienci coraz częściej wchodzą z telefonu.',
    },
    {
      icon: 'search',
      title: 'Google i AI',
      text: 'Tytuły, opisy, dane o firmie, godziny i adres. To samo czyta Google i asystenci AI.',
    },
    {
      icon: 'shield',
      title: 'Bezpieczeństwo',
      text: 'Certyfikat, aktualność systemu i wtyczek, kopie zapasowe, jeśli mamy do nich wgląd.',
    },
    {
      icon: 'users',
      title: 'Dostępność',
      // TODO(krystian): [SZEF] brzmienie zdania o 28.06.2025 sprawdzić z ustawą (spec. §6.5, §13).
      text: 'Kontrast, opisy obrazków, obsługa z klawiatury. Od 28.06.2025 część usług cyfrowych musi to spełniać. Powiemy, czy dotyczy to Ciebie.',
    },
    {
      icon: 'doc',
      title: 'Wynik: raport',
      text: 'Co działa, co poprawić i co jest pilne. Do [CZAS].',
    },
  ],
  levelsEyebrow: 'Rodzaje audytu',
  levelsTitle: 'Trzy poziomy audytu — pierwszy za darmo',
  levelsLead: 'Ceny netto. Pełny audyt odliczamy od projektu zamówionego w ciągu 60 dni.',
  levelButtons: [
    { label: 'Zamów za darmo', href: '/audyt#formularz' },
    { label: 'Zamawiam pełny audyt', href: '/kontakt#formularz' },
    { label: 'Zapytaj o termin', href: '/kontakt#formularz' },
  ],
  stepsEyebrow: 'Jak to działa',
  stepsTitle: 'Jak wygląda darmowy audyt',
  steps: [
    { title: 'Wpisujesz adres', text: 'I e-mail albo telefon. Nic więcej nie trzeba.' },
    {
      title: 'Sprawdzamy',
      text: 'Narzędzia Google plus człowiek, który klika po stronie jak Twój klient.',
    },
    {
      title: 'Dostajesz raport',
      text: 'Na piśmie, do [CZAS]. Jeśli chcesz, omówimy go w 15 minut.',
    },
  ],
  ctaTitle: 'Wolisz od razu nową stronę?',
  ctaText: 'Dobierz rozwiązanie w 60 sekund albo napisz, czego potrzebujesz.',
  ctaPrimary: { label: 'Dobierz rozwiązanie', href: '/dobierz' },
  ctaSecondary: { label: 'Kontakt', href: '/kontakt' },
}

/** FAQ of `/audyt` (board `Audyt`, 5 questions) — the shared `faq` block, Software look. */
export const SW_AUDIT_FAQ: FaqBlock = {
  blockType: 'faq',
  eyebrow: 'Pytania',
  heading: 'Zanim zamówisz audyt',
  items: [
    {
      question: 'Czy szybki audyt naprawdę jest darmowy?',
      answer: 'Tak. Nie ma haczyka ani obowiązku zamawiania czegokolwiek. Raport jest Twój.',
    },
    {
      question: 'Czym różni się pełny audyt?',
      answer:
        'Szybki sprawdza to, co widać z zewnątrz. Pełny zagląda też do panelu i serwera i kończy się planem naprawy z wyceną. Jeśli w ciągu 60 dni zamówisz u nas projekt, odliczamy jego cenę.',
    },
    {
      question: 'Moja strona jest u kogoś innego. To problem?',
      answer:
        'Nie. Szybki audyt robimy z zewnątrz. Do pełnego potrzebny jest dostęp do panelu, ale to Twoja decyzja.',
    },
    {
      question: 'Ile czeka się na raport?',
      answer: 'Szybki audyt: do [CZAS]. Przy prostych stronach zwykle szybciej.',
    },
    {
      question: 'Co, jeśli wszystko jest dobrze?',
      answer: 'To napiszemy, że jest dobrze. Nie wymyślamy problemów, żeby coś sprzedać.',
    },
  ],
}

export function softwareAuditLayout(): Block[] {
  return [structuredClone(SW_AUDIT), structuredClone(SW_AUDIT_FAQ)]
}

type Count = (name: string, result: boolean | 'updated') => void

/** Creates the published `/audyt` of the tenant. */
export function seedSoftwareAudit(payload: Payload, tenantId: number, count: Count) {
  return upsertSoftwarePage(
    payload,
    tenantId,
    {
      slug: SOFTWARE_AUDIT_SLUG,
      title: 'Darmowy audyt strony',
      block: 'swAuditForm',
      layout: softwareAuditLayout,
    },
    count,
  )
}
