import type { ComponentProps, ReactNode } from 'react'

import { cx } from './cx'

// Field border `border-input` keeps 3:1 on every surface (WCAG 1.4.11, themes.test.ts).
// An error is marked by a thicker border, bold text and an icon — not by colour (WCAG 1.4.1):
// the brand has no error colour. 16 px text keeps iOS from zooming in on focus.
const CONTROL =
  'block w-full min-h-11 rounded-xl border-[1.5px] border-border-input bg-card px-4 py-2.5 text-base text-ink aria-invalid:border-[3px]'

type FieldBase = {
  id: string
  label: string
  /** Shown after the label, e.g. „(opcjonalnie)”. */
  note?: string
  hint?: string
  error?: string
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-2 font-bold text-ink">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ink text-xs text-surface"
      >
        !
      </span>
      <span>
        <span className="sr-only">Błąd: </span>
        {children}
      </span>
    </p>
  )
}

function Label({ id, label, note }: Pick<FieldBase, 'id' | 'label' | 'note'>) {
  return (
    <label htmlFor={id} className="mb-1.5 block font-semibold text-ink">
      {label}
      {note && <span className="font-normal text-ink-2"> {note}</span>}
    </label>
  )
}

function Hint({ id, hint }: Pick<FieldBase, 'id' | 'hint'>) {
  if (!hint) return null
  return (
    <p id={`${id}-hint`} className="mb-1.5 text-sm text-ink-2">
      {hint}
    </p>
  )
}

function ariaFor({ id, hint, error }: Pick<FieldBase, 'id' | 'hint' | 'error'>) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy(id, hint, error),
  }
}

type TextFieldProps = FieldBase & Omit<ComponentProps<'input'>, 'id'>

/** Labelled input with its hint and error tied by `aria-describedby`. */
export function TextField({ id, label, note, hint, error, className, ...rest }: TextFieldProps) {
  return (
    <div className={className}>
      <Label id={id} label={label} note={note} />
      <Hint id={id} hint={hint} />
      <input id={id} {...ariaFor({ id, hint, error })} {...rest} className={CONTROL} />
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}

type TextAreaFieldProps = FieldBase & Omit<ComponentProps<'textarea'>, 'id'>

export function TextAreaField({
  id,
  label,
  note,
  hint,
  error,
  className,
  ...rest
}: TextAreaFieldProps) {
  return (
    <div className={className}>
      <Label id={id} label={label} note={note} />
      <Hint id={id} hint={hint} />
      <textarea
        id={id}
        rows={5}
        {...ariaFor({ id, hint, error })}
        {...rest}
        className={cx(CONTROL, 'min-h-32')}
      />
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}

type CheckboxFieldProps = Omit<FieldBase, 'label' | 'note' | 'hint'> &
  Omit<ComponentProps<'input'>, 'id' | 'type'> & { children: ReactNode }

/** Checkbox with its label text beside it (consents); 24 px box, the whole label is clickable. */
export function CheckboxField({ id, error, children, className, ...rest }: CheckboxFieldProps) {
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, undefined, error)}
          className="mt-0.5 size-6 shrink-0 accent-accent-text"
          {...rest}
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-ink-2">
          {children}
        </label>
      </div>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}
