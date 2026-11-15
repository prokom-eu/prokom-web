'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from 'react'

import { Icon } from '@/components/ui/Icon'
import { BUNDLES_PATH } from '@/lib/catalog/bundle'
import { PLAN_PATH } from '@/lib/catalog/floorPlan'
import type { OfferDepartment, OfferMenu, SupplyPage } from '@/lib/catalog/menu'
import type { IconName } from '@/lib/catalog/options'
import { CONFIGURATOR_PATH } from '@/lib/catalog/wizardEngine'
import { plural } from '@/lib/plural'

import { megaKey } from './megaKeys'

type Props = {
  offer: OfferMenu
  /** The shown department (kept by the header: ↓ on „Oferta ▾” focuses it). */
  active: number
  onActive: (index: number) => void
  /** Esc in the panel: close and give the focus back to „Oferta ▾”. */
  onClose: () => void
  /** „Szukasz konkretnego modelu? Ctrl K”. */
  onSearch: () => void
}

/** Hover intent before a department switches (plan 0611 §8.1 pkt 3). */
const HOVER_INTENT = 90
/** „Bezpłatny przegląd IT” — the card of a department without a top product. */
const REVIEW_HREF = '/opieka-it#przeglad'

const items = (n: number) => `${n} ${plural(n, ['pozycja', 'pozycje', 'pozycji'])}`
const categories = (n: number) => `${n} ${plural(n, ['kategoria', 'kategorie', 'kategorii'])}`

/** Department colours are data of the record (ADR-012, 18.10). */
const tint = (department: OfferDepartment) =>
  ({
    '--g1': department.gradient[0],
    '--g2': department.gradient[1],
    '--tint': department.gradient[0],
  }) as CSSProperties

const SUPPLY: Record<SupplyPage, { label: string; text: string; icon: IconName; color: string }> = {
  'agd-rtv-dla-firm': {
    label: 'AGD i RTV dla firm',
    text: 'Apartamenty, hotele, deweloperzy',
    icon: 'box',
    color: 'var(--warn)',
  },
  'dostawy-it-dla-firm': {
    label: 'Dostawy IT dla firm',
    text: 'Gotowe do pracy w dniu dostawy',
    icon: 'monitor',
    color: 'var(--c-software-text)',
  },
}

/**
 * Oferta ▾ premium (plan 0611 §8.1 pkt 3, prototype 0611 `mega()`): departments with a sliding
 * indicator and the department's top product, the department's categories with a studio
 * thumbnail and 2–4 brands, shortcuts with „Zaopatrzenie firm” once its pages exist, and a
 * bar with the search and the authorisations. Styles `.bmg*` in `biznes.css`.
 */
