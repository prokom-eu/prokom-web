'use client'

import { type KeyboardEvent, type TouchEvent, useRef, useState } from 'react'

import { MediaImage } from '@/components/MediaImage'
import type { PublicImage } from '@/lib/media/public'
import { plural } from '@/lib/plural'

import { InstIcon } from '../../InstIcon'

type Props = {
  photos: PublicImage[]
  /** The realization's name: the gallery's label and the start of the button's name. */
  title: string
  /** `sizes` of the cover on the card. */
  sizes: string
}

const PHOTO_WORDS: [string, string, string] = ['zdjęcie', 'zdjęcia', 'zdjęć']
const SWIPE_PX = 40

/**
 * The cover of a realization card (RUNDA-V5 §4): the first photo in a 4:3 frame; pointing at it
 * zooms it a little and shows „4 zdjęcia →”; a click opens the gallery — a modal `<dialog>` with
 * arrows, ←/→ keys, a swipe on a phone, the counter and the photo's description. Esc and the
 * backdrop close it; the browser gives the focus back to the cover.
 */
export function RealizationPhotos({ photos, title, sizes }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const touchX = useRef<number | null>(null)
  const [index, setIndex] = useState(0)
  const count = photos.length
  const label = `${count} ${plural(count, PHOTO_WORDS)}`
  const cover = photos[0]
  if (!cover) return null

  const open = () => {
    setIndex(0)
    dialog.current?.showModal()
  }
  const go = (step: number) => setIndex((i) => (i + step + count) % count)
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(1)
    else if (event.key === 'ArrowLeft') go(-1)
    else return
    event.preventDefault()
  }
  const onTouchEnd = (event: TouchEvent) => {
    const start = touchX.current
    const end = event.changedTouches[0]?.clientX
    touchX.current = null
    if (start === null || end === undefined || Math.abs(end - start) < SWIPE_PX) return
    go(end < start ? 1 : -1)
  }
  const photo = photos[index] ?? cover

  return (
    <>
      <button
        type="button"
        className="rlph"
        onClick={open}
        aria-label={`${title}: ${label} — otwórz galerię`}
        aria-haspopup="dialog"
      >
        <MediaImage image={cover} sizes={sizes} className="rlphi" />
        <span className="rlphm" aria-hidden="true">
          {label} →
        </span>
      </button>
      <dialog
        ref={dialog}
        className="rlg"
        aria-label={`Zdjęcia: ${title}`}
        onKeyDown={onKey}
        // A click on the backdrop (the dialog itself, outside the frame) closes it.
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close()
        }}
        onTouchStart={(event) => {
          touchX.current = event.touches[0]?.clientX ?? null
        }}
        onTouchEnd={onTouchEnd}
      >
        <div className="rlgw">
          <figure key={index} className="rlgf">
            <MediaImage image={photo} sizes="(min-width: 760px) 720px, 100vw" className="rlgi" />
            {/* Shown, not read: the photo's alt already says it (review of PR 4). */}
            <figcaption aria-hidden="true">
              <b>{title}</b> {photo.alt}
            </figcaption>
          </figure>
          <p className="rlgc" aria-live="polite">
            {index + 1} / {count}
          </p>
          {count > 1 && (
            <>
              <button
                type="button"
                className="rlgb rlgp"
                onClick={() => go(-1)}
                aria-label="Poprzednie zdjęcie"
              >
                <InstIcon name="arrowL" size={22} />
              </button>
              <button
                type="button"
                className="rlgb rlgn"
                onClick={() => go(1)}
                aria-label="Następne zdjęcie"
              >
                <InstIcon name="arrow" size={22} />
              </button>
            </>
          )}
          <button
            type="button"
            className="rlgb rlgx"
            onClick={() => dialog.current?.close()}
            aria-label="Zamknij galerię"
            autoFocus
          >
            <InstIcon name="x" size={20} />
          </button>
        </div>
      </dialog>
    </>
  )
}
