import { getRace, getResult, getRaceScores, getRacePredictions } from '@/lib/api'
import { notFound } from 'next/navigation'
import clsx from 'clsx'
import type { Score, Prediction } from '@/types'

export const revalidate = 60

export default async function RacePage({ params }: { params: { id: string } }) {
  const raceId = parseInt(params.id)

  const race = await getRace(raceId).catch(() => null)
  if (!race) notFound()

  const scheduled = new Date(race.scheduled_at)
  const raceStarted = new Date() >= scheduled

  const [result, scores, predictions] = await Promise.all([
    getResult(raceId).catch(() => null),
    getRaceScores(raceId).catch(() => []),
    raceStarted ? getRacePredictions(raceId).catch(() => []) : Promise.resolve([]),
  ])

  const sortedScores = [...scores].sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          Round {race.round} · {race.type}
        </p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">
          {race.location}
        </h1>
        <p className="font-mono text-f1muted text-sm mt-1">
          {scheduled.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Result */}
      {result ? (
        <div className="animate-fade-up card p-5 space-y-3">
          <h2 className="font-display font-bold text-xl uppercase tracking-wide text-f1red">Result</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { label: 'Pole',     value: result.pole },
              { label: '1st',      value: result.p1 },
              { label: '2nd',      value: result.p2 },
              { label: '3rd',      value: result.p3 },
              { label: 'Last',     value: result.last_place },
              { label: 'FL',       value: result.fastest_lap },
              { label: 'Pit',      value: result.fastest_pitstop },
              { label: 'DotD',     value: result.dotd },
              { label: 'SC',       value: result.safety_car != null ? (result.safety_car ? 'Yes' : 'No') : null },
            ].map(({ label, value }) => value && (
              <div key={label} className="flex items-center gap-2">
                <span className="font-mono text-f1muted text-xs w-10 shrink-0">{label}</span>
                <span className="driver-chip">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : raceStarted ? (
        <div className="card p-5 text-f1muted font-mono text-sm">Result not yet entered</div>
      ) : (
        <div className="card p-5 text-f1muted font-mono text-sm">
          Race starts {scheduled.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </div>
      )}

      {/* Scores */}
      {sortedScores.length > 0 && (
        <div className="animate-fade-up space-y-2">
          <h2 className="font-display font-bold text-xl uppercase tracking-wide">Scores</h2>
          {sortedScores.map((s, i) => {
            const pred = predictions.find((p: Prediction) => p.player_id === s.player_id)
            return (
              <ScoreRow key={s.player_id} score={s} prediction={pred} position={i + 1} />
            )
          })}
        </div>
      )}

      {/* Predictions (before result) */}
      {!raceStarted && (
        <div className="card p-5 text-center">
          <p className="font-mono text-f1muted text-sm">Predictions hidden until race starts</p>
        </div>
      )}
    </div>
  )
}

function ScoreRow({ score, prediction, position }: { score: Score; prediction?: Prediction; position: number }) {
  return (
    <div className={clsx('card card-hover p-4 stagger-' + Math.min(position, 7) + ' animate-fade-up')}>
      <div className="flex items-center gap-3 mb-3">
        <div className={clsx('pos-badge', `pos-${position <= 3 ? position : 'n'}`)}>
          {position}
        </div>
        <span className="font-display font-bold text-lg uppercase flex-1">
          {score.player_id}
        </span>
        <span className="font-display font-black text-2xl">{score.total}</span>
        <span className="font-mono text-f1muted text-xs">pts</span>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-4 gap-1 sm:grid-cols-6">
        {[
          { label: 'Pole', pts: score.pole_pts, pred: prediction?.pole },
          { label: '1st',  pts: score.p1_pts,   pred: prediction?.p1 },
          { label: '2nd',  pts: score.p2_pts,   pred: prediction?.p2 },
          { label: '3rd',  pts: score.p3_pts,   pred: prediction?.p3 },
          { label: 'Pod',  pts: score.podium_pts + score.podium_bonus },
          { label: 'Last', pts: score.last_pts,  pred: prediction?.last_place },
          { label: 'FL',   pts: score.fl_pts,    pred: prediction?.fastest_lap },
          { label: 'DotD', pts: score.dotd_pts,  pred: prediction?.dotd },
          { label: 'SC',   pts: score.sc_pts },
          { label: 'Pos',  pts: score.gains_pts, pred: prediction?.pos_gained },
        ].map(({ label, pts, pred }) => (
          <div key={label} className={clsx(
            'text-center p-1.5 rounded text-xs',
            pts > 0 ? 'bg-f1red/10 border border-f1red/20' : 'bg-f1mid/50'
          )}>
            <p className="font-mono text-f1muted text-[10px]">{label}</p>
            {pred && <p className="driver-chip mx-auto mt-0.5 inline-block">{pred}</p>}
            <p className={clsx('font-display font-bold text-sm mt-0.5', pts > 0 ? 'text-f1red' : 'text-f1muted')}>
              {pts > 0 ? `+${pts}` : '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
