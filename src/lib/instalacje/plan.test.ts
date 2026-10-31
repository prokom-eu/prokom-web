import { describe, expect, it } from 'vitest'

import {
  parsePlanAnswers,
  planContact,
  planHashState,
  planSummary,
  questionKeys,
  travelZone,
  type PlanAnswers,
} from './plan'

const charger = {
  model: 'EcoPower Wall',
  punkty: 2,
  mocNaPunkt: '11 kW',
  wyjscie: 'gniazdo Typ 2',
  montaz: 'ściana',
}

const minimal = { services: ['kam'], answers: {}, via: 0 }

describe('questionKeys (prototype QK)', () => {
  it('asks one question per service and the video intercom after the alarm', () => {
    expect(questionKeys(['kam', 'alarm', 'ev'])).toEqual(['kam', 'alarm', 'vd', 'ev'])
    expect(questionKeys([])).toEqual([])
  })
})

describe('parsePlanAnswers', () => {
  it('accepts the answers of the four steps', () => {
    const answers = parsePlanAnswers({
      services: ['kam', 'alarm', 'ev'],
      object: 'pens',
      size: 1,
      stage: 2,
      answers: { kam: 1, alarm: 0, vd: 2, ev: 1 },
      charger,
      via: 2,
      when: 0,
    })
    expect(answers).toMatchObject({ services: ['kam', 'alarm', 'ev'], object: 'pens', via: 2 })
  })

  it('accepts „Nie wiem, doradźcie mi” without services', () => {
    expect(parsePlanAnswers({ services: [], unsure: true, answers: {}, via: 0 })).not.toBeNull()
  })

  it('needs a service or „Nie wiem”, not both', () => {
    expect(parsePlanAnswers({ services: [], answers: {}, via: 0 })).toBeNull()
    expect(parsePlanAnswers({ ...minimal, unsure: true })).toBeNull()
  })

  it('rejects unknown and repeated services, objects and options', () => {
    expect(parsePlanAnswers({ ...minimal, services: ['kam', 'kam'] })).toBeNull()
    expect(parsePlanAnswers({ ...minimal, services: ['x'] })).toBeNull()
    expect(parsePlanAnswers({ ...minimal, object: 'zamek' })).toBeNull()
    expect(parsePlanAnswers({ ...minimal, size: 3 })).toBeNull()
    expect(parsePlanAnswers({ ...minimal, stage: -1 })).toBeNull()
    expect(parsePlanAnswers({ ...minimal, via: 3 })).toBeNull()
    expect(parsePlanAnswers({ ...minimal, when: 1.5 })).toBeNull()
  })

  it('takes answers only to the questions of the chosen services, „Nie wiem” included', () => {
    // kam has 4 options + „Nie wiem” = index 4.
    expect(parsePlanAnswers({ ...minimal, answers: { kam: 4 } })).not.toBeNull()
    expect(parsePlanAnswers({ ...minimal, answers: { kam: 5 } })).toBeNull()
    expect(parsePlanAnswers({ ...minimal, answers: { ev: 0 } })).toBeNull()
    expect(parsePlanAnswers({ ...minimal, answers: { vd: 0 } })).toBeNull()
  })

  it('takes a charger only with the EV service, with sane fields', () => {
    expect(parsePlanAnswers({ ...minimal, charger })).toBeNull()
    const ev = { ...minimal, services: ['ev'] }
    expect(parsePlanAnswers({ ...ev, charger })).not.toBeNull()
    expect(parsePlanAnswers({ ...ev, charger: { ...charger, kolor: 'antracyt' } })).not.toBeNull()
    expect(parsePlanAnswers({ ...ev, charger: { ...charger, punkty: 0 } })).toBeNull()
    expect(parsePlanAnswers({ ...ev, charger: { ...charger, model: 'x'.repeat(121) } })).toBeNull()
    expect(parsePlanAnswers({ ...ev, charger: { ...charger, extra: 1 } })).toBeNull()
    // Free text of the configurator goes into the office e-mail: one line each.
    expect(parsePlanAnswers({ ...ev, charger: { ...charger, model: 'A\nTemat: x' } })).toBeNull()
  })

  it('rejects what is not an answers object', () => {
    expect(parsePlanAnswers(undefined)).toBeNull()
    expect(parsePlanAnswers('kam')).toBeNull()
  })
})

