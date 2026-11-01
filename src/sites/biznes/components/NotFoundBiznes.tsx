import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { CONTACT_PATH } from '@/lib/biznes/mobileNav'
import { categoryHref } from '@/lib/catalog/category'
import { CATALOG_PATH } from '@/lib/catalog/filters'
import { PLAN_PATH } from '@/lib/catalog/floorPlan'
import type { IconName } from '@/lib/catalog/options'
import { CONFIGURATOR_PATH } from '@/lib/catalog/wizardEngine'

import { NotFoundSearch } from './NotFoundSearch'

/** The most visited places of the line (audit 01.11: 4–6 popular links). */
const LINKS: { label: string; note: string; href: string; icon: IconName }[] = [
  { label: 'Cała oferta', note: 'Sprzęt, programy i usługi', href: CATALOG_PATH, icon: 'box' },
  {
    label: 'Kasy fiskalne',
    note: 'Dobór, fiskalizacja i serwis',
    href: categoryHref('kasy-fiskalne'),
    icon: 'cash',
  },
  { label: 'Konfigurator', note: 'Zestaw dla Twojej firmy', href: CONFIGURATOR_PATH, icon: 'star' },
  { label: 'Plan Twojej firmy', note: 'Co gdzie stanie w lokalu', href: PLAN_PATH, icon: 'map' },
  { label: 'Kontakt', note: 'Telefon, e-mail i dojazd', href: CONTACT_PATH, icon: 'phone' },
  { label: 'Strona główna', note: 'Wszystko od początku', href: '/', icon: 'arrow' },
]

/**
 * 404 of the Biznes line (audit 01.11): the site search and six popular places. The section
 * fills the screen, so a short page never shows the page background under the footer.
 */
export function NotFoundBiznes() {
  return (
    <section className="flex min-h-[calc(100svh-8rem)] items-center py-16 sm:py-24">
      <Container wide>
        <p className="text-sm font-extrabold tracking-[0.12em] text-accent-text uppercase">
          Błąd 404 · strona nie istnieje
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.04] font-extrabold tracking-[-0.02em]">
          Tej strony tu nie ma.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
          Adres jest nieprawidłowy albo strona została przeniesiona. Poszukaj w ofercie albo wybierz
          jedno z miejsc poniżej.
        </p>
        <div className="mt-8">
          <NotFoundSearch />
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex min-h-16 items-center gap-3 rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--accent-text)]"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-accent-text"
                >
                  <Icon name={link.icon} className="size-5" strokeWidth={2} />
                </span>
                <span>
                  <span className="block font-bold text-ink">{link.label}</span>
                  <span className="text-sm text-ink-2">{link.note}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
