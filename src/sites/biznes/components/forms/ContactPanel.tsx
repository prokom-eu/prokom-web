import { connection } from 'next/server'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref, toWhatsAppHref } from '@/lib/site/link'

import { LiveHours } from '../home/LiveHours'
import { ContactForm } from './ContactForm'

type Props = {
  tenantId: number
  /** Anchor of the section, e.g. `kontakt` on the home page (link „Zgłoś awarię”). */
  id: string
  heading: string
  lead?: string | null
  formHeading?: string | null
  formNote?: string | null
  promises?: string[]
  successText?: string | null
}

type Channel = { label: string; value: string; href: string; icon: IconName; external?: boolean }

/**
 * Navy panel with the channels from the settings and the v20 contact form (ZMIANY-v20 §2.9):
 * home page `#kontakt` (`bzContact`), under the catalog and on `/kontakt`. The form token
 * carries the render time (minimum fill time), so this section is never served from a cache.
 */
export async function ContactPanel({
  tenantId,
  id,
  heading,
  lead,
  formHeading,
  formNote,
  promises = [],
  successText,
}: Props) {
  await connection()
  const [settings, company] = await Promise.all([getSiteSettings(tenantId), getCompanyData()])
  const formToken = issueFormToken(getEnv().PAYLOAD_SECRET)
  const phone = settings?.phone ?? null
  const whatsapp = settings?.biznes?.whatsapp ?? null
  const email = settings?.email ?? null
  const location = company?.locations[0]
  const hours = location?.hours ?? []

  const channels: Channel[] = []
  const tel = phone ? toTelHref(phone) : null
  if (phone && tel) channels.push({ label: 'Telefon', value: phone, href: tel, icon: 'phone' })
  const wa = whatsapp ? toWhatsAppHref(whatsapp) : null
  if (whatsapp && wa) {
    channels.push({ label: 'WhatsApp', value: whatsapp, href: wa, icon: 'chat', external: true })
  }
  if (email) channels.push({ label: 'E-mail', value: email, href: `mailto:${email}`, icon: 'mail' })
  const footer = [location && `${location.street}, ${location.city}`, hoursSummary(hours)]
    .filter(Boolean)
    .join(' · ')
  const headingId = `${id}-h`

  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-24 py-16 sm:py-24">
      <Container wide>
        <div className="grid overflow-hidden rounded-[30px] bg-card shadow-[0_40px_80px_-50px_var(--glow),inset_0_0_0_1px_var(--border)] min-[1080px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div
            data-surface="dark"
            className="flex flex-col gap-6 bg-surface-dark p-7 text-white sm:p-12"
          >
            <LiveHours hours={hours} className="text-sm text-white" />
            <h2
              id={headingId}
              className="font-display text-[clamp(1.9rem,3vw,2.6rem)] leading-[1.05] font-extrabold text-white"
            >
              {heading}
            </h2>
            {lead && <p className="leading-relaxed text-white/80">{lead}</p>}
            {channels.length > 0 && (
              <ul className="flex flex-col gap-2.5">
                {channels.map((channel) => (
                  <li key={channel.label}>
                    <a
                      href={channel.href}
                      {...(channel.external ? { rel: 'noopener', target: '_blank' } : {})}
                      className="flex items-center gap-4 rounded-2xl bg-white/5 px-4 py-3 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_12%,transparent)] hover:bg-white/10"
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-10 items-center justify-center rounded-xl bg-white/10"
                      >
                        <Icon name={channel.icon} className="size-5" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[13px] text-white/80">{channel.label}</span>
                        <span className="font-extrabold">{channel.value}</span>
                      </span>
                      {channel.external && (
                        <span className="sr-only"> (otwiera się w nowej karcie)</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {footer && (
              <p className="mt-auto border-t border-white/10 pt-5 text-sm text-white/80">
                {footer}
              </p>
            )}
          </div>
          <div className="p-7 sm:p-11">
            <ContactForm
              formToken={formToken}
              heading={formHeading}
              note={formNote}
              promises={promises}
              successText={successText}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
