"use client";
import { useState } from "react";
import clsx from "clsx";

interface TeamData {
  colour: string;
  logo: string | null;
  whiteBg?: boolean;
}

const TEAMS: Record<string, TeamData> = {
  Mercedes: { colour: "#6CD3BF", logo: "/logos/mercedes-grey.svg" },
  Ferrari: { colour: "#E8002D", logo: "/logos/ferrari.svg" },
  McLaren: { colour: "#FF8000", logo: "/logos/mclaren.svg" },
  Haas: { colour: "#B6BABD", logo: null },
  Alpine: { colour: "#2293D1", logo: null },
  "Red Bull Racing": { colour: "#3671C6", logo: null },
  "Racing Bulls": { colour: "#6692FF", logo: null },
  Audi: { colour: "#C0392B", logo: null },
  Williams: { colour: "#1B6AC2", logo: null },
  Cadillac: { colour: "#8A8A8A", logo: null },
  "Aston Martin": { colour: "#358C75", logo: null },
};

function getTeamData(teamName: string): TeamData {
  for (const [key, data] of Object.entries(TEAMS)) {
    if (teamName.toLowerCase().includes(key.toLowerCase())) return data;
  }
  return { colour: "#6B6B6B", logo: null };
}

interface Driver {
  position: number;
  points: number;
  acronym: string;
  full_name: string;
  team: string;
  colour: string;
  headshot: string | null;
}

interface Constructor {
  position: number;
  points: number;
  team: string;
}

interface Props {
  drivers: Driver[];
  constructors: Constructor[];
}

function PodiumCard({
  name,
  subtext,
  points,
  colour,
  position,
  headshot,
  logo,
  whiteBg,
}: {
  name: string;
  subtext?: string;
  points: number;
  colour: string;
  position: 1 | 2 | 3;
  headshot?: string | null;
  logo?: string | null;
  whiteBg?: boolean;
}) {
  const isFirst = position === 1;
  const imgSize = isFirst ? "w-14 h-14" : "w-12 h-12";

  return (
    <div
      className={clsx(
        "card p-4 text-center space-y-2",
        isFirst && "border-t-2",
      )}
      style={isFirst ? { borderTopColor: colour } : undefined}
    >
      {headshot ? (
        <img
          src={headshot}
          alt={name}
          className={clsx(
            imgSize,
            "rounded-full mx-auto object-cover object-top",
          )}
          style={{ background: colour }}
        />
      ) : logo ? (
        <div
          className={clsx(
            imgSize,
            "rounded-full mx-auto flex items-center justify-center p-2",
          )}
          style={{ background: colour }}
        >
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-contain"
            style={whiteBg ? { mixBlendMode: "multiply" } : undefined}
          />
        </div>
      ) : (
        <div
          className={clsx(imgSize, "rounded-full mx-auto")}
          style={{ background: colour }}
        />
      )}
      <p className="font-display font-bold text-xs uppercase tracking-wide leading-tight">
        {name}
      </p>
      {subtext && (
        <p className="font-mono text-f1muted text-[10px]">{subtext}</p>
      )}
      <p
        className={clsx(
          "font-display font-black",
          isFirst ? "text-3xl" : "text-2xl",
        )}
      >
        {points}
      </p>
      <div
        className={clsx(
          "font-mono text-xs rounded px-2 py-0.5 inline-block",
          isFirst ? "text-f1white bg-f1red" : "text-f1muted bg-f1mid",
        )}
      >
        {position === 1 ? "1st" : position === 2 ? "2nd" : "3rd"}
      </div>
    </div>
  );
}

