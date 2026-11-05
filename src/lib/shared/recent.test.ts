import { describe, expect, it } from 'vitest'

import { clearRecent, pushRecent, readRecent, RECENT_LIMIT, recentKey } from './recent'

/** A `localStorage` stand-in. */
function memory() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    data,
  }
}

const page = (n: number) => ({ title: `Strona ${n}`, href: `/s${n}`, kind: 'Strona', at: n })

describe('recently viewed (spec §5.1 dodatek 6)', () => {
  it('keeps the newest 5 per line, newest first, one entry per address', () => {
    const store = memory()
    for (let n = 1; n <= 7; n++) pushRecent('software', page(n), store)
    pushRecent('software', { ...page(4), at: 99 }, store)
    const list = readRecent('software', store)
    expect(list).toHaveLength(RECENT_LIMIT)
    expect(list.map((item) => item.href)).toEqual(['/s4', '/s7', '/s6', '/s5', '/s3'])
  })

  it('lines do not share their lists; clearing removes the key', () => {
    const store = memory()
    pushRecent('software', page(1), store)
    expect(readRecent('instalacje', store)).toEqual([])
    expect(store.data.has(recentKey('software'))).toBe(true)
    clearRecent('software', store)
    expect(store.data.has('pk-recent-software')).toBe(false)
  })

  it('treats broken or foreign data as empty and survives a blocked storage', () => {
    const store = memory()
    store.setItem('pk-recent-software', '{not json')
    expect(readRecent('software', store)).toEqual([])
    store.setItem('pk-recent-software', JSON.stringify([{ title: 'x', href: 'https://zly.test' }]))
    expect(readRecent('software', store)).toEqual([])
    const blocked = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }
    expect(readRecent('software', blocked)).toEqual([])
    expect(() => pushRecent('software', page(1), blocked)).not.toThrow()
    expect(() => clearRecent('software', blocked)).not.toThrow()
  })
})
