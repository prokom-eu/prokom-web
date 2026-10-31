import { MediaImage } from '@/components/MediaImage'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { PublicImage } from '@/lib/media/public'

export type PhotoTone = 'violet' | 'teal' | 'copper'

/** Gradients of the placeholders — existing Software tokens (ADR-015), never behind body text. */
const TONES: Record<PhotoTone, string> = {
  violet: 'bg-(image:--grad-say-no)',
  teal: 'bg-(image:--grad-area-sys)',
  copper: 'bg-(image:--grad-area-auto)',
}

export type PhotoView = { image: PublicImage | null; caption: string; tone: PhotoTone }

type Props = {
  photo: PhotoView
  sizes: string
  eager?: boolean
  className?: string
}

/**
 * A photo of the boards `ONas` / `Wszystko`, or — until it is taken — its placeholder: the tone,
 * an icon and „Zdjęcie do zrobienia” with what it should show. The caller leaves the placeholder
 * out on production (`photoView` returns `null` there, spec. §13 pkt 25).
 */
export function Photo({ photo, sizes, eager = false, className }: Props) {
  if (photo.image) {
    return (
      <div className={cx('relative overflow-hidden rounded-[22px] bg-surface-2', className)}>
        <MediaImage
          image={photo.image}
          sizes={sizes}
          eager={eager}
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    )
  }
  return (
    <div
      role="img"
      aria-label={`Zdjęcie do zrobienia: ${photo.caption}`}
      className={cx(
        'relative flex flex-col justify-between overflow-hidden rounded-[22px] p-4 text-white',
        TONES[photo.tone],
        className,
      )}
    >
      <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-white/16">
        <Icon name="monitor" className="size-5" />
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-surface-dark/75 to-transparent"
      />
      <span aria-hidden="true" className="relative flex flex-col gap-1">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/85">
          Zdjęcie do zrobienia
        </span>
        <span className="font-display text-base font-extrabold leading-snug">{photo.caption}</span>
      </span>
    </div>
  )
}
