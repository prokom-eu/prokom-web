import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { Payload } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { upsertK4Page, type PageBlock } from './page'
import {
  backupLayout,
  blockTypes,
  describeLayout,
  hasSeedLayout,
  pagesToReplace,
} from './replacePages'

const blocks = (...types: string[]) => types.map((blockType) => ({ blockType })) as PageBlock[]

describe('pagesToReplace (--zamien-strony / ZAMIEN_STRONY, runbook §2a)', () => {
  it('nothing named: nothing is replaced', () => {
    expect(pagesToReplace([], {}).size).toBe(0)
    expect(pagesToReplace(['--zamien-strony='], { ZAMIEN_STRONY: ' , ' }).size).toBe(0)
  })

  it('the flag, then the variable; spaces ignored', () => {
    expect([...pagesToReplace(['node', 'x', '--zamien-strony=gopos, insert'], {})]).toEqual([
      'gopos',
      'insert',
    ])
    expect([...pagesToReplace([], { ZAMIEN_STRONY: 'o-firmie,kontakt ' })]).toEqual([
      'o-firmie',
      'kontakt',
    ])
    expect([...pagesToReplace(['--zamien-strony=gopos'], { ZAMIEN_STRONY: 'kontakt' })]).toEqual([
      'gopos',
    ])
  })
})

describe('layout helpers', () => {
  it('the same block types in order = already the seed layout', () => {
    expect(hasSeedLayout(blocks('bzSection', 'faq'), blocks('bzSection', 'faq'))).toBe(true)
    expect(hasSeedLayout(blocks('bzOrderFlow', 'faq'), blocks('bzSection', 'faq'))).toBe(false)
    expect(blockTypes(null)).toEqual([])
  })

  it('describes a layout for the report', () => {
    expect(describeLayout(blocks('bzSection', 'bzSection', 'faq'))).toBe('3 bl. (bzSection×2, faq)')
    expect(describeLayout([])).toBe('0 bl. (—)')
  })

  it('appends the old layout to tmp/strony-backup-<date>.json', () => {
    const dir = mkdtempSync(join(tmpdir(), 'strony-'))
    const now = new Date('2026-11-09T20:00:00Z')
    backupLayout('gopos', blocks('bzOrderFlow'), dir, now)
    const file = backupLayout('insert', blocks('faq'), dir, now)
    expect(file).toMatch(/strony-backup-2026-11-09\.json$/)
    const saved = JSON.parse(readFileSync(file, 'utf8')) as { slug: string }[]
    expect(saved.map((entry) => entry.slug)).toEqual(['gopos', 'insert'])
  })
})

describe('upsertK4Page with a page named for replacement', () => {
  const seed = blocks('bzSection', 'bzSection', 'faq')
  const fakePayload = (layout: PageBlock[]) => {
    const update = vi.fn(async () => ({}))
    const payload = {
      find: vi.fn(async () => ({ docs: [{ id: 6, layout, seo: {} }] })),
      update,
      create: vi.fn(),
    } as unknown as Payload
    return { payload, update }
  }
  const page = { slug: 'gopos', title: 'GoPOS', layout: seed }

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('without the flag an old page stays (looks edited in the panel)', async () => {
    vi.stubEnv('ZAMIEN_STRONY', '')
    const { payload, update } = fakePayload(blocks('bzOrderFlow', 'faq'))
    expect(await upsertK4Page(payload, 1, page, () => {})).toBe(false)
    expect(update).not.toHaveBeenCalled()
  })

  it('with the flag the old page gets the seed layout, and the report says before → after', async () => {
    vi.stubEnv('ZAMIEN_STRONY', 'gopos')
    vi.spyOn(process, 'cwd').mockReturnValue(mkdtempSync(join(tmpdir(), 'seed-')))
    const { payload, update } = fakePayload(blocks('bzOrderFlow', 'faq'))
    const notes: string[] = []
    const done = await upsertK4Page(
      payload,
      1,
      page,
      () => {},
      (_what, item) => notes.push(item),
    )
    expect(done).toBe(true)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 6, data: { layout: seed, _status: 'published' } }),
    )
    expect(notes[0]).toMatch(/^gopos: 2 bl\. \(bzOrderFlow, faq\) → 3 bl\. \(bzSection×2, faq\)/)
  })

  it('after the replacement the page also gets the seed SEO description (one run is enough)', async () => {
    vi.stubEnv('ZAMIEN_STRONY', 'gopos')
    vi.spyOn(process, 'cwd').mockReturnValue(mkdtempSync(join(tmpdir(), 'seed-')))
    const { payload, update } = fakePayload(blocks('bzOrderFlow', 'faq'))
    const description =
      'GoPOS w Rabce-Zdroju: system dla gastronomii z wdrożeniem i serwisem na miejscu.'
    await upsertK4Page(payload, 1, { ...page, description }, () => {})
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ seo: { description } }) }),
    )
  })

  it('a second run on the replaced page changes nothing', async () => {
    vi.stubEnv('ZAMIEN_STRONY', 'gopos')
    const { payload, update } = fakePayload(seed)
    expect(await upsertK4Page(payload, 1, page, () => {})).toBe(true)
    expect(update).not.toHaveBeenCalled()
  })
})