export default function ChampionshipTabs({ drivers, constructors }: Props) {
  const [tab, setTab] = useState<"drivers" | "constructors">("drivers");

  return (
    <section className="animate-fade-up space-y-4">
      <h2 className="font-display font-bold text-2xl uppercase tracking-wide">
        Championship
      </h2>

      {/* Tab switcher */}
      <div className="flex gap-1 card p-1">
        <button
          onClick={() => setTab("drivers")}
          className={clsx(
            "flex-1 py-2 rounded font-display font-bold text-sm uppercase tracking-wide transition-colors",
            tab === "drivers"
              ? "bg-f1red text-white"
              : "text-f1muted hover:text-f1white",
          )}
        >
          Drivers
        </button>
        <button
          onClick={() => setTab("constructors")}
          className={clsx(
            "flex-1 py-2 rounded font-display font-bold text-sm uppercase tracking-wide transition-colors",
            tab === "constructors"
              ? "bg-f1red text-white"
              : "text-f1muted hover:text-f1white",
          )}
        >
          Constructors
        </button>
      </div>

      {/* Drivers tab */}
      {tab === "drivers" && (
        <div className="space-y-3">
          {drivers.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 items-end">
              <PodiumCard
                name={drivers[1].full_name}
                subtext={drivers[1].team}
                points={drivers[1].points}
                colour={drivers[1].colour}
                headshot={drivers[1].headshot}
                position={2}
              />
              <PodiumCard
                name={drivers[0].full_name}
                subtext={drivers[0].team}
                points={drivers[0].points}
                colour={drivers[0].colour}
                headshot={drivers[0].headshot}
                position={1}
              />
              <PodiumCard
                name={drivers[2].full_name}
                subtext={drivers[2].team}
                points={drivers[2].points}
                colour={drivers[2].colour}
                headshot={drivers[2].headshot}
                position={3}
              />
            </div>
          )}
          <div className="card overflow-hidden">
            {drivers.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b border-f1mid last:border-0"
              >
                <span className={`pos-badge pos-${i < 3 ? i + 1 : "n"}`}>
                  {d.position}
                </span>
                <div
                  className="w-1 h-8 rounded-full shrink-0"
                  style={{ background: d.colour }}
                />
                <div className="flex-1">
                  <p className="font-display font-bold uppercase tracking-wide text-sm">
                    {d.full_name}
                  </p>
                  <p className="font-mono text-f1muted text-xs">{d.team}</p>
                </div>
                <span className="font-display font-black text-xl">
                  {d.points}
                </span>
                <span className="font-mono text-f1muted text-xs">pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constructors tab */}
      {tab === "constructors" && (
        <div className="space-y-3">
          {constructors.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 items-end">
              <PodiumCard
                name={constructors[1].team}
                points={constructors[1].points}
                colour={getTeamData(constructors[1].team).colour}
                logo={getTeamData(constructors[1].team).logo}
                whiteBg={getTeamData(constructors[1].team).whiteBg}
                position={2}
              />
              <PodiumCard
                name={constructors[0].team}
                points={constructors[0].points}
                colour={getTeamData(constructors[0].team).colour}
                logo={getTeamData(constructors[0].team).logo}
                whiteBg={getTeamData(constructors[0].team).whiteBg}
                position={1}
              />
              <PodiumCard
                name={constructors[2].team}
                points={constructors[2].points}
                colour={getTeamData(constructors[2].team).colour}
                logo={getTeamData(constructors[2].team).logo}
                whiteBg={getTeamData(constructors[2].team).whiteBg}
                position={3}
              />
            </div>
          )}
          <div className="card overflow-hidden">
            {constructors.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b border-f1mid last:border-0"
              >
                <span className={`pos-badge pos-${i < 3 ? i + 1 : "n"}`}>
                  {c.position}
                </span>
                <div
                  className="w-1 h-8 rounded-full shrink-0"
                  style={{ background: getTeamData(c.team).colour }}
                />
                <span className="font-display font-bold uppercase tracking-wide text-sm flex-1">
                  {c.team}
                </span>
                <span className="font-display font-black text-xl">
                  {c.points}
                </span>
                <span className="font-mono text-f1muted text-xs">pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
