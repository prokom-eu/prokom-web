import type { ErrorEvent } from '@sentry/nextjs'
import { describe, expect, it } from 'vitest'

import { scrubEvent, sentryOptions } from './sentry'

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
    expect(options).toMatchObject({
      environment: 'production',
      tracesSampleRate: 0,
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
