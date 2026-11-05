# Prague Crew 🍺🎸🎮

Trip companion PWA for **Koryun, Alexey & Arto**, Prague, **13–22 Nov 2026**.

**Live app:** https://prague-crew.vercel.app (open on your phone → *Add to Home Screen*).

## What it does

| Tab | What's there |
| --- | --- |
| **Now** | Countdown / "Day N" hero, where each of us is right now (planned + live GPS), up next, today, prep progress, weather, handy tools (take me home, compass, converter, who-buys-the-round, guides) and a crew activity feed. |
| **Map** | Full map with our places (beer, sights, food, night, transport), crew avatars that **move through the itinerary**, a **timelapse** (play / scrub / jump to key moments, skips quiet hours, "Watch the whole trip" on the home screen), today's movement trails, live GPS dots, follow-me walking navigation (next turn, arrival alert), Google transit/Uber hand-off and an offline compass. Long-press the map to add a place. |
| **Plan** | All-days overview + day-by-day itinerary 13→22 Nov (tap anything to edit: time, place, who, status, notes), "running late" shift buttons, now-line, who's in Prague that day, weather & sunset, plus **Ideas & votes** to decide what to do. |
| **Prep** | Shared checklist (documents, Wizz baggage & check-in, eSIM, money, apartment, Korn, GTA VI night, bookings, packing) with per-person progress. |
| **More** | 16 researched guides (arrival step-by-step, airport→base options, baggage, EES border, eSIM, transport tickets, money, Korn night, GTA VI night, beer 101, departure day, packing, emergency, phrases, what's on), all places, expenses & split, shared notes, settings. |

Login = pick your name. Everyone sees and edits everything.

### Offline

* The app itself is cached by a service worker, so it opens without internet.
* **Settings → Download offline map** caches street-level vector tiles for Prague (+ Plzeň, Kutná Hora, Europe overview).
* Without tiles it still shows a built-in world map, all places, the crew and the timelapse.
* Edits made offline are queued and sync when you're back online.

### Sync / server

* `api/*.js`: Vercel Functions storing one JSON document in a **private Vercel Blob** store (`prague-crew-db`), with ETag-safe read-modify-write.
* Records merge per item (last writer wins). The built-in seed data (`src/data`) is the base layer, and server edits override it.
* Endpoints: `GET /api/state`, `POST /api/sync` `{ops}`, `POST /api/presence`, `GET /api/health`.
* Optional: set env `TRIP_KEY` to require an `X-Trip-Key` header for writes (then enter it in Settings → Advanced).
* The client can point at any server with the same contract (Settings → Advanced → Server URL), e.g. a Cloudflare Worker.

## Develop

```bash
npm install
node scripts/dev-api.mjs            # in-memory API on :8787
API_PROXY=http://localhost:8787 npm run dev
```

`?now=2026-11-16T18:30` in the URL fakes the current time, which helps when testing the live views.

## Data

* `src/data/events.ts`: the itinerary. Times are ISO with offsets; Yerevan legs carry `tz`.
* `src/data/places.ts`: 97 researched places (`approx: true` = pin not double-checked). Regenerate with `node scripts/build-places.mjs scripts/places.research.json`.
* `src/data/tasks.ts`, `ideas.ts`, `guides.ts`, `people.ts`.

Placeholders to fix: Arto's travel (Zürich assumed), Alexey's connection from Kožlany, apartment details in **More → Notes**.
