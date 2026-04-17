'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { CumulativeEntry } from '@/types'

const COLORS = [
  '#E8002D', '#FF6B6B', '#FF9F40',
  '#FFCD56', '#4BC0C0', '#9966FF', '#C9CBCF',
]

interface ChartRow {
  race: string
  [player: string]: string | number
}

export default function CumulativeChart({ data }: { data: CumulativeEntry[] }) {
  if (!data.length) return (
    <p className="text-center text-f1muted font-mono text-sm py-8">
      No race data yet
    </p>
  )

  // Build recharts-friendly rows: one per race, columns per player
  const races   = [...new Set(data.map(d => d.race_key))]
  const players = [...new Set(data.map(d => d.player_name))]

  const rows: ChartRow[] = races.map(race => {
    const row: ChartRow = { race }
    players.forEach(player => {
      const entry = data.find(d => d.race_key === race && d.player_name === player)
      row[player] = entry?.cumulative_score ?? 0
    })
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <XAxis
          dataKey="race"
          tick={{ fill: '#6B6B6B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={{ stroke: '#2A2A2A' }}
        />
        <YAxis
          tick={{ fill: '#6B6B6B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: 6,
            fontFamily: 'JetBrains Mono',
            fontSize: 12,
          }}
          labelStyle={{ color: '#F5F5F5', marginBottom: 4 }}
          itemStyle={{ color: '#F5F5F5' }}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#6B6B6B' }}
        />
        {players.map((player, i) => (
          <Line
            key={player}
            type="monotone"
            dataKey={player}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
