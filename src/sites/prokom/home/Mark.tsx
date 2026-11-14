import { cx } from '@/components/ui/cx'

type Props = {
  /** „BIZNES”, „TAK PRACUJĄ RAZEM”… — under the mark, in the line's text colour. */
  label?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * The PRO–KOM word mark with the dash in the colour of the surrounding line (`--ln`), as on the
 * board's line cards. Readers get „PRO-KOM” once, without the drawn dash.
 */
export function Mark({ label, size = 'sm', className }: Props) {
  return (
    <span className={cx('pk-mark', `pk-mark--${size}`, className)}>
      <span className="sr-only">PRO-KOM</span>
      <span aria-hidden="true" className="pk-mark__word">
        PRO
        <span className="pk-mark__dash" />
        KOM
      </span>
      {label && <span className="pk-mark__label">{label}</span>}
    </span>
  )
}
