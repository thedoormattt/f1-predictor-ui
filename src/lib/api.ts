import type {
  Race,
  Result,
  Prediction,
  Score,
  LeaderboardEntry,
  CumulativeEntry,
  Driver,
  Team,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function post<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const getRaces = () => get<Race[]>("/races");
export const getRace = (id: number) => get<Race>(`/races/${id}`);

export const getResult = (raceId: number) => get<Result>(`/results/${raceId}`);
export const getRaceScores = (raceId: number) =>
  get<Score[]>(`/results/${raceId}/scores`);

export const getRacePredictions = (raceId: number) =>
  get<Prediction[]>(`/predictions/race/${raceId}`);
export const getPlayerPredictions = (playerId: string) =>
  get<Prediction[]>(`/predictions/player/${playerId}`);

export const submitPrediction = (
  playerId: string,
  body: Omit<Prediction, "id" | "player_id" | "submitted_at" | "updated_at">,
) => post<Prediction>("/predictions", body, { "X-Player-Id": playerId });

export const getLeaderboard = () => get<LeaderboardEntry[]>("/leaderboard");
export const getCumulative = () =>
  get<CumulativeEntry[]>("/leaderboard/cumulative");

export const getDrivers = () => get<Driver[]>("/reference/drivers");
export const getTeams = () => get<Team[]>("/reference/teams");

export const getPlayers = () =>
  get<{ id: string; username: string }[]>("/players");
