# F1 Predictions League — Frontend

Next.js 14 frontend for the F1 Predictions League.

## Stack
- **Next.js 14** (App Router) — React framework
- **Tailwind CSS** — styling
- **Recharts** — cumulative points chart
- **Supabase JS** — auth only (data goes via FastAPI)
- **Vercel** — hosting

---

## Local setup

```bash
npm install

cp .env.local.example .env.local
# Fill in:
#   NEXT_PUBLIC_API_URL=http://localhost:8000  (your FastAPI backend)
#   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key   ← NOT service key

npm run dev
# → http://localhost:3000
```

Make sure your FastAPI backend is also running on port 8000.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Leaderboard + cumulative chart |
| `/race` | Full 2026 race calendar |
| `/race/[id]` | Race result, all scores, prediction breakdown |
| `/login` | Supabase email/password login |
| `/predict` | Pick a race to predict |
| `/predict/[id]` | Prediction form (locked after race starts) |
| `/admin` | Fetch OpenF1 results, set DotD, trigger scoring |

---

## Adding players

Players sign up via Supabase Auth. To add your 7 friends:

1. Go to **Supabase dashboard → Authentication → Users**
2. Click **Invite user** and enter their email
3. They'll get a magic link to set their password
4. Their UUID from auth.users will be their `player_id` — make sure it matches the `players` table

Or create them manually in the SQL editor:
```sql
-- After they've signed up via auth, link them to the players table:
INSERT INTO players (id, name) VALUES ('their-uuid-here', 'Matt');
```

---

## After each race — workflow

1. Go to `/admin`
2. Enter your `SECRET_KEY` (from the FastAPI `.env`)
3. Select the race
4. Click **Fetch OpenF1 Data** — pulls positions, fastest lap, SC etc.
5. Select **Driver of the Day** and save
6. Click **Run Scoring** — calculates all 7 players' scores

Scoring is safe to re-run if you correct anything.

---

## Deploying to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts, then add environment variables in the Vercel dashboard:
- `NEXT_PUBLIC_API_URL` — your Render backend URL (e.g. `https://f1-predictions-api.onrender.com`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Update CORS in your FastAPI `main.py` to allow your Vercel domain:
```python
allow_origins=["https://your-app.vercel.app"]
```

---

## Known manual fix needed

In `src/lib/api.ts`, the `getResult` line reads:
```ts
export const getResult = (raceId: number) => get<r>(`/results/${raceId}`)
```
Change `get<r>` to `get<r>` — the angle brackets were mangled during generation.
The correct line is:
```ts
export const getResult = (raceId: number) => get<Result>(`/results/${raceId}`)
```
