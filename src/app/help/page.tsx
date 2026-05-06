import Link from "next/link";

const scoring = [
  { category: "Pole Position", pts: "5", notes: "Exact driver match" },
  { category: "1st Place", pts: "10", notes: "Exact driver match" },
  { category: "2nd Place", pts: "8", notes: "Exact driver match" },
  { category: "3rd Place", pts: "6", notes: "Exact driver match" },
  {
    category: "Podium — wrong slot",
    pts: "4",
    notes: "Driver on podium but wrong position (per driver)",
  },
  {
    category: "Podium Bonus",
    pts: "5",
    notes: "All three podium drivers correct in any order",
  },
  { category: "Last Place", pts: "5", notes: "Exact driver match" },
  { category: "Fastest Lap", pts: "4", notes: "Exact driver match" },
  { category: "Fastest Pitstop", pts: "4", notes: "Team, not driver" },
  {
    category: "Driver of the Day",
    pts: "4",
    notes: "Exact driver match — sprint races excluded",
  },
  { category: "Safety Car", pts: "4", notes: "Yes / No — binary" },
  { category: "Most Positions Gained", pts: "6", notes: "Exact driver match" },
];

export default function HelpPage() {
  return (
    <div className="max-w-2xl space-y-12 animate-fade-up">
      <div>
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          How it works
        </p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">
          Help
        </h1>
      </div>

      {/* Prediction cutoff */}
      <section className="space-y-3">
        <h2 className="font-display font-bold text-2xl uppercase tracking-wide">
          Prediction Cutoff
        </h2>
        <div className="card p-5 space-y-2 font-mono text-sm text-f1muted leading-relaxed">
          <p>
            Predictions lock at{" "}
            <span className="text-f1white">FP1 start time</span> for each race
            weekend. This means both the Sprint and GP predictions for a sprint
            weekend must be submitted before Friday practice begins.
          </p>
          <p>
            A live countdown is shown on each race&apos;s predict page. Submit
            early — picks cannot be changed after the deadline.
          </p>
          <p>
            If you miss the deadline, your predictions from the previous race of
            the same type (GP or Sprint) are automatically rolled over and used
            for scoring. A banner on the predict page will let you know if your
            picks have been rolled over.
          </p>
        </div>
      </section>

      {/* Scoring table */}
      <section className="space-y-3">
        <h2 className="font-display font-bold text-2xl uppercase tracking-wide">
          Scoring
        </h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-f1mid">
                <th className="text-left px-4 py-3 text-f1muted uppercase tracking-wide text-xs">
                  Category
                </th>
                <th className="text-right px-4 py-3 text-f1muted uppercase tracking-wide text-xs">
                  Points
                </th>
                <th className="hidden sm:table-cell text-left px-4 py-3 text-f1muted uppercase tracking-wide text-xs">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {scoring.map(({ category, pts, notes }, i) => (
                <tr key={category} className={i % 2 === 0 ? "bg-f1mid/20" : ""}>
                  <td className="px-4 py-2.5 text-f1white">{category}</td>
                  <td className="px-4 py-2.5 text-right text-f1red font-bold">
                    {pts}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-2.5 text-f1muted">
                    {notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-mono text-xs text-f1muted">
          Scores are calculated automatically after an admin enters the race
          result. Scoring is safe to re-run if a result is corrected.
        </p>
      </section>

      {/* Sprint weekends */}
      <section className="space-y-3">
        <h2 className="font-display font-bold text-2xl uppercase tracking-wide">
          Sprint Weekends
        </h2>
        <div className="card p-5 space-y-2 font-mono text-sm text-f1muted leading-relaxed">
          <p>
            Sprint weekends have a separate prediction entry for the Sprint race
            and the GP. Both share the same prediction deadline — FP1 on Friday.
          </p>
          <p>
            <span className="text-f1white">Driver of the Day</span> and{" "}
            <span className="text-f1white">Fastest Pitstop</span> are not
            awarded in sprint races and those fields are disabled on the sprint
            predict form.
          </p>
        </div>
      </section>

      {/* Leagues */}
      <section className="space-y-3">
        <h2 className="font-display font-bold text-2xl uppercase tracking-wide">
          Leagues
        </h2>
        <div className="card p-5 space-y-2 font-mono text-sm text-f1muted leading-relaxed">
          <p>
            Any player can create a league and share the invite code with
            friends. Predictions are global — one set of picks per player per
            race, shared across all leagues you belong to.
          </p>
          <p>
            Each league has its own leaderboard and cumulative points chart.
            Scores are the same regardless of league — the league is just a
            filtered view.
          </p>
        </div>
      </section>

      {/* Tips */}
      <section className="space-y-3">
        <h2 className="font-display font-bold text-2xl uppercase tracking-wide">
          Tips
        </h2>
        <div className="card p-5 space-y-2 font-mono text-sm text-f1muted leading-relaxed">
          <p>
            · You can update predictions any number of times before the cutoff.
          </p>
          <p>
            · Predictions are hidden from other players until the race starts.
          </p>
          <p>
            · The podium bonus (5 pts) is awarded if all three podium drivers
            are correct in any order.
          </p>
          <p>
            · A driver predicted on the podium but in the wrong position scores
            4 pts instead of the full position points.
          </p>
          <p>
            · Leagues are independent — join multiple leagues to compete in
            different groups.
          </p>
          <p>
            · If you forget to predict, your previous picks are rolled over
            automatically — but update them if you can.
          </p>
        </div>
      </section>

      {/* Password */}
      <section className="space-y-3">
        <h2 className="font-display font-bold text-2xl uppercase tracking-wide">
          Account
        </h2>
        <div className="card p-5 space-y-2 font-mono text-sm text-f1muted leading-relaxed">
          <p>
            If you forget your password, use the{" "}
            <Link
              href="/forgot-password"
              className="text-f1red hover:text-red-400 transition-colors"
            >
              forgot password
            </Link>{" "}
            link on the login page. A reset link will be sent to your email.
          </p>
        </div>
      </section>

      <p className="font-mono text-xs text-f1muted">
        Questions? Ask the league admin, or{" "}
        <Link
          href="/leagues"
          className="text-f1red hover:text-red-400 transition-colors"
        >
          head back to your leagues
        </Link>
        .
      </p>
    </div>
  );
}
