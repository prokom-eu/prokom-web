import { CONFIGURATOR_PATH } from '@/lib/catalog/wizardEngine'
import { PLAN_PATH } from '@/lib/catalog/floorPlan'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { brandAsset, HORIZONTAL_LOGO_SIZE } from '@/lib/brand/lines'
import { BUNDLES_PATH } from '@/lib/catalog/bundle'
import { BRANDS_PATH } from '@/lib/catalog/filters'
import type { PartnerBadge } from '@/lib/partners/badges'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import type { PublicCompanyData, PublicSiteSettings } from '@/lib/site/public'

type Props = {
  name: string
  company: PublicCompanyData | null
  settings: PublicSiteSettings
  biznes: NonNullable<PublicSiteSettings['biznes']>
  badges: PartnerBadge[]
  /** Main number and WhatsApp link, computed once in the layout (as for the header). */
  contact: { phone: { label: string; href: string } | null; whatsapp: string | null }
}

const HEADING = 'mb-1 font-display font-extrabold text-white'
const LINK = 'inline-flex min-h-9 items-center text-white/80 hover:text-white hover:underline'

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  if (links.length === 0) return null
  return (
    <nav aria-label={title}>
      <h2 className={HEADING}>{title}</h2>
      <ul>
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className={LINK}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * „PRO-KOM w regionie” (K36 §1): the other lines of the company, as external links. Fixed here
 * like the lines of the top bar.
 */
const REGION_LINKS = [
  { label: 'Monitoring, sieci, smart home', href: 'https://prokominstalacje.pl' },
  { label: 'Strony, sklepy i aplikacje', href: 'https://prokomsoftware.pl' },
  { label: 'Serwis telefonów i laptopów', href: 'https://prokomserwis.pl' },
  { label: 'Sklep w Zakopanem', href: 'https://prokomzakopane.pl' },
]

const OFFER_LINKS = [
  { label: 'Cała oferta', href: '/oferta' },
  { label: 'Gotowe zestawy', href: BUNDLES_PATH },
  { label: 'Plan Twojej firmy', href: PLAN_PATH },
  { label: 'Wszystkie marki', href: BRANDS_PATH },
  { label: 'Konfigurator', href: CONFIGURATOR_PATH },
]

/**
 * Footer of the Biznes line, K4 six columns (K36 §1, board `Web-Start`): the company with the
 * address, hours and status badges; Oferta; Usługi and Systemy i tematy (panel); PRO-KOM
 * w regionie; Kontakt. Bottom row: copyright, NIP, legal links.
 * Extra bottom padding on phones keeps the last line above the phone tab bar (`TabBar`).
 */
export function BiznesFooter({ name, company, settings, biznes, badges, contact }: Props) {
  // One address on the whole site (K31-ZMIANY §11.4): the line's inbox, else the company's.
  const email = settings.email ?? company?.email ?? null
  // Only the first location (Rabka on Biznes, spec. §1) — never the list of all branches.
  const main = company?.locations[0]
  // The line's second phone (`SiteSettings.phone2`); `CompanyData` phones are shared by all lines.
  const otherPhones = settings.phone2 ? [{ label: null, number: settings.phone2 }] : []
  return (
    <footer data-surface="dark" className="mt-16 bg-surface-dark text-[0.94rem] text-white/80">
      <Container
        wide
        className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.35fr_repeat(5,1fr)]"
      >
        <div className="space-y-4 sm:col-span-2 lg:col-span-3 xl:col-span-1">
          <Image
            src={brandAsset('biznes', 'poziome_negatyw.svg')}
            alt={name}
            {...HORIZONTAL_LOGO_SIZE}
            className="h-9 w-auto"
          />
          {settings.footer.text && <p className="leading-relaxed">{settings.footer.text}</p>}
          {main && (
            <div className="text-sm">
              {/* Short hours „pn–pt 9:00–17:00” (audit 01.11), not the long form of the shared
                  `LocationAddress` the other lines keep. */}
              <address className="not-italic">
                <strong className="font-bold">{main.name}</strong>
                <br />
                {main.street}, {main.postalCode} {main.city}
                {main.hours.length > 0 && (
                  <>
                    <br />
                    {hoursSummary(main.hours)}
                  </>
                )}
              </address>
            </div>
          )}
          {badges.length > 0 && (
            <ul className="flex flex-wrap items-start gap-2">
              {badges.map((badge) => (
                <li
                  key={badge.label}
                  // White on the dark footer, as on the board (small text needs 4.5:1).
                  className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-extrabold text-white ring-1 ring-white/15 ring-inset"
                >
                  {badge.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <LinkColumn title="Oferta" links={OFFER_LINKS} />
        <LinkColumn title="Usługi" links={biznes.footer.important} />
        <LinkColumn title="Systemy i tematy" links={biznes.footer.company} />
        <nav aria-label="PRO-KOM w regionie">
          <h2 className={HEADING}>PRO-KOM w regionie</h2>
          <ul>
            {REGION_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener" className={LINK}>
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="stopka-kontakt">
          <h2 id="stopka-kontakt" className={HEADING}>
            Kontakt
          </h2>
          <ul>
            {settings.phone && (
              <li>
                {contact.phone ? (
                  <a href={contact.phone.href} className={LINK}>
                    {contact.phone.label} · oferty i serwis
                  </a>
                ) : (
                  <span>{settings.phone} · oferty i serwis</span>
                )}
              </li>
            )}
            {biznes.whatsapp && contact.whatsapp && (
              <li>
                <a href={contact.whatsapp} target="_blank" rel="noopener" className={LINK}>
                  WhatsApp: {biznes.whatsapp}
                </a>
              </li>
            )}
            {otherPhones.map((phone, i) => {
              const href = toTelHref(phone.number)
              const text = phone.label ? `${phone.number} · ${phone.label}` : phone.number
              return (
                <li key={`${i}-${phone.number}`}>
                  {href ? (
                    <a href={href} className={LINK}>
                      {text}
                    </a>
                  ) : (
                    text
                  )}
                </li>
              )
            })}
            {email && (
              <li>
                <a href={`mailto:${email}`} className={LINK}>
                  {email}
                </a>
              </li>
            )}
            <li>
              <Link href="/kontakt" className={`${LINK} font-extrabold text-white`}>
                Kontakt i dojazd →
              </Link>
            </li>
          </ul>
        </section>
      </Container>

      <div className="border-t border-white/15">
        <Container
          wide
          className="flex flex-wrap justify-between gap-x-6 gap-y-2 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 text-[0.8rem] md:pb-6"
        >
          <p>
            © {new Date().getFullYear()} {company?.name ?? name}
            {company && <> · NIP {company.nip}</>} · Oferta skierowana do przedsiębiorców i
            instytucji · Logotypy należą do ich właścicieli
          </p>
          {settings.footer.links.length > 0 && (
            <nav aria-label="Informacje prawne">
              <ul className="flex flex-wrap gap-x-4">
                {settings.footer.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className={LINK}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </Container>
      </div>
    </footer>
  )
}
