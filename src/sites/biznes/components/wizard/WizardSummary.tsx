import Image from 'next/image'
import { useId } from 'react'

import { cx } from '@/components/ui/cx'
import type { Wizard } from '@/lib/catalog/wizard'
import type { Kit, WizardAnswers } from '@/lib/catalog/wizardKit'
import { plural } from '@/lib/plural'

import { WizardIcon } from './WizardIcon'

export const TONE_GRADIENT: Record<Wizard['businessTypes'][number]['tone'], string> = {
  green: 'from-tone-green to-tone-green-2',
  red: 'from-tone-red to-tone-red-2',
  blue: 'from-tone-blue to-tone-blue-2',
  violet: 'from-tone-violet to-tone-violet-2',
}

type Props = {
  rules: Wizard
  answers: WizardAnswers | null
  kit: Kit | null
  phone: { label: string; href: string } | null
}

/** Short description of the answers for the panel (board: „2 stanowiska sprzedaży · …”). */
function metaOf(rules: Wizard, answers: WizardAnswers): string[] {
  const meta: string[] = []
  if (answers.salesPoints !== '0') {
    meta.push(
      `${answers.salesPoints} ${answers.salesPoints === '1' ? 'stanowisko sprzedaży' : 'stanowiska sprzedaży'}`,
    )
  }
  if (answers.computers !== '0') meta.push(`${answers.computers} komputerów`)
  const premises = rules.scale.premises.options.find((option) => option.id === answers.premises)
  if (premises) meta.push(premises.name.toLowerCase())
  if (answers.when) meta.push(answers.when.toLowerCase())
  return meta
}

/**
 * „Twój zestaw” (board `Kreator`): the live kit beside the steps — items with pictures and the
 * quantity, services included and badges. Sticky on a computer, under the steps on a phone.
 */
export function WizardSummary({ rules, answers, kit, phone }: Props) {
  const type = answers
    ? rules.businessTypes.find((item) => item.id === answers.businessType)
    : undefined
  const items = kit?.items ?? []
  const headingId = useId()
  return (
    <aside
      aria-labelledby={headingId}
      data-surface="dark"
      className="overflow-hidden rounded-[28px] bg-surface-dark text-white shadow-[0_40px_80px_-40px_var(--glow)] lg:sticky lg:top-28"
    >
      <div className="flex items-center gap-4 bg-[radial-gradient(ellipse_at_85%_0%,var(--glow),transparent_60%)] px-6 pt-6 pb-4">
        <span
          aria-hidden="true"
          className={cx(
            'flex size-[52px] shrink-0 items-center justify-center rounded-2xl text-white',
            type
              ? cx('bg-linear-135', TONE_GRADIENT[type.tone])
              : 'ring-[1.5px] ring-white/25 ring-inset',
          )}
        >
          <WizardIcon name={type?.icon ?? 'plus'} className="size-6" />
        </span>
        <div>
          <p className="text-[12px] font-extrabold tracking-[0.12em] text-accent-on-dark uppercase">
            Twój zestaw
          </p>
          <h2 id={headingId} className="font-display text-xl font-extrabold">
            {type?.name ?? 'Zaczynamy'}
          </h2>
        </div>
      </div>
      {answers && (
        <ul className="flex flex-wrap gap-2 px-6">
          {metaOf(rules, answers).map((item) => (
            <li key={item} className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold">
              {item}
            </li>
          ))}
        </ul>
      )}
      <div className="px-4 py-4">
        {items.length === 0 ? (
          <div>
            <ul aria-hidden="true" className="flex flex-col gap-2">
              {[0, 1, 2].map((row) => (
                <li key={row} className="h-[72px] rounded-2xl bg-white/5" />
              ))}
            </ul>
            <p className="mt-4 text-center text-sm text-white/70">
              {answers
                ? 'Zaznacz, co ma działać — zestaw zbuduje się sam.'
                : 'Wybierz branżę — zestaw zbuduje się sam.'}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.need} className="flex items-center gap-3 rounded-2xl bg-white/5 p-2.5">
                <span
                  aria-hidden="true"
                  className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white text-surface-dark"
                >
                  {item.image ? (
                    <Image
                      src={item.image.url}
                      alt=""
                      width={item.image.width}
                      height={item.image.height}
                      unoptimized
                      className="h-auto max-h-12 w-auto max-w-12 object-contain"
                    />
                  ) : (
                    <WizardIcon name={item.icon} className="size-6" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold leading-snug">
                    {item.quantity > 1 && `${item.quantity} × `}
                    {item.name}
                  </span>
                  {item.caption && (
                    <span className="mt-0.5 block text-[13px] leading-snug text-white/70">
                      {item.caption}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {kit && items.length > 0 && (
        <div className="flex flex-col gap-4 px-6 pb-5">
          <div>
            <p className="text-[12px] font-extrabold tracking-[0.12em] text-white/70 uppercase">
              W cenie zestawu
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {kit.services.map((service) => (
                <li
                  key={service}
                  className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
          {kit.badges.length > 0 && (
            <ul className="flex flex-col gap-2">
              {kit.badges.map((badge) => (
                <li key={badge.text} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                  <span className="min-w-14 rounded-xl bg-promo px-2 py-1.5 text-center font-display text-sm font-extrabold text-promo-ink">
                    {badge.value}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{badge.text}</span>
                    {badge.caption && (
                      <span className="block text-[13px] text-white/70">{badge.caption}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-6 py-4 text-sm">
        <p aria-live="polite" className="font-bold">
          {items.length}{' '}
          {plural(items.length, ['element zestawu', 'elementy zestawu', 'elementów zestawu'])}
        </p>
        {phone && (
          <a href={phone.href} className="font-bold text-accent-on-dark hover:underline">
            1 opiekun · {phone.label}
          </a>
        )}
      </div>
    </aside>
  )
}
