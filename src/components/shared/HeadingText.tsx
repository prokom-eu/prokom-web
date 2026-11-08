import { splitBold } from '@/lib/site/emphasis'

/**
 * A heading typed in the panel with its highlighted part in `**stars**` (AUDYT-0811 #11): the
 * part becomes `<em>`, which a line may paint (Software: the v24 gradient). Without stars — the
 * plain text, so lines that do not mark anything look as before.
 */
export function HeadingText({ text }: { text: string }) {
  return (
    <>
      {splitBold(text).map((part, i) =>
        part.bold ? (
          <em key={i} className="not-italic" data-heading-em>
            {part.text}
          </em>
        ) : (
          part.text
        ),
      )}
    </>
  )
}
