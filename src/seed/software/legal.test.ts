import { describe, expect, it } from 'vitest'

import { postOutline, type RichTextData } from '../../lib/posts/content'

import { softwarePrivacyLayout } from './legal'

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
