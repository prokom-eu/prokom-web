import { describe, expect, it } from 'vitest'

import { parseEnv } from './env'

const valid = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://prokom:prokom@127.0.0.1:54320/prokom_web',
  PAYLOAD_SECRET: 'a'.repeat(32),
  PANEL_HOST: 'panel.localhost',
  SMTP_HOST: '127.0.0.1',
  SMTP_PORT: '1025',
  MAIL_FROM_ADDRESS: 'formularz@example.test',
}

const defaults = {
  MEDIA_DIR: 'media',
  SITE_ENV: 'local',
  SMTP_PORT: 1025,
  SMTP_SECURE: false,
  MAIL_FROM_NAME: 'PRO-KOM',
  INQUIRY_RETENTION_MONTHS: 24,
}

describe('parseEnv', () => {
  it('accepts a valid environment', () => {
    expect(parseEnv(valid)).toEqual({ ...valid, ...defaults })
  })

  it('requires the SMTP server and the sender address (ADR-003)', () => {
    expect(() => parseEnv({ ...valid, SMTP_HOST: undefined })).toThrow(/SMTP_HOST/)
    expect(() => parseEnv({ ...valid, SMTP_PORT: undefined })).toThrow(/SMTP_PORT/)
    expect(() => parseEnv({ ...valid, MAIL_FROM_ADDRESS: undefined })).toThrow(/MAIL_FROM_ADDRESS/)
  })

  it('reads SMTP credentials and TLS', () => {
    const env = parseEnv({
      ...valid,
      SMTP_PORT: '465',
      SMTP_SECURE: 'true',
      SMTP_USER: 'formularz',
      SMTP_PASS: 'x'.repeat(16),
    })
    expect(env).toMatchObject({ SMTP_PORT: 465, SMTP_SECURE: true, SMTP_USER: 'formularz' })
  })

  it('rejects an invalid SMTP_PORT or SMTP_SECURE', () => {
    expect(() => parseEnv({ ...valid, SMTP_PORT: 'smtp' })).toThrow(/SMTP_PORT/)
    expect(() => parseEnv({ ...valid, SMTP_SECURE: 'yes' })).toThrow(/SMTP_SECURE/)
  })

  it('rejects an invalid MAIL_FROM_ADDRESS', () => {
    expect(() => parseEnv({ ...valid, MAIL_FROM_ADDRESS: 'PRO-KOM <a@b.pl>' })).toThrow(
      /MAIL_FROM_ADDRESS/,
    )
  })

  it('reads the inquiry retention in months', () => {
    expect(parseEnv({ ...valid, INQUIRY_RETENTION_MONTHS: '12' }).INQUIRY_RETENTION_MONTHS).toBe(12)
    expect(() => parseEnv({ ...valid, INQUIRY_RETENTION_MONTHS: '0' })).toThrow(
      /INQUIRY_RETENTION_MONTHS/,
    )
  })

  it('accepts staging as SITE_ENV', () => {
    expect(parseEnv({ ...valid, SITE_ENV: 'staging' }).SITE_ENV).toBe('staging')
  })

  it('rejects an unknown SITE_ENV', () => {
    expect(() => parseEnv({ ...valid, SITE_ENV: 'prod' })).toThrow(/SITE_ENV/)
  })

  it('accepts a custom MEDIA_DIR', () => {
    expect(parseEnv({ ...valid, MEDIA_DIR: '/data/media' }).MEDIA_DIR).toBe('/data/media')
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
