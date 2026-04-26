"use client";
import { useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function KeepAlive() {
  useEffect(() => {
    const ping = () => fetch(`${API}/`, { method: "GET" }).catch(() => {});
    ping();
    const interval = setInterval(ping, INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return null;
}
