import clsx from "clsx";
import { getRaces, getResult } from "@/lib/api";
import ChampionshipTabs from "@/components/ChampionshipTabs";
import { getTeamColour, getTeamLogo, getTeamByAcronym } from "@/lib/teams";

export const revalidate = 300;

const OPENF1 = "https://api.openf1.org/v1";

async function getChampionshipStandings(sessionKey: number) {
  const [driversRes, constructorsRes, driverInfoRes] = await Promise.all([
    fetch(`${OPENF1}/championship_drivers?session_key=${sessionKey}`, {
      next: { revalidate: 3600 },
    }),
    fetch(`${OPENF1}/championship_teams?session_key=${sessionKey}`, {
      next: { revalidate: 3600 },
    }),
    fetch(`${OPENF1}/drivers?session_key=${sessionKey}`, {
      next: { revalidate: 3600 },
    }),
  ]);
  const drivers = await driversRes.json();
  const constructors = await constructorsRes.json();
  const driverInfo = await driverInfoRes.json();

  const driverInfoMap: Record<
    number,
    {
      acronym: string;
      full_name: string;
      team: string;
      colour: string;
      headshot: string | null;
    }
  > = {};
  for (const d of driverInfo) {
    driverInfoMap[d.driver_number] = {
      acronym: d.name_acronym,
      full_name: `${d.first_name} ${d.last_name}`,
      team: d.team_name,
      colour: d.team_colour ? `#${d.team_colour}` : "#6B6B6B",
      headshot: d.headshot_url ?? null,
    };
  }

  const mergedDrivers = drivers
    .map((d: any) => ({
      position: d.position_current,
      points: d.points_current,
      acronym: driverInfoMap[d.driver_number]?.acronym ?? `#${d.driver_number}`,
      full_name:
        driverInfoMap[d.driver_number]?.full_name ?? `#${d.driver_number}`,
      team: driverInfoMap[d.driver_number]?.team ?? "",
      colour: driverInfoMap[d.driver_number]?.colour ?? "#6B6B6B",
      headshot: driverInfoMap[d.driver_number]?.headshot ?? null,
    }))
    .sort((a: any, b: any) => a.position - b.position);

  const mergedConstructors = constructors
    .map((c: any) => ({
      position: c.position_current,
      points: c.points_current,
      team: c.team_name,
    }))
    .sort((a: any, b: any) => a.position - b.position);

  return { drivers: mergedDrivers, constructors: mergedConstructors };
}

interface DriverInfo {
  colour: string;
  headshot: string | null;
  team: string;
  full_name: string;
}

