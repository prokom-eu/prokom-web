import { describe, expect, it, vi } from 'vitest'

import { deleteExpiredInquiries, isExpired, retentionCutoff } from './retention'

const now = new Date('2026-10-17T03:00:00.000Z')

describe('retentionCutoff', () => {
  it('goes back whole months', () => {
    expect(retentionCutoff(now, 24).toISOString()).toBe('2024-10-17T03:00:00.000Z')
    expect(retentionCutoff(now, 1).toISOString()).toBe('2026-09-17T03:00:00.000Z')
  })

  it('stops at the end of a shorter month instead of overflowing', () => {
    expect(retentionCutoff(new Date('2026-03-31T00:00:00.000Z'), 1).toISOString()).toBe(
      '2026-02-28T00:00:00.000Z',
    )
    expect(retentionCutoff(new Date('2028-02-29T00:00:00.000Z'), 24).toISOString()).toBe(
      '2026-02-28T00:00:00.000Z',
    )
  })
})

describe('isExpired (ADR-003)', () => {
  const cutoff = retentionCutoff(now, 24)
  const old = '2024-10-01T00:00:00.000Z'
  const recent = '2025-06-01T00:00:00.000Z'

  it('expires closed inquiries whose status changed before the cutoff', () => {
    expect(isExpired({ status: 'closed', statusChangedAt: old }, cutoff)).toBe(true)
  })

  it('keeps recently closed inquiries', () => {
    expect(isExpired({ status: 'closed', statusChangedAt: recent }, cutoff)).toBe(false)
  })

  it.each(['new', 'in_progress'] as const)('never expires %s inquiries, however old', (status) => {
    expect(isExpired({ status, statusChangedAt: old }, cutoff)).toBe(false)
  })

  it('keeps a closed inquiry without the change date (safe default)', () => {
    expect(isExpired({ status: 'closed', statusChangedAt: null }, cutoff)).toBe(false)
  })
})

describe('deleteExpiredInquiries', () => {
  const docs = [
    { id: 1, status: 'closed' as const, statusChangedAt: '2023-01-01T00:00:00.000Z' },
    { id: 2, status: 'closed' as const, statusChangedAt: '2026-10-01T00:00:00.000Z' },
    { id: 3, status: 'new' as const, statusChangedAt: '2020-01-01T00:00:00.000Z' },
    { id: 4, status: 'in_progress' as const, statusChangedAt: '2020-01-01T00:00:00.000Z' },
  ]

  it('deletes only old closed inquiries and reports the count', async () => {
    const remove = vi.fn(async (ids: number[]) => ids.length)
    const result = await deleteExpiredInquiries({
      now,
      months: 24,
      findClosed: async () => docs.filter((doc) => doc.status === 'closed'),
      remove,
    })
    expect(remove).toHaveBeenCalledWith([1])
    expect(result).toEqual({ deleted: 1 })
  })

  it('does not call delete when nothing expired', async () => {
    const remove = vi.fn(async (ids: number[]) => ids.length)
    const result = await deleteExpiredInquiries({
      now,
      months: 24,
      findClosed: async () => [docs[1]!],
      remove,
    })
    expect(remove).not.toHaveBeenCalled()
    expect(result).toEqual({ deleted: 0 })
  })
})
