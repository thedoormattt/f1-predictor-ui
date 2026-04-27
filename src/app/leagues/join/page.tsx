"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function JoinLeaguePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setJoining(true);
    setError(null);

    try {
      const res = await fetchWithAuth(
        `${API}/leagues/join?invite_code=${code.trim().toUpperCase()}`,
        {
          method: "POST",
          headers: { "X-Player-Id": user.id },
        },
      );
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail ?? "Invalid invite code");
        setJoining(false);
        return;
      }
      const league = await res.json();
      router.push(`/leagues/${league.id}`);
    } catch {
      setError("Failed to connect to server");
      setJoining(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          Enter the pits
        </p>
        <h1 className="font-display font-black text-4xl uppercase tracking-tight mb-2">
          Join League
        </h1>
        <p className="font-mono text-f1muted text-sm mb-8">
          Enter the invite code shared by your league creator.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-mono text-xs text-f1muted uppercase tracking-wide">
              Invite Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              placeholder="e.g. X7K2AB"
              maxLength={8}
              className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm tracking-widest uppercase focus:outline-none focus:border-f1red transition-colors"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-f1red bg-f1red/10 border border-f1red/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={joining}
            className="w-full bg-f1red hover:bg-red-700 disabled:opacity-50 text-white font-display font-bold text-lg uppercase tracking-wide py-3 rounded transition-colors"
          >
            {joining ? "Joining…" : "Join League"}
          </button>
        </form>
      </div>
    </div>
  );
}
