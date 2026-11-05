import { describe, expect, it } from 'vitest'

import { THEME_STORAGE_KEY } from '../../lib/brand/theme'
import { postOutline, type RichTextData } from '../../lib/posts/content'
import { PROMO_CLOSED_KEY } from '../../lib/site/promo'
import { PROJECT_KEY, PROJECT_SENT_KEY } from '../../lib/software/project'

import { SOFTWARE_LEGAL_PAGES, softwarePrivacyLayout } from './legal'

const [hero, text] = softwarePrivacyLayout()
const content = (text && 'content' in text ? text.content : null) as unknown as RichTextData
const json = JSON.stringify(content)

describe('Software privacy policy draft', () => {
  it('opens with the hero of the board, accent marked for the gradient', () => {
    expect(hero).toMatchObject({
      blockType: 'hero',
      heading: 'Twoje dane. **Krótko i po ludzku.**',
    })
  })

  it('has the 8 points of the board in their order', () => {
    expect(postOutline(content).map((item) => item.title)).toEqual([
      'Kto jest administratorem',
      'Jakie dane zbieramy',
      'Po co i na jakiej podstawie',
      'Jak długo przechowujemy dane',
      'Komu przekazujemy dane',
      'Twoje prawa',
      'Cookies i statystyki',
      'Zmiany i kontakt',
    ])
  })

  it('names what the site keeps in the browser and leaves out the newsletter (v21)', () => {
    expect(json).toContain('pk-project')
    expect(json).toContain('pk-theme')
    expect(json.toLowerCase()).not.toContain('newsletter')
  })

  it('keeps the owner’s open values as visible placeholders', () => {
    for (const key of ['[E-MAIL SOFTWARE]', '[OKRES PRZECHOWYWANIA]', '[DATA AKTUALIZACJI]']) {
      expect(json).toContain(key)
    }
  })
})

// D2-1b: the shared legal bar links four pages on every line — Software gets cookies and
// accessibility drafts next to its privacy policy.
describe('Software cookies and accessibility drafts', () => {
  const page = (slug: string) => {
    const found = SOFTWARE_LEGAL_PAGES.find((item) => item.slug === slug)
    if (!found) throw new Error(`no ${slug}`)
    return JSON.stringify(found.layout())
  }

  it('the legal bar finds all its pages in the seed', () => {
    expect(SOFTWARE_LEGAL_PAGES.map((item) => item.slug)).toEqual([
      'polityka-prywatnosci',
      'cookies',
      'dostepnosc',
    ])
  })

  it('cookies names every key the line keeps in the browser, and no cookies', () => {
    const cookies = page('cookies')
    for (const key of [THEME_STORAGE_KEY, PROJECT_KEY, PROJECT_SENT_KEY, PROMO_CLOSED_KEY]) {
      expect(cookies, key).toContain(key)
    }
    expect(cookies).toContain('Umami')
    expect(cookies).toContain('nie ustawia cookies')
  })

  it('accessibility leaves the e-mail as the same open value as the policy', () => {
    const accessibility = page('dostepnosc')
    expect(accessibility).toContain('[E-MAIL SOFTWARE]')
    expect(accessibility).not.toMatch(/[\w.-]+@[\w.-]+\.pl/)
  })
})
