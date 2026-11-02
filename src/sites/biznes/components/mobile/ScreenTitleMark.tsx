import { screenTitle } from '@/lib/biznes/screenTitle'

/**
 * The screen title of a page for the phone top bar (`ScreenTitle`): a hidden mark with the
 * short name (category, brand, page title). Pages without it show their H1.
 */
export function ScreenTitleMark({ name }: { name: string }) {
  return <span hidden data-screen-title={screenTitle(name)} />
}
