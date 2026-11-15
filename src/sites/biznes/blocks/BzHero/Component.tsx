import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { splitTime } from '@/lib/biznes/textParts'
import { getCatalogIndex } from '@/lib/catalog/data'
import { wheelGroups } from '@/lib/catalog/groups'
import { K4_ORDER, partnerStatusLabel } from '@/lib/partners/badges'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { BzFactsBlock, BzHeroBlock as BzHeroBlockData } from '@/payload-types'

import { DepartmentWheel } from './DepartmentWheelLazy'

type Props = {
  block: BzHeroBlockData
  isFirst: boolean
  tenantId: number
  /** The numbers of „Od 2004” on the same page (`bzFacts.stats`) — typed in once (runda 1411). */
  stats?: BzFactsBlock['stats']
}

/** „Oddzwaniamy w ciągu **60 minut**” (board): the time in bold. */
function Emphasis({ text }: { text: string }) {
  const parts = splitTime(text)
  if (!parts) return <>{text}</>
  const [before, time, after] = parts
  return (
    <>
      {before}
      <b className="font-extrabold">{time}</b>
      {after}
    </>
  )
}

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text'

/**
 * Hero of the Biznes home page (runda 1411, board `Main.dc.html`; spec. §4 pkt 1 before): H1 with
 * its plain accent part, the wizard CTA and the offer with its count, both numbers of the line
 * with „Oddzwaniamy w 60 minut w godzinach pracy”; on the right the department wheel from the
 * catalog — from 1080 px. Under it the authorisations bar: the four producers (logo on a white
 * plaque, status in one line) and the company's numbers. Below 1080 px (§5 „Hero”): no wheel —
 * the five departments as a scrolling row of tiles; on a phone the text sits in a dark card with
 * two full-width call buttons, the bar becomes a scrolling row.
 */
