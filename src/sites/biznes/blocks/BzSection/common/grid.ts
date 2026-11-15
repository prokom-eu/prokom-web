/**
 * Card grid of the K4 sections without an orphan (audit 14.11 P1-4): the number of columns comes
 * from the number of cards, and an incomplete last row is centred. The grid has twice the columns
 * and each card spans two, so half a column of offset centres the row.
 *
 * Columns: phone 1 or 2 (`phone`), tablet (640–1079 px) 2, from 1080 px 4 for 4, 8… cards, else 3;
 * 5 cards — 5 in a row from 1280 px (3 + 2 below). 4 cards: 2 × 2, then 4 in a row.
 */

type Range = 'tablet' | 'phoneTablet' | 'desktop' | 'desktopOnly'

/** Tailwind classes written out whole, so the scanner sees every one. */
const START: Record<Range, Record<number, string>> = {
  // phone (2 columns) and tablet: below 1080 px
  phoneTablet: { 2: 'max-[1079px]:col-start-2' },
  // tablet only, when the phone shows one column
  tablet: { 2: 'min-[640px]:max-[1079px]:col-start-2' },
  // from 1080 px on
  desktop: {
    2: 'min-[1080px]:col-start-2',
    3: 'min-[1080px]:col-start-3',
    4: 'min-[1080px]:col-start-4',
  },
  // 1080–1279 px, when 1280 px has a column per card
  desktopOnly: {
    2: 'min-[1080px]:max-[1279px]:col-start-2',
    3: 'min-[1080px]:max-[1279px]:col-start-3',
    4: 'min-[1080px]:max-[1279px]:col-start-4',
  },
}

const DESKTOP_COLUMNS: Record<number, string> = {
  3: 'min-[1080px]:grid-cols-6',
  4: 'min-[1080px]:grid-cols-8',
}

/** Columns of each range for a number of cards. */
export function gridColumns(count: number): { tablet: 2; desktop: 3 | 4; wide: number } {
  const desktop = count > 0 && count % 4 === 0 ? 4 : 3
  return { tablet: 2, desktop, wide: count === 5 ? 5 : desktop }
}

/** Offset (in half columns, 1-based) of the first card of an incomplete last row, or none. */
function start(count: number, columns: number): number | null {
  const rest = count % columns
  return rest === 0 ? null : columns - rest + 1
}

export function balancedGrid(
  count: number,
  { phone }: { phone: 1 | 2 },
): { list: string; item: (index: number) => string } {
  const columns = gridColumns(count)
  const wide = columns.wide !== columns.desktop
  const list = [
    'grid',
    phone === 2 ? 'grid-cols-4' : 'grid-cols-2 min-[640px]:grid-cols-4',
    DESKTOP_COLUMNS[columns.desktop],
    wide && 'min-[1280px]:grid-cols-10',
  ]
    .filter(Boolean)
    .join(' ')
  const offsets: [Range, number, number | null][] = [
    [phone === 2 ? 'phoneTablet' : 'tablet', columns.tablet, start(count, columns.tablet)],
    [wide ? 'desktopOnly' : 'desktop', columns.desktop, start(count, columns.desktop)],
  ]
  const item = (index: number) =>
    [
      'col-span-2',
      ...offsets.flatMap(([range, perRow, offset]) =>
        offset !== null && index === count - (count % perRow) ? [START[range][offset]!] : [],
      ),
    ].join(' ')
  return { list, item }
}
