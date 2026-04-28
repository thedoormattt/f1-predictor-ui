export interface TeamData {
  colour: string;
  logo: string | null;
  acronym?: string;
}

export const TEAMS: Record<string, TeamData> = {
  Mercedes: { colour: "#6CD3BF", logo: "/logos/mercedes.svg", acronym: "MER" },
  Ferrari: { colour: "#E8002D", logo: "/logos/ferrari.svg", acronym: "FER" },
  McLaren: { colour: "#FF8000", logo: "/logos/mclaren.svg", acronym: "MCL" },
  Haas: { colour: "#B6BABD", logo: "/logos/haas.svg", acronym: "HAA" },
  Alpine: { colour: "#2293D1", logo: null, acronym: "ALP" },
  "Red Bull Racing": { colour: "#3671C6", logo: null, acronym: "RBR" },
  "Racing Bulls": { colour: "#6692FF", logo: null, acronym: "RB" },
  Audi: { colour: "#C0392B", logo: "/logos/audi.svg", acronym: "AUD" },
  Williams: { colour: "#1B6AC2", logo: "/logos/williams.svg", acronym: "WIL" },
  Cadillac: { colour: "#8A8A8A", logo: "/logos/cadillac.svg", acronym: "CAD" },
  "Aston Martin": {
    colour: "#358C75",
    logo: "/logos/aston-martin.svg",
    acronym: "AMR",
  },
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

export function getTeamByAcronym(acronym: string): string {
  for (const [name, data] of Object.entries(TEAMS)) {
    if (data.acronym?.toUpperCase() === acronym.toUpperCase()) return name;
  }
  return acronym;
}
