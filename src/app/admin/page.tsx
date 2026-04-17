'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { getRaces, getDrivers } from '@/lib/api'
import type { Race, Driver } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router            = useRouter()

  const [races, setRaces]     = useState<Race[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [secret, setSecret]   = useState('')
  const [raceId, setRaceId]   = useState('')
  const [dotd, setDotd]       = useState('')
  const [status, setStatus]   = useState<string | null>(null)
  const [busy, setBusy]       = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    Promise.all([getRaces(), getDrivers()]).then(([r, d]) => {
      setRaces(r)
      setDrivers(d)
    })
  }, [])

  const adminPost = async (path: string, msg: string) => {
    setBusy(true)
    setStatus(null)
    try {
      const res = await fetch(`${API}${path}`, {
        method: 'POST',
        headers: { 'X-Admin-Secret': secret },
      })
      if (!res.ok) {
        const err = await res.json()
        setStatus(`❌ ${err.detail ?? 'Error'}`)
      } else {
        setStatus(`✓ ${msg}`)
      }
    } catch {
      setStatus('❌ Network error')
    } finally {
      setBusy(false)
    }
  }

  const adminPatch = async (path: string, msg: string) => {
    setBusy(true)
    setStatus(null)
    try {
      const res = await fetch(`${API}${path}`, {
        method: 'PATCH',
        headers: { 'X-Admin-Secret': secret },
      })
      if (!res.ok) {
        const err = await res.json()
        setStatus(`❌ ${err.detail ?? 'Error'}`)
      } else {
        setStatus(`✓ ${msg}`)
      }
    } catch {
      setStatus('❌ Network error')
    } finally {
      setBusy(false)
    }
  }

  if (loading || !user) return null

  const selectedRace = races.find(r => r.id === parseInt(raceId))

  return (
    <div className="space-y-8 max-w-lg">
      <div className="animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">Admin</p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">Race Control</h1>
      </div>

      <div className="card p-5 space-y-4 animate-fade-up">
        {/* Secret key */}
        <div className="space-y-1">
          <label className="font-mono text-xs text-f1muted uppercase tracking-wide">Admin Secret</label>
          <input
            type="password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="SECRET_KEY from .env"
            className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors"
          />
        </div>

        {/* Race picker */}
        <div className="space-y-1">
          <label className="font-mono text-xs text-f1muted uppercase tracking-wide">Race</label>
          <select
            value={raceId}
            onChange={e => setRaceId(e.target.value)}
            className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors appearance-none"
          >
            <option value="">— Select race —</option>
            {races.map(r => (
              <option key={r.id} value={r.id}>
                R{r.round} · {r.location} {r.type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {raceId && (
        <div className="space-y-3 animate-fade-up">

          {/* Step 1 */}
          <Step n={1} label="Fetch result from OpenF1">
            <button
              onClick={() => adminPost(`/results/admin/${raceId}/fetch-openf1`, 'Result fetched')}
              disabled={busy || !secret}
              className="btn-admin"
            >
              Fetch OpenF1 Data
            </button>
          </Step>

          {/* Step 2 */}
          <Step n={2} label="Set Driver of the Day">
            <div className="flex gap-2">
              <select
                value={dotd}
                onChange={e => setDotd(e.target.value)}
                className="flex-1 bg-f1grey border border-f1mid rounded px-3 py-2 text-f1white font-mono text-sm focus:outline-none focus:border-f1red appearance-none"
              >
                <option value="">— Select driver —</option>
                {drivers.map(d => (
                  <option key={d.acronym} value={d.acronym}>
                    {d.acronym} — {d.full_name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => adminPatch(`/results/admin/${raceId}/dotd?dotd=${dotd}`, 'DotD saved')}
                disabled={busy || !secret || !dotd}
                className="btn-admin shrink-0"
              >
                Save
              </button>
            </div>
          </Step>

          {/* Step 3 */}
          <Step n={3} label="Calculate all scores">
            <button
              onClick={() => adminPost(`/results/admin/${raceId}/score`, 'Scores calculated')}
              disabled={busy || !secret}
              className="btn-admin"
            >
              Run Scoring
            </button>
          </Step>
        </div>
      )}

      {status && (
        <div className={`font-mono text-sm rounded px-4 py-3 border ${
          status.startsWith('✓')
            ? 'bg-green-900/20 border-green-700 text-green-400'
            : 'bg-f1red/10 border-f1red/30 text-f1red'
        }`}>
          {status}
        </div>
      )}

      <style jsx>{`
        .btn-admin {
          background: #E8002D;
          color: white;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
        }
        .btn-admin:hover:not(:disabled) { background: #c0001f; }
        .btn-admin:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  )
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="pos-badge pos-n text-f1red border border-f1red/30 bg-transparent">{n}</div>
        <h3 className="font-display font-bold text-sm uppercase tracking-wide">{label}</h3>
      </div>
      {children}
    </div>
  )
}
