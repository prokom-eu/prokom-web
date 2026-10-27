import { describe, expect, it } from 'vitest'

import {
  categoriesOfLine,
  categoryChips,
  hasNews,
  isCategoryOfLine,
  NEWS_LINES,
  newsListHref,
  parseCategory,
  postHref,
} from './list'

describe('hasNews', () => {
  it('is true only for lines with a news section (Software joins in SW11b)', () => {
    expect(NEWS_LINES).toEqual(['biznes'])
    expect(hasNews('biznes')).toBe(true)
    expect(hasNews('instalacje')).toBe(false)
    expect(hasNews('software')).toBe(false)
    expect(hasNews('prokom')).toBe(false)
  })
})

describe('postHref / newsListHref', () => {
  it('builds the addresses of the list, a category view and a post', () => {
    expect(postHref('ksef-2027')).toBe('/aktualnosci/ksef-2027')
    expect(newsListHref(null)).toBe('/aktualnosci')
    expect(newsListHref('ksef')).toBe('/aktualnosci?kategoria=ksef')
  })
})

describe('parseCategory', () => {
  it('accepts one known category, anything else means „Wszystkie”', () => {
    expect(parseCategory('kasy')).toBe('kasy')
    expect(parseCategory(['kasy', 'ksef'])).toBe('kasy')
    expect(parseCategory('nie-ma')).toBeNull()
    expect(parseCategory('')).toBeNull()
    expect(parseCategory(undefined)).toBeNull()
  })
})

describe('categoryChips', () => {
  it('offers only categories that have posts, in the panel order', () => {
    expect(categoryChips(['kasy', 'ksef', 'kasy', null])).toEqual([
      { value: 'ksef', label: 'KSeF' },
      { value: 'kasy', label: 'Kasy' },
    ])
    expect(categoryChips([])).toEqual([])
  })
})

describe('post categories per line', () => {
  it('accepts only a category of the post line', () => {
    expect(isCategoryOfLine('ksef', 'biznes')).toBe(true)
    expect(isCategoryOfLine('poradnik', 'software')).toBe(true)
    expect(isCategoryOfLine('poradnik', 'biznes')).toBe(false)
    expect(isCategoryOfLine('ksef', 'software')).toBe(false)
    expect(isCategoryOfLine('ksef', null)).toBe(false)
    expect(isCategoryOfLine('nieznana', 'biznes')).toBe(false)
  })

  it('lists the categories of a line', () => {
    expect(categoriesOfLine('software')).toEqual(['Poradnik', 'Nowości', 'Realizacje'])
    expect(categoriesOfLine('instalacje')).toEqual([])
  })
})
