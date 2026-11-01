import { describe, expect, it } from 'vitest'

import {
  categoriesOfLine,
  categoryChips,
  hasGuide,
  hasNews,
  isCategoryOfLine,
  NEWS_LINES,
  newsListHref,
  parseCategory,
  postHref,
} from './list'

describe('hasNews', () => {
  it('is true only for lines with a news section (Software joins in SW11b)', () => {
    expect(NEWS_LINES).toEqual(['biznes', 'software'])
    expect(hasNews('biznes')).toBe(true)
    expect(hasNews('software')).toBe(true)
    expect(hasNews('instalacje')).toBe(false)
    expect(hasNews('prokom')).toBe(false)
  })
})

describe('postHref / newsListHref', () => {
  it('builds the addresses of the list, a category view and a post', () => {
    expect(postHref('ksef-2027')).toBe('/aktualnosci/ksef-2027')
    expect(newsListHref(null)).toBe('/aktualnosci')
    expect(newsListHref('ksef')).toBe('/aktualnosci?kategoria=ksef')
  })

  it('puts a post of Instalacje under /poradnik, the other lines stay under /aktualnosci', () => {
    expect(hasGuide('instalacje')).toBe(true)
    expect(hasGuide('biznes')).toBe(false)
    expect(postHref('monitoring-a-rodo', 'instalacje')).toBe('/poradnik/monitoring-a-rodo')
    expect(postHref('ksef-2027', 'biznes')).toBe('/aktualnosci/ksef-2027')
    expect(postHref('poradnik-sklep', 'software')).toBe('/aktualnosci/poradnik-sklep')
    expect(postHref('ą b', 'instalacje')).toBe('/poradnik/%C4%85%20b')
  })
})

describe('categories of Instalacje', () => {
  it('belong to Instalacje only, with unique values', () => {
    expect(categoriesOfLine('instalacje')).toEqual([
      'Przepisy',
      'Monitoring',
      'Obiekty noclegowe',
      'Energia',
      'Dźwięk i obraz',
    ])
    expect(isCategoryOfLine('przepisy', 'instalacje')).toBe(true)
    expect(isCategoryOfLine('przepisy', 'software')).toBe(false)
    expect(isCategoryOfLine('poradnik', 'instalacje')).toBe(false)
    expect(parseCategory('monitoring', 'instalacje')).toBe('monitoring')
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

  it('with a line, refuses another line’s category (SW11b)', () => {
    expect(parseCategory('poradnik', 'software')).toBe('poradnik')
    expect(parseCategory('kasy', 'software')).toBeNull()
    expect(parseCategory('poradnik', 'biznes')).toBeNull()
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
    expect(categoriesOfLine('prokom')).toEqual([])
  })
})
