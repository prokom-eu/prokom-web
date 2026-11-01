import Image from 'next/image'
import Link from 'next/link'
import { connection } from 'next/server'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { SectionData } from '@/lib/biznes/pages/sections'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary, weekHours } from '@/lib/site/hoursSummary'
import { toTelHref, toWhatsAppHref } from '@/lib/site/link'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'

import { AreaMap } from '../../../components/AreaMap'
import { Breadcrumbs, type Crumb } from '../../../components/Breadcrumbs'
import { ContactForm } from '../../../components/forms/ContactForm'
import { LiveHours } from '../../../components/home/LiveHours'
import {
  BTN_OUTLINE,
  BTN_PRIMARY,
  CARD,
  EYEBROW,
  H2,
  HeadingText,
  SectionShell,
  sectionId,
} from '../ui'
import { WeekHours } from './WeekHours'

/** Contact data of the panel the K4i sections share: phones, e-mail, address, hours. */
async function contactData(tenantId: number) {
  const [settings, company] = await Promise.all([getSiteSettings(tenantId), getCompanyData()])
  const phone = settings?.phone ?? null
  const location = company?.locations[0] ?? null
  // The line's second phone; `CompanyData` phones are shared by all lines.
  const phone2 = settings?.phone2 ?? null
  const whatsapp = settings?.biznes?.whatsapp ?? null
  return {
    company,
    phone,
    tel: phone ? toTelHref(phone) : null,
    phone2,
    phone2Tel: phone2 ? toTelHref(phone2) : null,
    email: settings?.email ?? null,
    whatsapp: whatsapp ? toWhatsAppHref(whatsapp) : null,
    whatsappNumber: whatsapp,
    location,
    hours: location?.hours ?? [],
    address: location ? `${location.street}, ${location.postalCode} ${location.city}` : null,
  }
}

/**
 * O firmie hero (K34 §7, plansza Web-OFirmie): pill, H1, lead, „Zadzwoń” and „Jak pracujemy”,
 * four figures; on the right the business card from the panel, four authorization logos (full
 * statuses — K4-FINAL §1) and the link to the public register.
 */
