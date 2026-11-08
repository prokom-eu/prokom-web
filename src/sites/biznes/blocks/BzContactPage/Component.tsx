import { headers } from 'next/headers'
import { connection } from 'next/server'

import { ContactPage } from '@/components/shared/ContactPage'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { siteOrigin } from '@/lib/seo/origin'
import { getSharedData } from '@/lib/shared/getSharedData'

import { CartAttachment } from '../../components/contact/CartAttachment'

type Props = { tenantId: number }

/**
 * `/kontakt` of Biznes (plan 0611 §8.2) = the shared Kontakt template on `shared.contact`: phone
 * first, the salon card (Rabka only), „Z czym dzwonisz?” (4 matters, each picks the form's topic
 * through `?temat=`), the form with the inquiry list attached, service area, the other lines, FAQ.
 */
export async function BzContactPageBlock({ tenantId }: Props) {
  // The form token carries the render time (minimum fill time), so never from a cache.
  await connection()
  const env = getEnv()
  const [shared, host] = await Promise.all([
    getSharedData(tenantId),
    headers().then((h) => h.get('host')),
  ])
  if (!shared) return null
  return (
    <ContactPage
      shared={shared}
      line="biznes"
      origin={siteOrigin(host, env.SITE_ENV) ?? ''}
      now={new Date().toISOString()}
      formToken={issueFormToken(env.PAYLOAD_SECRET)}
      slots={{ formPrefill: <CartAttachment /> }}
    />
  )
}
