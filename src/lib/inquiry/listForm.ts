import type { Cart } from '../cart/cart'
import { CONSENT_CLAUSE } from './consent'
import { BIZNES_FIELD_MESSAGES, sourceFromHref } from './form'
import { HONEYPOT_FIELD } from './honeypot'
import type { InquiryType, PreferredContact } from './types'

// Browser side of the inquiry list form `/zapytanie` (spec. §6.3, plansza Zapytanie): what it
// sends to `POST /api/inquiry`. The server validates the same rules (`schema.ts`, ADR-003).

/** „Na kiedy?” of the board; saved as the text of the chosen option. */
export const LIST_DEADLINES = ['Pilne', 'W tym miesiącu', 'Przed sezonem', 'Bez pośpiechu'] as const

export type ListFormValues = {
  name: string
  phone: string
  /** „Firma / NIP” — one field on the board, saved as the company. */
  company: string
  city: string
  email: string
  preferredContact: PreferredContact
  deadline: string
  message: string
  consent: boolean
  /** Honeypot: hidden from people, filled in by bots. */
  website: string
}

export type ListFieldName =
  'name' | 'phone' | 'company' | 'city' | 'email' | 'message' | 'consent' | 'items' | 'topics'

export const LIST_FIELD_MESSAGES: Record<ListFieldName, string> = {
  name: BIZNES_FIELD_MESSAGES.name,
  phone: BIZNES_FIELD_MESSAGES.phone,
  company: 'Nazwa firmy jest za długa.',
  city: 'Nazwa miejscowości jest za długa.',
  // The server reports a bad format and a missing address for „E-mail” contact alike.
  email: 'Podaj poprawny adres e-mail — jest potrzebny, gdy wybierasz kontakt przez e-mail.',
  message: 'Napisz, czego potrzebujesz — lista zapytania jest pusta.',
  consent: BIZNES_FIELD_MESSAGES.consent,
  // The server dropped every item (products removed meanwhile): the list needs a fresh look.
  items: 'Lista się zmieniła — odśwież stronę i sprawdź pozycje.',
  topics: 'Szukana fraza jest za długa.',
}

/** A list with items, „Zapytaj o X” without them, otherwise a plain contact (plansza). */
export function listInquiryType(itemCount: number, phrase: string | null): InquiryType {
  if (itemCount > 0) return 'list'
  return phrase?.trim() ? 'search' : 'contact'
}

/** Required fields before a request; the notes only when there is nothing else to quote. */
export function checkListRequired(
  values: ListFormValues,
  type: InquiryType,
): Partial<Record<ListFieldName, string>> {
  const errors: Partial<Record<ListFieldName, string>> = {}
  if (!values.name.trim()) errors.name = LIST_FIELD_MESSAGES.name
  if (!values.phone.trim()) errors.phone = LIST_FIELD_MESSAGES.phone
  if (values.preferredContact === 'email' && !values.email.trim()) {
    errors.email = LIST_FIELD_MESSAGES.email
  }
  if (type === 'contact' && !values.message.trim()) errors.message = LIST_FIELD_MESSAGES.message
  if (!values.consent) errors.consent = LIST_FIELD_MESSAGES.consent
  return errors
}

export function buildListInquiryBody(
  values: ListFormValues,
  {
    href,
    formToken,
    cart,
    phrase,
  }: { href: string; formToken: string; cart: Cart; phrase: string | null },
) {
  const type = listInquiryType(cart.length, phrase)
  const topic = phrase?.trim()
  return {
    type,
    source: sourceFromHref(href),
    name: values.name,
    phone: values.phone,
    company: values.company,
    city: values.city,
    email: values.email,
    preferredContact: values.preferredContact,
    deadline: values.deadline,
    message: values.message,
    topics: topic ? [topic] : [],
    // Only the slug, quantity and note: the server takes the name from the catalog.
    ...(type === 'list'
      ? {
          items: cart.map((item) => ({
            slug: item.id,
            quantity: item.q,
            ...(item.uwaga ? { note: item.uwaga } : {}),
          })),
        }
      : {}),
    consent: { accepted: values.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: values.website,
    formToken,
  }
}

/** „Posnet Ergo Online ×2, Szuflada Posnet SKL” — the first step of the success screen. */
export function itemsSummary(items: { name: string; quantity: number }[]): string {
  if (items.length === 0) return 'zapytanie ogólne'
  return items
    .map((item) => (item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name))
    .join(', ')
}
