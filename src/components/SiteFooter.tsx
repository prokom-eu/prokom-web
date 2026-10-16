import type { PublicCompanyData, PublicSiteSettings } from '@/lib/site/public'

import { LocationAddress, Phone } from './ContactDetails'

type Props = { company: PublicCompanyData | null; settings: PublicSiteSettings | null }

// Plain semantic markup; the designed footer arrives with the visual system (S6).
export function SiteFooter({ company, settings }: Props) {
  return (
    <footer>
      {settings && (settings.phone || settings.email || settings.footer.text) && (
        <section aria-label="Kontakt z linią">
          {settings.footer.text && <p>{settings.footer.text}</p>}
          {settings.phone && (
            <p>
              Telefon: <Phone number={settings.phone} />
            </p>
          )}
          {settings.email && (
            <p>
              E-mail: <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </p>
          )}
        </section>
      )}
      {settings && settings.footer.links.length > 0 && (
        <nav aria-label="Stopka">
          <ul>
            {settings.footer.links.map((link, i) => (
              <li key={`${i}-${link.href}`}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {company && (
        <section aria-label="Dane firmy">
          <p>
            {company.name} · NIP {company.nip}
          </p>
          <ul>
            {company.phones.map((phone, i) => (
              <li key={`${i}-${phone.number}`}>
                {phone.label && `${phone.label}: `}
                <Phone number={phone.number} />
              </li>
            ))}
          </ul>
          <p>
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </p>
          {company.locations.map((location) => (
            <LocationAddress key={`${location.name}-${location.street}`} location={location} />
          ))}
        </section>
      )}
    </footer>
  )
}
