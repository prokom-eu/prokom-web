import Image from 'next/image'

import { cx } from '@/components/ui/cx'
import type { SharedLineKey } from '@/lib/shared/lines'
import { lineLogoFile, type LogoTone } from '@/lib/shared/logo'

type Props = {
  line: SharedLineKey
  /** Accessible name, e.g. „PRO-KOM Biznes”; empty for a mark next to its name in text. */
  alt: string
  /** `auto` follows the page theme (both files, CSS shows one); `light`/`dark` = the background. */
  on?: 'auto' | 'light' | 'dark'
  /** Height in px; the width follows the file (180 × 36 in the header, spec §5). */
  height?: number
  /** At the top of the page: never lazy (often the LCP element). */
  eager?: boolean
  className?: string
}

const TONE: Record<'light' | 'dark', LogoTone> = { light: 'kolor', dark: 'negatyw' }

function Mark({
  line,
  alt,
  tone,
  height,
  eager,
  className,
}: Omit<Props, 'on'> & { tone: LogoTone; height: number }) {
  const file = lineLogoFile(line, tone)
  if (!file) return null
  const width = Math.round((file.width / file.height) * height)
  return (
    <Image
      src={file.src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      // Early in the queue (often the LCP element); not `preload`, which would add a <link> for
      // both theme files (Next 16 Image docs). Both are ~6 KB SVGs, so eager on both is cheap.
      fetchPriority={eager ? 'high' : undefined}
      className={cx('h-auto max-w-none', className)}
      // A container may resize the mark with `--logo-h` (the capsule on phones); the width follows.
      style={{ height: `var(--logo-h, ${height}px)`, width: 'auto' }}
      data-line-logo={line}
    />
  )
}

/**
 * The horizontal mark of a PRO-KOM line (spec §5 `LineLogo`). Gaming gets its own mark (§2.4);
 * a line without a file (Zakopane) renders nothing — the caller shows its name instead.
 */
export function LineLogo({ line, alt, on = 'auto', height = 36, eager, className }: Props) {
  if (on !== 'auto') {
    return <Mark {...{ line, alt, height, eager, className }} tone={TONE[on]} />
  }
  return (
    <>
      <Mark
        {...{ line, alt, height, eager }}
        tone="kolor"
        className={cx('theme-light-only', className)}
      />
      <Mark
        {...{ line, alt, height, eager }}
        tone="negatyw"
        className={cx('theme-dark-only', className)}
      />
    </>
  )
}
