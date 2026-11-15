import config from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { getEnv } from '@/lib/env'
import { toMailContext } from '@/lib/mail/context'
import { lineCopy } from '@/lib/mail/lineCopy'
import { mailLogo } from '@/lib/mail/logo'
import { senderFor } from '@/lib/mail/senders'
import { SAMPLE_LINES, sampleMails, type SampleLine } from '@/lib/mail/samples'
import { siteOrigin } from '@/lib/seo/origin'
import { getSharedData } from '@/lib/shared/getSharedData'

import { requireTenant } from '../tenant'

type Props = { params: Promise<{ domain: string }> }

export const metadata: Metadata = {
  title: 'Maile linii — podgląd',
  robots: { index: false, follow: false },
}

/** Shared data of the first tenant of each line — the contact a real mail of that line gets. */
async function lineContexts() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'tenants',
    where: { line: { in: [...SAMPLE_LINES] } },
    depth: 0,
    limit: 20,
    select: { name: true, line: true },
    overrideAccess: true,
  })
  return Promise.all(
    SAMPLE_LINES.map(async (line) => {
      const tenant = docs.find((doc) => doc.line === line)
      const shared = tenant ? await getSharedData(tenant.id) : null
      const domain = shared?.lines.find((item) => item.key === line)?.domain
      return {
        line,
        context: toMailContext(shared, domain ? `https://${domain}` : null, tenant?.name ?? line),
      }
    }),
  )
}

/**
 * `/_maile` — the line e-mails on sample data (spec MAILE §7): 3 lines × confirmation and
 * notification, HTML in a frame and the text part. Local and staging only (404 on production),
 * `noindex`, not in the sitemap. The logo comes from this site (`/brand/mail/…`), as a browser
 * cannot show `cid:` attachments.
 */
export default async function MailPreviewPage({ params }: Props) {
  await requireTenant(params)
  const env = getEnv()
  if (env.SITE_ENV === 'production') notFound()
  const host = (await headers()).get('host')
  const origin = siteOrigin(host, env.SITE_ENV) ?? undefined
  const contexts = await lineContexts()
  const sentAt = new Date()

  return (
    // The site layout already has the `<main>` landmark.
    <div className="mx-auto max-w-[1320px] px-6 py-12 font-sans">
      <h1 className="text-3xl font-extrabold">Maile linii — podgląd</h1>
      <p className="mt-2 text-sm opacity-80">
        Dane klienta przykładowe; telefon, e-mail i dane firmy z panelu (Dane firmy, Ustawienia
        stron). Wysyłka próbna: <code>pnpm mail:samples &lt;adres&gt;</code>.
      </p>
      {contexts.map(({ line, context }) => (
        <LineMails
          key={line}
          line={line}
          mails={sampleMails(line, {
            context,
            logo: mailLogo(lineCopy(line).logo, lineCopy(line).label, origin),
            panelUrl: `${siteOrigin(env.PANEL_HOST, env.SITE_ENV) ?? ''}/admin`,
            replyAddress: senderFor(line, env).address,
            sentAt,
          })}
          missing={!context}
        />
      ))}
    </div>
  )
}

function LineMails({
  line,
  mails,
  missing,
}: {
  line: SampleLine
  mails: ReturnType<typeof sampleMails>
  missing: boolean
}) {
  return (
    <section className="mt-12" aria-labelledby={`maile-${line}`}>
      <h2 id={`maile-${line}`} className="text-2xl font-extrabold">
        {lineCopy(line).label}
      </h2>
      {missing && (
        <p role="alert" className="mt-2 text-sm">
          Brak danych wspólnych tej linii — uruchom <code>pnpm seed</code>.
        </p>
      )}
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        {(['confirmation', 'notification'] as const).map((kind) => {
          const mail = mails[kind]
          return (
            <figure key={kind} className="m-0">
              <figcaption className="mb-2 text-sm">
                <b>{kind === 'confirmation' ? 'Potwierdzenie' : 'Powiadomienie'}</b> · od „
                {mail.fromName}” · temat „{mail.subject}”
              </figcaption>
              <iframe
                title={`${lineCopy(line).label} — ${kind === 'confirmation' ? 'potwierdzenie' : 'powiadomienie'}`}
                srcDoc={mail.html}
                sandbox=""
                className="h-[900px] w-full max-w-[640px] rounded-2xl border"
              />
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-bold">Część tekstowa</summary>
                <pre className="mt-2 max-w-[640px] overflow-x-auto text-xs whitespace-pre-wrap">
                  {mail.text}
                </pre>
              </details>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
