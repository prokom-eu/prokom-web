import Link from 'next/link'

import type { Navigation } from '../dane/types'

export type CtaBandProps = {
  band: Navigation['ctaBand']
  phone: { label: string; href: string } | null
  /** „Salon: Rabka-Zdrój, ul. Orkana 16B” — `salonsNote()` of the company data's locations */
  salons: string
  /** Id of the heading (two bands in one HTML must not share it). */
  titleId: string
  /** A page's own band (`data-cta-page`): the frame's band hides with CSS (`instalacje.css`). */
  page?: boolean
}

/** Band above the footer (`zrodlo/footer.html` → `.cta`), dark in both themes. */
export function CtaBandView({ band, phone, salons, titleId, page = false }: CtaBandProps) {
  return (
    <section
      className={page ? 'pb-24' : 'ctaf pb-24'}
      aria-labelledby={titleId}
      data-cta-page={page ? '' : undefined}
    >
      <div className="wrap">
        <div className="cta" data-surface="dark">
          <div className="flex flex-col gap-4">
            <span className="eye">{band.eyebrow}</span>
            <h2 id={titleId} className="h2">
              {band.title}
            </h2>
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
            {salons && <span className="note">{salons}</span>}
          </div>
        </div>
      </div>
    </section>
  )
}
