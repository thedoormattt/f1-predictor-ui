"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [nameChecking, setNameChecking] = useState(false);

  const checkNameAvailability = async (username: string) => {
    if (!username.trim()) return;
    setNameChecking(true);
    setUsernameTaken(false);
    try {
      const res = await fetchWithAuth(`/players`);
      if (res.ok) {
        const players: { username: string }[] = await res.json();
        setUsernameTaken(
          players.some(
            (p) => p.username.toLowerCase() === username.trim().toLowerCase(),
          ),
        );
      }
    } catch {
      // silent — constraint on server is the real safety net
    } finally {
      setNameChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameTaken) return;
    setLoading(true);
    setError(null);

    // 1. Sign up with Supabase auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Signup failed — please try again");
      setLoading(false);
      return;
    }

    // 2. Create player row via API
    try {
      const res = await fetchWithAuth(`/players`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Player-Id": userId,
        },
        body: JSON.stringify({
          username: username.trim(),
          full_name: fullName.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        const detail: string = err.detail ?? "";
        await supabase.auth.signOut();
        if (
          detail.toLowerCase().includes("duplicate key") ||
          detail.toLowerCase().includes("unique constraint")
        ) {
          setError(
            "That display name is already taken — please choose another.",
          );
        } else {
          setError(detail || "Failed to create player profile");
        }
        setLoading(false);
        return;
      }
    } catch {
      await supabase.auth.signOut();
      setError("Failed to connect to server");
      setLoading(false);
      return;
    }

    router.push("/leagues");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          Join the grid
        </p>
        <h1 className="font-display font-black text-4xl uppercase tracking-tight mb-8">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-mono text-xs text-f1muted uppercase tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="e.g. Alain Prost"
              className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs text-f1muted uppercase tracking-wide">
              Display Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.replace(/\s/g, ""));
                setUsernameTaken(false);
              }}
              onBlur={(e) => checkNameAvailability(e.target.value)}
              required
              placeholder="e.g. theProfessor"
              className={`w-full bg-f1grey border rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none transition-colors ${
                usernameTaken
                  ? "border-f1red focus:border-f1red"
                  : "border-f1mid focus:border-f1red"
              }`}
            />
            {nameChecking && (
              <p className="font-mono text-xs text-f1muted">
                Checking availability…
              </p>
            )}
            {usernameTaken && !nameChecking && (
              <p className="font-mono text-xs text-f1red">
                That username is already taken.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs text-f1muted uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs text-f1muted uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-f1grey border border-f1mid rounded px-3 py-2.5 text-f1white font-mono text-sm focus:outline-none focus:border-f1red transition-colors"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-f1red bg-f1red/10 border border-f1red/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || usernameTaken}
            className="w-full bg-f1red hover:bg-red-700 disabled:opacity-50 text-white font-display font-bold text-lg uppercase tracking-wide py-3 rounded transition-colors"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center font-mono text-xs text-f1muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-f1red hover:text-red-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
