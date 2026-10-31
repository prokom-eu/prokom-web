/**
 * Views of the SW11b blocks (`swPageHero`, `swSteps`, `swTeam`, `swLines`; boards `ONas`,
 * `Wszystko`). Pure: the components pass `fill` (facts and prices, `lib/software/facts`) and
 * the image resolver. On production `fill` returns `null` for a text with a missing fact; then
 * the item or card that holds it is left out (ADR-014 §1.4) — `[ROK ZAKOPANE]`, `[IMIĘ I
 * NAZWISKO]`, `[ADRES SALONU W ZAKOPANEM]`. A photo placeholder never reaches production
 * (spec. §13 pkt 25).
 */

export type Fill = (value: string | null | undefined) => string | null

type Tone = 'violet' | 'teal' | 'copper'

export type PhotoSource = {
  photo?: unknown
  photoCaption: string
  tone?: Tone | null
}

export type PhotoViewOf<I> = { image: I | null; caption: string; tone: Tone }

/** The photo, its placeholder off production, or `null` (placeholder on production). */
export function photoView<I>(
  source: PhotoSource,
  resolve: (value: unknown) => I | null,
  strict: boolean,
): PhotoViewOf<I> | null {
  const image = resolve(source.photo)
  if (!image && strict) return null
  return { image, caption: source.photoCaption, tone: source.tone ?? 'violet' }
}

/** Optional text: empty stays `undefined`, a missing fact makes the whole thing fail (`null`). */
function optional(fill: Fill, value: string | null | undefined): string | undefined | null {
  if (!value) return undefined
  return fill(value)
}

export type StepItem = {
  key: string
  marker?: string
  icon?: string
  title?: string
  text?: string
}

type StepSource = {
  id?: string | null
  marker?: string | null
  icon?: string | null
  title?: string | null
  text?: string | null
}

/** Items of `swSteps`; an item with a missing fact in any of its texts is left out. */
export function stepItems(items: readonly StepSource[] | null | undefined, fill: Fill): StepItem[] {
  return (items ?? []).flatMap((item, index) => {
    const marker = optional(fill, item.marker)
    const title = optional(fill, item.title)
    const text = optional(fill, item.text)
    if (marker === null || title === null || text === null) return []
    if (!marker && !title && !text) return []
    return [
      {
        key: item.id ?? String(index),
        ...(marker && { marker }),
        ...(item.icon && { icon: item.icon }),
        ...(title && { title }),
        ...(text && { text }),
      },
    ]
  })
}

export type TeamCard<P> = {
  key: string
  role?: string
  name: string
  text?: string
  details: string[]
  photo: P | null
}

type TeamSource = {
  id?: string | null
  role?: string | null
  name: string
  text?: string | null
  details?: string | null
}

/** Cards of `swTeam`; `details` split into lines; a card with a missing fact is left out. */
export function teamCards<S extends TeamSource, P>(
  members: readonly S[] | null | undefined,
  fill: Fill,
  photo: (member: S) => P | null,
  /** Places: a detail line with a missing fact goes, the card stays (the salon still exists). */
  { keepCardWithoutLine = false }: { keepCardWithoutLine?: boolean } = {},
): TeamCard<P>[] {
  return (members ?? []).flatMap((member, index) => {
    const name = fill(member.name)
    const role = optional(fill, member.role)
    const text = optional(fill, member.text)
    const details = (member.details ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => fill(line))
    if (!name || role === null || text === null) return []
    if (details.includes(null) && !keepCardWithoutLine) return []
    return [
      {
        key: member.id ?? String(index),
        ...(role && { role }),
        name,
        ...(text && { text }),
        details: details.filter((line): line is string => line !== null),
        photo: photo(member),
      },
    ]
  })
}

export type LineCard = {
  key: string
  name: string
  icon?: string
  /** Missing fact on production: the card stays, its caption goes („salon · [ADRES…]”). */
  address?: string
  href?: string
  points: string[]
  cta?: string
  current: boolean
}

type LineSource = {
  id?: string | null
  name: string
  icon?: string | null
  address?: string | null
  href?: string | null
  points?: readonly { text: string }[] | null
  cta?: string | null
  current?: boolean | null
}

/** Cards of `swLines` (variant „lines”); points with a missing fact are left out. */
export function lineCards(lines: readonly LineSource[] | null | undefined, fill: Fill): LineCard[] {
  return (lines ?? []).flatMap((line, index) => {
    const name = fill(line.name)
    if (!name) return []
    const address = line.address ? fill(line.address) : null
    const cta = line.cta ? fill(line.cta) : null
    return [
      {
        key: line.id ?? String(index),
        name,
        ...(line.icon && { icon: line.icon }),
        ...(address && { address }),
        ...(line.href && { href: line.href }),
        points: (line.points ?? []).flatMap((point) => {
          const text = fill(point.text)
          return text ? [text] : []
        }),
        ...(cta && { cta }),
        current: Boolean(line.current),
      },
    ]
  })
}
