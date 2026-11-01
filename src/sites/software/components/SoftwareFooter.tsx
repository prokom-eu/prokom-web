import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { brandAsset, HORIZONTAL_LOGO_SIZE } from '@/lib/brand/lines'
import { toTelHref } from '@/lib/site/link'
import type { PublicCompanyData } from '@/lib/site/public'
import { hoursSummary } from '@/lib/site/hoursSummary'
import type { SoftwareNavigation } from '@/lib/software/navigation'

import { WandIcon } from './FrameIcons'
import { CarouselDots } from './CarouselDots'

type Footer = SoftwareNavigation['footer']

type Props = {
  /** Tenant name, the logo's alternative text. */
  name: string
  footer: Footer
  phone: string | null
  /** Second number, next to the main one (ZMIANY-v23 §1). */
  phone2: string | null
  email: string | null
  company: PublicCompanyData | null
}

const COLUMN_TITLE =
  'mb-1.5 text-[12.5px] font-extrabold uppercase tracking-[0.12em] text-footer-muted'
const COLUMN_LINK =
  'flex min-h-11 max-w-full items-center text-footer-text hover:text-footer-eyebrow min-[1081px]:inline-flex min-[1081px]:min-h-7'

type LineCard = Footer['lines'][number]

/**
 * The PRO-KOM mark of a line card, set in type like the board: white „PRO-KOM” with the dash in
 * the line colour, the rule and the line name under it (docs/marka.md: only the dash, the rule
 * and the name change). The colour is the brand book's on-dark one (`--c-<line>-on-dark`).
 */
function LineMark({ line }: { line: LineCard }) {
  return (
    <span aria-hidden="true" className="flex flex-col items-start gap-[3px]">
      <b className="inline-flex items-center font-display text-base leading-none font-extrabold font-stretch-118%">
        PRO
        <i className="mx-[0.05em] inline-block h-[0.16em] w-[0.36em] rounded-[1px] bg-(--lc)" />
        KOM
      </b>
      <small className="self-stretch border-t-2 border-(--lc) pt-[3px] text-xs font-extrabold tracking-[0.2em] text-footer-muted">
        {line.label}
      </small>
    </span>
  )
}

/** A row of the contact column; `link`: the row is one link, its whole height the touch target. */
function ContactRow({
  icon,
  link = false,
  children,
}: {
  icon: IconName
  link?: boolean
  children: ReactNode
}) {
  return (
    <li
      className={`grid grid-cols-[20px_minmax(0,1fr)] gap-2.5 text-footer-text min-[1081px]:items-start min-[1081px]:py-0 ${link ? 'items-center' : 'items-start py-1.5'}`}
    >
      <Icon name={icon} className="mt-0.5 size-4 text-footer-eyebrow" />
      <span>{children}</span>
    </li>
  )
}

const SMALL = 'mt-0.5 block text-[13px] text-footer-muted'
/** Phone and e-mail: the main contacts, so a full touch target on the phone (≥ 44 px). */
const CONTACT_LINK =
  'flex min-h-11 items-center hover:text-footer-eyebrow min-[1081px]:inline min-[1081px]:min-h-0'

/**
 * Dark footer of the Software line v21 (spec. §3.4, ADR-014 v22 pkt 9, ADR-015 v22 pkt 1):
 * CTA band, the mark with three guarantees, Oferta / Firma / Kontakt, „Jedna firma” and the
 * bottom bar. Phones and e-mail from the site settings, the address and hours from the company
 * data — never from the navigation JSON. Software works only in Rabka (ZMIANY-v23 §1), so only
 * the first location (the main office) is shown, not the other salons of the company.
 *
 * A page that ends with its own CTA (`data-final-cta`) hides the band, a page with the PRO-KOM
 * lines (`data-lines-section`) hides the line cards — by CSS in `globals.css`, no list of
 * addresses here (plan §3b, decyzja 6).
 */
