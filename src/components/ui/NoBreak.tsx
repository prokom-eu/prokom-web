import { noBreakParts } from '@/lib/text/noBreak'

/** Text whose short hyphenated words („P-4”, „Wi-Fi”) never break after the hyphen. */
export function NoBreak({ text }: { text: string }) {
  return noBreakParts(text).map((part, i) =>
    part.nowrap ? (
      <span key={i} className="whitespace-nowrap">
        {part.text}
      </span>
    ) : (
      part.text
    ),
  )
}
