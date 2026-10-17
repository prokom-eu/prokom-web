import { describe, expect, it } from 'vitest'

import { createLogger } from './log'

function capture() {
  const lines: string[] = []
  const log = createLogger({
    write: (line) => lines.push(line),
    now: () => new Date(Date.UTC(2026, 9, 17, 12)),
  })
  const parsed = () => lines.map((line) => JSON.parse(line) as Record<string, unknown>)
  return { lines, log, parsed }
}

describe('createLogger', () => {
  it('writes one JSON line with level, time and msg', () => {
    const { lines, log, parsed } = capture()
    log.info({}, 'Hello')
    expect(lines).toHaveLength(1)
    expect(lines[0]).not.toContain('\n')
    expect(parsed()[0]).toEqual({ level: 'info', time: '2026-10-17T12:00:00.000Z', msg: 'Hello' })
  })

  it('adds tenant, requestId and other fields', () => {
    const { log, parsed } = capture()
    log.warn({ tenant: 3, requestId: 'abc12345', inquiry: 7 }, 'Tenant has no notification e-mail')
    expect(parsed()[0]).toMatchObject({
      level: 'warn',
      tenant: 3,
      requestId: 'abc12345',
      inquiry: 7,
      msg: 'Tenant has no notification e-mail',
    })
  })

  it('child loggers carry their bound fields', () => {
    const { log, parsed } = capture()
    log.child({ requestId: 'req-1' }).error({ tenant: 1 }, 'Failed')
    expect(parsed()[0]).toMatchObject({ level: 'error', requestId: 'req-1', tenant: 1 })
  })

  it('keeps the fixed fields from being overwritten', () => {
    const { log, parsed } = capture()
    log.info({ level: 'error', time: 'x', msg: 'y' }, 'Real')
    expect(parsed()[0]).toMatchObject({ level: 'info', msg: 'Real' })
    expect(parsed()[0]?.time).toBe('2026-10-17T12:00:00.000Z')
  })

  it('logs only the class of an error, never its message (it may quote form data)', () => {
    const { lines, log, parsed } = capture()
    log.error({ error: new TypeError('duplicate key: jan@example.test') }, 'Not saved')
    expect(parsed()[0]?.error).toBe('TypeError')
    expect(lines[0]).not.toContain('jan@example.test')
  })

  it('drops undefined fields', () => {
    const { log, parsed } = capture()
    log.info({ tenant: undefined }, 'x')
    expect(parsed()[0]).not.toHaveProperty('tenant')
  })
})
