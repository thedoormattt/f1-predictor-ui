export interface Race {
  id: number;
  round: number;
  location: string;
  type: "GP" | "Sprint";
  race_key: string;
  scheduled_at: string;
  locks_at: string | null;
  openf1_meeting_key: number | null;
  openf1_session_key: number | null;
}

export interface Result {
  id: number;
  race_id: number;
  pole: string | null;
  p1: string | null;
  p2: string | null;
  p3: string | null;
  last_place: string | null;
  fastest_lap: string | null;
  fastest_pitstop: string | null;
  dotd: string | null;
  safety_car: boolean | null;
  pos_gained_winner: string | null;
}

export interface Prediction {
  id: number;
  player_id: string;
  race_id: number;
  pole: string | null;
  p1: string | null;
  p2: string | null;
  p3: string | null;
  last_place: string | null;
  fastest_lap: string | null;
  fastest_pitstop: string | null;
  dotd: string | null;
  safety_car: boolean | null;
  pos_gained: string | null;
  is_rollover: boolean;
}

export interface Score {
  id: number;
  player_id: string;
  race_id: number;
  pole_pts: number;
  p1_pts: number;
  p2_pts: number;
  p3_pts: number;
  podium_bonus: number;
  podium_pts: number;
  last_pts: number;
  fl_pts: number;
  fp_pts: number;
  dotd_pts: number;
  sc_pts: number;
  gains_pts: number;
  total: number;
  is_rollover: boolean;
}

export interface LeaderboardEntry {
  position: number;
  player_id: string;
  player_name: string;
  total_score: number;
  races_scored: number;
}

export interface CumulativeEntry {
  player_name: string;
  race_id: number;
  race_key: string;
  round: number;
  location: string;
  type: string;
  scheduled_at: string;
  race_score: number;
  cumulative_score: number;
}

export interface Driver {
  id: number;
  full_name: string;
  acronym: string;
  number: number | null;
  team: string | null;
}

export interface EnrichedDriver {
  id: number;
  acronym: string;
  full_name: string;
  number: number | null;
  team: string | null;
  active: boolean;
  headshot_url: string | null;
  team_colour: string | null;
}

export interface Team {
  id: number;
  name: string;
  acronym: string;
}
