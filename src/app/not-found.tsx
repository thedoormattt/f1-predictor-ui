import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <p className="font-mono text-f1red text-xs tracking-widest uppercase">404</p>
      <h1 className="font-display font-black text-6xl uppercase tracking-tight">Not Found</h1>
      <p className="font-mono text-f1muted text-sm">This page doesn't exist.</p>
      <Link href="/"
        className="mt-4 bg-f1red hover:bg-red-700 text-white font-display font-bold uppercase tracking-wide px-6 py-2.5 rounded transition-colors">
        Back to Leaderboard
      </Link>
    </div>
  )
}
