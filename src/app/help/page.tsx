import Link from 'next/link'

const scoring = [
  { category: 'Pole Position',       exact: '?',  notes: 'Correct driver gets full points' },
  { category: '1st Place',           exact: '?',  notes: '' },
  { category: '2nd Place',           exact: '?',  notes: '' },
  { category: '3rd Place',           exact: '?',  notes: '' },
  { category: 'Podium Bonus',        exact: '?',  notes: 'Bonus if all 3 podium picks are correct' },
  { category: 'Last Place',          exact: '?',  notes: 'Correct driver gets full points' },
  { category: 'Fastest Lap',         exact: '?',  notes: '' },
  { category: 'Fastest Pitstop',     exact: '?',  notes: 'Team, not driver' },
  { category: 'Driver of the Day',   exact: '?',  notes: '' },
  { category: 'Most Positions Gained', exact: '?', notes: '' },
  { category: 'Safety Car',          exact: '?',  notes: 'Yes / No — binary' },
]

export default function HelpPage() {
  return (
    <div className="max-w-2xl space-y-12 animate-fade-up">

      <div>
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">How it works</p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">Help</h1>
      </div>

      {/* Prediction cutoff */}
      <section className="space-y-3">
        <h2 className="font-display font-bold text-2xl uppercase tracking-wide">Prediction Cutoff</h2>
        <div className="card p-5 space-y-2 font-mono text-sm text-f1muted leading-relaxed">
          <p>
            Predictions lock at the <span className="text-f1white">scheduled race start time</span>.
            Once the race begins you can no longer submit or change your picks.
          </p>
          <p>
            The countdown is shown on each race&apos;s predict page. Submit early — late picks score zero.
          </p>
          <p>
            Sprint weekends have a separate predict page and lock at the sprint start time.
          </p>
        </div>
      </section>

      {/* Scoring table */}
      <section className="space-y-3">
        <h2 className="font-display font-bold text-2xl uppercase tracking-wide">Scoring</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-f1mid">
                <th className="text-left px-4 py-3 text-f1muted uppercase tracking-wide text-xs">Category</th>
                <th className="text-right px-4 py-3 text-f1muted uppercase tracking-wide text-xs">Points</th>
                <th className="hidden sm:table-cell text-left px-4 py-3 text-f1muted uppercase tracking-wide text-xs">Notes</th>
              </tr>
            </thead>
            <tbody>
              {scoring.map(({ category, exact, notes }, i) => (
                <tr key={category} className={i % 2 === 0 ? 'bg-f1mid/20' : ''}>
                  <td className="px-4 py-2.5 text-f1white">{category}</td>
                  <td className="px-4 py-2.5 text-right text-f1red font-bold">{exact}</td>
                  <td className="hidden sm:table-cell px-4 py-2.5 text-f1muted">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-mono text-xs text-f1muted">
          Scores are calculated automatically after an admin enters the race result.
          Scoring is safe to re-run if a result is corrected.
        </p>
      </section>

      {/* Tips */}
      <section className="space-y-3">
        <h2 className="font-display font-bold text-2xl uppercase tracking-wide">Tips</h2>
        <div className="card p-5 space-y-2 font-mono text-sm text-f1muted leading-relaxed">
          <p>· You can update predictions any number of times before the cutoff.</p>
          <p>· Predictions are hidden from other players until the race starts.</p>
          <p>· Leagues are independent — join multiple leagues to compete in different groups.</p>
        </div>
      </section>

      <p className="font-mono text-xs text-f1muted">
        Questions? Ask the league admin, or{' '}
        <Link href="/leagues" className="text-f1red hover:text-red-400 transition-colors">
          head back to your leagues
        </Link>
        .
      </p>
    </div>
  )
}
