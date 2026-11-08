import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { CountUp } from '@/components/motion/CountUp'
import { cx } from '@/components/ui/cx'
import type { IndexImage, IndexLogo } from '@/lib/catalog/catalogIndex'
import { parseCount } from '@/lib/motion/countUp'

/** A brand of the page resolved to its logo and link (partner → catalog, else Media). */
export type ResolvedBrand = {
  name: string
  logo: IndexLogo | null
  /** Salon or brand page of a partner; other brands are not links. */
  href: string | null
}

/** Eyebrow, H2 and lead of a section (prototype `.head`). */
export function SectionHead({
  id,
  eyebrow,
  heading,
  lead,
}: {
  id: string
  eyebrow?: string
  heading: string
  lead?: ReactNode
}) {
  return (
    <div className="zp-head" data-reveal="">
      <div>
        {eyebrow && <p className="zp-eyebrow">{eyebrow}</p>}
        <h2 id={id}>{heading}</h2>
      </div>
      {lead && <p className="zp-head-lead">{lead}</p>}
    </div>
  )
}

/** A Media picture by id; missing (unknown, foreign or unpublished) → nothing. */
export function ProcImage({
  id,
  images,
  decorative = false,
  eager = false,
  className,
}: {
  id: number | null | undefined
  images: Record<number, IndexImage>
  decorative?: boolean
  eager?: boolean
  className?: string
}) {
  const image = id ? images[id] : undefined
  if (!image) return null
  return (
    <Image
      src={image.url}
      alt={decorative ? '' : image.alt}
      width={image.width}
      height={image.height}
      unoptimized
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      className={className}
    />
  )
}

/** Logo of a brand on a white tile, or its name when there is no logo. */
export function BrandMark({ brand }: { brand: ResolvedBrand }) {
  if (!brand.logo) return <span className="zp-brand-name">{brand.name}</span>
  return (
    <Image
      src={brand.logo.url}
      alt={brand.name}
      width={brand.logo.width}
      height={brand.logo.height}
      unoptimized
      draggable={false}
    />
  )
}

/** Internal address through `next/link`, an anchor or an outside address as a plain `<a>`. */
export function SmartLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

/**
 * A figure that counts up (ZAOPATRZENIE §7): not years (1900–2100) and not numbers below 10 —
 * those, and texts not starting with a number („od 2004”), stay as they are.
 */
export function Figure({ text, className }: { text: string; className?: string }) {
  const parsed = parseCount(text)
  const still = !parsed || parsed.value < 10 || (parsed.value >= 1900 && parsed.value <= 2100)
  return <b className={cx(className)}>{still ? text : <CountUp text={text} />}</b>
}
