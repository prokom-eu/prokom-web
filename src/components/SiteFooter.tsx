import Image from 'next/image'

import { BRAND_LINKS, brandAsset } from '@/lib/brand/lines'
import type { PublicCompanyData, PublicSiteSettings } from '@/lib/site/public'
import type { Line } from '@/lib/tenant/lines'

import { LocationAddress, Phone } from './ContactDetails'
import { Container } from './ui/Container'
import { TextLink } from './ui/TextLink'

type Props = {
  line: Line
  company: PublicCompanyData | null
  settings: PublicSiteSettings | null
}

const COLUMN_HEADING = 'mb-3 font-display text-sm font-extrabold uppercase tracking-[0.08em]'

/**
 * Footer on the dark rhythm block: the line's contact and links (`SiteSettings`), the company
 * branches with opening hours (`CompanyData`) and the other PRO-KOM lines. Site-specific
 * columns (e.g. Biznes: offer groups, towns served) belong to that site's own task.
 */
export function SiteFooter({ line, company, settings }: Props) {
  const lineContact = settings && (settings.phone || settings.email || settings.footer.text)
  const otherLines = BRAND_LINKS.filter((link) => link.line !== line)
  return (
    <footer data-surface="dark" className="mt-16 bg-surface-dark text-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src={brandAsset(line, 'poziome_negatyw.svg')}
            alt={company?.name ?? 'PRO-KOM'}
            width={836}
            height={167}
            className="h-8 w-auto"
          />
          {lineContact && (
            <section aria-label="Kontakt z linią" className="mt-6 space-y-1">
              {settings.footer.text && <p>{settings.footer.text}</p>}
              {settings.phone && (
                <p>
                  Telefon: <Phone number={settings.phone} />
                </p>
              )}
              {settings.email && (
                <p>
                  E-mail: <TextLink href={`mailto:${settings.email}`}>{settings.email}</TextLink>
                </p>
              )}
            </section>
          )}
        </div>

        {company && (
          <section aria-label="Dane firmy" className="space-y-4 lg:col-span-2">
            <h2 className={COLUMN_HEADING}>{company.name}</h2>
            <ul className="space-y-1">
              {company.phones.map((phone, i) => (
                <li key={`${i}-${phone.number}`}>
                  {phone.label && `${phone.label}: `}
                  <Phone number={phone.number} />
                </li>
              ))}
              <li>
                <TextLink href={`mailto:${company.email}`}>{company.email}</TextLink>
              </li>
            </ul>
            <div className="grid gap-4 sm:grid-cols-2">
              {company.locations.map((location) => (
                <LocationAddress key={`${location.name}-${location.street}`} location={location} />
              ))}
            </div>
          </section>
        )}

        <div className="space-y-8">
          {settings && settings.footer.links.length > 0 && (
            <nav aria-label="Stopka">
              <ul className="space-y-2">
                {settings.footer.links.map((link, i) => (
                  <li key={`${i}-${link.href}`}>
                    <TextLink href={link.href}>{link.label}</TextLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <nav aria-label="Inne linie PRO-KOM">
            <h2 className={COLUMN_HEADING}>Linie PRO-KOM</h2>
            <ul className="space-y-2">
              {otherLines.map((link) => (
                <li key={link.href}>
                  <TextLink href={link.href}>{link.label}</TextLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>

      {company && (
        <div className="border-t border-white/15">
          <Container className="py-5 text-sm">
            © {new Date().getFullYear()} {company.name} · NIP {company.nip}
          </Container>
        </div>
      )}
    </footer>
  )
}
