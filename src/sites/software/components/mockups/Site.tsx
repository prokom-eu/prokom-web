import type { SiteVariant } from '@/lib/software/mockups'
import { spotAttr } from '@/lib/software/spots'

import { HeroArt } from './art'
import { SITES, type SiteData } from './data'

/** Phone screen of a sample site: the phone kind, and the small phone over a site mock-up. */
function PhoneScreen({ site, toast }: { site: SiteData; toast: boolean }) {
  return (
    <div className="mk-screen">
      <div className="mk-screen-nav">
        <span>
          <i />
          {site.brand}
        </span>
        <span>≡</span>
      </div>
      <div className="mk-screen-hero">
        <div>{site.eyebrow}</div>
        <div>{site.title}</div>
      </div>
      <div className="mk-screen-body">
        <span data-spot={spotAttr(site.cta)}>{site.cta}</span>
        <span data-spot="telefon">Zadzwoń</span>
        <span data-spot={spotAttr(site.widget.title, site.widget.button)}>
          <b>{site.widget.title}</b>
          <small>{site.widget.tag}</small>
        </span>
      </div>
      {toast && (
        <div className="mk-toast">
          <b>Nowe zapytanie ze strony</b>
          <small>przed chwilą · odpowiedz jednym kliknięciem</small>
        </div>
      )}
    </div>
  )
}

/** A browser with the sample firm's site: bar, nav, hero with a picture and a widget, features. */
export function MockSite({
  variant,
  phone = false,
  toast = false,
}: {
  variant: SiteVariant
  phone?: boolean
  toast?: boolean
}) {
  const site = SITES[variant]
  return (
    <div data-mk-theme={site.theme}>
      <div className="mk-frame mk-site">
        <div className="mk-bar">
          <i />
          <i />
          <i />
          <span className="mk-url">{site.url}</span>
        </div>
        <div className="mk-nav">
          <b className="mk-brand">
            <i />
            {site.brand}
          </b>
          <span className="mk-links">
            {site.nav.map((link) => (
              <span key={link} data-spot={spotAttr(link)}>
                {link}
              </span>
            ))}
          </span>
          <span className="mk-cta" data-spot={spotAttr(site.cta)}>
            {site.cta}
          </span>
        </div>
        <div className="mk-hero">
          <HeroArt variant={variant} />
          <div className="mk-copy">
            <div className="mk-eyebrow">
              <i />
              {site.eyebrow}
            </div>
            <div className="mk-title">{site.title}</div>
            <div className="mk-lead">{site.lead}</div>
            <div className="mk-actions">
              <span data-spot={spotAttr(site.cta)}>{site.cta} →</span>
              <span data-spot="telefon">Zadzwoń</span>
            </div>
          </div>
          <div className="mk-widget" data-spot={spotAttr(site.widget.title, site.widget.button)}>
            <div className="mk-widget-head">
              <b>{site.widget.title}</b>
              <span>{site.widget.tag}</span>
            </div>
            {site.widget.chips.length > 0 && (
              <div className="mk-chips">
                {site.widget.chips.map(([label, on]) => (
                  <span key={label} data-on={on || undefined} data-spot={spotAttr(label)}>
                    {label}
                  </span>
                ))}
              </div>
            )}
            <div className="mk-rows">
              {site.widget.rows.map((row) => (
                <div key={row.label} data-spot={spotAttr(row.label, row.value)}>
                  <span>{row.label}</span>
                  <b className={row.ok ? 'mk-ok' : undefined}>{row.value}</b>
                </div>
              ))}
            </div>
            <div className="mk-button">{site.widget.button}</div>
          </div>
        </div>
        <div className="mk-features">
          {site.features.map(([icon, title, note]) => (
            <div key={title} className="mk-card mk-feature" data-spot={spotAttr(title, note)}>
              <span>{icon}</span>
              <span>
                <b>{title}</b>
                <small>{note}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
      {phone && (
        <div className="mk-phone-over">
          <PhoneScreen site={site} toast={toast} />
        </div>
      )}
    </div>
  )
}

/** A phone with the mobile version of the sample site (optional „Nowe zapytanie” toast). */
export function MockPhone({ variant, toast = false }: { variant: SiteVariant; toast?: boolean }) {
  const site = SITES[variant]
  return (
    <div data-mk-theme={site.theme}>
      <div className="mk-phone">
        <PhoneScreen site={site} toast={toast} />
      </div>
    </div>
  )
}
