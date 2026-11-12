'use client'

import { useEffect, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { activeSlide } from '@/lib/software/carousel'

type Props = {
  /** Id of the scrolling row; its children are the cards. */
  listId: string
  count: number
  /** Where the row stops being a carousel, e.g. `min-[641px]:hidden`. */
  className?: string
  /** On the dark footer. */
  tone?: 'light' | 'dark'
}

/**
 * Dots under a phone carousel (audyt 01.11 P1 #23–#24): how many cards there are and which one
 * is in view, so the ones beyond the edge are not missed. Only a picture — the row itself is the
 * accessible list — so `aria-hidden`; the active dot follows the scroll (`activeSlide`).
 */
export function CarouselDots({ listId, count, className, tone = 'light' }: Props) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const list = document.getElementById(listId)
    if (!list) return
    const update = () => {
      const left =
        list.getBoundingClientRect().left + parseFloat(getComputedStyle(list).paddingLeft)
      const starts = [...list.children].map((child) => child.getBoundingClientRect().left - left)
      const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2
      setActive(activeSlide(starts, atEnd && list.scrollLeft > 0))
    }
    update()
    list.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      list.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [listId, count])

  if (count < 2) return null
  return (
    <div aria-hidden="true" className={cx('mt-3 flex justify-center gap-1.5', className)}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cx(
            'h-1.5 rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none',
            i === active
              ? cx('w-5', tone === 'dark' ? 'bg-accent-on-dark' : 'bg-accent')
              : cx('w-1.5', tone === 'dark' ? 'bg-footer-muted' : 'bg-border-input'),
          )}
        />
      ))}
    </div>
  )
}
