import { describe, expect, it } from 'vitest'

import { BIZNES_GUIDE_POSTS } from '../../seed/biznes/wpisy'
import { BIZNES_PHRASES_1511, replacePhrases } from './biznes_teksty_1511'

const lexical = (text: string) => ({
  root: { children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
})

describe('biznes_teksty_1511 (audyt produkcji 15.11 wieczorem)', () => {
  it('fixes the live KSeF post heading and token sentence inside rich text', () => {
    const content = lexical(
      '3. Certyfikat KSeF — zanim skończy się token. Typ 2 do offline24. Stary token działa tylko do końca 2026 r.',
    )
    const fixed = JSON.stringify(replacePhrases(content))
    expect(fixed).not.toMatch(/skończy się token|Stary token/)
    expect(fixed).toContain('3. Certyfikat KSeF do programu i do trybu offline')
    expect(fixed).toContain('Token zostaje — MF utrzymało go bezterminowo.')
  })

  it('matches the seed hard spaces and keeps every other text as it is', () => {
    const text =
      'Sprzedajemy w Rabce. Uprawnienia producentów widzisz obok — to one pozwalają nam serwisować kasy i wdrażać programy.'
    expect(replacePhrases(text)).toBe(
      'Sprzedajemy w Rabce. Uprawnienia producentów to podstawa — pozwalają nam serwisować kasy i wdrażać programy.',
    )
    expect(replacePhrases({ a: 'inny tekst', n: 3, x: null })).toEqual({
      a: 'inny tekst',
      n: 3,
      x: null,
    })
  })

  it('is idempotent: a sentence added after a phrase is never added twice', () => {
    const once = replacePhrases(
      'Dotyczyło kas starego typu, z papierowym albo elektronicznym zapisem kopii.',
    )
    expect(once).toContain('Wyjątek: jeśli chcesz skorzystać z ulgi')
    expect(replacePhrases(once)).toBe(once)
    for (const [from, to] of BIZNES_PHRASES_1511) {
      expect(replacePhrases(replacePhrases(from)), from).toBe(replacePhrases(from))
      expect(replacePhrases(to), to).toBe(to)
    }
  })

  it('the guide posts in the repo already say the new wording (local and staging = production)', () => {
    const text = JSON.stringify(BIZNES_GUIDE_POSTS)
    expect(text).not.toMatch(/skończy się token|3 dni od zgłoszenia|token\w* działa tylko/i)
    expect(replacePhrases(BIZNES_GUIDE_POSTS)).toEqual(BIZNES_GUIDE_POSTS)
  })
})

describe('no Biznes seed text promises an end of the KSeF token', () => {
  it('seed sources and packages: no „skończy się token” or „3 dni od zgłoszenia” outside the fix lists', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs')
    const { join } = await import('node:path')
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((name) => {
        const path = join(dir, name)
        return statSync(path).isDirectory() ? files(path) : [path]
      })
    const sources = [...files('src/seed/biznes'), ...files('seed/prokombiznes')].filter(
      (path) => /\.(ts|json)$/.test(path) && !/textFixes\.ts$|\.test\.ts$/.test(path),
    )
    const hits = sources.filter((path) =>
      /skończy się token|3 dni od zgłoszenia/.test(readFileSync(path, 'utf8')),
    )
    expect(hits).toEqual([])
  })
})
