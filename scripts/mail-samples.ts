/**
 * `pnpm mail:samples <address>` — the 6 sample e-mails (3 lines × confirmation and notification,
 * spec MAILE §7) to one address, each through its line's real sender (`sendLineEmail`): locally to
 * Mailpit (`localhost:8025`). Refuses on production. Contact data from the panel of this database.
 */
import { getPayload } from 'payload'

import { getEnv } from '../src/lib/env'
import { toMailContext } from '../src/lib/mail/context'
import { lineCopy } from '../src/lib/mail/lineCopy'
import { mailLogo } from '../src/lib/mail/logo'
import { SAMPLE_LINES, sampleMails } from '../src/lib/mail/samples'
import { sendLineEmail } from '../src/lib/mail/send'
import { toSharedData } from '../src/lib/shared/project'
import config from '../src/payload.config'

const to = process.argv[2]
if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
  console.error('Użycie: pnpm mail:samples <adres e-mail>')
  process.exit(2)
}
const env = getEnv()
if (env.SITE_ENV === 'production') {
  console.error('mail:samples nie działa na produkcji (SITE_ENV=production).')
  process.exit(2)
}

const payload = await getPayload({ config })
let failed = false
try {
  const local = { depth: 0, overrideAccess: true } as const
  const company = await payload.findGlobal({ slug: 'company-data', ...local })
  for (const line of SAMPLE_LINES) {
    const {
      docs: [tenant],
    } = await payload.find({
      collection: 'tenants',
      where: { line: { equals: line } },
      limit: 1,
      ...local,
    })
    const {
      docs: [settings],
    } = tenant
      ? await payload.find({
          collection: 'site-settings',
          where: { tenant: { equals: tenant.id } },
          limit: 1,
          ...local,
        })
      : { docs: [] }
    const shared = toSharedData(company, settings ?? null)
    const domain = shared?.lines.find((item) => item.key === line)?.domain
    const context = toMailContext(shared, domain ? `https://${domain}` : null, tenant?.name ?? line)
    const copy = lineCopy(line)
    const mails = sampleMails(line, {
      context,
      logo: mailLogo(copy.logo, copy.label, env.MAIL_LOGO_BASE_URL),
      to,
      panelUrl: `https://${env.PANEL_HOST}/admin`,
    })
    for (const [kind, mail] of Object.entries(mails)) {
      try {
        await sendLineEmail(payload, line, mail)
        console.log(`${line} ${kind}: wysłane`)
      } catch (error) {
        failed = true
        console.error(`${line} ${kind}: BŁĄD ${error instanceof Error ? error.name : typeof error}`)
      }
    }
  }
} finally {
  await payload.destroy()
}
process.exit(failed ? 1 : 0)
