'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { getRace, getDrivers, getTeams, getPlayerPredictions, submitPrediction } from '@/lib/api'
import type { Race, Driver, Team, Prediction } from '@/types'
import clsx from 'clsx'

interface FormState {
  pole: string; p1: string; p2: string; p3: string
  last_place: string; fastest_lap: string; fastest_pitstop: string
  dotd: string; safety_car: string; pos_gained: string
}

const EMPTY: FormState = {
  pole: '', p1: '', p2: '', p3: '',
  last_place: '', fastest_lap: '', fastest_pitstop: '',
  dotd: '', safety_car: '', pos_gained: '',
}

export default function PredictRacePage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router            = useRouter()
  const raceId            = parseInt(params.id)

  const [race, setRace]         = useState<Race | null>(null)
  const [drivers, setDrivers]   = useState<Driver[]>([])
  const [teams, setTeams]       = useState<Team[]>([])
  const [form, setForm]         = useState<FormState>(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [locked, setLocked]     = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    Promise.all([
      getRace(raceId),
      getDrivers(),
      getTeams(),
    ]).then(([r, d, t]) => {
      setRace(r)
      setDrivers(d)
      setTeams(t)
      setLocked(new Date() >= new Date(r.scheduled_at))
    })
  }, [raceId])

  useEffect(() => {
    if (!user) return
    getPlayerPredictions(user.id).then(preds => {
      const existing = preds.find((p: Prediction) => p.race_id === raceId)
      if (existing) {
        setForm({
          pole:             existing.pole             ?? '',
          p1:               existing.p1               ?? '',
          p2:               existing.p2               ?? '',
          p3:               existing.p3               ?? '',
          last_place:       existing.last_place       ?? '',
          fastest_lap:      existing.fastest_lap      ?? '',
          fastest_pitstop:  existing.fastest_pitstop  ?? '',
          dotd:             existing.dotd             ?? '',
          safety_car:       existing.safety_car != null ? String(existing.safety_car) : '',
          pos_gained:       existing.pos_gained       ?? '',
        })
      }
    })
  }, [user, raceId])

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || locked) return
    setSaving(true)
    setError(null)
    try {
      await submitPrediction(user.id, {
        race_id:         raceId,
        pole:            form.pole            || null,
        p1:              form.p1              || null,
        p2:              form.p2              || null,
        p3:              form.p3              || null,
        last_place:      form.last_place      || null,
        fastest_lap:     form.fastest_lap     || null,
        fastest_pitstop: form.fastest_pitstop || null,
        dotd:            form.dotd            || null,
        safety_car:      form.safety_car !== '' ? form.safety_car === 'true' : null,
        pos_gained:      form.pos_gained      || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user || !race) return (
    <div className="flex items-center justify-center h-64">
      <div className="font-mono text-f1muted text-sm animate-pulse">Loading…</div>
    </div>
  )

  const driverSelect = (field: keyof FormState, label: string) => (
    <div className="space-y-1">
      <label className="font-mono text-xs text-f1muted uppercase tracking-wide">{label}</label>
      <select
        value={form[field]}
        onChange={set(field)}
        disabled={locked}
        className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors disabled:opacity-40 appearance-none"
      >
        <option value="">— Select —</option>
        {drivers.map(d => (
          <option key={d.acronym} value={d.acronym}>
            {d.acronym} — {d.full_name}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="space-y-8 max-w-lg">
      <div className="animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          Round {race.round} · {race.type}
        </p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">{race.location}</h1>
        {locked && (
          <p className="font-mono text-xs text-f1red mt-2 bg-f1red/10 border border-f1red/20 rounded px-3 py-2 inline-block">
            Predictions locked — race has started
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up" style={{ animationDelay: '0.1s' }}>

        {/* Section: Qualifying */}
        <Section label="Qualifying">
          {driverSelect('pole', 'Pole Position')}
        </Section>

        {/* Section: Podium */}
        <Section label="Race Podium">
          {driverSelect('p1', '1st Place')}
          {driverSelect('p2', '2nd Place')}
          {driverSelect('p3', '3rd Place')}
        </Section>

        {/* Section: Other */}
        <Section label="Other Picks">
          {driverSelect('last_place', 'Last Place')}
          {driverSelect('fastest_lap', 'Fastest Lap')}

          <div className="space-y-1">
            <label className="font-mono text-xs text-f1muted uppercase tracking-wide">Fastest Pitstop (Team)</label>
            <select
              value={form.fastest_pitstop}
              onChange={set('fastest_pitstop')}
              disabled={locked}
              className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors disabled:opacity-40 appearance-none"
            >
              <option value="">— Select —</option>
              {teams.map(t => (
                <option key={t.acronym} value={t.acronym}>{t.acronym} — {t.name}</option>
              ))}
            </select>
          </div>

          {driverSelect('dotd', 'Driver of the Day')}
          {driverSelect('pos_gained', 'Most Positions Gained')}

          <div className="space-y-1">
            <label className="font-mono text-xs text-f1muted uppercase tracking-wide">Safety Car?</label>
            <select
              value={form.safety_car}
              onChange={set('safety_car')}
              disabled={locked}
              className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors disabled:opacity-40 appearance-none"
            >
              <option value="">— Select —</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </Section>

        {error && (
          <p className="font-mono text-xs text-f1red bg-f1red/10 border border-f1red/20 rounded px-3 py-2">
            {error}
          </p>
        )}

        {!locked && (
          <button
            type="submit"
            disabled={saving}
            className={clsx(
              'w-full font-display font-bold text-lg uppercase tracking-wide py-3 rounded transition-all',
              saved
                ? 'bg-green-700 text-white'
                : 'bg-f1red hover:bg-red-700 text-white disabled:opacity-50'
            )}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Prediction'}
          </button>
        )}
      </form>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-display font-bold text-sm uppercase tracking-widest text-f1red">{label}</h3>
      {children}
    </div>
  )
}
