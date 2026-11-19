import { describe, expect, it } from 'vitest'

import { emailsWithShop, trustWithAlsenFigure } from './hub_sklep_alsen'

describe('hub data 19.11: shop e-mail and the ALSEN figure', () => {
  it('replaces the unused sklep@pro-kom.pl with sklep@pro-kom.eu, switched on', () => {
    expect(
      emailsWithShop([
        { id: 'a', label: 'Biuro (ogólny)', email: 'biuro@pro-kom.eu', published: true },
        { id: 'b', label: 'Zamówienia', email: 'sklep@pro-kom.pl', published: false },
      ]),
    ).toEqual([
      { id: 'a', label: 'Biuro (ogólny)', email: 'biuro@pro-kom.eu', published: true },
      { id: 'b', label: 'Zamówienia', email: 'sklep@pro-kom.eu', published: true },
    ])
  })

  it('adds the shop address when missing and leaves an existing one as edited', () => {
    expect(emailsWithShop([])).toEqual([
      { label: 'Zamówienia', email: 'sklep@pro-kom.eu', published: true },
    ])
    expect(
      emailsWithShop([{ label: 'Sklep', email: 'sklep@pro-kom.eu', published: false }]),
    ).toBeNull()
  })

  it('approves ALSEN 350+ and nothing else; null when already approved or absent', () => {
    const trust = [
      { value: 'ALSEN 350+', label: 'sklepów sieci ALSEN', approved: false },
      { value: 'ALSEN Rabka', label: 'salon = punkt partnerski ALSEN', approved: false },
    ]
    expect(trustWithAlsenFigure(trust)).toEqual([
      { value: 'ALSEN 350+', label: 'sklepów sieci ALSEN', approved: true },
      { value: 'ALSEN Rabka', label: 'salon = punkt partnerski ALSEN', approved: false },
    ])
    expect(trustWithAlsenFigure(trustWithAlsenFigure(trust))).toBeNull()
    expect(trustWithAlsenFigure([])).toBeNull()
    expect(trustWithAlsenFigure(null)).toBeNull()
  })
})
