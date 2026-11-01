import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import type { LivePreview } from '@/lib/software/previews'

import { PreviewProjectButton } from './LivePreviewTabs'
import { PreviewLaptop, PreviewPhone } from './PreviewScreens'

type Texts = { open: string; add: readonly [string, string] }

const NOTE_ICONS = [
  // bell — a new enquiry / booking
  'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  // tick
  'M5 12l5 5L20 7',
]

/**
 * One panel of „Podglądy na żywo” (spec. §4 pkt 5), rendered on the server: the laptop and the
 * phone living together with two floating notes, 3 steps and the card with the links. From
 * 641 px the stage keeps the board's proportions (1060 × 560); on a phone only the phone screen
 * stays — a shrunk laptop was unreadable there (audyt 01.11 P1 #22) — without floating notes.
 */
export function LivePreviewPanel({ preview, texts }: { preview: LivePreview; texts: Texts }) {
  return (
    <div className="flex flex-col gap-4 min-[640px]:gap-5">
      <div aria-hidden="true" data-parallax className="relative min-[641px]:aspect-[1060/560]">
        <div className="hidden min-[641px]:absolute min-[641px]:top-[3%] min-[641px]:left-[8.5%] min-[641px]:block min-[641px]:w-[78%]">
          <PreviewLaptop kind={preview.kind} />
        </div>
        <div className="mx-auto w-[64%] max-w-[260px] min-[641px]:absolute min-[641px]:top-[14%] min-[641px]:right-[3%] min-[641px]:mx-0 min-[641px]:w-[21%] min-[641px]:max-w-none min-[641px]:motion-safe:animate-float">
          <PreviewPhone kind={preview.kind} />
        </div>
        {preview.notes.map((note, i) => (
          <div
            key={`${i}-${note.title}`}
            className={cx(
              'absolute hidden max-w-[34%] items-center gap-3 rounded-2xl border border-border bg-card px-3.5 py-3 text-ink shadow-raised min-[1081px]:flex',
              i === 0 ? 'top-[11%] left-0' : 'top-[70%] left-[2%]',
              'motion-safe:animate-float',
            )}
            style={i === 0 ? { animationDelay: '-3s' } : undefined}
          >
            <i
              className={cx(
                'grid size-9 shrink-0 place-items-center rounded-xl',
                i === 0 ? 'bg-button text-accent-ink' : 'bg-ok text-white',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={i === 0 ? 2 : 3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={NOTE_ICONS[i]} />
              </svg>
            </i>
            <span className="flex flex-col text-sm leading-snug">
              <b>{note.title}</b>
              {note.text && <span className="text-xs text-ink-2">{note.text}</span>}
            </span>
          </div>
        ))}
      </div>

      {preview.steps.length > 0 && (
        <ol className="grid gap-2 min-[1081px]:grid-cols-3 min-[1081px]:gap-3">
          {preview.steps.map((step, i) => (
            <li
              key={`${i}-${step.title}`}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
            >
              <span className="font-display text-xl leading-none font-extrabold text-accent-text">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex flex-col gap-0.5">
                <b className="text-[14.5px]">{step.title}</b>
                {step.text && <span className="text-[13px] text-ink-2">{step.text}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-col gap-4 rounded-[22px] border border-border bg-card p-4 min-[640px]:p-6 min-[1081px]:flex-row min-[1081px]:items-center min-[1081px]:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          {preview.tag && (
            <p className="text-xs font-extrabold tracking-[0.14em] text-accent-text uppercase">
              {preview.tag}
            </p>
          )}
          <h3 className="font-display text-[22px] leading-tight font-extrabold min-[640px]:text-2xl">
            {preview.title}
          </h3>
          {preview.text && <p className="text-[15px] text-ink-2">{preview.text}</p>}
        </div>
        <div className="flex shrink-0 flex-col gap-2.5 min-[640px]:flex-row">
          <Link
            href={preview.href}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-border bg-card px-5 text-sm font-extrabold text-ink hover:border-accent-line"
          >
            {texts.open}
          </Link>
          <PreviewProjectButton item={preview.project} labels={texts.add} />
        </div>
      </div>
    </div>
  )
}
