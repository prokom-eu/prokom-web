import type { Block } from 'payload'

import { formPageFields } from '../formPageFields'

/**
 * The planner „Zaplanuj” (`/zaplanuj`): four steps, the answers sent as a wizard inquiry (ADR-I002
 * §0). One block for the whole page, as its first block (it carries the h1).
 */
export const InstPlannerBlock: Block = {
  slug: 'instPlanner',
  interfaceName: 'InstPlannerBlock',
  labels: { singular: 'Instalacje: kreator Zaplanuj', plural: 'Instalacje: kreatory Zaplanuj' },
  fields: formPageFields,
}
