import type { FaqBlock as FaqBlockData } from '@/payload-types'

// `<details>` works without JavaScript and is accessible by default.
// TODO(S7): FAQPage structured data.
export function FaqBlock({ block }: { block: FaqBlockData }) {
  return (
    <section>
      {block.heading && <h2>{block.heading}</h2>}
      {block.items.map((item, i) => (
        <details key={item.id ?? i}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  )
}
