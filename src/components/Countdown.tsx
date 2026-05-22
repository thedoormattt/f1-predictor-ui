"use client";
import { useEffect, useState } from "react";

export default function Countdown({ locks_at }: { locks_at: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(locks_at).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Locked");
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setUrgent(diff < 3600000); // under 1 hour

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [locks_at]);

  if (timeLeft === "Locked") return null;

  return (
    <span
      className={`font-mono text-xs tabular-nums ${urgent ? "text-f1red animate-pulse" : "text-f1muted"}`}
    >
      🔒 {timeLeft}
    </span>
  );
}
