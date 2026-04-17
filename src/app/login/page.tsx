'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { signIn } = useAuth()
  const router     = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, password)
    if (err) {
      setError(err)
      setLoading(false)
    } else {
      router.push('/predict')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">Welcome back</p>
        <h1 className="font-display font-black text-4xl uppercase tracking-tight mb-8">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-mono text-xs text-f1muted uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs text-f1muted uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-f1red bg-f1red/10 border border-f1red/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-f1red hover:bg-red-700 disabled:opacity-50 text-white font-display font-bold text-lg uppercase tracking-wide py-3 rounded transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
