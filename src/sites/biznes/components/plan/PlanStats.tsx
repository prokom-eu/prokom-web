import { planStats, type PlanScene } from '@/lib/catalog/floorPlan'
import { plural } from '@/lib/plural'

/** „12 rodzajów firm · 186 punktów na planach · 97 produktów z oferty” — counts from the database. */
export function PlanStats({ scenes }: { scenes: readonly PlanScene[] }) {
  const stats = planStats(scenes)
  const figures = [
    [stats.scenes, plural(stats.scenes, ['rodzaj firmy', 'rodzaje firm', 'rodzajów firm'])],
    [
      stats.points,
      plural(stats.points, ['punkt na planach', 'punkty na planach', 'punktów na planach']),
    ],
    [
      stats.products,
      plural(stats.products, ['produkt z oferty', 'produkty z oferty', 'produktów z oferty']),
    ],
  ] as const
  return (
    <dl className="grid max-w-md grid-cols-3 gap-4">
      {figures.map(([value, label]) => (
        <div key={label} className="flex flex-col-reverse">
          <dt className="text-[12.5px] text-ink-3">{label}</dt>
          <dd className="font-display text-[clamp(1.5rem,2.4vw,1.9rem)] font-extrabold text-ink">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
