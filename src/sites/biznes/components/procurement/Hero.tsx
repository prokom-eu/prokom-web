import type { CSSProperties } from 'react'

import type { IndexImage } from '@/lib/catalog/catalogIndex'
import type { ProcurementPageData } from '@/lib/biznes/procurement/schema'
import { toTelHref } from '@/lib/site/link'

import { BrandMarquee } from './BrandMarquee'
import { iconPath, ProcIcon } from './icons'
import { BrandMark, Figure, ProcImage, SmartLink, type ResolvedBrand } from './parts'

type Hero = ProcurementPageData['hero']
type Box = Hero['scene'][number]['box']

/** Depth of each packshot for the pointer parallax (prototype `Z`). */
const DEPTH = [10, 18, 24, 14, 20]

function boxStyle(box: Box, extra: Record<string, string | number>): CSSProperties {
  const { z, ...edges } = box
  return { ...edges, ...(z !== undefined && { zIndex: z }), ...extra } as CSSProperties
}

/**
 * Hero of a procurement page (ZAOPATRZENIE §2 pkt 1): navy card with the H1, the action and the
 * line's phone (from the panel), the figures, and the scene of packshots placed by `box` with
 * the chips (the `live` chip is static until the configurator drives it, B2-1c).
 */
export function ProcurementHero({
  hero,
  phone,
  images,
}: {
  hero: Hero
  phone: string | null
  images: Record<number, IndexImage>
}) {
  const tel = phone ? toTelHref(phone) : null
  return (
    <section className="zp-hero" aria-labelledby="zp-h1">
      <div className="zp-hero-text">
        <p className="zp-pill">
          <i aria-hidden="true" />
          {hero.pill}
        </p>
        <h1 id="zp-h1">
          {hero.heading}
          {hero.headingAccent && (
            <>
              {' '}
              <em>{hero.headingAccent}</em>
            </>
          )}
        </h1>
        <p className="zp-hero-lead">{hero.lead}</p>
        <div className="zp-acts">
          <SmartLink href={hero.action.href} className="zp-btn zp-btn-white">
            {hero.action.label}
            <ProcIcon name="arrow" />
          </SmartLink>
          {phone && tel && (
            <a href={tel} className="zp-btn zp-btn-ghost">
              <ProcIcon name="phone" />
              {phone}
            </a>
          )}
        </div>
        {hero.stats.length > 0 && (
          <ul className="zp-stats">
            {hero.stats.map((stat) => (
              <li key={stat.label}>
                <Figure text={stat.value} />
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="zp-scene" aria-hidden="true">
        <div className="zp-floor" />
        {hero.scene.map((item, i) => (
          <div
            key={i}
            className="zp-scene-item"
            style={boxStyle(item.box, { '--i': i, '--z': DEPTH[i % DEPTH.length]! })}
          >
            <ProcImage id={item.image} images={images} decorative eager />
          </div>
        ))}
        {hero.chips.map((chip, i) => (
          <span
            key={chip.text}
            className="zp-chip"
            data-live={chip.live ? '' : undefined}
            style={boxStyle(chip.box, { '--i': i })}
          >
            <i>{iconPath(chip.icon) ? <ProcIcon name={chip.icon} /> : chip.icon}</i>
            <span>{chip.text}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

/** Brand strip under the hero (§2 pkt 2): logos only; partner tiles lead to the brand page. */
export function HeroBrands({ label, brands }: { label: string; brands: ResolvedBrand[] }) {
  const logos = brands.filter((brand) => brand.logo)
  if (logos.length === 0) return null
  return (
    <BrandMarquee label={label} showLabel>
      {logos.map((brand) => (
        <li key={brand.name}>
          {brand.href ? (
            <SmartLink href={brand.href} className="zp-marq-tile">
              <BrandMark brand={brand} />
            </SmartLink>
          ) : (
            <span className="zp-marq-tile">
              <BrandMark brand={brand} />
            </span>
          )}
        </li>
      ))}
    </BrandMarquee>
  )
}