export function OfferMega({ offer, active, onActive, onClose, onSearch }: Props) {
  const id = useId()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const indicator = useRef<HTMLElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const intent = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(intent.current), [])

  // The indicator follows the active department (its height too: a name may wrap, also after
  // the window changes width).
  useLayoutEffect(() => {
    const place = () => {
      const tab = tabs.current[active]
      const mark = indicator.current
      if (!tab || !mark) return
      mark.style.translate = `0 ${tab.offsetTop}px`
      mark.style.height = `${tab.offsetHeight}px`
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [active])

  const department = offer.departments[active] ?? offer.departments[0]
  if (!department) return null
  const { totals } = offer

  const run = (event: KeyboardEvent, zone: 'tabs' | 'categories') => {
    const action = megaKey(event.key, { zone, index: active, count: offer.departments.length })
    if (action.type === 'none') return
    event.preventDefault()
    event.stopPropagation()
    if (action.type === 'tab') {
      onActive(action.focus)
      tabs.current[action.focus]?.focus()
    } else if (action.type === 'categories') {
      grid.current?.querySelector<HTMLElement>('a')?.focus()
    } else if (action.type === 'close') onClose()
  }

  return (
    <div className="bmg">
      <div className="bmg__body">
        {/* Departments */}
        <div className="bmg__dz">
          <span className="bmg__h" id={`${id}-dz`}>
            Działy
          </span>
          <i ref={indicator} className="bmg__ind" aria-hidden="true" />
          <div role="tablist" aria-orientation="vertical" aria-labelledby={`${id}-dz`}>
            {offer.departments.map((item, i) => (
              <button
                key={item.slug}
                ref={(element) => {
                  tabs.current[i] = element
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                className="bmg__d"
                aria-selected={i === active}
                aria-controls={`${id}-cat`}
                tabIndex={i === active ? 0 : -1}
                style={tint(item)}
                onClick={() => onActive(i)}
                onFocus={() => onActive(i)}
                onPointerEnter={(event) => {
                  if (event.pointerType !== 'mouse') return
                  window.clearTimeout(intent.current)
                  intent.current = window.setTimeout(() => onActive(i), HOVER_INTENT)
                }}
                onPointerLeave={() => window.clearTimeout(intent.current)}
                onKeyDown={(event) => run(event, 'tabs')}
              >
                <span className="bmg__mi" aria-hidden="true">
                  <Icon name={item.icon} strokeWidth={2} />
                </span>
                <span>
                  <b>{item.name}</b>
                  <small>{items(item.count)}</small>
                </span>
                <Icon name="arrow" className="bmg__ar" strokeWidth={2.2} />
              </button>
            ))}
          </div>
          <Featured department={department} />
        </div>

        {/* Categories of the department */}
        <div
          id={`${id}-cat`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${active}`}
          className="bmg__cat"
          style={tint(department)}
          onKeyDown={(event) => run(event, 'categories')}
        >
          <div className="bmg__ct">
            <span className="bmg__h">
              {department.name} · {categories(department.categories.length)}
            </span>
            {department.description && <p>{department.description}</p>}
          </div>
          {/* A new key per department restarts the cascade of the tiles. */}
          <div ref={grid} key={department.slug} className="bmg__grid">
            {department.categories.map((category, k) => (
              <Link
                key={category.href}
                href={category.href}
                className="bmg__c"
                style={{ '--k': k } as CSSProperties}
              >
                <span className={category.image ? 'bmg__th' : 'bmg__th bmg__th--ic'}>
                  {category.image ? (
                    <Image
                      src={category.image.url}
                      alt=""
                      width={category.image.width}
                      height={category.image.height}
                      unoptimized
                    />
                  ) : (
                    <Icon name={department.icon} strokeWidth={1.8} />
                  )}
                </span>
                <span>
                  <b>{category.label}</b>
                  <small>
                    {category.brands.length > 0
                      ? category.brands.join(' · ')
                      : items(category.count)}
                  </small>
                </span>
                <Icon name="arrow" className="size-4" />
              </Link>
            ))}
          </div>
          <div className="bmg__all">
            <Link href={department.href}>
              Cały dział {department.name}
              <Icon name="arrow" className="size-4" />
            </Link>
            <span>{items(department.count)}</span>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="bmg__sc">
          <span className="bmg__h">Na skróty</span>
          <Link href={CONFIGURATOR_PATH} className="bmg__k">
            <b>
              Konfigurator
              <Icon name="arrow" className="size-4" />
            </b>
            <small>Dobierzemy rozwiązanie w około minutę — z uzasadnieniem każdej pozycji.</small>
            <span className="bmg__tm">
              <Icon name="clock" className="size-3.5" />
              ok. 1 minuta
            </span>
          </Link>
          <Shortcut
            href={BUNDLES_PATH}
            icon="box"
            color="var(--c-instalacje)"
            label="Gotowe zestawy"
            text={
              totals.bundles > 0
                ? `${totals.bundles} ${plural(totals.bundles, ['zestaw', 'zestawy', 'zestawów'])}: sklep, gastronomia, biuro, hotel`
                : 'Sklep, gastronomia, biuro, hotel'
            }
          />
          <Shortcut
            href={PLAN_PATH}
            icon="map"
            color="var(--ok)"
            label="Plan Twojej firmy"
            text="Kliknij urządzenie na planie lokalu"
          />
          <Shortcut
            href="/oferta"
            icon="grid"
            color="var(--accent)"
            label={`Cała oferta · ${totals.products}`}
            text="Filtry po marce i branży"
          />
          {offer.supply.length > 0 && (
            <>
              <span className="bmg__h bmg__zh">Zaopatrzenie firm</span>
              {offer.supply.map((slug) => (
                <Shortcut key={slug} href={`/${slug}`} isNew {...SUPPLY[slug]} />
              ))}
            </>
          )}
        </div>
      </div>

      <div className="bmg__ft">
        <button type="button" onClick={onSearch} aria-keyshortcuts="Control+K Meta+K /">
          <Icon name="search" className="size-4" />
          Szukasz konkretnego modelu?
          <kbd aria-hidden="true">Ctrl K</kbd>
        </button>
        {/* Statuses only as in K4-FINAL §1. */}
        <div className="bmg__au">
          <span>
            <Icon name="check" className="size-4" strokeWidth={2.4} />
            Autoryzowany serwis Posnet i Elzab
          </span>
          <span>
            <Icon name="check" className="size-4" strokeWidth={2.4} />
            Autoryzowany partner GoPOS i InsERT
          </span>
        </div>
      </div>
    </div>
  )
}

/** „Najczęściej wybierane” of the department, or the free IT review (Serwis has no product). */
function Featured({ department }: { department: OfferDepartment }) {
  const { featured } = department
  const card = featured
    ? { label: 'Najczęściej wybierane', name: featured.name, badge: featured.badge }
    : { label: 'Na start', name: 'Bezpłatny przegląd IT', badge: 'Bez zobowiązań' }
  return (
    <Link href={featured?.href ?? REVIEW_HREF} className="bmg__feat" style={tint(department)}>
      {featured?.image ? (
        <span className="bmg__pic">
          <Image
            src={featured.image.url}
            alt=""
            width={featured.image.width}
            height={featured.image.height}
            unoptimized
          />
        </span>
      ) : (
        // A service or a product without a photo: the department's colours with an icon.
        <span className="bmg__pic bmg__pic--svc" aria-hidden="true">
          <Icon name={featured ? department.icon : 'shield'} />
        </span>
      )}
      <span>
        <small>{card.label}</small>
        <b>{card.name}</b>
        {card.badge && <em className="bmg__bdg">{card.badge}</em>}
      </span>
    </Link>
  )
}

function Shortcut({
  href,
  icon,
  color,
  label,
  text,
  isNew = false,
}: {
  href: string
  icon: IconName
  color: string
  label: string
  text: string
  isNew?: boolean
}) {
  return (
    <Link href={href} className="bmg__s" style={{ '--c': color } as CSSProperties}>
      <span className="bmg__si" aria-hidden="true">
        <Icon name={icon} strokeWidth={2} />
      </span>
      <span>
        <b>
          {label}
          {isNew && <em className="bmg__new">nowe</em>}
        </b>
        <small>{text}</small>
      </span>
      <Icon name="arrow" className="size-4" />
    </Link>
  )
}
