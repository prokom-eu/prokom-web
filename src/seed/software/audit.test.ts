import { describe, expect, it } from 'vitest'

import factsPackage from '../../../seed/prokomsoftware/fakty.json'
import { SW_AUDIT, SW_AUDIT_FAQ, softwareAuditLayout } from './audit'

describe('Software /audyt of the seed (SW11a)', () => {
  it('is the audit block and the 5 audit questions', () => {
    expect(softwareAuditLayout().map((block) => block.blockType)).toEqual(['swAuditForm', 'faq'])
    expect(SW_AUDIT_FAQ.items).toHaveLength(5)
  })

  it('asks for „Imię” besides the board fields (ADR-014 rozstrz. SW0 6)', () => {
    expect(SW_AUDIT.nameLabel).toBe('Imię')
  })

  it('has five checks and the report card, three steps, a button per audit kind', () => {
    expect(SW_AUDIT.checks).toHaveLength(6)
    expect(SW_AUDIT.steps).toHaveLength(3)
    expect(SW_AUDIT.levelButtons).toHaveLength(3)
  })

  it('holds no price of its own and only facts the package knows', () => {
    const json = JSON.stringify([SW_AUDIT, SW_AUDIT_FAQ])
    expect(json).not.toMatch(/\d[\d\s\u00a0]*zł/)
    const facts = factsPackage.facts as Record<string, string | null>
    for (const [, key] of json.matchAll(/\[([A-ZĄĆĘŁŃÓŚŹŻ ]+)\]/g))
      expect(facts).toHaveProperty(key!)
  })
})
