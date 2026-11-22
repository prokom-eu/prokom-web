import { describe, expect, it } from 'vitest'

import { instContactUpdate, INST_PHONE, INST_PHONE2 } from './inst_kontakt_telefony'

describe('inst_kontakt_telefony (Krystian 22.11)', () => {
  it('drops „+48”, adds the second number and removes „Zgłoś awarię”', () => {
    const shared = {
      phoneLabel: 'Instalacje:',
      brandBarSlot: { label: 'Zgłoś awarię', href: '/serwis#zglos' },
    }
    expect(instContactUpdate({ phone: '+48 889 003 889', phone2: null, shared } as never)).toEqual({
      phone: INST_PHONE,
      phone2: INST_PHONE2,
      shared: { ...shared, brandBarSlot: { label: null, href: null } },
    })
  })

  it('keeps what the panel already changed; a second run changes nothing', () => {
    expect(
      instContactUpdate({
        phone: '18 123 45 67',
        phone2: '600 000 000',
        shared: { brandBarSlot: { label: 'Serwis', href: '/serwis' } },
      } as never),
    ).toBeNull()
    expect(
      instContactUpdate({
        phone: INST_PHONE,
        phone2: INST_PHONE2,
        shared: { brandBarSlot: { label: null, href: null } },
      } as never),
    ).toBeNull()
  })
})

describe('inst_kontakt_telefony — facts', () => {
  it('drops the fact that repeats the response promise, keeps the others', () => {
    const facts = [
      { kind: 'email', label: 'E-mail' },
      { kind: 'text', label: 'Zaplanuj', value: '4 kroki online' },
      { kind: 'text', label: 'Odpowiedź', value: 'Do 24 h w dni robocze' },
    ]
    const update = instContactUpdate({
      phone: INST_PHONE,
      phone2: INST_PHONE2,
      shared: { contact: { facts } },
    } as never)
    expect(update?.shared?.contact?.facts).toEqual(facts.slice(0, 2))
  })
})
