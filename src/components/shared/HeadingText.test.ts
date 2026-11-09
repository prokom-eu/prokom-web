import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AccentText, HeadingText } from './HeadingText'

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el)

describe('HeadingText', () => {
  it('renders the starred part as a band em by default', () => {
    expect(html(createElement(HeadingText, { text: 'Napisz **po swojemu**' }))).toBe(
      'Napisz <em class="not-italic" data-heading-em="true">po swojemu</em>',
    )
  })

  it('uses the line class instead of the band look when given', () => {
    expect(html(createElement(HeadingText, { text: 'Kawa **w Rabce.**', emClass: 'sw-em' }))).toBe(
      'Kawa <em class="sw-em">w Rabce.</em>',
    )
  })

  it('keeps text without stars plain', () => {
    expect(html(createElement(HeadingText, { text: 'Kontakt' }))).toBe('Kontakt')
  })
})

describe('AccentText (AUDYT-0911 #1)', () => {
  it('drops the stars for a line that does not ask for em', () => {
    expect(html(createElement(AccentText, { text: 'Z czym **dzwonisz?**' }))).toBe(
      'Z czym dzwonisz?',
    )
  })

  it('wraps the starred part in the line class', () => {
    expect(
      html(createElement(AccentText, { text: 'Z czym **dzwonisz?**', emClass: 'sw-em' })),
    ).toBe('Z czym <em class="sw-em">dzwonisz?</em>')
  })

  it('gives a band heading the band look', () => {
    expect(
      html(createElement(AccentText, { text: 'Wpadnij **do nas**', emClass: 'sw-em', band: true })),
    ).toBe('Wpadnij <em class="not-italic" data-heading-em="true">do nas</em>')
  })
})