describe('planSummary', () => {
  it('names the answers for people (e-mail and panel)', () => {
    const answers = parsePlanAnswers({
      services: ['kam', 'alarm', 'ev'],
      object: 'pens',
      size: 1,
      stage: 0,
      answers: { kam: 1, alarm: 0, vd: 2, ev: 1 },
      charger: { ...charger, kolor: 'antracyt' },
      via: 1,
      when: 2,
    }) as PlanAnswers
    expect(planSummary(answers, 'Zakopane')).toEqual({
      Instalacje: ['Monitoring i kamery', 'Alarmy i wideodomofony', 'Ładowarki EV'],
      Obiekt: 'Pensjonat',
      Wielkość: 'Średni (pensjonat, firma)',
      Etap: 'Budowa (stan surowy)',
      'Monitoring i kamery — Ile miejsc chcesz obserwować?': '5–8',
      'Alarmy i wideodomofony — Jaki alarm?': 'Przewodowy',
      'Alarmy i wideodomofony — Czy dołożyć wideodomofon?': 'Nie wiem',
      'Ładowarki EV — Jakie masz przyłącze?': '3 fazy',
      Ładowarka: [
        'Model: EcoPower Wall',
        'Punkty ładowania: 2',
        'Moc na punkt: 11 kW',
        'Wyjście: gniazdo Typ 2',
        'Montaż: ściana',
        'Kolor: antracyt',
      ],
      'Strefa dojazdu': 'Zakopane i Tatry',
      'Kontakt przez': 'WhatsApp',
      'Pora kontaktu': 'Obojętnie',
    })
  })

  it('says „Do doradzenia” and leaves out what was not answered', () => {
    const answers = parsePlanAnswers({ services: [], unsure: true, answers: {}, via: 0 })!
    expect(planSummary(answers, undefined)).toEqual({
      Instalacje: 'Do doradzenia',
      'Kontakt przez': 'Telefon',
    })
  })
})

describe('planContact', () => {
  it('maps „Jak się skontaktować?” to the inquiry preference', () => {
    expect(planContact({ via: 0 })).toBe('phone')
    expect(planContact({ via: 1 })).toBe('whatsapp')
    expect(planContact({ via: 2 })).toBe('email')
  })
})

describe('travelZone', () => {
  it('finds the zone like the prototype', () => {
    expect(travelZone('Chabówka')).toBe('Rabka-Zdrój i okolice')
    expect(travelZone('Białka Tatrzańska')).toBe('Zakopane i Tatry')
    expect(travelZone('Nowy Targ')).toBe('Podhale')
    expect(travelZone('Kraków')).toBe('Małopolska · dojazd ustalimy')
    expect(travelZone('  ')).toBeNull()
  })
})

describe('planHashState (#obiekt=&uslugi=&konf=)', () => {
  it('reads the object, the services in planner order and the charger', () => {
    const konf = Buffer.from(JSON.stringify(charger)).toString('base64url')
    expect(planHashState(`#obiekt=biuro&uslugi=ev,kam,ev,xx&konf=${konf}`)).toEqual({
      object: 'firma',
      services: ['kam', 'ev'],
      charger,
    })
  })

  it('maps the object keys of other pages and ignores the rest', () => {
    expect(planHashState('#obiekt=kosc')).toEqual({ object: 'gmina' })
    expect(planHashState('#obiekt=bud')).toEqual({ object: 'dew' })
    expect(planHashState('#obiekt=zamek&uslugi=')).toEqual({})
    expect(planHashState('')).toEqual({})
  })

  it('drops a broken charger and one without the EV service', () => {
    expect(planHashState('#uslugi=ev&konf=nie-json')).toEqual({ services: ['ev'] })
    const konf = Buffer.from(JSON.stringify(charger)).toString('base64url')
    expect(planHashState(`#uslugi=kam&konf=${konf}`)).toEqual({ services: ['kam'] })
  })
})
