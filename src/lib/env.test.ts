import { describe, expect, it } from 'vitest'

import { parseEnv } from './env'

const valid = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://prokom:prokom@127.0.0.1:54320/prokom_web',
  PAYLOAD_SECRET: 'a'.repeat(32),
  PANEL_HOST: 'panel.localhost',
}

describe('parseEnv', () => {
  it('accepts a valid environment', () => {
    expect(parseEnv(valid)).toEqual(valid)
  })

  it('defaults NODE_ENV to development', () => {
    expect(parseEnv({ ...valid, NODE_ENV: undefined }).NODE_ENV).toBe('development')
  })

  it('rejects a missing DATABASE_URL', () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: undefined })).toThrow(/DATABASE_URL/)
  })

  it('rejects a non-postgres DATABASE_URL', () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: 'mongodb://127.0.0.1/db' })).toThrow(
      /DATABASE_URL/,
    )
  })

  it('rejects a too short PAYLOAD_SECRET without printing its value', () => {
    const secret = 'too-short-secret'
    expect(() => parseEnv({ ...valid, PAYLOAD_SECRET: secret })).toThrow(/PAYLOAD_SECRET/)
    expect(() => parseEnv({ ...valid, PAYLOAD_SECRET: secret })).not.toThrow(secret)
  })

  it('normalizes PANEL_HOST', () => {
    expect(parseEnv({ ...valid, PANEL_HOST: 'Panel.Localhost:3000' }).PANEL_HOST).toBe(
      'panel.localhost',
    )
  })

  it('rejects a missing or invalid PANEL_HOST', () => {
    expect(() => parseEnv({ ...valid, PANEL_HOST: undefined })).toThrow(/PANEL_HOST/)
    expect(() => parseEnv({ ...valid, PANEL_HOST: 'https://panel.pro-kom.eu/' })).toThrow(
      /PANEL_HOST/,
    )
  })
})
