import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE } from '@/lib/inquiry/consent'

import {
  type PlanState,
  planBody,
  planError,
  planProgress,
  plannerHref,
  phoneDigits,
  travelZone,
} from './quickPlan'

const EMPTY: PlanState = {
  services: [],
  object: null,
  town: '',
  name: '',
  phone: '',
  consent: false,
}

describe('travelZone (Main.js zone)', () => {
  it.each([
    ['Rabka-Zdrój', 'Rabka-Zdrój i okolice'],
    ['  jordanów ', 'Rabka-Zdrój i okolice'],
    ['Mszana Dolna', 'Rabka-Zdrój i okolice'],
    ['Zakopane', 'Zakopane i Tatry'],
    ['Białka Tatrzańska', 'Zakopane i Tatry'],
    ['Bukowina', 'Zakopane i Tatry'],
    ['Nowy Targ', 'Podhale'],
    ['Szaflary', 'Podhale'],
    ['Czorsztyn', 'Podhale'],
    ['Limanowa', 'Małopolska · dojazd ustalimy'],
    ['Kraków', 'Małopolska · dojazd ustalimy'],
  ])('%s → %s', (town, zone) => {
    expect(travelZone(town)).toBe(zone)
  })

  it('has no zone without a town', () => {
    expect(travelZone('')).toBeNull()
    expect(travelZone('  ,. ')).toBeNull()
  })
})

describe('phoneDigits', () => {
  it('counts digits only', () => {
    expect(phoneDigits('+48 600-100 200')).toBe(11)
    expect(phoneDigits('')).toBe(0)
  })
})

describe('planError — in the order of the form', () => {
  const ready: PlanState = {
    ...EMPTY,
    services: ['kam'],
    name: 'Anna',
    phone: '600 100 200',
    consent: true,
  }

  it('asks for a service first', () => {
    expect(planError({ ...ready, services: [] })).toBe('services')
  })

  it('then the name, the phone (9 digits) and the consent', () => {
    expect(planError({ ...ready, name: '  ' })).toBe('name')
    expect(planError({ ...ready, phone: '600 100 20' })).toBe('phone')
    expect(planError({ ...ready, consent: false })).toBe('consent')
  })

  it('passes a complete form (object and town optional, like the prototype)', () => {
    expect(planError(ready)).toBeNull()
  })
})

describe('planProgress (ticket ring)', () => {
  it('counts the five parts of the prototype', () => {
    expect(planProgress(EMPTY)).toBe(0)
    expect(planProgress({ ...EMPTY, services: ['kam'] })).toBe(20)
    expect(planProgress({ ...EMPTY, services: ['kam'], object: 'dom', town: 'Zakopane' })).toBe(60)
    expect(
      planProgress({
        services: ['kam'],
        object: 'dom',
        town: 'Zakopane',
        name: '',
        phone: '600100200',
        consent: true,
      }),
    ).toBe(100)
  })
})

describe('plannerHref (fullHref)', () => {
  it('carries the object and the services to the full planner', () => {
    expect(plannerHref({ object: 'pens', services: ['kam', 'wifi'] })).toBe(
      '/zaplanuj#obiekt=pens&uslugi=kam,wifi',
    )
  })

  it('maps office and hall to the planner’s company', () => {
    expect(plannerHref({ object: 'hala', services: [] })).toBe('/zaplanuj#obiekt=firma')
  })

  it('is the bare planner without choices', () => {
    expect(plannerHref({ object: null, services: [] })).toBe('/zaplanuj')
  })
})

describe('planBody (POST /api/inquiry)', () => {
  const body = planBody(
    {
      services: ['kam', 'wifi'],
      object: 'pens',
      town: ' Zakopane ',
      name: ' Anna ',
      phone: '600 100 200',
      consent: true,
    },
    {
      href: 'https://instalacje.example/?utm_source=fb&gclid=x',
      formToken: 'token',
      website: '',
    },
  )

  it('is a contact inquiry of the home page with services, town and phone', () => {
    expect(body).toMatchObject({
      type: 'contact',
      category: 'Instalacje — strona główna',
      topics: ['kam', 'wifi'],
      city: 'Zakopane',
      name: 'Anna',
      phone: '600 100 200',
      consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
      website: '',
      formToken: 'token',
      source: { url: 'https://instalacje.example/', utmSource: 'fb' },
    })
  })

  it('says the object and the zone in the message (a contact needs one)', () => {
    expect(body.message).toBe(
      'Prośba o oddzwonienie ze strony głównej.\nObiekt: Pensjonat lub apartamenty\nStrefa dojazdu: Zakopane i Tatry',
    )
  })

  it('still has a message without object and town', () => {
    const bare = planBody(
      { ...EMPTY, services: ['ev'], name: 'Jan', phone: '600100200', consent: true },
      { href: 'https://instalacje.example/', formToken: 't', website: '' },
    )
    expect(bare.message).toBe('Prośba o oddzwonienie ze strony głównej.')
    expect(bare.topics).toEqual(['ev'])
    expect(bare).not.toHaveProperty('city')
  })
})
