import { describe, expect, it } from 'vitest'

import {
  LEGACY_COOKIES_INTRO,
  LEGACY_PROCESSORS,
  PROCESSORS,
  isLegacyCookies,
  replaceText,
} from './legal'

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

describe('privacy page processors (PRODUKCJA-BIZNES-1211 §6)', () => {
  it('names the server, mail and backup providers — webh.pl hosts the server', () => {
    expect(PROCESSORS).toContain('webh.pl')
    expect(PROCESSORS).toContain('Backblaze B2')
    expect(PROCESSORS).not.toMatch(/serwer\w* (VPS )?w Seohost/)
  })

  it('replaces only the old sentence in a stored page, nothing else', () => {
    const layout = [
      {
        content: {
          root: {
            children: [
              { type: 'text', text: LEGACY_PROCESSORS },
              { type: 'text', text: 'X' },
            ],
          },
        },
      },
    ]
    const next = replaceText(layout, LEGACY_PROCESSORS, PROCESSORS)
    expect(JSON.stringify(next)).toContain('webh.pl')
    expect(JSON.stringify(next)).toContain('"X"')
    expect(
      replaceText([{ type: 'text', text: 'edited' }], LEGACY_PROCESSORS, PROCESSORS),
    ).toBeNull()
  })
})
