import { describe, expect, it } from 'vitest'

import { INSTALACJE_CATALOG_CATEGORY, inquiryCategory } from './category'

describe('inquiryCategory (ADR-029 pkt 5)', () => {
  it('marks the catalog list of Instalacje as „Instalacje · Sprzęt”', () => {
    expect(INSTALACJE_CATALOG_CATEGORY).toBe('Instalacje · Sprzęt')
    expect(inquiryCategory('instalacje', 'list', undefined)).toBe('Instalacje · Sprzęt')
    expect(inquiryCategory('instalacje', 'search', undefined)).toBe('Instalacje · Sprzęt')
  })

  it('keeps a category the form sent', () => {
    expect(inquiryCategory('instalacje', 'list', 'Architekci · projekt')).toBe(
      'Architekci · projekt',
    )
  })

  it('leaves Biznes and other inquiry types unchanged', () => {
    expect(inquiryCategory('biznes', 'list', undefined)).toBeUndefined()
    expect(inquiryCategory('instalacje', 'contact', undefined)).toBeUndefined()
    expect(inquiryCategory('instalacje', 'wizard', undefined)).toBeUndefined()
  })
})
