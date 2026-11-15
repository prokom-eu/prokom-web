/** Magnifier of the search (header button, overlay, catalog box); decorative. */
export function SearchIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M11 18a7 7 0 100-14 7 7 0 000 14z M20 20l-4.3-4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
