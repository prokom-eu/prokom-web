import type { Field } from 'payload'

import { ctaGroup, heroGroup } from '../../../collections/instalacjeFields'

/**
 * Fields of the Instalacje form pages (I11: Zaplanuj, Kontakt, Serwis): the hero and the band
 * before the footer are edited in the panel like on the service pages; forms, steps, salons and
 * their texts live in code (`src/sites/instalacje/dane/`, ADR-I002 §1).
 */
export const formPageFields: Field[] = [heroGroup, ctaGroup]
