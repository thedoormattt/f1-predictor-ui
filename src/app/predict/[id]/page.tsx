"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getRaces, getEnrichedDrivers, getTeams } from "@/lib/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import SelectionCarousel from "@/components/SelectionCarousel";
import type { Race, Team, Prediction, EnrichedDriver } from "@/types";
import clsx from "clsx";

const TEAM_COLOURS: Record<string, string> = {
  Mercedes: "#6CD3BF",
  Ferrari: "#E8002D",
  McLaren: "#FF8000",
  Haas: "#B6BABD",
  Alpine: "#2293D1",
  "Red Bull Racing": "#3671C6",
  "Racing Bulls": "#6692FF",
  Audi: "#C0392B",
  Williams: "#1B6AC2",
  Cadillac: "#8A8A8A",
  "Aston Martin": "#358C75",
};

const TEAM_LOGOS: Record<string, string> = {
  Mercedes: "/logos/mercedes.svg",
  Ferrari: "/logos/ferrari.svg",
  McLaren: "/logos/mclaren.svg",
  // add others as downloaded
};

function getTeamColour(name: string): string {
  for (const [k, v] of Object.entries(TEAM_COLOURS)) {
    if (name.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "#6B6B6B";
}

function getTeamLogo(name: string): string | null {
  for (const [k, v] of Object.entries(TEAM_LOGOS)) {
    if (name.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return null;
}

interface FormState {
  pole: string;
  p1: string;
  p2: string;
  p3: string;
  last_place: string;
  fastest_lap: string;
  fastest_pitstop: string;
  dotd: string;
  safety_car: string;
  pos_gained: string;
}

const EMPTY: FormState = {
  pole: "",
  p1: "",
  p2: "",
  p3: "",
  last_place: "",
  fastest_lap: "",
  fastest_pitstop: "",
  dotd: "",
  safety_car: "",
  pos_gained: "",
};

export default function PredictRacePage({
  params,
}: {
  params: { id: string };
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const raceId = parseInt(params.id);

  const [race, setRace] = useState<Race | null>(null);
  const [drivers, setDrivers] = useState<EnrichedDriver[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    Promise.all([getRaces(), getEnrichedDrivers(), getTeams()]).then(
      ([races, d, t]) => {
        const r = races.find((r) => r.id === raceId) ?? null;
        setRace(r);
        setDrivers(d);
        setTeams(t);
        if (r) setLocked(new Date() >= new Date(r.locks_at ?? r.scheduled_at));
      },
    );
  }, [raceId]);

  useEffect(() => {
    if (!user) return;
    fetchWithAuth(`/predictions/player/${user.id}`)
      .then((r) => r.json())
      .then((preds: Prediction[]) => {
        const existing = preds.find((p) => p.race_id === raceId);
        if (existing) {
          setForm({
            pole: existing.pole ?? "",
            p1: existing.p1 ?? "",
            p2: existing.p2 ?? "",
            p3: existing.p3 ?? "",
            last_place: existing.last_place ?? "",
            fastest_lap: existing.fastest_lap ?? "",
            fastest_pitstop: existing.fastest_pitstop ?? "",
            dotd: existing.dotd ?? "",
            safety_car:
              existing.safety_car != null ? String(existing.safety_car) : "",
            pos_gained: existing.pos_gained ?? "",
          });
        }
      })
      .catch(() => {});
  }, [user, raceId]);

  const set = (field: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || locked) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/predictions", {
        method: "POST",
        body: JSON.stringify({
          race_id: raceId,
          pole: form.pole || null,
          p1: form.p1 || null,
          p2: form.p2 || null,
          p3: form.p3 || null,
          last_place: form.last_place || null,
          fastest_lap: form.fastest_lap || null,
          fastest_pitstop: form.fastest_pitstop || null,
          dotd: form.dotd || null,
          safety_car:
            form.safety_car !== "" ? form.safety_car === "true" : null,
          pos_gained: form.pos_gained || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail ?? "Failed to save");
        setSaving(false);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to connect to server");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || !race)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-mono text-f1muted text-sm animate-pulse">
          Loading…
        </div>
      </div>
    );

  // Build carousel items
  const driverItems = drivers.map((d) => ({
    value: d.acronym,
    label: d.full_name.split(" ").pop() ?? d.full_name,
    sublabel: d.team ?? undefined,
    image: d.headshot_url ?? null,
    colour: d.team_colour ?? getTeamColour(d.team ?? ""),
  }));

  const teamItems = teams.map((t) => ({
    value: t.acronym,
    label: t.name,
    image: getTeamLogo(t.name),
    colour: getTeamColour(t.name),
  }));

  const scYesNo = [
    { value: "true", label: "Yes", colour: "#358C75", image: null },
    { value: "false", label: "No", colour: "#E8002D", image: null },
  ];

  return (
    <div className="space-y-8 max-w-lg">
      <div className="animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          Round {race.round} · {race.type}
        </p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">
          {race.location}
        </h1>
        {locked && (
          <p className="font-mono text-xs text-f1red mt-2 bg-f1red/10 border border-f1red/20 rounded px-3 py-2 inline-block">
            Predictions locked — race weekend has started
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        <Section label="Qualifying">
          <FieldLabel>Pole Position</FieldLabel>
          <SelectionCarousel
            items={driverItems}
            selected={form.pole}
            onSelect={set("pole")}
            disabled={locked}
          />
        </Section>

        <Section label="Race Podium">
          <FieldLabel>1st Place</FieldLabel>
          <SelectionCarousel
            items={driverItems}
            selected={form.p1}
            onSelect={set("p1")}
            disabled={locked}
          />
          <FieldLabel>2nd Place</FieldLabel>
          <SelectionCarousel
            items={driverItems}
            selected={form.p2}
            onSelect={set("p2")}
            disabled={locked}
          />
          <FieldLabel>3rd Place</FieldLabel>
          <SelectionCarousel
            items={driverItems}
            selected={form.p3}
            onSelect={set("p3")}
            disabled={locked}
          />
        </Section>

        <Section label="Other Picks">
          <FieldLabel>Last Place</FieldLabel>
          <SelectionCarousel
            items={driverItems}
            selected={form.last_place}
            onSelect={set("last_place")}
            disabled={locked}
          />
          <FieldLabel>Fastest Lap</FieldLabel>
          <SelectionCarousel
            items={driverItems}
            selected={form.fastest_lap}
            onSelect={set("fastest_lap")}
            disabled={locked}
          />
          <FieldLabel>Fastest Pitstop (Team)</FieldLabel>
          <SelectionCarousel
            items={teamItems}
            selected={form.fastest_pitstop}
            onSelect={set("fastest_pitstop")}
            disabled={locked}
          />
          <FieldLabel>Driver of the Day</FieldLabel>
          <SelectionCarousel
            items={driverItems}
            selected={form.dotd}
            onSelect={set("dotd")}
            disabled={locked}
          />
          <FieldLabel>Most Positions Gained</FieldLabel>
          <SelectionCarousel
            items={driverItems}
            selected={form.pos_gained}
            onSelect={set("pos_gained")}
            disabled={locked}
          />
          <FieldLabel>Safety Car?</FieldLabel>
          <SelectionCarousel
            items={scYesNo}
            selected={form.safety_car}
            onSelect={set("safety_car")}
            disabled={locked}
          />
        </Section>

        {error && (
          <p className="font-mono text-xs text-f1red bg-f1red/10 border border-f1red/20 rounded px-3 py-2">
            {error}
          </p>
        )}

        {!locked && (
          <button
            type="submit"
            disabled={saving}
            className={clsx(
              "w-full font-display font-bold text-lg uppercase tracking-wide py-3 rounded transition-all",
              saved
                ? "bg-green-700 text-white"
                : "bg-f1red hover:bg-red-700 text-white disabled:opacity-50",
            )}
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save Prediction"}
          </button>
        )}
      </form>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-display font-bold text-sm uppercase tracking-widest text-f1red">
        {label}
      </h3>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs text-f1muted uppercase tracking-wide">
      {children}
    </p>
  );
}
