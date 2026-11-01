import { Icon } from '@/components/ui/Icon'
import type { SoftwareHomeSections } from '@/lib/software/home'

type Panel = NonNullable<SoftwareHomeSections['heroPanel']>

/** Start of each notification's slide-in (MOBILE-APLIKACJA §3a pkt 5: 0,35 / 0,75 / 1,15 s). */
const DELAYS = ['[animation-delay:350ms]', '[animation-delay:750ms]', '[animation-delay:1150ms]']

/**
 * Card „Twoja Firma · panel” of the phone hero (v23, only ≤ 640 px): a sample of the client's
 * panel with notifications coming in one by one. Decorative sample, so the list is plain text;
 * with reduced motion everything is there at once.
 */
export function HeroPanelCard({ panel }: { panel: Panel }) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-[24px] bg-surface-dark p-3.5 text-white ring-1 ring-white/6 ring-inset min-[640px]:hidden">
      <p className="flex items-center justify-between gap-3 px-1 pt-0.5 text-[12.5px] font-extrabold text-white/80">
        <span className="inline-flex items-center gap-2">
          <i aria-hidden="true" className="size-3.5 rounded-[4px] bg-accent-on-dark" />
          {panel.title}
        </span>
        <span className="inline-flex items-center gap-1.5 text-footer-ok">
          <i aria-hidden="true" className="relative size-2 rounded-full bg-footer-ok">
            <i className="absolute inset-0 animate-ping rounded-full bg-footer-ok motion-reduce:hidden" />
          </i>
          {panel.live}
        </span>
      </p>
      <ul className="flex flex-col gap-2">
        {panel.items.map((item, index) => (
          <li
            // A sample list that never reorders; titles in the panel need not be unique.
            key={index}
            className={`grid animate-panel-in grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-2xl bg-white/6 p-2.5 motion-reduce:animate-none ${DELAYS[index] ?? ''}`}
          >
            <span
              aria-hidden="true"
              className={`grid size-[34px] place-items-center rounded-[11px] ${
                item.icon === 'check'
                  ? 'bg-footer-ok/16 text-footer-ok'
                  : 'bg-accent-on-dark/20 text-accent-on-dark'
              }`}
            >
              <Icon name={item.icon} className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <b className="truncate text-sm font-extrabold">{item.title}</b>
              <small className="truncate text-[12.5px] text-white/70">{item.sub}</small>
            </span>
            <em className="text-xs font-bold not-italic text-white/60">{item.time}</em>
          </li>
        ))}
      </ul>
      <p className="mt-1 flex items-center justify-between gap-3 border-t border-white/8 px-1 pt-2.5 text-[13px] text-white/70">
        {panel.footer.label}
        <b className="font-display text-[17px] font-extrabold text-white">{panel.footer.value}</b>
      </p>
    </div>
  )
}
