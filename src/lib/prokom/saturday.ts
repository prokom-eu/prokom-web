/** The Saturday part of a line's hours text from the panel, e.g. „sob. 9:00–14:00”. */
const SATURDAY = /(?:sobota|sob\.|so\.)[^,;]*/i

/**
 * Lines that work on Saturday although the salon is closed then (decision of 15.11: only Tech) —
 * read from the hours text in the panel, so a change there needs no code.
 */
export function saturdayLines<T extends { key: string; name: string; hours: string | null }>(
  lines: readonly T[],
): { key: T['key']; name: string; saturday: string }[] {
  return lines.flatMap((line) => {
    const match = line.hours?.match(SATURDAY)
    return match ? [{ key: line.key, name: line.name, saturday: match[0].trim() }] : []
  })
}
