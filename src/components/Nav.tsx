"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import clsx from "clsx";

export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  const { user, isAdmin, signOut } = useAuth();

  const links = [
    { href: "/leagues", label: "Leagues" },
    { href: "/race", label: "Races" },
    { href: "/predict", label: "Predict" },
    { href: "/help", label: "Help" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-f1mid bg-f1dark/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link
          href="/"
          className="font-display font-black text-xl tracking-widest uppercase shrink-0"
        >
          <span className="text-f1red">F1</span>
          <span className="text-f1white ml-1">Predictions</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "px-3 py-1.5 rounded text-sm font-display font-semibold tracking-wide uppercase transition-colors",
                  active
                    ? "bg-f1red text-white"
                    : "text-f1muted hover:text-f1white",
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={handleSignOut}
              className="font-mono text-xs text-f1muted hover:text-f1white transition-colors uppercase tracking-wide"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="font-mono text-xs text-f1red hover:text-red-400 transition-colors uppercase tracking-wide"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      <div className="sm:hidden flex border-t border-f1mid">
        {links.map(({ href, label }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex-1 text-center py-2 text-xs font-display font-semibold uppercase tracking-wide transition-colors",
                active ? "text-f1red border-b-2 border-f1red" : "text-f1muted",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="red-bar" />
    </nav>
  );
}
