import { describe, expect, it } from 'vitest'

import { environmentFor, hostForEnvironment, origin, portOf, protocolOf } from './origin'

const domains = [
  { host: 'prokombiznes.pl', environment: 'production' as const },
  { host: 'staging.prokombiznes.pl', environment: 'staging' as const },
  { host: 'biznes.localhost', environment: 'local' as const },
]

describe('environmentFor', () => {
  it('maps a production build to production domains, anything else to local ones', () => {
    expect(environmentFor('production')).toBe('production')
    expect(environmentFor('development')).toBe('local')
    expect(environmentFor(undefined)).toBe('local')
  })
})

describe('hostForEnvironment', () => {
  it('picks the domain of the environment', () => {
    expect(hostForEnvironment(domains, 'local')).toBe('biznes.localhost')
    expect(hostForEnvironment(domains, 'production')).toBe('prokombiznes.pl')
  })

  it('returns null without such a domain', () => {
    expect(hostForEnvironment(domains.slice(0, 1), 'local')).toBeNull()
    expect(hostForEnvironment(null, 'local')).toBeNull()
  })
})

describe('protocolOf', () => {
  it('trusts the proxy header first, then the request', () => {
    expect(protocolOf('https', 'http:')).toBe('https')
    expect(protocolOf('https, http', 'http:')).toBe('https')
    expect(protocolOf(null, 'http:')).toBe('http')
    expect(protocolOf(null, 'https:')).toBe('https')
  })

  it('falls back to https for anything unexpected', () => {
    expect(protocolOf('ftp', 'gopher:')).toBe('https')
  })
})

describe('origin', () => {
  it('builds an origin with an optional port', () => {
    expect(origin('http', 'biznes.localhost', '3000')).toBe('http://biznes.localhost:3000')
    expect(origin('https', 'prokombiznes.pl', '')).toBe('https://prokombiznes.pl')
  })
})

describe('portOf', () => {
  it('reads the port of a Host header', () => {
    expect(portOf('panel.localhost:3000')).toBe('3000')
    expect(portOf('panel.pro-kom.eu')).toBe('')
    expect(portOf(null)).toBe('')
    expect(portOf('panel.localhost:abc')).toBe('')
  })
})
