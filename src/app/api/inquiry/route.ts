import { submitInquiry } from '@/lib/inquiry/submit'

// Far above any honest inquiry (message ≤ 5000 characters); larger bodies are not parsed.
const MAX_BODY_BYTES = 32 * 1024

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

  const result = await submitInquiry({
    host: request.headers.get('host'),
    ip: clientIp(request),
    body,
  })
  if (result.ok) return json({ ok: true }, 201)
  switch (result.error) {
    case 'unknown_host':
      return json({ error: 'not_found' }, 404)
    case 'rate_limited':
      return json({ error: 'rate_limited' }, 429)
    case 'spam':
      return json({ error: 'rejected' }, 400)
    case 'invalid':
      return json({ error: 'invalid', fields: result.fields }, 400)
  }
}
