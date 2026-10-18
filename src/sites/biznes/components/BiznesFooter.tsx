import Image from 'next/image'
import Link from 'next/link'

import { LocationAddress } from '@/components/ContactDetails'
import { Container } from '@/components/ui/Container'
import { brandAsset, HORIZONTAL_LOGO_SIZE } from '@/lib/brand/lines'
import type { MegaMenu } from '@/lib/catalog/menu'
import type { PartnerBadge } from '@/lib/partners/badges'
import { toTelHref, toWhatsAppHref } from '@/lib/site/link'
import type { PublicCompanyData, PublicSiteSettings } from '@/lib/site/public'

type Props = {
  name: string
  company: PublicCompanyData | null
  settings: PublicSiteSettings
  biznes: NonNullable<PublicSiteSettings['biznes']>
  menu: MegaMenu
  badges: PartnerBadge[]
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
 * Footer of the Biznes line, five columns of the `Main` design (spec. §3.4, layout chosen
 * 18.10): the company with hours, status badges and towns served; Oferta (catalog groups);
 * Najważniejsze and Branże i firma (panel); Kontakt. Bottom row: copyright, NIP, legal links.
 * Extra bottom padding on phones keeps the last line above the sticky bar (`MobileBar`).
 */
export function BiznesFooter({ name, company, settings, biznes, menu, badges }: Props) {
  const main = company?.locations[0]
  const tel = settings.phone ? toTelHref(settings.phone) : null
  const whatsapp = biznes.whatsapp ? toWhatsAppHref(biznes.whatsapp) : null
  return (
    <footer data-surface="dark" className="mt-16 bg-surface-dark text-[0.94rem] text-white/80">
      <Container
        wide
        className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.1fr]"
      >
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <Image
            src={brandAsset('biznes', 'poziome_negatyw.svg')}
            alt={name}
            {...HORIZONTAL_LOGO_SIZE}
            className="h-9 w-auto"
          />
          {settings.footer.text && <p className="leading-relaxed">{settings.footer.text}</p>}
          {main && (
            <div className="text-sm">
              <LocationAddress location={main} />
            </div>
          )}
          {biznes.serviceAreas.length > 0 && (
            <p className="text-sm">
              <span className="font-bold text-white">Obsługujemy:</span>{' '}
              {biznes.serviceAreas.join(', ')}
            </p>
          )}
          {badges.length > 0 && (
            <ul className="flex flex-col items-start gap-2">
              {badges.map((badge) => (
                <li
                  key={badge.label}
                  className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-extrabold text-white"
                >
                  {badge.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <LinkColumn
          title="Oferta"
          links={[
            { label: 'Cały katalog', href: '/oferta' },
            ...menu.columns.map((column) => ({ label: column.name, href: column.href })),
          ]}
        />
        <LinkColumn title="Najważniejsze" links={biznes.footer.important} />
        <LinkColumn title="Branże i firma" links={biznes.footer.company} />

        <section aria-labelledby="stopka-kontakt">
          <h2 id="stopka-kontakt" className={HEADING}>
            Kontakt
          </h2>
          <ul>
            {settings.phone && (
              <li className="mt-1">
                <span className="block text-sm">Oferty i serwis</span>
                {tel ? (
                  <a href={tel} className="text-lg font-extrabold text-white hover:underline">
                    {settings.phone}
                  </a>
                ) : (
                  <span className="text-lg font-extrabold text-white">{settings.phone}</span>
                )}
              </li>
            )}
            {biznes.whatsapp && whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener" className={LINK}>
                  WhatsApp: {biznes.whatsapp}
                </a>
              </li>
            )}
            {company?.phones.map((phone, i) => {
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
            {company && (
              <li>
                <a href={`mailto:${company.email}`} className={LINK}>
                  {company.email}
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
          className="flex flex-wrap justify-between gap-x-6 gap-y-2 pb-24 pt-5 text-[0.8rem] sm:pb-6"
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
                  <li key={link.href}>
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
