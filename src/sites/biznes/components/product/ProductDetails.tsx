import { RichText } from '@payloadcms/richtext-lexical/react'

import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import type { ProductTab, ProductView } from '@/lib/catalog/product'

import { ProductTabs, type TabPanel } from './ProductTabs'

const LABELS: Record<ProductTab, string> = {
  opis: 'Opis',
  specyfikacja: 'Specyfikacja',
  dokumenty: 'Dokumenty',
  pytania: 'Pytania',
}

/** Host of a manufacturer's address, shown next to the link (`www.elzab.com.pl`). */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function Documents({ documents }: { documents: ProductView['documents'] }) {
  const links: { url: string; label: string; icon: IconName }[] = [
    ...documents.datasheets.map((url) => ({
      url,
      label: 'Karta katalogowa (PDF)',
      icon: 'doc' as const,
    })),
    ...documents.productPages.map((url) => ({
      url,
      label: 'Strona producenta',
      icon: 'arrow' as const,
    })),
  ]
  return (
    <div className="flex max-w-3xl flex-col gap-3">
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-14 items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-accent-text">
                <Icon name={link.icon} className="size-4" strokeWidth={2.1} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-extrabold text-ink">{link.label}</span>
                <span className="truncate text-sm text-ink-3">{hostOf(link.url)}</span>
              </span>
              <span className="sr-only"> (otwiera się w nowej karcie)</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm text-ink-3">Dokumenty producenta — otwierają się na jego stronie.</p>
    </div>
  )
}

function Specs({ specs }: { specs: ProductView['specs'] }) {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {specs.map((group, position) => (
        <table key={position} className="w-full border-collapse text-left text-sm">
          {group.group && (
            <caption className="mb-2 text-left font-display text-lg font-extrabold text-ink">
              {group.group}
            </caption>
          )}
          <tbody>
            {group.rows.map((row) => (
              <tr key={row.label} className="border-b border-border">
                <th scope="row" className="w-2/5 py-2.5 pr-4 font-bold text-ink-3">
                  {row.label}
                </th>
                <td className="py-2.5 font-bold text-ink">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}

function Faq({ faq }: { faq: ProductView['faq'] }) {
  return (
    <div className="flex max-w-3xl flex-col gap-2">
      {faq.map((item) => (
        <details
          key={item.question}
          className="group rounded-2xl bg-card px-5 py-4 shadow-[inset_0_0_0_1px_var(--border)]"
        >
          <summary className="cursor-pointer font-extrabold text-ink">{item.question}</summary>
          <p className="mt-2 leading-relaxed text-ink-2">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}

/** Content of the tabs (spec. §6.2): only the ones with content (`ProductView.tabs`). */
export function ProductDetails({ product }: { product: ProductView }) {
  const content: Record<ProductTab, () => React.ReactNode> = {
    opis: () =>
      product.description && (
        <RichText data={product.description} className="rich-text max-w-3xl" />
      ),
    specyfikacja: () => <Specs specs={product.specs} />,
    dokumenty: () => <Documents documents={product.documents} />,
    pytania: () => <Faq faq={product.faq} />,
  }
  const panels: TabPanel[] = product.tabs.map((tab) => ({
    id: tab,
    label: LABELS[tab],
    content: content[tab](),
  }))
  return <ProductTabs panels={panels} />
}
