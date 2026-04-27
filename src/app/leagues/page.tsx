"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface League {
  id: number;
  name: string;
  invite_code: string;
  created_by: string;
}

export default function LeaguesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchWithAuth(`${API}/leagues`, {
      headers: { "X-Player-Id": user.id },
    })
      .then((r) => r.json())
      .then((data) => {
        setLeagues(data);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          Your leagues
        </p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">
          Leagues
        </h1>
      </div>

      {/* Actions */}
      <div
        className="flex gap-3 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <Link
          href="/leagues/create"
          className="flex-1 bg-f1red hover:bg-red-700 text-white font-display font-bold text-base uppercase tracking-wide py-3 rounded text-center transition-colors"
        >
          + Create League
        </Link>
        <Link
          href="/leagues/join"
          className="flex-1 card card-hover text-f1white font-display font-bold text-base uppercase tracking-wide py-3 rounded text-center transition-colors border border-f1mid hover:border-f1red"
        >
          Join League
        </Link>
      </div>

      {/* League list */}
      {fetching ? (
        <p className="font-mono text-f1muted text-sm animate-pulse">Loading…</p>
      ) : leagues.length === 0 ? (
        <div className="card p-8 text-center space-y-2">
          <p className="font-display font-bold text-xl uppercase text-f1muted">
            No leagues yet
          </p>
          <p className="font-mono text-f1muted text-sm">
            Create one or join with an invite code
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {leagues.map((league, i) => (
            <Link
              key={league.id}
              href={`/leagues/${league.id}`}
              className={clsx(
                "card card-hover flex items-center gap-4 px-5 py-4 block",
                `stagger-${Math.min(i + 1, 7)} animate-fade-up`,
              )}
            >
              <div className="flex-1">
                <p className="font-display font-bold text-xl uppercase tracking-wide">
                  {league.name}
                </p>
                <p className="font-mono text-f1muted text-xs mt-0.5">
                  Code:{" "}
                  <span className="text-f1white tracking-widest">
                    {league.invite_code}
                  </span>
                </p>
              </div>
              {league.created_by === user.id && (
                <span className="font-mono text-xs px-2 py-0.5 rounded border border-f1red text-f1red uppercase">
                  Owner
                </span>
              )}
              <span className="font-mono text-xs text-f1muted">View →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
