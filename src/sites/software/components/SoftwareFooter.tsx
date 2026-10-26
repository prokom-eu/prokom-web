import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { brandAsset, HORIZONTAL_LOGO_SIZE } from '@/lib/brand/lines'
import { toTelHref } from '@/lib/site/link'
import type { PublicCompanyData } from '@/lib/site/public'
import type { SoftwareNavigation } from '@/lib/software/navigation'

type Props = {
  /** Tenant name, the logo's alternative text. */
  name: string
  footer: SoftwareNavigation['footer']
  phone: string | null
  email: string | null
  company: PublicCompanyData | null
}

const HEADING = 'mb-3 font-display font-extrabold text-ink'
const LINK = 'inline-flex min-h-7 items-center text-ink-2 hover:text-ink hover:underline'

/** „Szukasz …? PRO-KOM Biznes →”: only the part after the question is the link. */
function splitCrossLink(label: string): [string, string] {
  const at = label.lastIndexOf('? ')
  return at === -1 ? ['', label] : [label.slice(0, at + 2), label.slice(at + 2)]
}

/**
 * Footer of the Software line (spec. §3.4, `Main` 08): about the line, link columns from
 * `navigation.footer`, the contact column with the line's phone and e-mail from the site
 * settings (never from the package), and the bottom bar with the company data. Phones: two
 * columns of links.
 */
export function SoftwareFooter({ name, footer, phone, email, company }: Props) {
  const tel = phone ? toTelHref(phone) : null
  const location = company?.locations[0]
  const [crossText, crossLink] = splitCrossLink(footer.crossLink[0])
  return (
    <footer className="mt-16 border-t border-border bg-surface-2 text-[15px]">
      <Container wide className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-1">
          <Image
            src={brandAsset('software', 'poziome_kolor.svg')}
            alt={name}
            {...HORIZONTAL_LOGO_SIZE}
            className="theme-light-only h-7 w-auto"
          />
          <Image
            src={brandAsset('software', 'poziome_negatyw.svg')}
            alt={name}
            {...HORIZONTAL_LOGO_SIZE}
            className="theme-dark-only h-7 w-auto"
          />
          <p className="mt-4 max-w-xs text-ink-2">{footer.about}</p>
        </div>

        {footer.columns.map((column) => (
          <section key={column.title} aria-label={column.title}>
            <h2 className={HEADING}>{column.title}</h2>
            {'links' in column ? (
              <ul className="space-y-1">
                {column.links.map(([label, href]) => (
                  <li key={href + label}>
                    <Link href={href} className={LINK}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-1 text-ink-2">
                {phone && (
                  <li>
                    {tel ? (
                      <a href={tel} className={LINK}>
                        {phone}
                      </a>
                    ) : (
                      phone
                    )}
                  </li>
                )}
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className={`${LINK} break-all`}>
                      {email}
                    </a>
                  </li>
                )}
                {column.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </Container>

      <div className="border-t border-border">
        <Container
          wide
          className="flex flex-col gap-3 py-5 text-sm text-ink-2 lg:flex-row lg:items-center lg:justify-between"
        >
          {company && (
            <p>
              {company.name}
              {location && ` · ${location.street}, ${location.postalCode} ${location.city}`} · NIP{' '}
              {company.nip}
            </p>
          )}
          <p>
            {crossText}
            <a href={footer.crossLink[1]} className="font-bold text-accent-text hover:underline">
              {crossLink}
            </a>
          </p>
          {footer.legal.length > 0 && (
            <nav aria-label="Informacje prawne">
              <ul className="flex flex-wrap gap-x-5">
                {footer.legal.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className={LINK}>
                      {label}
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
