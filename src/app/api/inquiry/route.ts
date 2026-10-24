import { submitInquiry } from '@/lib/inquiry/submit'
import { REQUEST_ID_HEADER, requestIdFrom } from '@/lib/requestId'

// Above any honest inquiry: a full list (50 items, notes ≤ 500 characters, up to 2 bytes each
// in UTF-8), message ≤ 5000 characters and wizard answers ≤ 8 KB. Larger bodies are not parsed.
const MAX_BODY_BYTES = 96 * 1024

const json = (body: unknown, status: number) => Response.json(body, { status })

/**
 * Client IP for the rate limit. Only `X-Real-IP`, which Nginx overwrites with the connecting
 * address (S9/S10); the first `X-Forwarded-For` entry is whatever the client sent. Without the
 * header (local dev) every request shares one limit.
 */
function clientIp(request: Request): string | null {
  return request.headers.get('x-real-ip')?.trim() || null
}

/**
 * `POST /api/inquiry` — the one entry point for site forms (ADR-003). On site domains the proxy
 * lets through only this method on this path. JSON only: a cross-site page cannot send it
 * without a CORS preflight, which nothing here answers.
 */
export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'unsupported_media_type' }, 415)
  }
  // Cheap refusal by the declared size first; the read body is checked again below
  // (the header may be missing or wrong).
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json({ error: 'too_large' }, 413)
  }
  const raw = await request.text()
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return json({ error: 'too_large' }, 413)
  }
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ error: 'invalid', fields: [] }, 400)
  }

  const result = await submitInquiry(
    { host: request.headers.get('host'), ip: clientIp(request), body },
    { requestId: requestIdFrom(request.headers.get(REQUEST_ID_HEADER)) },
  )
  // The number is what the customer quotes on the phone (success screen of `/zapytanie`).
  if (result.ok) return json({ ok: true, number: result.number }, 201)
  switch (result.error) {
    case 'unknown_host':
      return json({ error: 'not_found' }, 404)
    case 'rate_limited':
      return json({ error: 'rate_limited' }, 429)
    case 'unavailable':
      return json({ error: 'unavailable' }, 503)
    case 'spam':
      return json({ error: 'rejected' }, 400)
    case 'invalid':
      return json({ error: 'invalid', fields: result.fields }, 400)
  }
}
