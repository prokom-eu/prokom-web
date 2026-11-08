type Fill = (text: string | null | undefined) => string | null

/**
 * Heading of the contact block with its facts filled. Eyebrow and title are required (`null` =
 * the block renders nothing); the side title — in v24 the line under the heading, e.g.
 * „Odpowiadamy w ciągu [CZAS ODPOWIEDZI]…” — is left out on its own when its fact is missing,
 * so one empty fact never takes the form off the start page.
 */
export function contactHead(
  block: { eyebrow?: string | null; title?: string | null; sideTitle?: string | null },
  fill: Fill,
): { eyebrow: string; title: string; sideTitle: string | null } | null {
  const eyebrow = fill(block.eyebrow)
  const title = fill(block.title)
  if (!eyebrow || !title) return null
  return { eyebrow, title, sideTitle: fill(block.sideTitle) }
}
