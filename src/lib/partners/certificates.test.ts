import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  APPLE_PROGRAM_NOTE,
  APPLE_PROGRAMS,
  CERTIFICATES,
  CERTIFICATES_SPAN,
  certificateLabel,
} from './certificates'

describe('certificates (boss consent 23.11.2026)', () => {
  it('lists the five documents, newest first', () => {
    expect(CERTIFICATES.map((item) => item.id)).toEqual([
      'samsung-silver-2023',
      'samsung-gold-2022',
      'dell-2022',
      'samsung-vd-2018',
      'samsung-signage-2018',
    ])
  })

  it('every file it points to is in public/', () => {
    for (const item of CERTIFICATES) {
      for (const src of [item.image.src, item.image.thumb]) {
        expect(src).toMatch(/^\/certyfikaty\/[\w-]+\.webp$/)
        expect(existsSync(join('public', src))).toBe(true)
      }
    }
  })

  it('every partner status has expired — none ends after today’s date of the decision', () => {
    for (const item of CERTIFICATES.filter((cert) => cert.kind === 'status')) {
      expect(item.validTo < '2026-11-23').toBe(true)
    }
  })

  it('labels a status as history with its years, a training with its year', () => {
    expect(certificateLabel(CERTIFICATES[0]!)).toBe('Status partnerski · 2023–2024')
    expect(certificateLabel(CERTIFICATES[3]!)).toBe('Szkolenie · 2018')
  })

  it('spans the years of the documents', () => {
    expect(CERTIFICATES_SPAN).toBe('2018–2024')
  })
})

describe('Apple programmes (iLeader, AB — sales and deployments only)', () => {
  const texts = [
    APPLE_PROGRAM_NOTE,
    ...APPLE_PROGRAMS.flatMap((item) => [item.title, item.lead, item.text]),
  ].join(' ')

  it('are DEP, CTO and AppleCare+', () => {
    expect(APPLE_PROGRAMS.map((item) => item.key)).toEqual(['dep', 'cto', 'applecare'])
  })

  it('never suggest an Apple service authorisation', () => {
    expect(texts).not.toMatch(/autoryz|serwis/i)
    expect(APPLE_PROGRAM_NOTE).toContain('iLeader')
    expect(APPLE_PROGRAM_NOTE).toContain('AB')
  })
})
