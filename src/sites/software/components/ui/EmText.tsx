import { splitBold } from '@/lib/site/emphasis'

/**
 * A Software heading typed in the panel with its highlighted part in `**stars**` (AUDYT po SWA7
 * #5: „eyebrow → H2 z `em`” on every section): the part becomes `<em>` in the v24 gradient.
 * Without stars — the plain text. The H1 of a subpage hero passes `sw-em-hero`.
 */
export function EmText({ text, emClass = 'sw-em' }: { text: string; emClass?: string }) {
  return (
    <>
      {splitBold(text).map((part, i) =>
        part.bold ? (
          <em key={i} className={emClass}>
            {part.text}
          </em>
        ) : (
          part.text
        ),
      )}
    </>
  )
}
