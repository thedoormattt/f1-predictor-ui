"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getRaces } from "@/lib/api";
import type { Race } from "@/types";
import Link from "next/link";
import clsx from "clsx";
import Countdown from "@/components/Countdown";

export default function PredictPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [races, setRaces] = useState<Race[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    getRaces().then(setRaces);
  }, []);

  if (loading || !user) return null;

  const now = new Date();
  const upcoming = races
    .filter((r) => new Date(r.scheduled_at) > now)
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
    );

  const past = races
    .filter((r) => new Date(r.scheduled_at) <= now)
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
    );

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          Your predictions
        </p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">
          Predict
        </h1>
      </div>

      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl uppercase tracking-wide text-f1muted">
            Upcoming
          </h2>
          {upcoming.map((race, i) => (
            <RaceCard key={race.id} race={race} index={i} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl uppercase tracking-wide text-f1muted">
            Past
          </h2>
          {past.map((race, i) => (
            <RaceCard key={race.id} race={race} index={i} past />
          ))}
        </div>
      )}
    </div>
  );
}

function RaceCard({
  race,
  index,
  past,
}: {
  race: Race;
  index: number;
  past?: boolean;
}) {
  const scheduled = new Date(race.scheduled_at);
  return (
    <Link
      href={`/predict/${race.id}`}
      className={clsx(
        "card card-hover flex items-center gap-4 px-5 py-4 block",
        `stagger-${Math.min(index + 1, 7)} animate-fade-up`,
        past && "opacity-50",
      )}
    >
      <span className="font-mono text-f1muted text-xs w-6 text-right shrink-0">
        {race.round}
      </span>
      <div className="flex-1">
        <p className="font-display font-bold text-lg uppercase tracking-wide">
          {race.location}
        </p>
        <p className="font-mono text-f1muted text-xs">
          {scheduled.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      {race.type === "Sprint" && (
        <span className="font-mono text-xs px-2 py-0.5 rounded border border-f1red text-f1red uppercase">
          Sprint
        </span>
      )}
      {past ? (
        <span className="font-mono text-xs text-f1muted uppercase">Locked</span>
      ) : (
        <Countdown locks_at={race.locks_at ?? race.scheduled_at} />
      )}
    </Link>
  );
}
