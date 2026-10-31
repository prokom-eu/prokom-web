import { describe, expect, it } from 'vitest'

import { reviewSlots } from './reviews'

const review = (author: string) => ({ quote: 'Polecam.', author })

describe('reviewSlots', () => {
  it('shows only the reviews from the panel without placeholders (production)', () => {
    expect(reviewSlots([review('E. S.')], false)).toEqual([
      { kind: 'review', review: review('E. S.') },
    ])
    expect(reviewSlots([], false)).toEqual([])
  })

  it('fills the empty places up to three with placeholders outside production', () => {
    const slots = reviewSlots([review('E. S.')], true)
    expect(slots.map((slot) => slot.kind)).toEqual(['review', 'placeholder', 'placeholder'])
  })

  it('shows at most three reviews', () => {
    const slots = reviewSlots(['A', 'B', 'C', 'D'].map(review), true)
    expect(slots.map((slot) => (slot.kind === 'review' ? slot.review.author : '-'))).toEqual([
      'A',
      'B',
      'C',
    ])
  })
})