export default async function Home() {
  const races = await getRaces();
  const now = new Date();

  const completedRaces = races
    .filter((r: any) => new Date(r.scheduled_at) < now && r.openf1_session_key)
    .sort(
      (a: any, b: any) =>
        new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
    );

  const latestRace = completedRaces[0] ?? null;

  const enrichedRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/reference/drivers/enriched`,
    { next: { revalidate: 3600 } },
  ).catch(() => null);

  const enrichedDrivers = enrichedRes?.ok ? await enrichedRes.json() : [];

  const driverMap: Record<string, DriverInfo> = {};
  for (const d of enrichedDrivers) {
    driverMap[d.acronym] = {
      colour: d.team_colour ?? getTeamColour(d.team ?? ""),
      headshot: d.headshot_url ?? null,
      team: d.team ?? "",
      full_name: `${d.first_name} ${d.last_name}`,
    };
  }

  const [latestResult, standings] = await Promise.all([
    latestRace
      ? getResult(latestRace.id).catch(() => null)
      : Promise.resolve(null),
    latestRace?.openf1_session_key
      ? getChampionshipStandings(latestRace.openf1_session_key)
      : Promise.resolve({ drivers: [], constructors: [] }),
  ]);

  return (
    <div className="space-y-10">
      <div className="animate-fade-up">
        <p className="font-mono text-f1red text-xs tracking-widest uppercase mb-1">
          2026 Season
        </p>
        <h1 className="font-display font-black text-5xl uppercase tracking-tight">
          Home
        </h1>
      </div>

      {/* Latest race result */}
      {latestRace && (
        <section
          className="animate-fade-up space-y-3"
          style={{ animationDelay: "0.05s" }}
        >
          <h2 className="font-display font-bold text-2xl uppercase tracking-wide">
            Latest Race
            <span className="ml-3 font-mono text-f1muted text-sm normal-case tracking-normal">
              {latestRace.location} {latestRace.type}
            </span>
          </h2>

          {latestResult ? (
            <div className="space-y-3">
              {/* Podium cards */}
              {latestResult.p1 && latestResult.p2 && latestResult.p3 && (
                <div className="grid grid-cols-3 gap-2 items-end">
                  {[
                    { pos: "2nd", driver: latestResult.p2, isFirst: false },
                    { pos: "1st", driver: latestResult.p1, isFirst: true },
                    { pos: "3rd", driver: latestResult.p3, isFirst: false },
                  ].map(({ pos, driver, isFirst }) => {
                    const info = driverMap[driver];
                    return (
                      <div
                        key={pos}
                        className={clsx(
                          "card p-4 text-center space-y-2",
                          isFirst && "border-t-2",
                        )}
                        style={
                          isFirst
                            ? { borderTopColor: info?.colour ?? "#6B6B6B" }
                            : undefined
                        }
                      >
                        {info?.headshot ? (
                          <img
                            src={info.headshot}
                            alt={driver}
                            className={clsx(
                              "rounded-full mx-auto object-cover object-top",
                              isFirst ? "w-14 h-14" : "w-12 h-12",
                            )}
                            style={{ background: info.colour }}
                          />
                        ) : (
                          <div
                            className={clsx(
                              "rounded-full mx-auto",
                              isFirst ? "w-14 h-14" : "w-12 h-12",
                            )}
                            style={{ background: info?.colour ?? "#6B6B6B" }}
                          />
                        )}
                        <p className="font-display font-bold text-xs uppercase tracking-wide leading-tight">
                          {info?.full_name ?? driver}
                        </p>
                        <p className="font-mono text-f1muted text-[10px]">
                          {info?.team ?? ""}
                        </p>
                        <div
                          className={clsx(
                            "font-mono text-xs rounded px-2 py-0.5 inline-block",
                            isFirst
                              ? "text-f1white bg-f1red"
                              : "text-f1muted bg-f1mid",
                          )}
                        >
                          {pos}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Other results */}
              <div className="card overflow-hidden">
                {[
                  { label: "Pole", value: latestResult.pole, isTeam: false },
                  {
                    label: "Fastest Lap",
                    value: latestResult.fastest_lap,
                    isTeam: false,
                  },
                  {
                    label: "Fastest Pitstop",
                    value: latestResult.fastest_pitstop,
                    isTeam: true,
                  },
                  {
                    label: "Positions Gained",
                    value: latestResult.pos_gained_winner,
                    isTeam: false,
                  },
                  { label: "DotD", value: latestResult.dotd, isTeam: false },
                ]
                  .filter(({ value }) => value)
                  .map(({ label, value, isTeam }) => {
                    const info = !isTeam ? driverMap[value!] : null;
                    const teamName = isTeam ? getTeamByAcronym(value!) : null;
                    const teamColour = isTeam
                      ? getTeamColour(teamName ?? value!)
                      : null;
                    const teamLogo = isTeam
                      ? getTeamLogo(teamName ?? value!)
                      : null;

                    return (
                      <div
                        key={label}
                        className="flex items-center gap-3 px-4 py-3 border-b border-f1mid last:border-0"
                      >
                        <span className="font-mono text-f1muted text-xs w-28 shrink-0 whitespace-nowrap">
                          {label}
                        </span>

                        {isTeam ? (
                          teamLogo ? (
                            <div
                              className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center p-1 overflow-hidden"
                              style={{ background: teamColour ?? "#6B6B6B" }}
                            >
                              <img
                                src={teamLogo}
                                alt={value!}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div
                              className="w-7 h-7 rounded-full shrink-0"
                              style={{ background: teamColour ?? "#6B6B6B" }}
                            />
                          )
                        ) : info?.headshot ? (
                          <img
                            src={info.headshot}
                            alt={value!}
                            className="w-7 h-7 rounded-full object-cover object-top shrink-0"
                            style={{ background: info.colour }}
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full shrink-0"
                            style={{ background: info?.colour ?? "#6B6B6B" }}
                          />
                        )}

                        <span className="font-display font-bold uppercase tracking-wide text-sm flex-1">
                          {isTeam
                            ? (teamName ?? value)
                            : (info?.full_name ?? value)}
                        </span>
                        <span className="font-mono text-f1muted text-xs">
                          {!isTeam && (info?.team ?? "")}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="card p-5">
              <p className="font-mono text-f1muted text-sm">
                Result not yet entered
              </p>
            </div>
          )}
        </section>
      )}

      {/* Championship tabs */}
      <ChampionshipTabs
        drivers={standings.drivers}
        constructors={standings.constructors}
      />
    </div>
  );
}
