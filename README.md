# F1 Predictions League — Frontend

Next.js frontend for the F1 Predictions League.

## Stack

- **Next.js** (App Router) — React framework
- **Tailwind CSS** — styling
- **Recharts** — cumulative points chart
- **Supabase JS** — auth only (data goes via FastAPI)
- **Vercel** — hosting
- **Vercel Analytics + Speed Insights** — usage and performance tracking

---

## Requirements

- **Node.js >=20.9.0**. Use nvm: `nvm install 20 && nvm use 20`

## Local setup

```bash
nvm use   # picks up .nvmrc → Node 20
npm install
cp .env.local.example .env.local
# Fill in:
#   NEXT_PUBLIC_API_URL=http://localhost:8000
#   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
npm run dev
# → http://localhost:3000
```

Make sure your FastAPI backend is also running on port 8000.

---

## Pages

| Route              | Description                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| `/`                | Latest race result, driver and constructor championship standings      |
| `/race`            | Full 2026 race calendar with countdown to locks_at                     |
| `/race/[id]`       | Race result with podium cards, scores per player, prediction breakdown |
| `/predict`         | Pick a race to predict, sorted by scheduled_at                         |
| `/predict/[id]`    | Prediction form with carousel UI, locks at FP1 start                   |
| `/leagues`         | Your leagues list                                                      |
| `/leagues/create`  | Create a new league                                                    |
| `/leagues/join`    | Join a league with an invite code                                      |
| `/leagues/[id]`    | League leaderboard + cumulative points chart                           |
| `/login`           | Supabase email/password login                                          |
| `/signup`          | Player registration (full name + display name, duplicate check)        |
| `/forgot-password` | Request a password reset email                                         |
| `/reset-password`  | Set a new password via reset link                                      |
| `/help`            | Scoring rules, prediction cutoff info, tips                            |
| `/admin`           | Corrections only — fetch OpenF1 results, override fields, force scoring |

---

## Key components

| Component           | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| `ChampionshipTabs`  | Driver/constructor standings with podium cards, team colours/logos    |
| `LeaderboardTable`  | Expandable rows showing per-race score breakdown                      |
| `CumulativeChart`   | Recharts line chart, linear interpolation, scored races only          |
| `SelectionCarousel` | Infinite scroll carousel for prediction picking with headshots        |
| `Countdown`         | Live countdown to locks_at, pulses red under 1 hour                   |
| `KeepAlive`         | Silent ping to backend every 10 minutes to prevent Render cold starts |
| `Nav`               | Responsive nav, Admin tab only visible to admins                      |

---

## Auth

- Supabase email/password auth
- JWT token attached to all authenticated API calls via `fetchWithAuth`
- Admin status checked via `GET /players/me` on login — `isAdmin` flag from DB
- Admin routes (`/admin`) redirect non-admins to `/`
- Password reset flow via Supabase email → `/reset-password`

---

## Team data

Team colours and logos are centralised in `src/lib/teams.ts`. Add new logos to `public/logos/` and update the `TEAMS` map. Current logos: Mercedes, Ferrari, McLaren, Haas, Williams, Audi, Aston Martin, Cadillac.

---

## Prediction locking

Predictions lock at `locks_at` (FP1 start time) for each race, not at race start. Set via SQL script from OpenF1 session data. Falls back to `scheduled_at` if `locks_at` is null.

Sprint weekends lock at the same FP1 time as the GP for that meeting — both Sprint and GP predictions are submitted before the weekend begins.

---

## Rollover predictions

If a player misses the prediction deadline, their most recent prediction of the same race type (GP or Sprint) is automatically rolled over when scoring runs. Rolled-over predictions are flagged with `is_rollover: true` and a banner is shown on the predict page so players know to update them.

---

## Adding players

Players self-register at `/signup`. Display name is checked for uniqueness client-side and enforced by a DB unique constraint. The admin can also insert directly into Supabase if needed.

---

## After each race — nothing

The API fetches the result from OpenF1 and scores every player automatically, a
few hours after each race and sprint. Nothing needs doing at `/admin`.

`/admin` is now only for corrections:

1. Go to `/admin`, enter your `SECRET_KEY`, select the race
2. **Fetch OpenF1 Data** — re-pull positions, fastest lap, pitstop, safety car, positions gained
3. **Override Result Fields** — fix anything OpenF1 got wrong
4. **Run Scoring** — recalculate after a correction
5. **Sweep Now** — run the automatic pass immediately instead of waiting for it
6. **Rescore All Races** — after adding new players or correcting past results

Scoring is safe to re-run at any time.

### Driver of the Day

DotD has been retired — it isn't published by OpenF1 and was the only field ever
entered by hand. It's gone from the prediction form and from the admin page, and
the DotD column only appears in the leaderboard, race and prediction tables for
races that already have it. Past scores are untouched.

---

## Deploying to Vercel

```bash
npm install -g vercel
vercel
```

Environment variables required in Vercel dashboard:

- `NEXT_PUBLIC_API_URL` — Render backend URL
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Environment variables

| Variable                        | Used in         | Description              |
| ------------------------------- | --------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL`           | Client + Server | FastAPI backend base URL |
| `NEXT_PUBLIC_SUPABASE_URL`      | Client          | Supabase project URL     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client          | Supabase anon/public key |
