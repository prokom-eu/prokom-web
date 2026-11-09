import { splitBold } from '@/lib/site/emphasis'

/** The `<em>` of a band heading: a line may paint `[data-heading-em]` (Software: the v24 band). */
function BandEm({ children }: { children: string }) {
  return (
    <em className="not-italic" data-heading-em>
      {children}
    </em>
  )
}

/**
 * A heading typed in the panel with its highlighted part in `**stars**` (AUDYT-0811 #11): the
 * part becomes `<em>`, which a line may paint (Software: the v24 gradient). Without stars — the
 * plain text, so lines that do not mark anything look as before. `emClass` replaces the band
 * look with the line's own class (a heading on a light section).
 */
export function HeadingText({ text, emClass }: { text: string; emClass?: string }) {
  return (
    <>
      {splitBold(text).map((part, i) =>
        !part.bold ? (
          part.text
        ) : emClass ? (
          <em key={i} className={emClass}>
            {part.text}
          </em>
        ) : (
          <BandEm key={i}>{part.text}</BandEm>
        ),
      )}
    </>
  )
}

/**
 * A heading written in a shared template with its highlighted part in `**stars**` (AUDYT-0911
 * #1). Only a line that passes `emClass` gets the `<em>`; for the others the stars are dropped and
 * the heading stays plain text, as before. `band`: the heading sits on the dark band, so the
 * highlight takes the band look (`[data-heading-em]`) instead of `emClass`.
 */
export function AccentText({
  text,
  emClass,
  band = false,
}: {
  text: string
  emClass?: string
  band?: boolean
}) {
  const parts = splitBold(text)
  if (!emClass) return <>{parts.map((part) => part.text).join('')}</>
  return band ? <HeadingText text={text} /> : <HeadingText text={text} emClass={emClass} />
}
