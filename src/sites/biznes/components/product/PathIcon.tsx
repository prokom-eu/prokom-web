import { PRODUCT_ICONS, type ProductIcon } from '@/lib/catalog/productIcons'

/** A stroked 24 × 24 icon from a path of the board (`lib/catalog/productIcons`). */
export function PathIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={d} />
    </svg>
  )
}

export const productIconPath = (icon: ProductIcon) => PRODUCT_ICONS[icon]
