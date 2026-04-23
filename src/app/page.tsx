import { getRaces, getResult, getRaceScores } from "@/lib/api";

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

  // Build lookup: driver_number -> { acronym, team }
  const driverMap: Record<number, { acronym: string; team: string }> = {};
  for (const d of driverInfo) {
    driverMap[d.driver_number] = {
      acronym: d.name_acronym,
      team: d.team_name,
    };
  }

  // Merge
  const mergedDrivers = drivers
    .map((d: any) => ({
      position: d.position_current,
      points: d.points_current,
      acronym: driverMap[d.driver_number]?.acronym ?? `#${d.driver_number}`,
      team: driverMap[d.driver_number]?.team ?? "",
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

  const [latestResult, latestScores, standings] = await Promise.all([
    latestRace
      ? getResult(latestRace.id).catch(() => null)
      : Promise.resolve(null),
    latestRace
      ? getRaceScores(latestRace.id).catch(() => [])
      : Promise.resolve([]),
    latestRace?.openf1_session_key
      ? getChampionshipStandings(latestRace.openf1_session_key)
      : Promise.resolve({ drivers: [], constructors: [] }),
  ]);

  const drivers = standings.drivers.sort(
    (a: any, b: any) => a.position - b.position,
  );
  const constructors = standings.constructors.sort(
    (a: any, b: any) => a.position - b.position,
  );
  const sortedScores = [...latestScores].sort(
    (a: any, b: any) => b.total - a.total,
  );

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
          <div className="card p-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {latestResult ? (
              [
                { label: "Pole", value: latestResult.pole },
                { label: "1st", value: latestResult.p1 },
                { label: "2nd", value: latestResult.p2 },
                { label: "3rd", value: latestResult.p3 },
                { label: "FL", value: latestResult.fastest_lap },
                { label: "DotD", value: latestResult.dotd },
              ].map(
                ({ label, value }) =>
                  value && (
                    <div key={label} className="flex items-center gap-2">
                      <span className="font-mono text-f1muted text-xs w-10 shrink-0">
                        {label}
                      </span>
                      <span className="driver-chip">{value}</span>
                    </div>
                  ),
              )
            ) : (
              <p className="font-mono text-f1muted text-sm col-span-3">
                Result not yet entered
              </p>
            )}
          </div>
        </section>
      )}

      {/* Driver championship */}
      {drivers.length > 0 && (
        <section
          className="animate-fade-up space-y-3"
          style={{ animationDelay: "0.1s" }}
        >
          <h2 className="font-display font-bold text-2xl uppercase tracking-wide">
            Drivers Championship
          </h2>
          <div className="card overflow-hidden">
            {drivers.map((d: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b border-f1mid last:border-0"
              >
                <span className={`pos-badge pos-${i < 3 ? i + 1 : "n"}`}>
                  {d.position}
                </span>
                <div className="flex-1">
                  <p className="font-display font-bold uppercase tracking-wide text-sm">
                    {d.acronym}
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
        </section>
      )}

      {/* Constructor championship */}
      {constructors.length > 0 && (
        <section
          className="animate-fade-up space-y-3"
          style={{ animationDelay: "0.15s" }}
        >
          <h2 className="font-display font-bold text-2xl uppercase tracking-wide">
            Constructors Championship
          </h2>
          <div className="card overflow-hidden">
            {constructors.map((c: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b border-f1mid last:border-0"
              >
                <span className={`pos-badge pos-${i < 3 ? i + 1 : "n"}`}>
                  {c.position}
                </span>
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
        </section>
      )}
    </div>
  );
}
