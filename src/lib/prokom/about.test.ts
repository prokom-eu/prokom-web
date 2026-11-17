import { describe, expect, it } from 'vitest'

import { HUB_ABOUT } from './about'

const allText = [
  HUB_ABOUT.title,
  ...HUB_ABOUT.paragraphs,
  HUB_ABOUT.quote,
  ...HUB_ABOUT.steps.flatMap((step) => [step.mark, step.title, step.text]),
  HUB_ABOUT.valuesTitle,
  ...HUB_ABOUT.values.flatMap((value) => [value.title, value.text]),
].join(' ')

describe('HUB_ABOUT — the story of /o-firmie (spec §3)', () => {
  it('names no figure but the founding year (no prices, phones or counts)', () => {
    expect(allText.match(/\d+/g)).toEqual(['2004', '2004'])
  })

  it('carries no contact data or prices — those come from the panel', () => {
    expect(allText).not.toMatch(/@|\d\s*zł|PLN|https?:|tel\./i)
  })

  it('has four steps and four values', () => {
    expect(HUB_ABOUT.steps).toHaveLength(4)
    expect(HUB_ABOUT.values).toHaveLength(4)
  })
})