export function SoftwareFooter({ name, footer, phone, phone2, email, company }: Props) {
  const tel = phone ? toTelHref(phone) : null
  const tel2 = phone2 ? toTelHref(phone2) : null
  const main = company?.locations[0]
  const { cta } = footer
  return (
    <footer
      data-surface="dark"
      className="relative mt-16 overflow-hidden bg-footer text-[14.5px] text-footer-text"
    >
      <div data-footer-cta className="border-b border-footer-line">
        <Container
          wide
          className="flex flex-wrap items-center justify-between gap-[18px] pt-10 pb-7 sm:gap-6 sm:pt-14 sm:pb-10"
        >
          <div className="min-w-0 sm:flex-1 sm:basis-[28rem]">
            <p className="mb-2 text-[12.5px] font-extrabold tracking-[0.12em] text-footer-eyebrow uppercase">
              {cta.eyebrow}
            </p>
            <h2 className="font-display text-[30px] leading-[1.05] font-black tracking-[-0.02em] font-stretch-112% sm:text-[clamp(28px,3.4vw,44px)]">
              {cta.title}
            </h2>
            <p className="mt-2.5 max-w-[56ch] text-base text-footer-muted">{cta.text}</p>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:shrink-0 sm:flex-row sm:flex-wrap">
            <Link
              href={cta.primary.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cta px-6 font-extrabold text-white"
            >
              <WandIcon className="size-[18px]" />
              {cta.primary.label}
            </Link>
            <Link
              href={cta.secondary.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-footer-line px-6 font-extrabold text-footer-text hover:border-footer-muted"
            >
              {cta.secondary.label}
              <Icon name="arrow" strokeWidth={2.4} className="size-[18px]" />
            </Link>
          </div>
        </Container>
      </div>

      <Container
        wide
        className="grid grid-cols-2 gap-x-4 gap-y-[26px] pt-8 pb-[26px] min-[1081px]:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,0.8fr))_minmax(0,1.3fr)] min-[1081px]:gap-9 min-[1081px]:pt-11 min-[1081px]:pb-9"
      >
        <div className="col-span-2 min-[1081px]:col-span-1">
          <Image
            src={brandAsset('software', 'poziome_negatyw.svg')}
            alt={name}
            {...HORIZONTAL_LOGO_SIZE}
            className="h-auto w-[220px]"
          />
          <p className="mt-4 max-w-[40ch] leading-relaxed text-footer-muted">{footer.about}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {footer.guarantees.map((guarantee) => (
              <li key={guarantee} className="flex items-center gap-2.5 text-sm font-semibold">
                <span
                  aria-hidden="true"
                  className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-footer-ok/16 text-footer-ok"
                >
                  <Icon name="check" strokeWidth={3} className="size-3.5" />
                </span>
                {guarantee}
              </li>
            ))}
          </ul>
        </div>

        {footer.columns.map((column) =>
          'links' in column ? (
            <nav key={column.title} aria-label={column.title}>
              <h2 className={COLUMN_TITLE}>{column.title}</h2>
              <ul className="min-[1081px]:space-y-1">
                {column.links.map(([label, href, note]) => (
                  <li key={href + label}>
                    <Link href={href} className={COLUMN_LINK}>
                      {label}
                      {note && (
                        <span className="ml-1.5 rounded-full bg-footer-ok/16 px-[7px] py-0.5 text-xs font-extrabold text-footer-ok">
                          {note}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <section
              key={column.title}
              aria-label={column.title}
              className="col-span-2 min-[1081px]:col-span-1"
            >
              <h2 className={COLUMN_TITLE}>{column.title}</h2>
              <ul className="min-[1081px]:space-y-2.5">
                {phone && (
                  <ContactRow icon="phone" link={tel !== null}>
                    {tel ? (
                      <a href={tel} className={CONTACT_LINK}>
                        {phone}
                      </a>
                    ) : (
                      phone
                    )}
                  </ContactRow>
                )}
                {phone2 && (
                  <ContactRow icon="phone" link={tel2 !== null}>
                    {tel2 ? (
                      <a href={tel2} className={CONTACT_LINK}>
                        {phone2}
                      </a>
                    ) : (
                      phone2
                    )}
                  </ContactRow>
                )}
                {email && (
                  <ContactRow icon="mail" link>
                    <a href={`mailto:${email}`} className={`${CONTACT_LINK} break-all`}>
                      {email}
                    </a>
                  </ContactRow>
                )}
                {main && (
                  <ContactRow icon="pin">
                    {main.street}, {main.postalCode} {main.city}
                  </ContactRow>
                )}
                {main && main.hours.length > 0 ? (
                  <ContactRow icon="clock">
                    {hoursSummary(main.hours)}
                    <small className={SMALL}>{column.response}</small>
                  </ContactRow>
                ) : (
                  <ContactRow icon="clock">{column.response}</ContactRow>
                )}
                <ContactRow icon="globe">{column.reach}</ContactRow>
              </ul>
            </section>
          ),
        )}
      </Container>

      <section
        data-footer-lines
        aria-labelledby="stopka-linie"
        className="border-t border-footer-line"
      >
        <Container wide className="py-7">
          <h2
            id="stopka-linie"
            className="mb-3.5 text-[12.5px] font-extrabold tracking-[0.12em] text-footer-muted uppercase"
          >
            {footer.linesTitle}
          </h2>
          <ul
            id="stopka-linie-lista"
            className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pt-0.5 pb-1.5 [scrollbar-width:none] sm:mx-0 sm:grid sm:overflow-visible sm:p-0 min-[1081px]:grid-cols-5 sm:max-[1080px]:grid-cols-3"
          >
            {footer.lines.map((line) => (
              <li key={line.label} className="shrink-0 basis-[58%] snap-start sm:basis-auto">
                <a
                  href={line.href}
                  // The current line, not the current page: the card leads to `/` from every page.
                  aria-current={line.current ? 'true' : undefined}
                  style={{ '--lc': `var(--c-${line.color}-on-dark)` } as CSSProperties}
                  className={`flex h-full flex-col gap-2 rounded-[18px] border p-3.5 transition-colors hover:border-(--lc) ${
                    line.current
                      ? 'border-accent-on-dark bg-accent-on-dark/16'
                      : 'border-footer-line bg-footer-text/4'
                  }`}
                >
                  <LineMark line={line} />
                  <span className="sr-only">PRO-KOM {line.name}: </span>
                  <span className="text-[13px] leading-snug text-footer-muted">{line.text}</span>
                </a>
              </li>
            ))}
          </ul>
          <CarouselDots
            listId="stopka-linie-lista"
            count={footer.lines.length}
            tone="dark"
            className="sm:hidden"
          />
        </Container>
      </section>

      <div className="border-t border-footer-line">
        <Container
          wide
          className="flex flex-col items-center gap-3 pt-[18px] pb-[calc(148px+env(safe-area-inset-bottom))] text-[13px] min-[1081px]:pb-[26px] text-footer-muted sm:flex-row sm:flex-wrap sm:justify-between"
        >
          {company && (
            <p>
              © {new Date().getFullYear()} {company.name}
              {main && ` · ${main.street}, ${main.postalCode} ${main.city}`} · NIP {company.nip}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4">
            {footer.legal.length > 0 && (
              <nav aria-label="Informacje prawne">
                <ul className="flex flex-wrap items-center gap-x-4">
                  {footer.legal.map(([label, href]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="inline-flex min-h-11 items-center text-footer-text underline decoration-footer-line underline-offset-[3px] hover:decoration-footer-text"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {footer.bottom.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  )
}
