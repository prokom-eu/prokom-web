import Image from 'next/image'
import Link from 'next/link'

import { brandAsset, HORIZONTAL_LOGO_SIZE as LOGO } from '@/lib/brand/lines'
import { hasDarkTheme } from '@/lib/brand/theme'
import type { SiteTenant } from '@/lib/tenant/byHost'

/** The line's logo linking home; the negative version in the dark theme of lines that have one. */
export function SiteLogo({
  tenant,
  className = 'h-9 w-auto',
}: {
  tenant: SiteTenant
  className?: string
}) {
  const dark = hasDarkTheme(tenant.line)
  const alt = `${tenant.name} — strona główna`
  return (
    <Link href="/" className="shrink-0">
      <Image
        src={brandAsset(tenant.line, 'poziome_kolor.svg')}
        alt={alt}
        {...LOGO}
        className={dark ? `theme-light-only ${className}` : className}
      />
      {dark && (
        <Image
          src={brandAsset(tenant.line, 'poziome_negatyw.svg')}
          alt={alt}
          {...LOGO}
          className={`theme-dark-only ${className}`}
        />
      )}
    </Link>
  )
}
