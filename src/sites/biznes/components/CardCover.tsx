import Image from 'next/image'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import {
  type CardCover,
  type CoverTone,
  ELECTRONIC_TERMS,
  type LicenceCover,
  PERPETUAL_TERMS,
  type ServiceCover,
  SUBSCRIPTION_TERMS,
} from '@/lib/catalog/cover'
import type { IconName } from '@/lib/catalog/options'

export type CoverSize = 'sm' | 'md' | 'lg'

/** The producer's tone as `--cv` (a token of the brand palette); the grid and the bar use it. */
const TONE: Record<CoverTone, string> = {
  blue: '[--cv:var(--tone-blue)]',
  green: '[--cv:var(--tone-green-tag)]',
  red: '[--cv:var(--tone-red-tag)]',
  violet: '[--cv:var(--tone-violet)]',
}

/** The licence model in a list card: one word fits the key. */
const SHORT_TERMS: Record<string, string> = {
  [SUBSCRIPTION_TERMS]: 'Subskrypcja',
  [PERPETUAL_TERMS]: 'Bezterminowa',
  [ELECTRONIC_TERMS]: 'Elektroniczna',
}

/** Small text that scales with the cover (container units) — readable from a card to the gallery. */
const PILL_TEXT = 'text-[clamp(10px,4.2cqw,13px)] leading-none font-extrabold'

/**
 * Cover of a card without a photo (runda 1411 R8, board `Karty.dc.html`) over the whole stage:
 * the „klucz licencji” of a licence or the navy cover of a service. Built from the card's data
 * (`cardCover`); it scales with its box (container units), so one cover serves the list card, the
 * product page, the search and „Najczęściej wybierane”. `sm` (thumbnails) keeps the picture only.
 */
export function CardCoverView({
  cover,
  icon,
  size = 'md',
}: {
  cover: CardCover
  /** The card's icon: a service without a picture shows it in the middle. */
  icon: IconName
  size?: CoverSize
}) {
  return cover.kind === 'licence' ? (
    <LicenceKey cover={cover} size={size} />
  ) : (
    <ServiceStage cover={cover} icon={icon} size={size} />
  )
}

/** The licence key: a white card with the logo and the plan on a grid in the producer's tone. */
function LicenceKey({ cover, size }: { cover: LicenceCover; size: CoverSize }) {
  return (
    <span
      data-stage-fallback=""
      data-cover="licence"
      className={cx(
        '@container absolute inset-0 overflow-hidden bg-plate',
        'bg-[radial-gradient(120%_100%_at_30%_0%,transparent_0%,color-mix(in_srgb,var(--cv)_12%,transparent)_100%)]',
        TONE[cover.tone],
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--cv)_9%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--cv)_9%,transparent)_1px,transparent_1px)] bg-[size:9cqw_9cqw]"
      />
      <span
        aria-hidden="true"
        className="absolute top-[47%] left-1/2 flex aspect-[210/132] w-[68%] -translate-1/2 -rotate-[5deg] flex-col justify-between rounded-[6cqw] bg-white p-[6cqw] text-surface-dark shadow-[0_6cqw_10cqw_-5cqw_var(--shd),inset_0_0_0_1px_var(--plate-shadow)]"
      >
        {cover.logo ? (
          <Image
            src={cover.logo.url}
            alt=""
            width={cover.logo.width}
            height={cover.logo.height}
            unoptimized
            className="h-[6.5cqw] w-auto max-w-[60%] self-start object-contain object-left"
          />
        ) : (
          <span className="text-[clamp(8px,5cqw,14px)] font-extrabold tracking-[0.08em] uppercase">
            {cover.brand}
          </span>
        )}
        {size !== 'sm' && (
          <span className="line-clamp-2 font-display text-[clamp(8px,7.4cqw,20px)] leading-[1.05] font-extrabold font-stretch-110%">
            {cover.plan}
          </span>
        )}
        {size === 'md' && cover.terms ? (
          // A list card: the licence model on the key (its corners hold the brand and the button).
          <span className="truncate text-[clamp(8px,4.4cqw,12px)] font-extrabold text-[var(--cv)]">
            {SHORT_TERMS[cover.terms] ?? cover.terms}
          </span>
        ) : (
          <span className="flex gap-[1.6cqw]">
            {[0, 1, 2].map((bar) => (
              <span key={bar} className="h-[2.6cqw] w-[11cqw] rounded-full bg-surface-dark/15" />
            ))}
            <span className="h-[2.6cqw] w-[11cqw] rounded-full bg-[var(--cv)]" />
          </span>
        )}
      </span>
      {size === 'lg' && cover.terms && (
        <span
          className={cx(
            'absolute bottom-[5cqw] left-[5cqw] max-w-[90cqw] truncate rounded-full px-[4cqw] py-[2.4cqw] text-white',
            PILL_TEXT,
            cover.perpetual ? 'bg-tone-green-tag' : 'bg-surface-dark',
          )}
        >
          {cover.terms}
        </span>
      )}
    </span>
  )
}

