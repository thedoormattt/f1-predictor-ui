export interface TeamData {
  colour: string;
  logo: string | null;
}

export const TEAMS: Record<string, TeamData> = {
  Mercedes: { colour: "#6CD3BF", logo: "/logos/mercedes.svg" },
  Ferrari: { colour: "#E8002D", logo: "/logos/ferrari.svg" },
  McLaren: { colour: "#FF8000", logo: "/logos/mclaren.svg" },
  Haas: { colour: "#B6BABD", logo: "/logos/haas.svg" },
  Alpine: { colour: "#2293D1", logo: null },
  "Red Bull Racing": { colour: "#3671C6", logo: null },
  "Racing Bulls": { colour: "#6692FF", logo: null },
  Audi: { colour: "#C0392B", logo: "/logos/audi.svg" },
  Williams: { colour: "#1B6AC2", logo: "/logos/williams.svg" },
  Cadillac: { colour: "#8A8A8A", logo: "/logos/cadillac.svg" },
  "Aston Martin": { colour: "#358C75", logo: "/logos/aston-martin.svg" },
};

export function getTeamData(teamName: string): TeamData {
  for (const [key, data] of Object.entries(TEAMS)) {
    if (teamName.toLowerCase().includes(key.toLowerCase())) return data;
  }
  return { colour: "#6B6B6B", logo: null };
}

export function getTeamColour(teamName: string): string {
  return getTeamData(teamName).colour;
}

export function getTeamLogo(teamName: string): string | null {
  return getTeamData(teamName).logo;
}
