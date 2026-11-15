import { describe, expect, it } from 'vitest'

import { newsListView, newsPageHref, parsePage, NEWS_PAGE_SIZE } from './newsList'

type Post = { slug: string; categoryValue: string }

const posts = (count: number, category = 'strony'): Post[] =>
  Array.from({ length: count }, (_, index) => ({
    slug: `wpis-${index + 1}`,
    categoryValue: category,
  }))

const slugs = (list: readonly Post[]) => list.map((post) => post.slug)

describe('parsePage', () => {
  it('reads a whole page number from 1 up; missing is page 1', () => {
    expect(parsePage(undefined)).toBe(1)
    expect(parsePage('2')).toBe(2)
    expect(parsePage(['3', '4'])).toBe(3)
  })

  it('refuses anything else (the route answers 404, no duplicate of the list)', () => {
    for (const value of ['', '0', '-1', '1.5', 'abc', '02', '1e2', ' 2']) {
      expect(parsePage(value), value).toBeNull()
    }
  })
})

describe('newsPageHref', () => {
  it('keeps the category and adds a page only from 2 up', () => {
    expect(newsPageHref(null, 1)).toBe('/aktualnosci')
    expect(newsPageHref(null, 2)).toBe('/aktualnosci?strona=2')
    expect(newsPageHref('strony', 1)).toBe('/aktualnosci?kategoria=strony')
    expect(newsPageHref('strony', 3)).toBe('/aktualnosci?kategoria=strony&strona=3')
  })
})

describe('newsListView', () => {
  it('features the newest post and puts the next two beside it on the first page', () => {
    const view = newsListView(posts(6), null, 1)
    expect(view?.featured?.slug).toBe('wpis-1')
    expect(slugs(view?.latest ?? [])).toEqual(['wpis-2', 'wpis-3'])
    expect(slugs(view?.cards ?? [])).toEqual(['wpis-4', 'wpis-5', 'wpis-6'])
    expect(view).toMatchObject({ total: 6, page: 1, pages: 1 })
  })

  it('pages by NEWS_PAGE_SIZE, the featured post and the two beside it included', () => {
    expect(NEWS_PAGE_SIZE).toBe(12)
    const first = newsListView(posts(20), null, 1)
    expect(first?.pages).toBe(2)
    // 1 featured + 2 beside it + 9 in the grid (three full rows).
    expect(first?.featured?.slug).toBe('wpis-1')
    expect(first?.cards.length).toBe(9)
    const second = newsListView(posts(20), null, 2)
    expect(second?.featured).toBeNull()
    expect(second?.latest).toEqual([])
    expect(slugs(second?.cards ?? [])).toEqual(
      posts(20)
        .slice(12)
        .map((post) => post.slug),
    )
  })

  it('has one page up to 12 posts', () => {
    expect(newsListView(posts(12), null, 1)?.pages).toBe(1)
    expect(newsListView(posts(13), null, 1)?.pages).toBe(2)
  })

  it('shows a category without featuring, all of its posts in the grid', () => {
    const list = [...posts(3, 'strony'), ...posts(2, 'systemy')]
    const view = newsListView(list, 'systemy', 1)
    expect(view?.featured).toBeNull()
    expect(view?.latest).toEqual([])
    expect(view?.cards.map((post) => post.categoryValue)).toEqual(['systemy', 'systemy'])
    expect(view?.total).toBe(2)
  })

  it('counts the posts of every category for the chips, in the panel order', () => {
    const list = [...posts(2, 'systemy'), ...posts(3, 'strony'), ...posts(1, 'poradnik')]
    expect(newsListView(list, 'systemy', 1)?.chips).toEqual([
      { value: 'poradnik', label: 'Poradnik', count: 1 },
      { value: 'strony', label: 'Strony', count: 3 },
      { value: 'systemy', label: 'Systemy', count: 2 },
    ])
  })

  it('refuses a page past the last one, and any page but 1 of an empty list', () => {
    expect(newsListView(posts(6), null, 2)).toBeNull()
    expect(newsListView([], null, 1)).toMatchObject({ total: 0, pages: 1, featured: null })
    expect(newsListView([], null, 2)).toBeNull()
  })
})
