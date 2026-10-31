'use client'

import Link from 'next/link'
import { useId, useState, type CSSProperties } from 'react'

import { Icon } from '@/components/ui/Icon'

type Category = { slug: string; name: string; count: number }

type Props = {
  groupName: string
  categories: Category[]
  /** Shown before „Wszystkie kategorie · N” (board `#s4-dz`: six). */
  visible: number
  allHref: string
  /** `--dept`: the group's colour for the „Cały dział” button. */
  style: CSSProperties
}

const categoryHref = (slug: string) => `/oferta/${encodeURIComponent(slug)}`

/**
 * Categories of a department card (board `#s4-dz`): the first six, the rest after „Wszystkie
 * kategorie · N” (in place, „Zwiń kategorie” folds them), then „Cały dział”.
 */
export function DepartmentCategories({ groupName, categories, visible, allHref, style }: Props) {
  const [open, setOpen] = useState(false)
  const listId = useId()
  const more = categories.length > visible
  const shown = open ? categories : categories.slice(0, visible)

  return (
    <>
      {shown.length > 0 && (
        <ul id={listId} className="mt-4 grid grid-cols-2 gap-1.5">
          {shown.map((category) => (
            <li key={category.slug} className="flex">
              <Link
                href={categoryHref(category.slug)}
                className="flex w-full items-center justify-between gap-2 rounded-[10px] bg-surface-2 px-2.5 py-2 text-[13px] leading-snug font-bold text-ink transition-colors hover:bg-accent-soft hover:text-accent-text"
              >
                {category.name}
                <span className="shrink-0 text-xs font-bold text-ink-2">{category.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3.5">
          {more ? (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={listId}
              onClick={() => setOpen((value) => !value)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-1 text-[13px] font-bold text-ink-2 hover:text-ink"
            >
              {open ? 'Zwiń kategorie' : `Wszystkie kategorie · ${categories.length}`}
              <Icon
                name="arrow"
                strokeWidth={2.4}
                className={open ? 'size-3.5 -rotate-90' : 'size-3.5 rotate-90'}
              />
            </button>
          ) : (
            <span />
          )}
          <Link
            href={allHref}
            style={style}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[color-mix(in_srgb,var(--dept)_14%,var(--card))] px-3.5 text-[13.5px] font-extrabold text-ink transition-colors hover:bg-[color-mix(in_srgb,var(--dept)_24%,var(--card))]"
          >
            <span className="sr-only">{groupName}: </span>
            Cały dział
            <Icon name="arrow" strokeWidth={2.4} className="size-4" />
          </Link>
        </div>
      </div>
    </>
  )
}
