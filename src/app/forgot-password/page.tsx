"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent)
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-sm animate-fade-up text-center space-y-4">
          <p className="font-mono text-f1red text-xs tracking-widest uppercase">
            Check your email
          </p>
          <h1 className="font-display font-black text-4xl uppercase tracking-tight">
            Email Sent
          </h1>
          <p className="font-mono text-f1muted text-sm">
            We've sent a password reset link to{" "}
            <span className="text-f1white">{email}</span>. Check your inbox and
            follow the link to reset your password.
          </p>
          <Link
            href="/login"
            className="font-mono text-xs text-f1red hover:text-red-400 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          Account recovery
        </p>
        <h1 className="font-display font-black text-4xl uppercase tracking-tight mb-2">
          Forgot Password
        </h1>
        <p className="font-mono text-f1muted text-sm mb-8">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <p className="font-mono text-xs text-f1red bg-f1red/10 border border-f1red/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-f1red hover:bg-red-700 disabled:opacity-50 text-white font-display font-bold text-lg uppercase tracking-wide py-3 rounded transition-colors"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>

          <p className="text-center font-mono text-xs text-f1muted">
            Remember your password?{" "}
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
