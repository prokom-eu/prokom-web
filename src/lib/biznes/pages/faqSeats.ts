type Block = { blockType: string; variant?: string | null }

const isSeats = (block: Block | undefined) =>
  block?.blockType === 'bzSection' && block.variant === 'seats'

/**
 * Opieka IT (Web-opieka-it, PREMIUM-1011): „Ile masz stanowisk?” right after the FAQ is a card in
 * the FAQ's column, one section. `'faq'` renders both, `'seats'` renders nothing (done by the
 * FAQ), `null` — each on its own. The page's data stays two blocks, so the panel keeps both.
 */
export function faqSeatsPair(blocks: readonly Block[], index: number): 'faq' | 'seats' | null {
  const block = blocks[index]
  if (block?.blockType === 'faq' && isSeats(blocks[index + 1])) return 'faq'
  if (isSeats(block) && blocks[index - 1]?.blockType === 'faq') return 'seats'
  return null
}
