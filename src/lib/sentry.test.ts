import type { ErrorEvent } from '@sentry/nextjs'
import { describe, expect, it } from 'vitest'

import { scrubEvent, scrubMessage, sentryOptions } from './sentry'

describe('sentryOptions', () => {
  it('is off without a DSN', () => {
    expect(sentryOptions({ SITE_ENV: 'staging' })).toBeUndefined()
    expect(sentryOptions({ SITE_ENV: 'staging', SENTRY_DSN: '' })).toBeUndefined()
  })

  it('collects no personal data and no traces', () => {
    const options = sentryOptions({
      SITE_ENV: 'production',
      SENTRY_DSN: 'https://key@o1.ingest.de.sentry.io/1',
    })
    expect(options).not.toHaveProperty('tracesSampleRate')
    expect(options).toMatchObject({
      environment: 'production',
      dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: false,
        httpBodies: [],
        urlQueryParams: false,
        databaseQueryData: false,
        stackFrameVariables: false,
      },
    })
    expect(options?.beforeBreadcrumb?.({ message: 'x' }, undefined)).toBeNull()
  })
})

describe('scrubEvent', () => {
  it('drops request details, user, breadcrumbs and extras but keeps the error', () => {
    const event: ErrorEvent = {
      type: undefined,
      exception: { values: [{ type: 'Error', value: 'boom' }] },
      user: { email: 'jan@example.com', ip_address: '1.2.3.4' },
      breadcrumbs: [{ message: 'tel 600 100 200' }],
      extra: { body: 'Imię: Jan' },
      request: {
        url: 'https://prokombiznes.pl/zapytanie?email=jan@example.com',
        method: 'POST',
        data: { message: 'Proszę o kontakt' },
        cookies: { session: 'x' },
        headers: { cookie: 'x' },
        query_string: 'email=jan@example.com',
      },
    }
    const scrubbed = scrubEvent(event)
    expect(scrubbed.exception).toEqual(event.exception)
    expect(scrubbed.request).toEqual({ url: 'https://prokombiznes.pl/zapytanie', method: 'POST' })
    expect(scrubbed.user).toBeUndefined()
    expect(scrubbed.breadcrumbs).toBeUndefined()
    expect(scrubbed.extra).toBeUndefined()
    expect(JSON.stringify(scrubbed)).not.toMatch(/jan@example\.com|600 100 200|Jan|kontakt/)
  })
})

describe('scrubMessage', () => {
  it('drops the parameters of a failed drizzle query', () => {
    const message =
      'Failed query: insert into "inquiries" ("email", "phone", "message") values ($1, $2, $3)\nparams: jan@example.com,600100200,Proszę o kontakt'
    const scrubbed = scrubMessage(message)
    expect(scrubbed).toContain('Failed query: insert into "inquiries"')
    expect(scrubbed).toContain('params: [removed]')
    expect(scrubbed).not.toMatch(/jan@example\.com|600100200|kontakt/)
  })

  it('masks e-mails, phone numbers and values quoted by the database', () => {
    expect(scrubMessage('cannot send to jan.kowalski@firma.pl')).toBe('cannot send to [email]')
    expect(scrubMessage('call +48 600 100 200 or 18-267-12-34')).toBe('call [phone] or [phone]')
    expect(scrubMessage('invalid input syntax for type integer: "Jan Kowalski"')).toBe(
      'invalid input syntax for type integer: "[value]"',
    )
    expect(scrubMessage('Key (email)=(jan@example.com) already exists.')).toBe(
      'Key (email)=([value]) already exists.',
    )
  })

  it('keeps ordinary error text', () => {
    expect(scrubMessage("Cannot read properties of undefined (reading 'slug')")).toBe(
      "Cannot read properties of undefined (reading 'slug')",
    )
  })
})

describe('scrubEvent and error messages', () => {
  it('scrubs the message and every exception value, linked causes included', () => {
    const event: ErrorEvent = {
      type: undefined,
      message: 'mail to jan@example.com failed',
      exception: {
        values: [
          { type: 'DatabaseError', value: 'Key (email)=(jan@example.com) already exists.' },
          { type: 'DrizzleQueryError', value: 'Failed query: select 1\nparams: 600100200' },
        ],
      },
    }
    const scrubbed = scrubEvent(event)
    expect(JSON.stringify(scrubbed)).not.toMatch(/jan@example\.com|600100200/)
    expect(scrubbed.exception?.values?.[0]?.type).toBe('DatabaseError')
  })
})
