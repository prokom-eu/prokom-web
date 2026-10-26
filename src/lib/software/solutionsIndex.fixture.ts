import { softwareSettingsData, solutionData, solutionsToImport } from '../../seed/software/map'
import type { SolutionsSource } from './solutionsIndex'

/** Test fixture: the Software seed package as the solutions index reads it (what `pnpm seed` stores). */
export function solutionsSourceFromSeed(): SolutionsSource {
  return {
    solutions: solutionsToImport().map(solutionData),
    search: softwareSettingsData().search,
  }
}
