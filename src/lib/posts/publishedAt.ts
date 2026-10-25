type PostData = { _status?: unknown; publishedAt?: unknown }

/**
 * A post published without a date gets „now”: the list, its order and JSON-LD `Article` need
 * the date, and a post without it would never show up (lists take `publishedAt ≤ today`).
 * On update Payload passes the saved fields in `data`, so an empty date here was really
 * cleared — it gets „now” too, never `null`, which would hide a published post.
 */
export function withPublishedAt<T extends PostData>(data: T, now: Date): T {
  if (data._status !== 'published' || data.publishedAt) return data
  return { ...data, publishedAt: now.toISOString() }
}

const WARSAW_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/**
 * Upper bound for „published by now”: the end of today's Polish date, as UTC. The panel stores
 * a day as 12:00 UTC (`dayOnly` picker), so a post dated today is public from the morning,
 * not from 13:00/14:00; a post dated tomorrow (12:00 UTC tomorrow) stays hidden.
 */
export function publishedUntil(now: Date): string {
  return `${WARSAW_DATE.format(now)}T23:59:59.999Z`
}
