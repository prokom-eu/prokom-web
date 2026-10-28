'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { Navigation } from '../dane/types'

type Props = {
  band: Navigation['ctaBand']
  phone: { label: string; href: string } | null
  /** „Salony: Rabka-Zdrój, ul. Orkana 16B · Zakopane, …” */
  salons: string
}

/**
 * Band above the footer (`zrodlo/footer.html` → `.cta`), dark in both themes. Not on the start
 * page: it ends with its own plan form (prototype `cta: false` in `Main.meta.json`).
 */
export function CtaBand({ band, phone, salons }: Props) {
  const pathname = usePathname()
  if (pathname === '/') return null
  return (
    <section className="pb-24" aria-labelledby="cta-band-title">
      <div className="wrap">
        <div className="cta">
          <div className="flex flex-col gap-4">
            <span className="eye">{band.eyebrow}</span>
            <b id="cta-band-title" className="h2">
              {band.title}
            </b>
            <p className="lead">{band.text}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Link href={band.button.href} className="btn hbtn-p text-[17px]">
              {band.button.label}
            </Link>
            {phone && (
              <a href={phone.href} className="btn hbtn-g">
                Zadzwoń: <b>{phone.label}</b>
              </a>
            )}
            {salons && <span className="note">Salony: {salons}</span>}
          </div>
        </div>
      </div>
    </section>
  )
}
