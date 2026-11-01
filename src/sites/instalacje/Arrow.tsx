/**
 * The „→” of a link or a card: moves 3 px to the right while its link is pointed at
 * (`data-icon="arrow"`, motion.css §2). `inline-block`, because a translate does not move an
 * inline box; the width stays the same. Not hidden from screen readers: link names keep their „→”.
 */
export function Arrow() {
  return (
    <span data-icon="arrow" className="inline-block">
      →
    </span>
  )
}
