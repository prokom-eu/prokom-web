import type { ReactNode } from 'react'
import { connection } from 'next/server'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { splitSentence } from '@/lib/biznes/textParts'
import type { IconName } from '@/lib/catalog/options'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getSharedData } from '@/lib/shared/getSharedData'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import { BZ_H2 } from '@/sites/biznes/typography'

import { LiveHours } from '../home/LiveHours'
import { ContactForm } from './ContactFormLazy'
import { ContactPlace } from './ContactPlace'

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
  /** Topic chips of the form and their label (home page: board „W czym możemy pomóc?”). */
  topics?: readonly string[]
  topicsLabel?: string
  /** Home page (board `#s4-kontakt`): the heading's second sentence on its own line, in the accent. */
  accentSecondSentence?: boolean
  /**
   * Home page (plan 0611 §7.1 pkt 14): the left column shows the location — map, route, phone,
   * address — instead of the channel tiles (`ContactPlace`).
   */
  showLocation?: boolean
  /** Under the lead: the steps of an inquiry as the form's heading (categories, audit P1-2). */
  steps?: ReactNode
  /** Above the form fields, sent with the message (the list „Do zapytania”, `CartAttachment`). */
  prefill?: ReactNode
  /** With `showLocation`: the address map in the left column (off on `/kontakt` — its hero has it). */
  placeMap?: boolean
}

type CardProps = Omit<Props, 'id'> & { headingId: string }

type Channel = { label: string; value: string; href: string; icon: IconName }

/**
 * Navy panel with the channels from the settings and the v20 contact form (ZMIANY-v20 §2.9):
 * home page `#kontakt` (`bzContact`), under the catalog. `/kontakt` puts the same card
 * (`ContactPanelCard`) into the shared template's `#formularz` section — one form for both pages
 * (PREMIUM-1011). The form token carries the render time (minimum fill time), so this section is
 * never served from a cache.
 */
export async function ContactPanel({ id, ...props }: Props) {
  const headingId = `${id}-h`
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-24 py-16 sm:py-24">
      <Container wide>
        <ContactPanelCard {...props} headingId={headingId} />
      </Container>
    </section>
  )
}

/** The card of `ContactPanel` without its section: the navy column and the form. */
export async function ContactPanelCard({
  tenantId,
  headingId,
  heading,
  lead,
  formHeading,
  formNote,
  promises = [],
  successText,
  topics,
  topicsLabel,
  accentSecondSentence = false,
  showLocation = false,
  steps,
  prefill,
  placeMap = true,
}: CardProps) {
  const [first, accent] = accentSecondSentence ? splitSentence(heading) : [heading, null]
  await connection()
  const [settings, company, shared] = await Promise.all([
    getSiteSettings(tenantId),
    getCompanyData(),
    getSharedData(tenantId),
  ])
  const formToken = issueFormToken(getEnv().PAYLOAD_SECRET)
  const phone = settings?.phone ?? null
  const email = settings?.email ?? null
  const location = company?.locations[0]
  const hours = location?.hours ?? []

  const channels: Channel[] = []
  const tel = phone ? toTelHref(phone) : null
  if (phone && tel) channels.push({ label: 'Telefon', value: phone, href: tel, icon: 'phone' })
  if (email) channels.push({ label: 'E-mail', value: email, href: `mailto:${email}`, icon: 'mail' })
  const footer = [location && `${location.street}, ${location.city}`, hoursSummary(hours)]
    .filter(Boolean)
    .join(' · ')
  const place = showLocation ? shared : null

  return (
    <div className="grid overflow-hidden rounded-[30px] bg-card shadow-[0_40px_80px_-50px_var(--glow),inset_0_0_0_1px_var(--border)] min-[1080px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div
        data-surface="dark"
        className="flex flex-col gap-6 bg-surface-dark p-7 text-white sm:p-12"
      >
        <LiveHours hours={hours} className="text-sm text-white" />
        <h2 id={headingId} className={`${BZ_H2} text-white`}>
          {first}
          {accent && (
            <>
              {' '}
              <span className="block text-accent-on-dark">{accent}</span>
            </>
          )}
        </h2>
        {lead && <p className="leading-relaxed text-white/80">{lead}</p>}
        {steps}
        {place && <ContactPlace shared={place} map={placeMap} />}
        {!place && channels.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {channels.map((channel) => (
              <li key={channel.label}>
                <a
                  href={channel.href}
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
                </a>
              </li>
            ))}
          </ul>
        )}
        {!place && footer && (
          <p className="mt-auto border-t border-white/10 pt-5 text-sm text-white/80">{footer}</p>
        )}
      </div>
      <div className="p-7 sm:p-11">
        <ContactForm
          formToken={formToken}
          heading={formHeading}
          note={formNote}
          promises={promises}
          successText={successText}
          topics={topics}
          topicsLabel={topicsLabel}
          prefill={prefill}
          zones={shared?.company.serviceZones ?? []}
        />
      </div>
    </div>
  )
}
