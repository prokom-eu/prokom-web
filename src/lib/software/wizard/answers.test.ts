import { describe, expect, it } from 'vitest'

import { WIZARD_V3 as w } from '../../../seed/software/wizard'
import { parseWizardAnswers, wizardMessage, wizardRecord } from './answers'
import { EMPTY_ANSWERS } from './flow'

const raw = (more: Record<string, unknown>) => ({ ...EMPTY_ANSWERS, ...more })

describe('wizard v3 — answers from the browser (checked against the tenant rules)', () => {
  it('accepts a full path of each group', () => {
    const paths = [
      raw({ type: 'firmowa', industry: 'nocleg', picks: { have: ['logo'], feat: ['nocleg-1'] } }),
      raw({ type: 'przebudowa', picks: { redo: ['dostepy'], fix: ['google'] }, url: 'stara.pl' }),
      raw({ type: 'system', picks: { today: ['excel'], sysf: ['czas'] }, size: '4-10' }),
      raw({ type: 'automatyzacje', picks: { auto: ['ai'], prog: ['excel'] } }),
      raw({ type: 'nie-wiem', picks: { desc: ['start'] }, description: 'Wszystko ginie.' }),
    ]
    for (const answers of paths) expect(parseWizardAnswers(w, answers)).toEqual(answers)
  })

  it.each([
    ['no kind', raw({})],
    ['unknown kind', raw({ type: 'sklep' })],
    ['a team size outside the system group', raw({ type: 'firmowa', size: '1-3' })],
    ['a pick the group does not ask', raw({ type: 'firmowa', picks: { sysf: ['czas'] } })],
    ['an unknown option', raw({ type: 'firmowa', picks: { have: ['nic'] } })],
    ['another industry’s feature', raw({ type: 'firmowa', picks: { feat: ['gastro-1'] } })],
    ['„od zera” with other things', raw({ type: 'firmowa', picks: { have: ['zero', 'logo'] } })],
    ['an address outside przebudowa', raw({ type: 'system', url: 'x.pl' })],
    ['a description outside idk', raw({ type: 'system', description: 'x' })],
    ['an unknown industry', raw({ type: 'system', industry: 'kosmos' })],
    ['an extra key', { ...raw({ type: 'system' }), addOns: ['sms'] }],
    ['a repeated option', raw({ type: 'system', picks: { sysf: ['czas', 'czas'] } })],
  ])('rejects %s', (_, answers) => {
    expect(parseWizardAnswers(w, answers)).toBeNull()
  })
})

describe('wizard v3 — the inquiry', () => {
  const answers = raw({
    type: 'system',
    industry: 'bud',
    picks: { today: ['excel'], sysf: ['czas', 'raporty'] },
    size: '11-30',
    note: 'Pilne, przed sezonem.',
  })

  it('stores the answers named in Polish, one per line of the mail', () => {
    expect(wizardRecord(w, answers)).toEqual({
      Rodzaj: 'System dla firmy',
      Branża: 'Budowlanka i remonty',
      Dziś: ['Excel i arkusze'],
      'System ma': ['Czas pracy', 'Raporty dla szefa'],
      Użytkownicy: ['11–30 osób'],
      Uwagi: 'Pilne, przed sezonem.',
    })
  })

  it('keeps the address and the description of their groups', () => {
    expect(wizardRecord(w, raw({ type: 'przebudowa', url: 'stara.pl' }))).toEqual({
      Rodzaj: 'Przebudowa starej strony',
      'Adres strony': 'stara.pl',
    })
    expect(wizardRecord(w, raw({ type: 'nie-wiem', description: 'Ginie.' }))).toEqual({
      Rodzaj: 'Nie wiem jeszcze',
      Opis: 'Ginie.',
    })
  })

  it('writes the message: the kind, then the client’s own words', () => {
    expect(wizardMessage(w, answers)).toBe('Kreator: System dla firmy\n\nPilne, przed sezonem.')
    expect(
      wizardMessage(w, raw({ type: 'nie-wiem', description: 'Ginie.', note: 'Tel. po 15.' })),
    ).toBe('Kreator: Nie wiem jeszcze\n\nGinie.\n\nTel. po 15.')
  })
})