export async function AboutHero({
  block,
  data,
  index,
  crumbs,
  tenantId,
}: {
  block: BzSectionData
  data: SectionData<'about-hero'>
  index: CatalogIndex
  crumbs: readonly Crumb[]
  tenantId: number
}) {
  const c = await contactData(tenantId)
  const logos = data.authorizations.map((item) => ({
    ...item,
    name: item.brand.charAt(0).toUpperCase() + item.brand.slice(1),
    brand: index.brands.find((brand) => brand.slug === item.brand),
  }))
  return (
    <section aria-labelledby="o-firmie-h" className="bg-surface-2 pt-6 pb-14 sm:pt-8 sm:pb-20">
      <Container wide>
        <div className="mb-7">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="grid items-start gap-10 min-[1080px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 text-ink">
            <p
              className={cx(
                EYEBROW,
                'inline-flex items-center gap-2 self-start rounded-full bg-card px-3.5 py-2 text-accent-text shadow-[inset_0_0_0_1px_var(--border)]',
              )}
            >
              <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
              {data.pill}
            </p>
            <h1
              id="o-firmie-h"
              className="font-display text-[clamp(2.2rem,4.2vw,3.8rem)] leading-[1] font-extrabold tracking-[-0.025em] font-stretch-110% text-balance"
            >
              {block.heading || crumbs.at(-1)?.name}{' '}
              {block.headingAccent && (
                <em className="text-accent-text not-italic">{block.headingAccent}</em>
              )}
            </h1>
            {block.lead && (
              <p className="max-w-[60ch] text-[clamp(1.0625rem,1.3vw,1.2rem)] leading-relaxed text-pretty text-ink-2">
                {block.lead}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {c.phone && c.tel && (
                <a href={c.tel} className={BTN_PRIMARY}>
                  Zadzwoń: {c.phone}
                </a>
              )}
              {data.actions.map((action) => (
                <a key={action.href} href={action.href} className={BTN_OUTLINE}>
                  {action.label}
                </a>
              ))}
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t border-border pt-5 min-[640px]:grid-cols-4">
              {data.stats.map((stat) => (
                <div key={stat.k} className="flex flex-col-reverse gap-1">
                  <dt className="text-[14px] leading-snug text-ink-2">{stat.k}</dt>
                  <dd className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-none font-extrabold">
                    {stat.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={cx(CARD, 'flex flex-col gap-5 p-6 text-ink sm:p-7')}>
            <p className={cx(EYEBROW, 'text-ink-2')}>Dane firmy</p>
            <dl className="grid gap-x-5 gap-y-2.5 text-[15px] min-[480px]:grid-cols-[110px_1fr]">
              {c.company?.name && (
                <>
                  <dt className="text-ink-2">Firma</dt>
                  <dd className="font-bold">{c.company.name}</dd>
                </>
              )}
              {c.address && (
                <>
                  <dt className="text-ink-2">Adres</dt>
                  <dd className="font-bold">{c.address}</dd>
                </>
              )}
              {c.company?.nip && (
                <>
                  <dt className="text-ink-2">NIP</dt>
                  <dd className="font-bold">{c.company.nip}</dd>
                </>
              )}
              {(c.phone || c.phone2) && (
                <>
                  <dt className="text-ink-2">Telefon</dt>
                  <dd className="font-bold">
                    {c.phone && c.tel && (
                      <a href={c.tel} className="hover:underline">
                        {c.phone}
                      </a>
                    )}
                    {c.phone2 && c.phone2Tel && (
                      <>
                        {' · '}
                        <a href={c.phone2Tel} className="hover:underline">
                          {c.phone2}
                        </a>
                      </>
                    )}
                  </dd>
                </>
              )}
              {c.email && (
                <>
                  <dt className="text-ink-2">E-mail</dt>
                  <dd className="font-bold">
                    <a href={`mailto:${c.email}`} className="hover:underline">
                      {c.email}
                    </a>
                  </dd>
                </>
              )}
              {c.hours.length > 0 && (
                <>
                  <dt className="text-ink-2">Godziny</dt>
                  <dd className="font-bold">{hoursSummary(c.hours)}</dd>
                </>
              )}
            </dl>
            <ul className="grid grid-cols-2 gap-3 min-[640px]:grid-cols-4">
              {logos.map((item) => (
                <li
                  key={item.status + (item.brand?.slug ?? '')}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-surface-2 p-3 text-center"
                >
                  <span className="flex h-9 items-center">
                    {item.brand?.logo ? (
                      <Image
                        unoptimized
                        src={item.brand.logo.url}
                        alt={item.brand.name}
                        width={item.brand.logo.width}
                        height={item.brand.logo.height}
                        className="h-auto max-h-8 w-auto max-w-[96px] object-contain"
                      />
                    ) : (
                      <b className="font-extrabold">{item.brand?.name ?? item.name}</b>
                    )}
                  </span>
                  <small className="text-[12.5px] leading-tight font-bold text-ink-2">
                    {item.status}
                  </small>
                </li>
              ))}
            </ul>
            <a
              href={data.register.href}
              rel="noopener"
              target="_blank"
              className="inline-flex min-h-11 items-center gap-2 font-extrabold text-accent-text hover:underline"
            >
              {data.register.label}
              <span className="sr-only"> (otwiera się w nowej karcie)</span>
            </a>
            {data.photoNote && (
              <p className="rounded-2xl bg-surface-2 px-4 py-3 text-[14px] text-ink-2">
                {data.photoNote}
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

/** Lines of PRO-KOM: one card each, the current line marked „Jesteś tutaj”. */
export function LinesSection({
  block,
  data,
}: {
  block: BzSectionData
  data: SectionData<'lines'>
}) {
  return (
    <SectionShell block={block}>
      <ul className="grid gap-4 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
        {data.lines.map((line) => {
          const card = (
            <>
              <span className="flex items-center justify-between gap-3">
                <span className="font-display text-[13px] font-extrabold tracking-[0.06em] uppercase">
                  PRO-KOM {line.n}
                </span>
                {line.here && (
                  <em className="rounded-full bg-accent-text px-2.5 py-1 text-[12px] font-extrabold text-accent-ink not-italic">
                    Jesteś tutaj
                  </em>
                )}
              </span>
              <b className="font-display text-[1.15rem] leading-tight font-extrabold">{line.t}</b>
              <span className="text-[15px] leading-relaxed text-ink-2">{line.d}</span>
              <small className="text-[13px] text-ink-2">{line.w}</small>
              <span className="mt-auto pt-2 text-[14px] font-extrabold text-accent-text">
                {line.u}
              </span>
            </>
          )
          return (
            <li key={line.n}>
              {line.here ? (
                <div
                  className={cx(
                    CARD,
                    'flex h-full flex-col gap-2 p-5 text-ink shadow-[inset_0_0_0_2px_var(--accent-text)]',
                  )}
                >
                  {card}
                </div>
              ) : (
                <a
                  href={`https://${line.u}`}
                  rel="noopener"
                  target="_blank"
                  className={cx(
                    CARD,
                    'flex h-full flex-col gap-2 p-5 text-ink hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                  )}
                >
                  {card}
                  <span className="sr-only"> (otwiera się w nowej karcie)</span>
                </a>
              )}
            </li>
          )
        })}
      </ul>
      {data.note && <p className="mt-5 text-[14px] text-ink-2">{data.note}</p>}
    </SectionShell>
  )
}

/** „Autoryzacje i partnerzy”: groups of brands — logos from Partners, names where none. */
export function BrandsSection({
  block,
  data,
  index,
}: {
  block: BzSectionData
  data: SectionData<'brands'>
  index: CatalogIndex
}) {
  const byName = new Map(index.brands.map((brand) => [brand.name.toLowerCase(), brand]))
  return (
    <SectionShell
      block={block}
      aside={
        data.action ? (
          <Link href={data.action.href} className={BTN_OUTLINE}>
            {data.action.label}
          </Link>
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        {data.groups.map((group) => (
          <div key={group.k} className="flex flex-col gap-3">
            <h3 className="font-extrabold text-ink">{group.k}</h3>
            <ul className="flex flex-wrap gap-3">
              {group.names.map((name) => {
                const brand = byName.get(name.toLowerCase())
                return (
                  <li
                    key={name}
                    className="flex h-16 min-w-[120px] items-center justify-center rounded-2xl bg-card px-4 shadow-[inset_0_0_0_1px_var(--border)]"
                  >
                    {brand?.logo ? (
                      <Image
                        unoptimized
                        src={brand.logo.url}
                        alt={brand.name}
                        width={brand.logo.width}
                        height={brand.logo.height}
                        className="h-auto max-h-8 w-auto max-w-[110px] object-contain"
                      />
                    ) : (
                      <span className="font-extrabold text-ink">{name}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      {data.note && <p className="mt-5 text-[13px] text-ink-2">{data.note}</p>}
    </SectionShell>
  )
}

type Channel = {
  label: string
  value: string
  note: string
  cta: string
  href: string
  icon: 'phone' | 'chat' | 'mail' | 'doc'
  external?: boolean
}

/**
 * Kontakt hero (K34 §8, plansza Web-Kontakt): live status, H1, the 60-minute promise in the lead,
 * four channels and the second phone; on the right the area map, the address and the week of hours
 * with today marked, the company data. Everything from the panel — one source for every page.
 */
export async function ContactHero({
  block,
  data,
  crumbs,
  tenantId,
}: {
  block: BzSectionData
  data: SectionData<'contact-hero'>
  crumbs: readonly Crumb[]
  tenantId: number
}) {
  const c = await contactData(tenantId)
  const channels: Channel[] = []
  if (c.phone && c.tel) {
    channels.push({
      label: 'Oferty i serwis',
      value: c.phone,
      note: 'kasy, komputery, programy, awarie',
      cta: 'Zadzwoń',
      href: c.tel,
      icon: 'phone',
    })
  }
  if (c.whatsapp && c.whatsappNumber) {
    channels.push({
      label: 'WhatsApp',
      value: c.whatsappNumber,
      note: 'wyślij zdjęcie usterki albo tabliczki znamionowej',
      cta: 'Napisz',
      href: c.whatsapp,
      icon: 'chat',
      external: true,
    })
  }
  if (c.email) {
    channels.push({
      label: 'E-mail',
      value: c.email,
      note: 'odpisujemy w godzinach pracy',
      cta: 'Wyślij',
      href: `mailto:${c.email}`,
      icon: 'mail',
    })
  }
  channels.push({
    label: 'Formularz',
    value: 'Opisz, czego potrzebujesz',
    note: 'oddzwonimy z konkretną propozycją',
    cta: 'Przejdź',
    href: '#formularz',
    icon: 'doc',
  })
  return (
    <section aria-labelledby="kontakt-h" className="bg-surface-2 pt-6 pb-14 sm:pt-8 sm:pb-20">
      <Container wide>
        <div className="mb-7">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="grid items-start gap-10 min-[1080px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 text-ink">
            <LiveHours hours={c.hours} className="text-sm text-ink" />
            <h1
              id="kontakt-h"
              className="font-display text-[clamp(2.2rem,4.2vw,3.8rem)] leading-[1] font-extrabold tracking-[-0.025em] font-stretch-110% text-balance"
            >
              {block.heading || crumbs.at(-1)?.name}{' '}
              {block.headingAccent && (
                <em className="text-accent-text not-italic">{block.headingAccent}</em>
              )}
            </h1>
            {block.lead && (
              <p className="max-w-[60ch] text-[clamp(1.0625rem,1.3vw,1.2rem)] leading-relaxed text-pretty text-ink-2">
                {block.lead}
              </p>
            )}
            <ul className="grid gap-3 min-[640px]:grid-cols-2">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    {...(channel.external ? { rel: 'noopener', target: '_blank' } : {})}
                    className={cx(
                      CARD,
                      'flex h-full flex-col gap-1 p-5 text-ink hover:shadow-[inset_0_0_0_1.5px_var(--ink)]',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="mb-2 flex size-10 items-center justify-center rounded-xl bg-surface-2 text-accent-text"
                    >
                      <Icon name={channel.icon} className="size-5" />
                    </span>
                    <small className="text-[13px] text-ink-2">{channel.label}</small>
                    <b className="text-[17px] font-extrabold break-words">{channel.value}</b>
                    <span className="text-[14px] text-ink-2">{channel.note}</span>
                    <em className="mt-2 text-[14px] font-extrabold text-accent-text not-italic">
                      {channel.cta} →
                    </em>
                    {channel.external && (
                      <span className="sr-only"> (otwiera się w nowej karcie)</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
            {c.phone2 && c.phone2Tel && (
              <a href={c.phone2Tel} className="self-start text-[15px] text-ink-2 hover:underline">
                Drugi telefon: <b className="text-ink">{c.phone2}</b>
              </a>
            )}
          </div>
          <div className="flex flex-col gap-5">
            {c.company && (
              <AreaMap
                label="Dojeżdżamy na całe Podhale i Małopolskę"
                companyName={c.company.name}
                street={c.location ? `${c.location.street}, ${c.location.city}` : null}
                fullAddress={c.address}
              />
            )}
            <div className={cx(CARD, 'flex flex-col gap-4 p-5 text-ink')}>
              {c.address && (
                <p className="flex flex-col">
                  <b className="font-extrabold">{c.location?.street}</b>
                  <small className="text-[14px] text-ink-2">
                    {c.location?.postalCode} {c.location?.city} · biuro, salon i serwis
                  </small>
                </p>
              )}
              {c.hours.length > 0 && <WeekHours week={weekHours(c.hours)} />}
              {data.bringNote && (
                <p className="text-[14px] leading-relaxed text-ink-2">{data.bringNote}</p>
              )}
              {c.company && (
                <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-[13px] text-ink-2">
                  <span>{c.company.name}</span>
                  {c.company.nip && <span>NIP {c.company.nip}</span>}
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/**
 * Kontakt form (#formularz, K4-FINAL §5): texts and the phone on the left, the form with the
 * topic chips on the right. The form token carries the render time, so this is never cached.
 */
export async function ContactFormSection({
  block,
  data,
  tenantId,
}: {
  block: BzSectionData
  data: SectionData<'contact-form'>
  tenantId: number
}) {
  await connection()
  const c = await contactData(tenantId)
  const formToken = issueFormToken(getEnv().PAYLOAD_SECRET)
  const id = sectionId(block)
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28 py-14 sm:py-20">
      <Container wide>
        <div className="grid overflow-hidden rounded-[30px] bg-card shadow-[0_40px_80px_-50px_var(--glow),inset_0_0_0_1px_var(--border)] min-[1080px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div
            data-surface="dark"
            className="flex flex-col gap-5 bg-surface-dark p-7 text-white sm:p-11"
          >
            {block.eyebrow && <p className={cx(EYEBROW, 'text-accent-on-dark')}>{block.eyebrow}</p>}
            <h2 id={`${id}-h`} className={cx(H2, 'text-white')}>
              <HeadingText block={block} onDark />
            </h2>
            {block.lead && <p className="leading-relaxed text-white/80">{block.lead}</p>}
            <ul className="flex flex-col gap-2">
              {data.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2 text-white/90">
                  <span aria-hidden="true" className="text-footer-ok">
                    ✓
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
            {c.phone && c.tel && (
              <a
                href={c.tel}
                className="mt-auto flex flex-col gap-0.5 rounded-2xl bg-white/5 px-5 py-4 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_12%,transparent)] hover:bg-white/10"
              >
                <small className="text-[13px] text-white/75">Wolisz porozmawiać?</small>
                <b className="font-display text-xl font-extrabold">{c.phone}</b>
                {c.hours.length > 0 && (
                  <span className="text-[13px] text-white/75">
                    oferty i serwis · {hoursSummary(c.hours)}
                  </span>
                )}
              </a>
            )}
          </div>
          <div className="p-7 sm:p-11">
            <ContactForm
              formToken={formToken}
              topics={data.topics}
              successText={data.successText}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
