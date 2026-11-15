/**
 * Software v24 start page (ZMIANY-v24 §4 pkt 10): „Zanim napiszesz” and „Napisz po swojemu” stand
 * side by side in one section, yet stay two blocks in the panel (`faq`, then `swContact`). This
 * says which half of that pair the block at `index` is — the FAQ renders both, the contact block
 * nothing; any other block, or the two apart, renders as usual (`null`).
 */
export function faqContactPair(
  blocks: readonly { blockType: string }[],
  index: number,
): 'faq' | 'contact' | null {
  const type = blocks[index]?.blockType
  if (type === 'faq' && blocks[index + 1]?.blockType === 'swContact') return 'faq'
  if (type === 'swContact' && blocks[index - 1]?.blockType === 'faq') return 'contact'
  return null
}