/** A service: the picture of what it is about with a glow, the „Usługa” chip and three words. */
function ServiceStage({
  cover,
  icon,
  size,
}: {
  cover: ServiceCover
  icon: IconName
  size: CoverSize
}) {
  return (
    <span
      data-surface="dark"
      data-stage-fallback=""
      data-cover="service"
      className="@container absolute inset-0 overflow-hidden bg-surface-dark bg-[radial-gradient(90%_80%_at_50%_40%,color-mix(in_srgb,var(--accent)_42%,transparent)_0%,transparent_75%)] text-white"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,white_6%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,white_6%,transparent)_1px,transparent_1px)] bg-[size:9cqw_9cqw]"
      />
      <span
        aria-hidden="true"
        className="absolute top-[66%] left-1/2 h-[14%] w-[76%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_70%,transparent),transparent)]"
      />
      {cover.image ? (
        <Image
          src={cover.image.url}
          alt=""
          width={cover.image.width}
          height={cover.image.height}
          unoptimized
          className="absolute top-[44%] left-1/2 h-[56%] w-auto max-w-[70%] -translate-1/2 -rotate-6 object-contain drop-shadow-[0_6cqw_8cqw_color-mix(in_srgb,black_55%,transparent)]"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute top-[44%] left-1/2 grid size-[26cqw] -translate-1/2 place-items-center rounded-[7cqw] bg-white/10"
        >
          <Icon name={icon} className="size-[12cqw]" strokeWidth={2} />
        </span>
      )}
      {/* Chip, badge and words: the gallery only — a list card shows its own logo plate and
          „Usługa” / „Autoryzowany serwis” badges in these corners. */}
      {size === 'lg' && (
        <>
          <span
            className={cx(
              'absolute top-[5cqw] left-[5cqw] flex items-center gap-[1.6cqw] rounded-full bg-white/8 px-[3.4cqw] py-[2.2cqw] ring-1 ring-white/15',
              PILL_TEXT,
            )}
          >
            <Icon name="wrench" className="size-[1.1em] text-on-dark-text" strokeWidth={2.4} />
            Usługa
          </span>
          {cover.authorized && (
            <span
              className={cx(
                'absolute top-[5cqw] right-[5cqw] flex items-center gap-[1.4cqw] rounded-full bg-white/8 px-[3.4cqw] py-[2.2cqw] ring-1 ring-white/15 @max-[260px]:hidden',
                PILL_TEXT,
              )}
            >
              <Icon name="shield" className="size-[1.1em] text-on-dark-text" strokeWidth={2.4} />
              Autoryzowany serwis
            </span>
          )}
          {cover.words && (
            <span
              className={cx(
                'absolute inset-x-[5cqw] bottom-[5cqw] flex items-center @max-[200px]:hidden justify-center gap-[2.4cqw] rounded-[3.6cqw] bg-white/6 py-[2.8cqw] text-white/85 ring-1 ring-white/10',
                PILL_TEXT,
                'font-bold',
              )}
            >
              {cover.words.map((word, i) => (
                <span key={word} className="flex items-center gap-[2.4cqw] whitespace-nowrap">
                  {i > 0 && (
                    <span aria-hidden="true" className="text-white/40">
                      •
                    </span>
                  )}
                  {word}
                </span>
              ))}
            </span>
          )}
        </>
      )}
    </span>
  )
}
