import { getRaces } from '@/lib/api'
import Link from 'next/link'
import clsx from 'clsx'

export const revalidate = 3600

export default async function RacesPage() {
  const races = await getRaces()
  const now   = new Date()

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">2026 Calendar</p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">Races</h1>
      </div>

      <div className="space-y-2">
        {races.map((race, i) => {
          const scheduled = new Date(race.scheduled_at)
          const past      = scheduled < now
          const isSprint  = race.type === 'Sprint'

          return (
            <Link
              key={race.id}
              href={`/race/${race.id}`}
              className={clsx(
                'card card-hover flex items-center gap-4 px-5 py-4 block',
                `stagger-${Math.min(i + 1, 7)} animate-fade-up`
              )}
            >
              {/* Round */}
              <span className="font-mono text-f1muted text-xs w-6 text-right shrink-0">
                {race.round}
              </span>

              {/* Location */}
              <div className="flex-1">
                <p className="font-display font-bold text-lg uppercase tracking-wide">
                  {race.location}
                </p>
                <p className="font-mono text-f1muted text-xs">
                  {scheduled.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Sprint badge */}
              {isSprint && (
                <span className="font-mono text-xs px-2 py-0.5 rounded border border-f1red text-f1red uppercase tracking-wide">
                  Sprint
                </span>
              )}

              {/* Status */}
              <span className={clsx(
                'font-mono text-xs uppercase tracking-wide',
                past ? 'text-f1muted' : 'text-f1red'
              )}>
                {past ? 'Finished' : 'Upcoming'}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
