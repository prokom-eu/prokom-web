import { buildInquiryBody, type FormValues } from '@/lib/inquiry/form'
import { topicFromSearch } from '@/lib/shared/contactTopic'
import { withAttachments } from '@/lib/shared/formAttachment'
import { PHRASE_PARAM } from '@/lib/shared/search/provider'

/**
 * What the address gives the Biznes contact form: a route of „Z czym dzwonisz?” picks its topic
 * (`?temat=`, plan 0611 §8.2 — only a topic the form has), „Zapytaj o …” of the search starts
 * the message (`?fraza=`, ADR-022 D2-2b).
 */
export function prefillFromSearch(
  search: string,
  topics: readonly string[],
): { topic: string | null; phrase: string | null } {
  const phrase = new URLSearchParams(search).get(PHRASE_PARAM)?.trim() || null
  return { topic: topicFromSearch(search, topics), phrase }
}

/**
 * The `contact` inquiry of the Biznes form: the parts a page attaches (the list „Do zapytania”,
 * `CartAttachment`) go under the visitor's message, cut to the server's limit, never the text.
 */
export function contactBody(
  values: FormValues,
  parts: readonly string[],
  context: { href: string; formToken: string },
) {
  return buildInquiryBody(
    { ...values, message: withAttachments(values.message, parts) },
    { ...context, type: 'contact' },
  )
}
