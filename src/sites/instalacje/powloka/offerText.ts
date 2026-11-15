import type { InstMenu } from '@/lib/instalacje/menu'
import { plural } from '@/lib/plural'

/** „76 rozwiązań” (prototype `offerN.i` + `offerN.iW`). */
export const solutionsText = (n: number) =>
  `${n} ${plural(n, ['rozwiązanie', 'rozwiązania', 'rozwiązań'])}`

/** „10 obszarów, 76 rozwiązań” — title of the services mega menu promo. */
export const offerText = ({ areas, solutions }: InstMenu['offer']) =>
  `${areas} ${plural(areas, ['obszar', 'obszary', 'obszarów'])}, ${solutionsText(solutions)}`
