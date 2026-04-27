"use client";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import LeaderboardTable from "@/components/LeaderboardTable";
import CumulativeChart from "@/components/CumulativeChart";
import type { LeaderboardEntry, CumulativeEntry } from "@/types";
import clsx from "clsx";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface League {
  id: number;
  name: string;
  invite_code: string;
  created_by: string;
}

export default function LeaguePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const leagueId = parseInt(id);

  const [league, setLeague] = useState<League | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [cumulative, setCumulative] = useState<CumulativeEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchWithAuth(`/leagues`, { headers: { "X-Player-Id": user.id } })
        .then((r) => r.json())
        .then(
          (leagues: League[]) => leagues.find((l) => l.id === leagueId) ?? null,
        ),
      fetch(`${API}/leagues/${leagueId}/leaderboard`).then((r) => r.json()),
      fetch(`${API}/leagues/${leagueId}/cumulative`).then((r) => r.json()),
    ])
      .then(([l, lb, cum]) => {
        setLeague(l);
        setLeaderboard(lb);
        setCumulative(cum);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [user, leagueId]);

  const copyCode = () => {
    if (!league) return;
    navigator.clipboard.writeText(league.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user || fetching)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-mono text-f1muted text-sm animate-pulse">
          Loading…
        </div>
      </div>
    );

  if (!league)
    return (
      <div className="text-center py-16">
        <p className="font-display font-bold text-2xl uppercase text-f1muted">
          League not found
        </p>
      </div>
    );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          2026 Season
        </p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">
          {league.name}
        </h1>

        {/* Invite code */}
        <button
          onClick={copyCode}
          className={clsx(
            "mt-3 flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded border transition-all",
            copied
              ? "border-green-600 text-green-500 bg-green-900/20"
              : "border-f1mid text-f1muted hover:border-f1red hover:text-f1white",
          )}
        >
          <span className="uppercase tracking-widest">
            {league.invite_code}
          </span>
          <span>{copied ? "✓ Copied" : "· Click to copy"}</span>
        </button>
      </div>

      {/* Leaderboard */}
      <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="font-display font-bold text-2xl uppercase tracking-wide mb-4">
          Standings
        </h2>
        <LeaderboardTable entries={leaderboard} />
      </div>

      {/* Chart */}
      {cumulative.length > 0 && (
        <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="font-display font-bold text-2xl uppercase tracking-wide mb-4">
            Points Over Time
          </h2>
          <div className="card p-4">
            <CumulativeChart data={cumulative} />
          </div>
        </div>
      )}
    </div>
  );
}
