import { describe, expect, it } from 'vitest'

import { LEGACY_COOKIES_INTRO, isLegacyCookies } from './legal'

const layout = (text: string) => [
  {
    blockType: 'richText',
    content: { root: { children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] } },
  },
]

describe('cookies page (K31b)', () => {
  it('upgrades only the text the old seed wrote', () => {
    expect(isLegacyCookies(layout(LEGACY_COOKIES_INTRO))).toBe(true)
    expect(isLegacyCookies(layout('Tekst poprawiony w panelu.'))).toBe(false)
    expect(isLegacyCookies(layout(`${LEGACY_COOKIES_INTRO} youtube-nocookie.com`))).toBe(false)
    expect(isLegacyCookies(null)).toBe(false)
  })
})
