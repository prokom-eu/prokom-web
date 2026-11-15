import { plainText, type RichTextData } from './content'

export type FaqItem = { question: string; answer: string }

/** Names of the h2 that opens a post's FAQ (compared without case and outer spaces). */
const FAQ_HEADINGS = new Set(['najczęstsze pytania', 'pytania i odpowiedzi', 'faq'])

type Node = { type?: string; tag?: string }

const isHeading = (node: unknown, tag: string) =>
  (node as Node | null)?.type === 'heading' && (node as Node).tag === tag

/**
 * The FAQ of a post for `FAQPage` JSON-LD, read from the text itself (no extra field, no
 * migration): under the h2 „Najczęstsze pytania” each h3 is a question and the blocks up to the
 * next h3 or h2 its answer. The answer is the plain text shown on the page, as Google requires.
 */
export function postFaq(content: RichTextData | null | undefined): FaqItem[] {
  const children = content?.root?.children
  if (!Array.isArray(children)) return []
  const items: { question: string; answer: string[] }[] = []
  let inFaq = false
  for (const node of children) {
    if (isHeading(node, 'h2')) {
      inFaq = FAQ_HEADINGS.has(plainText(node).trim().toLowerCase())
      continue
    }
    if (!inFaq) continue
    if (isHeading(node, 'h3')) items.push({ question: plainText(node).trim(), answer: [] })
    else items.at(-1)?.answer.push(blockText(node))
  }
  return items
    .map(({ question, answer }) => ({
      question,
      answer: answer.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
    }))
    .filter(({ question, answer }) => question && answer)
}

/** A block's text; list items joined with a space, so their words do not merge. */
function blockText(node: unknown): string {
  if ((node as Node | null)?.type !== 'list') return plainText(node).trim()
  const items = (node as { children?: unknown }).children
  return Array.isArray(items) ? items.map((item) => plainText(item).trim()).join(' ') : ''
}
