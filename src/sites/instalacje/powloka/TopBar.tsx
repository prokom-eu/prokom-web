import Link from 'next/link'

import type { OpeningHours, OpeningStatus } from '@/lib/site/hours'

import type { Navigation } from '../dane/types'
import { HoursLive } from './HoursLive'

type Props = {
  topBar: Navigation['topBar']
  /** „Rabka-Zdrój, ul. Orkana 16B” — salons from the company data. */
  salons: string
  hours: OpeningHours | null
  status: OpeningStatus | null
  phone: { label: string; href: string } | null
}

/** Top bar above the header, from 761 px (`zrodlo/header.html` → `.topb`; spec §4). */
export function TopBar({ topBar, salons, hours, status, phone }: Props) {
  return (
    <div className="topb">
      <div className="wrap topw">
        <span>
          {hours && status && (
            <>
              <HoursLive hours={hours} initial={status} />
              {salons && ' · '}
            </>
          )}
          {salons}
        </span>
        <nav aria-label="Strony PRO-KOM" className="flex flex-wrap gap-4">
          {topBar.links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <Link href={topBar.fault.href}>{topBar.fault.label}</Link>
          {phone && (
            <a href={phone.href} className="tel">
              Instalacje: {phone.label}
            </a>
          )}
        </nav>
      </div>
    </div>
  )
}
