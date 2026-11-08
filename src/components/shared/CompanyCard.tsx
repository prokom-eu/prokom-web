import Image from 'next/image'
import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { OpeningHours } from '@/lib/shared/openingStatus'
import type { SharedCompany } from '@/lib/shared/project'
import { toTelHref } from '@/lib/site/link'
import { hoursSummary } from '@/lib/site/hoursSummary'

type Props = {
  company: Pick<SharedCompany, 'name' | 'nip' | 'address' | 'ceidgUrl'>
  /** The line's phone and e-mail (not the company's). */
  phone: string | null
  email: string | null
  hours: OpeningHours
  /** „Autoryzacje i partnerstwa” — `shared.about.authTitle`. */
  authTitle?: string | null
  /** Badges with a shield (`shared.about.auth`). */
  auth?: readonly string[] | null
  /**
   * Logos of the authorisations with their status (Biznes: Posnet, Elzab, GoPOS, InsERT from
   * `Partners`, plan 0611 §8.2). Given, they replace the badges.
   */
  authLogos?: readonly AuthLogo[] | null
  className?: string
}

export type AuthLogo = {
  name: string
  status: string
  logo: { url: string; width: number; height: number }
}

/**
 * The company's card in the O firmie hero (spec §5 `CompanyCard`, board OFirmie): company, address,
 * NIP, the line's phone and e-mail, hours; the line's authorisations as badges; the CEIDG link.
 * All from the panel — a missing value leaves its row out.
 */
export function CompanyCard({
  company,
  phone,
  email,
  hours,
  authTitle,
  auth,
  authLogos,
  className,
}: Props) {
  const logos = authLogos?.length ? authLogos : null
  const tel = phone ? toTelHref(phone) : null
  const rows: [string, ReactNode][] = [
    ['Firma', company.name],
    ...(company.address
      ? ([
          [
            'Adres',
            `${company.address.street}, ${company.address.postalCode} ${company.address.city}`,
          ],
        ] as [string, ReactNode][])
      : []),
    ['NIP', company.nip],
    ...(phone && tel
      ? ([
          [
            'Telefon',
            <a key="tel" href={tel} className="font-bold underline-offset-2 hover:underline">
              {phone}
            </a>,
          ],
        ] as [string, ReactNode][])
      : []),
    ...(email
      ? ([
          [
            'E-mail',
            <a
              key="mail"
              href={`mailto:${email}`}
              className="font-bold underline-offset-2 hover:underline"
            >
              {email}
            </a>,
          ],
        ] as [string, ReactNode][])
      : []),
    ...(hours.length ? ([['Godziny', hoursSummary(hours)]] as [string, ReactNode][]) : []),
  ]
  return (
    <div
      className={cx(
        'flex flex-col gap-5 rounded-[28px] bg-card p-6 text-ink shadow-raised',
        className,
      )}
      data-company-card
    >
      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-ink-2">{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      {(logos || (auth && auth.length > 0)) && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          {authTitle && (
            <p className="text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase">
              {authTitle}
            </p>
          )}
          {logos ? (
            <ul className="grid grid-cols-2 gap-2">
              {logos.map((item) => (
                <li key={item.name} className="flex flex-col items-center gap-1.5" data-auth-logo>
                  {/* Brand logos stay on light tiles in both themes (K35 §6). */}
                  <span className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-white px-3">
                    <Image
                      src={item.logo.url}
                      alt={item.name}
                      width={item.logo.width}
                      height={item.logo.height}
                      unoptimized
                      className="max-h-7 w-auto object-contain"
                    />
                  </span>
                  <span className="text-center text-xs font-bold text-ink-2">{item.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {(auth ?? []).map((badge) => (
                <li
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-sm font-bold text-accent-text"
                >
                  <Icon name="shield" strokeWidth={2} className="size-4" />
                  {badge}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {company.ceidgUrl && (
        <a
          href={company.ceidgUrl}
          target="_blank"
          rel="noopener"
          className="text-sm font-bold text-accent-text underline-offset-2 hover:underline"
        >
          Dane sprawdzisz w CEIDG po numerze NIP →<span className="sr-only"> (nowe okno)</span>
        </a>
      )}
    </div>
  )
}
