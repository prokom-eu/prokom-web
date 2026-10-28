import Image from 'next/image'
import Link from 'next/link'

import { brandAsset, HORIZONTAL_LOGO_SIZE } from '@/lib/brand/lines'
import type { InstMenu } from '@/lib/instalacje/menu'
import { hoursSummary } from '@/lib/site/hoursSummary'
import type { PublicCompanyData } from '@/lib/site/public'

import type { Navigation } from '../dane/types'
import { InstIcon } from '../InstIcon'

type Props = {
  navigation: Navigation
  menu: InstMenu
  company: PublicCompanyData | null
  phone: { label: string; href: string } | null
  /** Legal links from the panel (`SiteSettings.footer.links`; the pages come in I13). */
  legal: { label: string; href: string }[]
}

/**
 * Footer of the Instalacje shell (`zrodlo/footer.html` → `.ftr2`), dark in both themes: contact
 * cards, brand column, services, objects, company, PRO-KOM sites, company line, legal links.
 * Phone, salons and hours come from the panel; nothing shows a placeholder.
 */
export function Footer({ navigation, menu, company, phone, legal }: Props) {
  const { footer } = navigation
  const [salon] = company?.locations ?? []
  const year = new Date().getFullYear()
  return (
    <footer id="stopka" className="ftr2" data-surface="dark">
      <svg className="ftmt" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 120 L0 74 L90 52 L170 70 L260 30 L330 58 L420 18 L500 50 L580 34 L650 62 L740 22 L820 56 L900 40 L990 70 L1080 36 L1160 60 L1250 28 L1330 56 L1440 44 L1440 120 Z" />
        <path
          className="l"
          d="M0 74 L90 52 L170 70 L260 30 L330 58 L420 18 L500 50 L580 34 L650 62 L740 22 L820 56 L900 40 L990 70 L1080 36 L1160 60 L1250 28 L1330 56 L1440 44"
        />
      </svg>
      <div className="wrap relative">
        <div className="ftc">
          {phone && (
            <a href={phone.href} className="ftci big">
              <span className="ftic">
                <InstIcon name="phone" size={20} />
              </span>
              <span>
                <small>Instalacje i serwis</small>
                <b>{phone.label}</b>
                {salon && <em>{hoursSummary(salon.hours)}</em>}
              </span>
            </a>
          )}
          {company?.locations.map((location) => (
            <Link key={location.name} href="/kontakt" className="ftci">
              <span className="ftic">
                <InstIcon name="pin" size={20} />
              </span>
              <span>
                <small>Salon {location.city}</small>
                <b>{location.street}</b>
                <em>
                  {location.postalCode} {location.city}
                </em>
              </span>
            </Link>
          ))}
          <Link href={footer.plan.href} className="ftci plan">
            <span className="ftic">
              <InstIcon name="plane" size={20} />
            </span>
            <span>
              <small>{footer.plan.label}</small>
              <b>{footer.plan.title}</b>
              <em>{footer.plan.caption}</em>
            </span>
          </Link>
        </div>
        <div className="fg">
          <div className="ftb">
            <Link href="/" className="inline-block">
              <Image
                src={brandAsset('instalacje', 'poziome_negatyw.svg')}
                alt="PRO-KOM Instalacje — strona główna"
                {...HORIZONTAL_LOGO_SIZE}
                className="h-auto w-[160px]"
              />
            </Link>
            <p>{footer.about}</p>
            <div className="ftchips">
              {footer.chips.map((chip) => (
                <span key={chip.label} className={chip.strong ? 'b' : undefined}>
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
          <nav aria-label="Usługi">
            <h2>Usługi</h2>
            {menu.services
              .flatMap((column) => column.items)
              .map((item) => (
                <Link key={item.key} href={item.href}>
                  {item.label}
                </Link>
              ))}
            <Link href="/uslugi" className="ftstrong">
              Pełna oferta →
            </Link>
          </nav>
          <nav aria-label="Dla kogo">
            <h2>Dla kogo</h2>
            {menu.objects
              .flatMap((column) => column.items)
              .map((item) => (
                <Link key={item.key} href={item.href}>
                  {item.label}
                </Link>
              ))}
          </nav>
          <nav aria-label="Firma">
            <h2>Firma</h2>
            {footer.company.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <Link href={navigation.cta.href} className="ftstrong">
              {navigation.cta.label} →
            </Link>
          </nav>
          <nav aria-label="Strony PRO-KOM">
            <h2>Strony PRO-KOM</h2>
            {footer.sites.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="fbot">
          <span>
            © {year} {company?.name ?? 'PRO-KOM'}
            {salon && ` · ${salon.street}, ${salon.postalCode} ${salon.city}`}
            {company?.nip && ` · NIP ${company.nip}`} · Logotypy należą do ich właścicieli
          </span>
          <span className="ftl">
            {legal.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <a href="#top">Do góry ↑</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
