import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createListStore } from './store'

type Item = { id: string }

const parse = (raw: string | null): Item[] => {
  try {
    const data: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? (data as Item[]) : []
  } catch {
    return []
  }
}

/** A minimal browser: `localStorage` and the `storage` event, enough for the store. */
function fakeWindow({ failWrites = false, failReads = false } = {}) {
  const data = new Map<string, string>()
  const listeners = new Set<(event: StorageEvent) => void>()
  const win = {
    localStorage: {
      getItem: (key: string) => {
        if (failReads) throw new Error('blocked')
        return data.get(key) ?? null
      },
      setItem: (key: string, value: string) => {
        if (failWrites) throw new Error('quota')
        data.set(key, value)
      },
    },
    addEventListener: (_type: string, fn: (event: StorageEvent) => void) => listeners.add(fn),
    removeEventListener: (_type: string, fn: (event: StorageEvent) => void) => listeners.delete(fn),
  }
  /** Another tab wrote the list. */
  const otherTab = (key: string | null, value: string) => {
    if (key) data.set(key, value)
    for (const fn of listeners) fn({ key } as StorageEvent)
  }
  return { win, data, listeners, otherTab }
}

let browser: ReturnType<typeof fakeWindow>

beforeEach(() => {
  browser = fakeWindow()
  vi.stubGlobal('window', browser.win)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createListStore', () => {
  it('reads the stored list and writes under its own key', () => {
    browser.data.set('pk-test', JSON.stringify([{ id: 'a' }]))
    const store = createListStore('pk-test', parse)
    expect(store.get()).toEqual([{ id: 'a' }])
    store.write([{ id: 'a' }, { id: 'b' }])
    expect(JSON.parse(browser.data.get('pk-test')!)).toEqual([{ id: 'a' }, { id: 'b' }])
    expect(browser.data.size).toBe(1)
  })

  it('returns the same array while the stored text is unchanged', () => {
    browser.data.set('pk-test', JSON.stringify([{ id: 'a' }]))
    const store = createListStore('pk-test', parse)
    expect(store.get()).toBe(store.get())
  })

  it('is empty without stored data', () => {
    expect(createListStore('pk-test', parse).get()).toEqual([])
  })

  it('notifies subscribers on write and on a change from another tab', () => {
    const store = createListStore('pk-test', parse)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    store.write([{ id: 'a' }])
    browser.otherTab('pk-test', JSON.stringify([{ id: 'b' }]))
    expect(listener).toHaveBeenCalledTimes(2)
    expect(store.get()).toEqual([{ id: 'b' }])
    unsubscribe()
    expect(browser.listeners.size).toBe(0)
  })

  it('ignores storage events of other keys, but not a full clear (key null)', () => {
    const store = createListStore('pk-test', parse)
    const listener = vi.fn()
    store.subscribe(listener)
    browser.otherTab('pk-other', '[]')
    expect(listener).not.toHaveBeenCalled()
    browser.otherTab(null, '')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('keeps the list in memory when storage cannot be written', () => {
    browser = fakeWindow({ failWrites: true })
    vi.stubGlobal('window', browser.win)
    const store = createListStore('pk-test', parse)
    store.write([{ id: 'a' }])
    expect(store.get()).toEqual([{ id: 'a' }])
  })

  it('keeps the list in memory when storage cannot be read', () => {
    browser = fakeWindow({ failReads: true })
    vi.stubGlobal('window', browser.win)
    const store = createListStore('pk-test', parse)
    store.write([{ id: 'a' }])
    expect(store.get()).toEqual([{ id: 'a' }])
  })

  it('keeps two stores apart (pk-cart and pk-project on one page)', () => {
    const cart = createListStore('pk-a', parse)
    const project = createListStore('pk-b', parse)
    cart.write([{ id: 'x' }])
    expect(project.get()).toEqual([])
  })

  it('sends "added" and "open" events to their listeners only', () => {
    const store = createListStore('pk-test', parse)
    const added = vi.fn()
    const opened = vi.fn()
    const offAdded = store.onAdded(added)
    store.onOpen(opened)
    store.announce('a', 'Strona firmowa')
    store.open()
    expect(added).toHaveBeenCalledWith({ id: 'a', name: 'Strona firmowa' })
    expect(opened).toHaveBeenCalledTimes(1)
    offAdded()
    store.announce('b', 'CRM')
    expect(added).toHaveBeenCalledTimes(1)
  })
})
