"use client";
import { useState } from "react";
import type { LeaderboardEntry } from "@/types";
import clsx from "clsx";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface ScoreBreakdown {
  race_key: string;
  location: string;
  type: string;
  pole_pts: number;
  p1_pts: number;
  p2_pts: number;
  p3_pts: number;
  podium_bonus: number;
  podium_pts: number;
  last_pts: number;
  fl_pts: number;
  fp_pts: number;
  dotd_pts: number;
  sc_pts: number;
  gains_pts: number;
  total: number;
  is_rollover: boolean;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function LeaderboardTable({
  entries,
}: {
  entries: LeaderboardEntry[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, ScoreBreakdown[]>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const toggle = async (playerId: string) => {
    if (expanded === playerId) {
      setExpanded(null);
      return;
    }
    setExpanded(playerId);
    if (scores[playerId]) return;

    setLoading(playerId);
    try {
      const [scoresRes, racesRes] = await Promise.all([
        fetchWithAuth(`/players/${playerId}/scores`).then((r) => r.json()),
        fetch(`${API}/races`).then((r) => r.json()),
      ]);
      const raceMap = Object.fromEntries(racesRes.map((r: any) => [r.id, r]));
      const merged = scoresRes
        .map((s: any) => ({
          ...s,
          race_key: raceMap[s.race_id]?.race_key ?? s.race_id,
          location: raceMap[s.race_id]?.location ?? "",
          type: raceMap[s.race_id]?.type ?? "",
          scheduled_at: raceMap[s.race_id]?.scheduled_at ?? "",
        }))
        .sort(
          (a: any, b: any) =>
            new Date(a.scheduled_at).getTime() -
            new Date(b.scheduled_at).getTime(),
        );
      setScores((prev) => ({ ...prev, [playerId]: merged }));
    } finally {
      setLoading(null);
    }
  };

  if (!entries.length)
    return (
      <div className="card p-8 text-center text-f1muted font-mono text-sm">
        No scores yet — first race coming soon
      </div>
    );

  return (
    <div className="card overflow-hidden">
      {entries.map((e, i) => (
        <div
          key={e.player_id}
          className={clsx(i < entries.length - 1 && "border-b border-f1mid")}
        >
          {/* Main row */}
          <div
            onClick={() => toggle(e.player_id)}
            className={clsx(
              "flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors",
              `stagger-${Math.min(i + 1, 7)} animate-fade-up`,
              expanded === e.player_id ? "bg-f1grey" : "hover:bg-f1grey/50",
            )}
          >
            <div
              className={clsx(
                "pos-badge",
                `pos-${e.position <= 3 ? e.position : "n"}`,
              )}
            >
              {e.position}
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-lg uppercase tracking-wide">
                {e.player_name}
              </p>
              <p className="font-mono text-f1muted text-xs">
                {e.races_scored} race{e.races_scored !== 1 ? "s" : ""} scored
              </p>
            </div>
            <div className="text-right">
              <p className="font-display font-black text-3xl text-f1white">
                {e.total_score}
              </p>
              <p className="font-mono text-f1muted text-xs">pts</p>
            </div>
            <span className="font-mono text-f1muted text-xs ml-1">
              {expanded === e.player_id ? "▲" : "▼"}
            </span>
          </div>

          {/* Expanded scores */}
          {expanded === e.player_id && (
            <div className="border-t border-f1mid bg-f1dark px-5 py-3 space-y-2">
              {loading === e.player_id ? (
                <p className="font-mono text-f1muted text-xs animate-pulse py-2">
                  Loading…
                </p>
              ) : scores[e.player_id]?.length ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-0 pb-1 border-b border-f1mid text-[10px] font-mono text-f1muted uppercase">
                    <span className="w-16">Race</span>
                    {[
                      "Pole",
                      "P1",
                      "P2",
                      "P3",
                      "Pod",
                      "Last",
                      "FL",
                      "FP",
                      "DotD",
                      "SC",
                      "Gains",
                    ].map((h) => (
                      <span key={h} className="w-10 text-right">
                        {h}
                      </span>
                    ))}
                  </div>

                  {scores[e.player_id].map((s) => (
                    <div
                      key={s.race_key}
                      className="flex items-center gap-0 py-0.5"
                    >
                      <div className="w-16 flex items-center gap-1">
                        <span className="font-mono text-xs text-f1white">
                          {s.location.split(" ")[0]}
                        </span>
                        {s.type === "Sprint" && (
                          <span className="font-mono text-[10px] text-f1red uppercase">
                            S
                          </span>
                        )}
                        {s.is_rollover && (
                          <span
                            className="font-mono text-[10px] text-f1muted uppercase"
                            title="Rolled over from previous race"
                          >
                            ↩
                          </span>
                        )}
                      </div>
                      {[
                        s.pole_pts,
                        s.p1_pts,
                        s.p2_pts,
                        s.p3_pts,
                        s.podium_bonus + s.podium_pts,
                        s.last_pts,
                        s.fl_pts,
                        s.fp_pts,
                        s.dotd_pts,
                        s.sc_pts,
                        s.gains_pts,
                      ].map((pts, j) => (
                        <span
                          key={j}
                          className={clsx(
                            "w-10 text-right font-mono text-xs",
                            pts > 0 ? "text-f1red font-bold" : "text-f1muted",
                          )}
                        >
                          {pts > 0 ? pts : "—"}
                        </span>
                      ))}
                    </div>
                  ))}

                  {/* Total row */}
                  <div className="flex items-center gap-0 pt-1 border-t border-f1mid">
                    <span className="flex-1 font-mono text-xs text-f1muted uppercase">
                      Total
                    </span>
                    <span className="font-display font-black text-base text-f1white">
                      {scores[e.player_id].reduce((sum, s) => sum + s.total, 0)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="font-mono text-f1muted text-xs py-2">
                  No scores yet
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
