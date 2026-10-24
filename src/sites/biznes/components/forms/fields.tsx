import type { ComponentProps, ReactNode } from 'react'

import { FieldError } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { cx } from '@/components/ui/cx'
import type { IconName } from '@/lib/catalog/options'

// Fields of the Biznes forms (ZMIANY-v20 §2.9): label above, icon inside, 54 px. The border is
// `border-input` (3:1, WCAG 1.4.11) rather than the lighter line of the design; an error is a
// thicker border and the message with an icon, not a colour (WCAG 1.4.1, as `ui/Field`).
const CONTROL =
  'block w-full rounded-[14px] border-[1.5px] border-border-input bg-card text-[15.5px] text-ink transition-[border-color,box-shadow] placeholder:text-ink-3 hover:border-ink-2 focus:border-accent-text focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent-text)_12%,transparent)] aria-invalid:border-[3px]'

type Base = { id: string; label: string; required?: boolean; error?: string }

function Label({ id, label, required }: Pick<Base, 'id' | 'label' | 'required'>) {
  return (
    <label htmlFor={id} className="mb-[7px] block text-sm font-extrabold text-ink">
      {label}
      {/* The input says „required” to screen readers; the star is for the eye. */}
      {required && <span aria-hidden="true"> *</span>}
    </label>
  )
}

function aria(id: string, error?: string) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  }
}

type IconFieldProps = Base & { icon: IconName } & Omit<ComponentProps<'input'>, 'id' | 'required'>

/** Text input with an icon on the left. */
export function IconField({
  id,
  label,
  required,
  error,
  icon,
  className,
  ...rest
}: IconFieldProps) {
  return (
    <div className={className}>
      <Label id={id} label={label} required={required} />
      <span className="relative block">
        <Icon
          name={icon}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-ink-2"
        />
        <input
          id={id}
          required={required}
          {...aria(id, error)}
          {...rest}
          className={cx(CONTROL, 'h-[54px] pr-4 pl-11')}
        />
      </span>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}

type AreaFieldProps = Base & Omit<ComponentProps<'textarea'>, 'id' | 'required'>

export function AreaField({ id, label, required, error, className, ...rest }: AreaFieldProps) {
  return (
    <div className={className}>
      <Label id={id} label={label} required={required} />
      <textarea
        id={id}
        rows={5}
        required={required}
        {...aria(id, error)}
        {...rest}
        className={cx(CONTROL, 'min-h-[130px] resize-y px-4 py-3.5')}
      />
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}

type ConsentFieldProps = { id: string; error?: string; children: ReactNode; className?: string }

/** Consent checkbox of the Biznes forms: small text beside a 20 px box. */
export function ConsentField({ id, error, children, className }: ConsentFieldProps) {
  return (
    <div className={className}>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          name="consent"
          type="checkbox"
          required
          {...aria(id, error)}
          className="mt-0.5 size-5 shrink-0 accent-accent-text"
        />
        <label htmlFor={id} className="text-[13.5px] leading-[1.45] text-ink-2">
          {children}
        </label>
      </div>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}
