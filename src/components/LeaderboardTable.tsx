import type { LeaderboardEntry } from '@/types'
import clsx from 'clsx'

export default function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (!entries.length) return (
    <div className="card p-8 text-center text-f1muted font-mono text-sm">
      No scores yet — first race coming soon
    </div>
  )

  return (
    <div className="card overflow-hidden">
      {entries.map((e, i) => (
        <div
          key={e.player_id}
          className={clsx(
            'flex items-center gap-4 px-5 py-4 card-hover',
            `stagger-${Math.min(i + 1, 7)} animate-fade-up`,
            i < entries.length - 1 && 'border-b border-f1mid'
          )}
        >
          {/* Position */}
          <div className={clsx('pos-badge', `pos-${e.position <= 3 ? e.position : 'n'}`)}>
            {e.position}
          </div>

          {/* Name */}
          <div className="flex-1">
            <p className="font-display font-bold text-lg uppercase tracking-wide">
              {e.player_name}
            </p>
            <p className="font-mono text-f1muted text-xs">
              {e.races_scored} race{e.races_scored !== 1 ? 's' : ''} scored
            </p>
          </div>

          {/* Score */}
          <div className="text-right">
            <p className="font-display font-black text-3xl text-f1white">
              {e.total_score}
            </p>
            <p className="font-mono text-f1muted text-xs">pts</p>
          </div>

          {/* Red bar for leader */}
          {e.position === 1 && (
            <div className="w-1 h-10 bg-f1red rounded-full absolute left-0" />
          )}
        </div>
      ))}
    </div>
  )
}
