"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import clsx from "clsx";

interface Prediction {
  player_id: string;
  pole: string | null;
  p1: string | null;
  p2: string | null;
  p3: string | null;
  last_place: string | null;
  fastest_lap: string | null;
  fastest_pitstop: string | null;
  dotd: string | null;
  safety_car: boolean | null;
  pos_gained: string | null;
  is_rollover: boolean;
  players: { username: string };
}

interface Result {
  pole: string | null;
  p1: string | null;
  p2: string | null;
  p3: string | null;
  last_place: string | null;
  fastest_lap: string | null;
  fastest_pitstop: string | null;
  dotd: string | null;
  safety_car: boolean | null;
  pos_gained_winner: string | null;
}

// Driver of the Day was retired mid-season — the column stays for races that
// already have it, and is hidden everywhere else.
const FIELDS: { key: keyof Prediction; label: string }[] = [
  { key: "pole", label: "Pole" },
  { key: "p1", label: "P1" },
  { key: "p2", label: "P2" },
  { key: "p3", label: "P3" },
  { key: "last_place", label: "Last" },
  { key: "fastest_lap", label: "FL" },
  { key: "fastest_pitstop", label: "FP" },
  { key: "dotd", label: "DotD" },
  { key: "safety_car", label: "SC" },
  { key: "pos_gained", label: "Pos" },
];

const RESULT_MAP: Record<string, keyof Result> = {
  pole: "pole",
  p1: "p1",
  p2: "p2",
  p3: "p3",
  last_place: "last_place",
  fastest_lap: "fastest_lap",
  fastest_pitstop: "fastest_pitstop",
  dotd: "dotd",
  safety_car: "safety_car",
  pos_gained: "pos_gained_winner",
};

function isCorrect(
  field: string,
  prediction: Prediction,
  result: Result | null,
): boolean | null {
  if (!result) return null;
  const predVal =
    field === "safety_car" ? prediction.safety_car : (prediction as any)[field];
  const resultVal = result[RESULT_MAP[field] as keyof Result];
  if (predVal == null || resultVal == null) return null;
  return String(predVal) === String(resultVal);
}

export default function AllPredictionsTable({
  raceId,
  result,
}: {
  raceId: number;
  result: Result | null;
}) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth(`/predictions/race/${raceId}/all`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setPredictions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [raceId]);

  if (loading)
    return (
      <p className="font-mono text-f1muted text-sm animate-pulse">
        Loading predictions…
      </p>
    );
  if (!predictions.length)
    return (
      <p className="font-mono text-f1muted text-sm">No predictions available</p>
    );

  const showDotd =
    Boolean(result?.dotd) || predictions.some((p) => Boolean(p.dotd));
  const fields = FIELDS.filter((f) => f.key !== "dotd" || showDotd);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono min-w-max">
        <thead>
          <tr className="border-b border-f1mid">
            <th className="text-left px-3 py-2 text-f1muted uppercase tracking-wide whitespace-nowrap">
              Player
            </th>
            {fields.map((f) => (
              <th
                key={f.key}
                className="text-center px-2 py-2 text-f1muted uppercase tracking-wide"
              >
                {f.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {predictions.map((pred) => (
            <tr
              key={pred.player_id}
              className="border-b border-f1mid/50 hover:bg-f1grey/30 transition-colors"
            >
              <td className="px-3 py-2 font-display font-bold uppercase whitespace-nowrap">
                {pred.players?.username ?? pred.player_id}
                {pred.is_rollover && (
                  <span
                    className="ml-1 text-f1muted text-[10px]"
                    title="Rolled over"
                  >
                    ↩
                  </span>
                )}
              </td>
              {fields.map((f) => {
                const val =
                  f.key === "safety_car"
                    ? pred.safety_car == null
                      ? null
                      : pred.safety_car
                        ? "Yes"
                        : "No"
                    : (pred as any)[f.key];
                const correct = isCorrect(f.key, pred, result);
                return (
                  <td
                    key={f.key}
                    className={clsx(
                      "text-center px-2 py-2 whitespace-nowrap",
                      correct === true && "text-green-400",
                      correct === false && "text-f1red",
                      correct === null && "text-f1muted",
                    )}
                  >
                    {val ?? "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
