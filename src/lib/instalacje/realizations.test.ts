import { describe, expect, it } from 'vitest'

import { leadPhoto, matchRealization, publishWithoutConsent } from './realizations'

describe('publishWithoutConsent', () => {
  it('refuses publishing without the client consent', () => {
    expect(publishWithoutConsent({ _status: 'published', clientConsent: false })).toBe(true)
    expect(publishWithoutConsent({ _status: 'published' })).toBe(true)
  })

  it('allows publishing with the consent', () => {
    expect(publishWithoutConsent({ _status: 'published', clientConsent: true })).toBe(false)
  })

  it('allows drafts without the consent', () => {
    expect(publishWithoutConsent({ _status: 'draft', clientConsent: false })).toBe(false)
    expect(publishWithoutConsent({ clientConsent: false })).toBe(false)
  })

  it('takes the consent of the stored document when the save does not send it', () => {
    expect(publishWithoutConsent({ _status: 'published' }, { clientConsent: true })).toBe(false)
  })

  it('refuses unticking the consent of a published realization', () => {
    expect(
      publishWithoutConsent(
        { _status: 'published', clientConsent: false },
        { _status: 'published', clientConsent: true },
      ),
    ).toBe(true)
  })

  it('takes the status of the stored document when the save does not send it', () => {
    expect(
      publishWithoutConsent(
        { clientConsent: false },
        { _status: 'published', clientConsent: true },
      ),
    ).toBe(true)
    expect(
      publishWithoutConsent({ clientConsent: false }, { _status: 'draft', clientConsent: true }),
    ).toBe(false)
  })
})

describe('matchRealization (round v5: photos on object and service pages)', () => {
  const list = [
    'Blachotrapez',
    'Parafia św. Teresy',
    'Empik',
    'Restauracja „Aleksandra”',
    'Caffe Europa',
    'Parafia Narodzenia św. Jana Chrzciciela (Jasna Górka)',
    'Szkoła Podstawowa im. Adama Mickiewicza',
    'Dom prywatny',
  ].map((title) => ({ title }))
  const match = (name: string) => matchRealization(name, list)?.title

  it('finds the realization by its distinctive words', () => {
    expect(match('Blachotrapez')).toBe('Blachotrapez')
    expect(match('Restauracja i dom weselny „Aleksandra”')).toBe('Restauracja „Aleksandra”')
    expect(match('Parafia św. Teresy, chór')).toBe('Parafia św. Teresy')
    expect(match('Jasna Górka, Ślemień')).toBe(
      'Parafia Narodzenia św. Jana Chrzciciela (Jasna Górka)',
    )
    expect(match('Parafia Narodzenia św. Jana Chrzciciela')).toBe(
      'Parafia Narodzenia św. Jana Chrzciciela (Jasna Górka)',
    )
    expect(match('Szkoła Podstawowa im. Adama Mickiewicza')).toBe(
      'Szkoła Podstawowa im. Adama Mickiewicza',
    )
    expect(match('Empik Zakopane i Kraków')).toBe('Empik')
  })

  it('does not match on generic words only', () => {
    expect(match('Salon PRO-KOM')).toBeUndefined()
    expect(match('Parafia w Zakopanem')).toBeUndefined()
    expect(match('Kaplica Sióstr Nazaretanek')).toBeUndefined()
  })
})

describe('leadPhoto (round v5: the cover that fits the card)', () => {
  const photos = [
    { alt: 'Sala konferencyjna Blachotrapezu: projektor na uchwycie sufitowym' },
    { alt: 'Sala szkoleniowa w Ponicach: ekran w ramie' },
    { alt: 'Puszka podłogowa z gniazdami przy stanowisku' },
    { alt: 'Sala biurowa na poddaszu z puszkami przyłączy w podłodze' },
  ]
  const first = (text: string) => leadPhoto(text, photos)[0]?.alt

  it('puts first the photo whose description shares the most words with the card', () => {
    expect(first('Ponice · sala szkoleniowa')).toBe('Sala szkoleniowa w Ponicach: ekran w ramie')
    // Both desk photos fit (one word each): either, never the conference room.
    expect([photos[2]?.alt, photos[3]?.alt]).toContain(first('Rabka-Zdrój · stanowiska biurowe'))
    expect(leadPhoto('Ponice · sala szkoleniowa', photos)).toHaveLength(4)
  })

  it('keeps the order when nothing fits', () => {
    expect(first('Nowy Sącz · kawiarnia')).toBe(photos[0]?.alt)
  })
})
