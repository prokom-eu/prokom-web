import { normalizeText } from './search/normalize'

/**
 * „Z czym dzwonisz?” → the form (plan 0611 §8.2): a route links `/kontakt?temat=<topic>#formularz`
 * and `ContactForm` picks that topic chip. Only a topic the line has (`shared.contact.topics`).
 */
export const TOPIC_PARAM = 'temat'

export function topicFromSearch(search: string, topics: readonly string[]): string | null {
  const wanted = new URLSearchParams(search).get(TOPIC_PARAM)?.trim()
  if (!wanted) return null
  const key = normalizeText(wanted)
  return topics.find((topic) => normalizeText(topic) === key) ?? null
}
