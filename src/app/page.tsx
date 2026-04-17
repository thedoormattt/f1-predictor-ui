import { getLeaderboard, getCumulative } from '@/lib/api'
import LeaderboardTable from '@/components/LeaderboardTable'
import CumulativeChart from '@/components/CumulativeChart'

export const revalidate = 60

export default async function Home() {
  const [leaderboard, cumulative] = await Promise.all([
    getLeaderboard(),
    getCumulative(),
  ])

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">2026 Season</p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">
          Standings
        </h1>
      </div>

      {/* Leaderboard */}
      <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <LeaderboardTable entries={leaderboard} />
      </div>

      {/* Chart */}
      <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="font-display font-bold text-2xl uppercase tracking-wide mb-4">
          Points Over Time
        </h2>
        <div className="card p-4">
          <CumulativeChart data={cumulative} />
        </div>
      </div>

    </div>
  )
}
