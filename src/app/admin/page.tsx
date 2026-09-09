"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getRaces, getDrivers, getTeams } from "@/lib/api";
import type { Race, Driver, Team } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ResultData {
  pole: string | null;
  p1: string | null;
  p2: string | null;
  p3: string | null;
  last_place: string | null;
  fastest_lap: string | null;
  fastest_pitstop: string | null;
  pos_gained_winner: string | null;
  safety_car: boolean | null;
}

const EMPTY_RESULT: ResultData = {
  pole: null,
  p1: null,
  p2: null,
  p3: null,
  last_place: null,
  fastest_lap: null,
  fastest_pitstop: null,
  pos_gained_winner: null,
  safety_car: null,
};

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  const [races, setRaces] = useState<Race[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [secret, setSecret] = useState("");
  const [raceId, setRaceId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [editForm, setEditForm] = useState<ResultData>(EMPTY_RESULT);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.replace("/");
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    Promise.all([getRaces(), getDrivers(), getTeams()]).then(([r, d, t]) => {
      setRaces(r);
      setDrivers(d);
      setTeams(t);
    });
  }, []);

  // Load existing result when race changes
  useEffect(() => {
    if (!raceId || !secret) return;
    setResult(null);
    setShowEdit(false);
    fetch(`${API}/results/${raceId}`, {
      headers: { "X-Admin-Secret": secret },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setResult(data);
          setEditForm(data);
          setShowEdit(true);
        }
      })
      .catch(() => {});
  }, [raceId, secret]);

  const adminPost = async (path: string, msg: string) => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { "X-Admin-Secret": secret },
      });
      if (!res.ok) {
        const err = await res.json();
        setStatus(`❌ ${err.detail ?? "Error"}`);
      } else {
        setStatus(`✓ ${msg}`);
        // Reload result after fetch
        if (path.includes("fetch-openf1")) {
          const r = await fetch(`${API}/results/${raceId}`);
          if (r.ok) {
            const data = await r.json();
            setResult(data);
            setEditForm(data);
            setShowEdit(true);
          }
        }
      }
    } catch {
      setStatus("❌ Network error");
    } finally {
      setBusy(false);
    }
  };

  const saveOverrides = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`${API}/results/admin/${raceId}/override`, {
        method: "PATCH",
        headers: {
          "X-Admin-Secret": secret,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json();
        setStatus(`❌ ${err.detail ?? "Error"}`);
      } else {
        setStatus("✓ Result updated");
        const data = await res.json();
        setResult(data);
        setEditForm(data);
      }
    } catch {
      setStatus("❌ Network error");
    } finally {
      setBusy(false);
    }
  };

  const setField =
    (field: keyof ResultData) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setEditForm((f) => ({
        ...f,
        [field]:
          val === "" ? null : field === "safety_car" ? val === "true" : val,
      }));
    };

  if (loading || !user || !isAdmin) return null;

  const driverOptions = drivers.map((d) => (
    <option key={d.acronym} value={d.acronym}>
      {d.acronym} — {d.full_name}
    </option>
  ));

  const teamOptions = teams.map((t) => (
    <option key={t.acronym} value={t.acronym}>
      {t.acronym} — {t.name}
    </option>
  ));

  return (
    <div className="space-y-8 max-w-lg">
      <div className="animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          Admin
        </p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">
          Race Control
        </h1>
      </div>

      <div className="card p-5 space-y-4 animate-fade-up">
        <div className="space-y-1">
          <label className="font-mono text-xs text-f1muted uppercase tracking-wide">
            Admin Secret
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="SECRET_KEY from .env"
            className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-xs text-f1muted uppercase tracking-wide">
            Race
          </label>
          <select
            value={raceId}
            onChange={(e) => setRaceId(e.target.value)}
            className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors appearance-none"
          >
            <option value="">— Select race —</option>
            {races.map((r) => (
              <option key={r.id} value={r.id}>
                R{r.round} · {r.location} {r.type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {raceId && (
        <div className="space-y-3 animate-fade-up">
          <div className="card p-4 border-l-2 border-l-f1red">
            <p className="font-mono text-f1muted text-xs leading-relaxed">
              Results are fetched and scored{" "}
              <span className="text-f1white">automatically</span> a few hours
              after each race and sprint. The steps below are only needed to
              correct a result or to force an early run.
            </p>
          </div>

          <Step n={1} label="Fetch result from OpenF1">
            <button
              onClick={() =>
                adminPost(
                  `/results/admin/${raceId}/fetch-openf1`,
                  "Result fetched",
                )
              }
              disabled={busy || !secret}
              className="btn-admin"
            >
              Fetch OpenF1 Data
            </button>
          </Step>

          {/* Override section */}
          {showEdit && (
            <Step n={2} label="Override Result Fields">
              <div className="space-y-3">
                {(
                  [
                    { field: "pole", label: "Pole", type: "driver" },
                    { field: "p1", label: "1st Place", type: "driver" },
                    { field: "p2", label: "2nd Place", type: "driver" },
                    { field: "p3", label: "3rd Place", type: "driver" },
                    {
                      field: "last_place",
                      label: "Last Place",
                      type: "driver",
                    },
                    {
                      field: "fastest_lap",
                      label: "Fastest Lap",
                      type: "driver",
                    },
                    {
                      field: "fastest_pitstop",
                      label: "Fastest Pitstop",
                      type: "team",
                    },
                    {
                      field: "pos_gained_winner",
                      label: "Positions Gained",
                      type: "driver",
                    },
                    { field: "safety_car", label: "Safety Car", type: "bool" },
                  ] as {
                    field: keyof ResultData;
                    label: string;
                    type: string;
                  }[]
                ).map(({ field, label, type }) => (
                  <div key={field} className="flex items-center gap-3">
                    <label className="font-mono text-xs text-f1muted w-32 shrink-0 whitespace-nowrap">
                      {label}
                    </label>
                    {type === "bool" ? (
                      <select
                        value={
                          editForm[field] == null ? "" : String(editForm[field])
                        }
                        onChange={setField(field)}
                        className="flex-1 bg-f1grey border border-f1mid rounded px-3 py-2 text-f1white font-mono text-sm focus:outline-none focus:border-f1red appearance-none"
                      >
                        <option value="">— Select —</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <select
                        value={(editForm[field] as string) ?? ""}
                        onChange={setField(field)}
                        className="flex-1 bg-f1grey border border-f1mid rounded px-3 py-2 text-f1white font-mono text-sm focus:outline-none focus:border-f1red appearance-none"
                      >
                        <option value="">— Select —</option>
                        {type === "driver" ? driverOptions : teamOptions}
                      </select>
                    )}
                  </div>
                ))}
                <button
                  onClick={saveOverrides}
                  disabled={busy || !secret}
                  className="btn-admin mt-2"
                >
                  Save Overrides
                </button>
              </div>
            </Step>
          )}

          <Step n={showEdit ? 3 : 2} label="Run scoring manually">
            <button
              onClick={() =>
                adminPost(`/results/admin/${raceId}/score`, "Scores calculated")
              }
              disabled={busy || !secret}
              className="btn-admin"
            >
              Run Scoring
            </button>
          </Step>
        </div>
      )}

      <div className="card p-4 space-y-3 animate-fade-up">
        <h3 className="font-display font-bold text-sm uppercase tracking-wide">
          Run Auto-Score Sweep
        </h3>
        <p className="font-mono text-f1muted text-xs">
          Checks every recent race that has finished, pulls anything missing
          from OpenF1 and scores it. This runs on its own in the background —
          use this to trigger it immediately.
        </p>
        <button
          onClick={() => adminPost("/results/admin/autoscore", "Sweep complete")}
          disabled={busy || !secret}
          className="btn-admin"
        >
          Sweep Now
        </button>
      </div>

      <div className="card p-4 space-y-3 animate-fade-up">
        <h3 className="font-display font-bold text-sm uppercase tracking-wide">
          Rescore All Completed Races
        </h3>
        <p className="font-mono text-f1muted text-xs">
          Recalculates scores for every race that has a result. Run this after
          adding new players or predictions.
        </p>
        <button
          onClick={async () => {
            setBusy(true);
            setStatus(null);
            try {
              const res = await fetch(`${API}/results/admin/score-all`, {
                method: "POST",
                headers: { "X-Admin-Secret": secret },
              });
              if (!res.ok) {
                const err = await res.json();
                setStatus(`❌ ${err.detail ?? "Error"}`);
              } else {
                const data = await res.json();
                const count = Object.keys(data.scored).length;
                setStatus(`✓ Scored ${count} race${count !== 1 ? "s" : ""}`);
              }
            } catch {
              setStatus("❌ Network error");
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy || !secret}
          className="btn-admin"
        >
          Rescore All Races
        </button>
      </div>

      {status && (
        <div
          className={`font-mono text-sm rounded px-4 py-3 border ${
            status.startsWith("✓")
              ? "bg-green-900/20 border-green-700 text-green-400"
              : "bg-f1red/10 border-f1red/30 text-f1red"
          }`}
        >
          {status}
        </div>
      )}

      <style jsx>{`
        .btn-admin {
          background: #e8002d;
          color: white;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
        }
        .btn-admin:hover:not(:disabled) {
          background: #c0001f;
        }
        .btn-admin:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

function Step({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="pos-badge pos-n text-f1red border border-f1red/30 bg-transparent">
          {n}
        </div>
        <h3 className="font-display font-bold text-sm uppercase tracking-wide">
          {label}
        </h3>
      </div>
      {children}
    </div>
  );
}
