import type { Payload } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { companyDataKept, writeCompanyData } from './companyData'

/** A Payload stub with the stored company data and a spy on `updateGlobal`. */
const stub = (stored: Record<string, unknown>) => {
  const updateGlobal = vi.fn()
  const payload = { findGlobal: vi.fn(async () => stored), updateGlobal } as unknown as Payload
  return { payload, updateGlobal }
}

describe('company data in a line import (ADR-027: production keeps its own)', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('SEED_KEEP_COMPANY_DATA=1 keeps it; anything else writes', () => {
    expect(companyDataKept({ SEED_KEEP_COMPANY_DATA: '1' })).toBe(true)
    expect(companyDataKept({})).toBe(false)
    expect(companyDataKept({ SEED_KEEP_COMPANY_DATA: '0' })).toBe(false)
  })

  it('writes a different value, skips the same one', async () => {
    vi.stubEnv('SEED_KEEP_COMPANY_DATA', '')
    const count = vi.fn()
    const changed = stub({ name: 'Stara nazwa' })
    await writeCompanyData(changed.payload, { name: 'PRO-KOM' }, 'company-data shared', count)
    expect(changed.updateGlobal).toHaveBeenCalledTimes(1)
    expect(count).toHaveBeenLastCalledWith('company-data shared', 'updated')

    const same = stub({ name: 'PRO-KOM' })
    await writeCompanyData(same.payload, { name: 'PRO-KOM' }, 'company-data shared', count)
    expect(same.updateGlobal).not.toHaveBeenCalled()
    expect(count).toHaveBeenLastCalledWith('company-data shared', false)
  })

  it('kept: never writes, only reports the difference', async () => {
    vi.stubEnv('SEED_KEEP_COMPANY_DATA', '1')
    const count = vi.fn()
    const { payload, updateGlobal } = stub({ name: 'Edytowane w panelu produkcji' })
    await writeCompanyData(payload, { name: 'PRO-KOM' }, 'company-data shared', count)
    expect(updateGlobal).not.toHaveBeenCalled()
    expect(count).toHaveBeenLastCalledWith('company-data shared (kept, differs)', false)
  })
})