export async function BzHeroBlock({ block, isFirst, tenantId, stats }: Props) {
  const [index, settings] = await Promise.all([
    getCatalogIndex(tenantId),
    getSiteSettings(tenantId),
  ])
  const groups = wheelGroups(index)
  const phones = block.showPhone
    ? [settings?.phone, settings?.phone2].flatMap((number) => {
        const href = number ? toTelHref(number) : null
        return number && href ? [{ number, href }] : []
      })
    : []
  // Plan 0611 §7.1 pkt 9: the hero is one of the three places of the promise (with „Nasze
  // zobowiązania” and the form). The confirmed wording (D18, 01.11) stands in while the panel's
  // „Obietnice” is empty (decyzja Krystiana 08.11: zapas tylko w hero).
  const callback = settings?.biznes?.promises.callbackTime?.trim() || 'Oddzwaniamy w ciągu 60 minut'
  // The four authorisations (K4-FINAL §1 order) with logo and status from `Partners`.
  const auth = K4_ORDER.flatMap((slug) => {
    const brand = index.brands.find((item) => item.slug === slug)
    const authorized =
      brand?.status === 'authorized-service' || brand?.status === 'authorized-partner'
    const status = partnerStatusLabel(brand?.status)
    return brand?.logo && authorized && status
      ? [
          {
            name: brand.name,
            status,
            logo: brand.logo,
            service: brand.status === 'authorized-service',
          },
        ]
      : []
  })
  const numbers = (stats ?? []).slice(0, 2)
  const Title = isFirst ? 'h1' : 'h2'

  return (
    <section
      id="start"
      className="relative overflow-hidden pt-4 pb-3 md:pt-10 md:pb-10 min-[1080px]:pb-12"
    >
      <Container
        wide
        className="relative grid items-center gap-7 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]"
      >
        <div className="flex flex-col gap-6 max-md:gap-3.5 max-md:rounded-[28px] max-md:bg-surface-dark max-md:bg-[radial-gradient(60%_50%_at_88%_8%,color-mix(in_srgb,var(--accent-on-dark)_32%,transparent),transparent_70%)] max-md:px-[22px] max-md:pt-[26px] max-md:pb-[22px] max-md:text-white">
          {block.pill && (
            <p className="inline-flex items-center gap-2 self-start text-sm font-bold text-ink-2 max-md:text-[13px] max-md:text-white/80">
              <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
              {block.pill}
            </p>
          )}
          <Title className="font-display text-[clamp(2.5rem,4.1vw,3.625rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance font-stretch-112% max-md:text-[31px]">
            {block.heading}
            {block.headingAccent && (
              <>
                {' '}
                {/* v150 (K36 §1): the second sentence on its own line, smaller (board `.s4h1 em`). */}
                <span className="mt-3.5 block text-[0.56em] leading-[1.15] tracking-[-0.015em] text-h1-accent max-md:mt-2.5 max-md:text-[0.62em] max-md:text-accent-on-dark">
                  {block.headingAccent}
                </span>
              </>
            )}
          </Title>
          {block.lead && (
            <p className="max-w-[52ch] text-[clamp(1.0625rem,1.35vw,1.22rem)] leading-relaxed text-ink-2 max-md:text-[15.5px] max-md:text-white/80">
              {block.lead}
            </p>
          )}
          <div className="flex flex-wrap gap-3 max-md:hidden">
            <a
              href={block.cta.href}
              className={`inline-flex min-h-14 items-center gap-3 rounded-2xl bg-accent-text py-2.5 pr-6 pl-3 font-bold text-accent-ink transition-colors hover:bg-ink hover:text-surface ${FOCUS}`}
            >
              <span
                aria-hidden="true"
                className="flex size-[34px] items-center justify-center rounded-[10px] bg-white/20"
              >
                <Icon name="clock" strokeWidth={2.2} />
              </span>
              {block.cta.label}
              <Icon name="arrow" strokeWidth={2.4} className="size-[18px]" />
            </a>
            {/* v150 (K36 §1): the whole offer with its count from the catalog. */}
            <Link
              href="/oferta"
              className={`inline-flex min-h-14 items-center gap-2.5 rounded-2xl bg-card px-6 font-bold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] transition-colors hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)] ${FOCUS}`}
            >
              Przeglądaj ofertę · {index.products.length}
            </Link>
          </div>
          {phones.length > 0 && (
            <div
              className="flex flex-col gap-2.5 border-t border-border pt-5 max-md:border-white/12 max-md:pt-4"
              data-hero-calls
            >
              <p className="text-xs font-extrabold tracking-[0.14em] text-ink-3 uppercase max-md:order-last max-md:text-[12px] max-md:tracking-normal max-md:text-white/75 max-md:normal-case">
                {/* Desktop: „Zadzwoń · ODDZWANIAMY W 60 MINUT…” over the buttons; phone: the
                    promise under them (§5 „Hero”). */}
                <span className="max-md:hidden">Zadzwoń · </span>
                <Emphasis text={callback} /> w godzinach pracy
              </p>
              <ul className="flex flex-wrap gap-2.5 max-md:grid max-md:grid-cols-1">
                {phones.map((item, i) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`inline-flex min-h-[52px] items-center gap-3 rounded-[15px] py-2 pr-[18px] pl-2 font-display text-[19px] font-extrabold tracking-[-0.01em] whitespace-nowrap max-md:w-full max-md:justify-center max-md:pl-[18px] ${
                        i === 0
                          ? 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--border)] max-md:bg-accent max-md:text-accent-ink max-md:shadow-none'
                          : 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--border)] max-md:bg-white/10 max-md:text-white max-md:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_22%,transparent)]'
                      } ${FOCUS}`}
                      data-hero-call={i === 0 ? 'main' : 'second'}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex size-9 items-center justify-center rounded-[11px] max-md:hidden ${
                          i === 0
                            ? 'bg-accent-text text-accent-ink'
                            : 'bg-card text-accent-text shadow-[inset_0_0_0_1px_var(--border)]'
                        }`}
                      >
                        <Icon name="phone" className="size-4" strokeWidth={2.2} />
                      </span>
                      <Icon name="phone" className="size-[18px] md:hidden" strokeWidth={2.2} />
                      {item.number}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {groups.length > 0 && (
          <div className="flex justify-center max-[1079px]:hidden">
            <DepartmentWheel
              groups={groups}
              hint={block.wheelHint}
              planLabel={block.planLinkLabel}
            />
          </div>
        )}
      </Container>

      {/* Below 1080 px the wheel's place: the five departments in a scrolling row (§5 „Hero”). */}
      {groups.length > 0 && (
        <Container wide className="mt-4 min-[1080px]:hidden">
          <ul
            className="-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none]"
            aria-label="Działy oferty"
            data-hero-departments
          >
            {groups.map((group) => {
              const thumb = group.items.find((item) => item.image)?.image
              return (
                <li key={group.slug} className="w-[158px] shrink-0 snap-start">
                  <Link
                    href={group.href}
                    className={`flex h-full min-h-[132px] flex-col gap-2 rounded-[20px] border border-border bg-card p-3 ${FOCUS}`}
                    style={{ borderTop: `4px solid ${group.gradient[0]}` }}
                  >
                    {thumb && (
                      <span className="flex h-[62px] items-center justify-center rounded-[14px] bg-white">
                        <Image
                          src={thumb.url}
                          alt=""
                          width={thumb.width}
                          height={thumb.height}
                          unoptimized
                          loading="lazy"
                          className="h-[52px] w-auto object-contain"
                        />
                      </span>
                    )}
                    <span className="text-[15px] leading-tight font-extrabold text-ink">
                      {group.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Container>
      )}

      {(auth.length > 0 || numbers.length > 0) && (
        <Container wide className="mt-6 min-[1080px]:mt-2">
          <div
            className="flex items-stretch gap-3 rounded-[26px] border border-border bg-surface-2 p-3 max-[1079px]:-mx-4 max-[1079px]:snap-x max-[1079px]:snap-mandatory max-[1079px]:overflow-x-auto max-[1079px]:rounded-none max-[1079px]:border-x-0 max-[1079px]:px-4 max-[1079px]:[scrollbar-width:none] min-[1080px]:max-[1279px]:flex-wrap min-[1360px]:pl-7"
            data-auth-bar
          >
            <p className="flex w-[118px] shrink-0 items-center text-[11px] leading-normal font-extrabold tracking-[0.16em] text-ink-2 uppercase max-[1359px]:hidden">
              Uprawnienia producentów
            </p>
            {auth.length > 0 && (
              <ul
                className="grid flex-1 grid-cols-4 gap-2.5 max-[1079px]:flex min-[1080px]:max-[1279px]:basis-full"
                aria-label="Uprawnienia producentów"
              >
                {auth.map((item) => (
                  <li
                    key={item.name}
                    className="flex min-h-[84px] min-w-0 flex-col justify-center gap-2 rounded-[18px] border border-border bg-white px-3.5 max-[1079px]:w-[190px] max-[1079px]:shrink-0 max-[1079px]:snap-start"
                  >
                    {/* Brand logos stay on a white plaque in both themes (K35 §6). */}
                    <Image
                      src={item.logo.url}
                      alt={item.name}
                      width={item.logo.width}
                      height={item.logo.height}
                      unoptimized
                      className="h-[22px] w-auto self-start object-contain"
                    />
                    <span
                      className={`flex items-center gap-1.5 text-[12px] font-extrabold whitespace-nowrap ${
                        item.service
                          ? 'text-[var(--c-biznes-tone-green-tag)]'
                          : 'text-[var(--c-biznes-text)]'
                      }`}
                    >
                      <Icon
                        name={item.service ? 'shield' : 'check'}
                        className="size-3.5 shrink-0"
                        strokeWidth={2.6}
                      />
                      {item.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {numbers.length > 0 && (
              <dl className="flex shrink-0 items-center gap-7 rounded-[18px] bg-surface-dark px-[26px] py-3 text-white min-[1080px]:max-[1279px]:basis-full">
                {numbers.map((stat) => (
                  <div key={stat.id ?? stat.value} className="flex flex-col-reverse gap-[3px]">
                    <dt className="text-[12px] text-white/75">{stat.label}</dt>
                    <dd className="font-display text-[26px] leading-none font-extrabold whitespace-nowrap font-stretch-115%">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Container>
      )}
    </section>
  )
}
