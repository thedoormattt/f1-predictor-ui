"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [user, isAdmin, loading, router]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-mono text-f1muted text-sm animate-pulse">
          Loading…
        </div>
      </div>
    );

  if (!user || !isAdmin) return null;

  return <>{children}</>;
}
