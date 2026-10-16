import type { ServiceGridBlock as ServiceGridBlockData } from '@/payload-types'

import { BlockLink } from '../BlockLink'

export function ServiceGridBlock({ block }: { block: ServiceGridBlockData }) {
  const ItemHeading = block.heading ? 'h3' : 'h2'
  return (
    <section>
      {block.heading && <h2>{block.heading}</h2>}
      {block.intro && <p>{block.intro}</p>}
      <ul>
        {block.items.map((item, i) => (
          <li key={item.id ?? i}>
            <ItemHeading>{item.title}</ItemHeading>
            {item.description && <p>{item.description}</p>}
            <BlockLink link={item.link} />
          </li>
        ))}
      </ul>
    </section>
  )
}
