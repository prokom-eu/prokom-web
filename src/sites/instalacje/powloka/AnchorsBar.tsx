import { RailMarks } from './RailMarks'

type Props = {
  /** Section ids of the page (the same as in the prototype) and their labels. */
  anchors: { id: string; label: string }[]
}

/**
 * Bar of section anchors under the header of subpages (`zrodlo/inc/pheroA.html` → `.anchors`):
 * sticky below the shared capsule, moves to the top when the phone capsule hides. Scrolls
 * sideways on a phone. First page with it: I4. From 1400 px the side rail's „Na tej stronie”
 * takes over (L1-I), so the same sections are marked for the rail (`RailMarks`).
 */
export function AnchorsBar({ anchors }: Props) {
  if (anchors.length === 0) return null
  return (
    <>
      <RailMarks anchors={anchors} />
      <nav className="anchors" aria-label="Sekcje strony">
        <div className="wrap">
          {anchors.map((anchor) => (
            <a key={anchor.id} href={`#${anchor.id}`}>
              {anchor.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  )
}
