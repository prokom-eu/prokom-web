import { splitBold } from '@/lib/site/emphasis'

/** Panel text with `**bold**` fragments (`splitBold`); bold in the ink colour. */
export function Emphasis({ text, boldClassName }: { text: string; boldClassName?: string }) {
  return (
    <>
      {splitBold(text).map((part, i) =>
        part.bold ? (
          <strong key={i} className={boldClassName ?? 'font-bold text-ink'}>
            {part.text}
          </strong>
        ) : (
          part.text
        ),
      )}
    </>
  )
}
