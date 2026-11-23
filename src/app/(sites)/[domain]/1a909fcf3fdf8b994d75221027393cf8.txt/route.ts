import { INDEXNOW_KEY } from '@/lib/seo/indexnow'

import { findTenant } from '../tenant'

type Context = { params: Promise<{ domain: string }> }

/**
 * IndexNow key file (ADR-030): the folder name is the key, the body repeats it. Only on a known
 * domain — an unknown host stays 404 like every other address.
 */
export async function GET(_request: Request, { params }: Context) {
  const tenant = await findTenant(params)
  if (!tenant) return new Response('Not Found', { status: 404 })
  return new Response(INDEXNOW_KEY, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
