type Props = {
  /** Section ids of the page (the same as in the prototype) and their labels. */
  anchors: { id: string; label: string }[]
}

/**
 * Bar of section anchors under the header of subpages (`zrodlo/inc/pheroA.html` → `.anchors`):
 * sticky below the header, moves to the top when the phone header hides
 * (`html[data-hdr-hidden]`). Scrolls sideways on a phone. First page with it: I4.
 */
export function AnchorsBar({ anchors }: Props) {
  if (anchors.length === 0) return null
  return (
    <nav className="anchors" aria-label="Sekcje strony">
      <div className="wrap">
        {anchors.map((anchor) => (
          <a key={anchor.id} href={`#${anchor.id}`}>
            {anchor.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
