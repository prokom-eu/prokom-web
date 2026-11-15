/** Joins class names, skipping empty ones — enough for our components, no library needed. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
