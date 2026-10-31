import Link from 'next/link'
import { connection } from 'next/server'

import { Container } from '@/components/ui/Container'
import type { IconName } from '@/lib/catalog/options'
import { getEnv } from '@/lib/env'
import { FIELD_MESSAGES } from '@/lib/inquiry/form'
import { SOFTWARE_CONTACT_MESSAGES } from '@/lib/inquiry/contactForm'
import { issueFormToken } from '@/lib/inquiry/spam'
import { SOFTWARE_TOPIC_LABELS, type SoftwareTopic } from '@/lib/inquiry/types'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { getSoftwareWizard } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import type { SwContactBlock as SwContactBlockData } from '@/payload-types'
import { softwareTextContext } from '@/sites/software/components/textContext'

import { ContactForm } from './ContactForm'

type Props = { block: SwContactBlockData; tenantId: number }

/** Icons of the topics (board `Main`). */
const TOPIC_ICONS: Record<SoftwareTopic, IconName> = {
  strona: 'site',
  system: 'panel',
  mobile: 'phone',
  laczenie: 'plug',
  opieka: 'lifebuoy',
  audyt: 'search',
}

const TOPICS = (Object.keys(SOFTWARE_TOPIC_LABELS) as SoftwareTopic[]).map((value) => ({
  value,
  label: SOFTWARE_TOPIC_LABELS[value],
  icon: TOPIC_ICONS[value],
}))

/**
 * „Kontakt” of the Software start page (`#kontakt`, spec. §4 pkt 12, board `Main`): dark side
 * with the promises (facts filled; one with a missing fact is left out on production), the audit
 * card and the line's phone, next to the contact form. Errors „no contact” and „no consent” use
 * the wizard's texts (spec. §7.2); the form token carries the render time, so never cached.
 */
export async function SwContactBlock({ block, tenantId }: Props) {
  await connection()
  const [settings, wizard, context] = await Promise.all([
    getSiteSettings(tenantId),
    getSoftwareWizard(tenantId),
    softwareTextContext(tenantId),
  ])
  const fill = (text: string | null | undefined) => (text ? fillText(text, context) : null)
  const eyebrow = fill(block.eyebrow)
  const title = fill(block.title)
  const sideTitle = fill(block.sideTitle)
  if (!eyebrow || !title || !sideTitle) return null

  const promises = (block.promises ?? []).flatMap((promise) => {
    const text = fill(promise.text)
    return text ? [{ id: promise.id, text }] : []
  })
  const auditTitle = fill(block.auditTitle)
  const audit = auditTitle && block.auditHref ? { title: auditTitle, href: block.auditHref } : null
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  const email = settings?.email ?? null
  const phoneCaption = [fill(block.phoneCaption), email].filter(Boolean).join(' · ')
  const alternativeLink =
    block.alternativeLink?.label && block.alternativeLink.href
      ? { label: block.alternativeLink.label, href: block.alternativeLink.href }
      : null

  return (
    // `data-final-cta`: the page ends with this CTA — the footer drops its CTA band (SWR2).
    <section
      id="kontakt"
      data-final-cta
      className="scroll-mt-24 py-12 min-[640px]:pt-20 min-[640px]:pb-[110px]"
    >
      <Container wide className="flex flex-col gap-6 min-[640px]:gap-7">
        <div className="mx-auto flex max-w-[820px] flex-col items-center gap-2.5 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text min-[640px]:text-sm">
            {eyebrow}
          </p>
          <h2 className="font-display text-[32px] font-extrabold leading-[1.02] tracking-tight min-[640px]:text-5xl min-[1081px]:text-[56px]">
            {title}
          </h2>
        </div>

        <div className="grid overflow-hidden rounded-[26px] border border-border bg-card shadow-raised min-[641px]:rounded-[32px] min-[1081px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col gap-[22px] bg-surface-dark px-[18px] py-[22px] text-white min-[641px]:p-[clamp(28px,4vw,48px)]">
            <p className="font-display text-[26px] font-extrabold leading-[1.05] min-[641px]:text-[30px]">
              {sideTitle}
            </p>
            {fill(block.sideText) ? (
              <p className="text-[15.5px] leading-relaxed text-white/80">{fill(block.sideText)}</p>
            ) : null}
            {promises.length > 0 ? (
              <ul className="flex flex-col gap-2.5 text-[15px]">
                {promises.map((promise, index) => (
                  <li key={promise.id ?? index} className="flex items-center gap-2.5">
                    <i aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-ok" />
                    {promise.text}
                  </li>
                ))}
              </ul>
            ) : null}
            {audit ? (
              <Link
                href={audit.href}
                className="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-0.5 rounded-2xl bg-white/[0.07] px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] transition-colors hover:bg-white/[0.12]"
              >
                <b className="text-[15px]">{audit.title}</b>
                {fill(block.auditText) ? (
                  <span className="col-start-1 text-[13px] leading-snug text-white/80">
                    {fill(block.auditText)}
                  </span>
                ) : null}
                <span
                  aria-hidden="true"
                  className="col-start-2 row-span-2 row-start-1 self-center font-extrabold text-accent-on-dark"
                >
                  →
                </span>
              </Link>
            ) : null}
            {phone && tel ? (
              <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-[18px]">
                <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-accent-on-dark">
                  Telefon
                </span>
                <a href={tel} className="text-2xl font-extrabold hover:underline">
                  {phone}
                </a>
                {phoneCaption ? (
                  <span className="text-[13px] text-white/80">{phoneCaption}</span>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="px-[18px] py-[22px] min-[641px]:p-[clamp(24px,3.5vw,44px)]">
            <ContactForm
              texts={{
                topicsLabel: block.topicsLabel,
                messageLabel: block.messageLabel,
                messagePlaceholder: block.messagePlaceholder ?? null,
                nameLabel: block.nameLabel,
                namePlaceholder: block.namePlaceholder ?? null,
                contactLabel: block.contactLabel,
                contactPlaceholder: block.contactPlaceholder ?? null,
                submit: block.submit,
                alternative: block.alternative ?? null,
                alternativeLink,
              }}
              topics={TOPICS}
              initialTopic="system"
              errors={{
                ...SOFTWARE_CONTACT_MESSAGES,
                contact: wizard?.send.contact.any.error ?? FIELD_MESSAGES.email,
                consent: wizard?.send.errors.consent ?? FIELD_MESSAGES.consent,
              }}
              formToken={issueFormToken(getEnv().PAYLOAD_SECRET)}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
