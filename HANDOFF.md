# Handoff: Prague Crew

Status as of 5 Nov 2026. Live at **https://prague-crew.vercel.app**. Every push to branch `claude/jolly-cori-z7w6mu` auto-deploys to production on Vercel (project `prague-crew`, team `darkillerygmailcoms-projects`).

## Architecture
- **Client:** Vite + React 19 + TypeScript PWA (`src/`). It uses a hash router, MapLibre GL 5, and vite-plugin-pwa (Workbox).
- **Data:** a local-first store (`src/lib/store.ts`) with three layers: seed (`src/data/*`), server, and pending edits.
  - Last-writer-wins per record.
  - Persisted in localStorage.
- **Sync:** `src/lib/sync.ts`.
  - Pushes pending ops to `POST /api/sync`.
  - Polls `GET /api/state` every 20 s while visible.
  - Opt-in live GPS goes to `POST /api/presence`.
- **Server:** `api/*.js` are plain JS Vercel Functions.
  - One JSON doc in the private Vercel Blob store `prague-crew-db` (fra1), env `BLOB_READ_WRITE_TOKEN`.
  - Optimistic concurrency via ETag `ifMatch`.
  - Shared merge logic lives in `shared/merge.js`.
- **Map:** OpenFreeMap vector styles (liberty/positron/bright/dark).
  - Tile URLs are pinned from TileJSON.
  - Bundled Natural Earth world underlay (`public/data/world.json`).
  - Offline pack downloader in `src/lib/offline.ts` (418 tiles + styles/sprites/fonts → Cache Storage).
- **Positions / timelapse:** `src/lib/positions.ts` turns each person's events into a continuous timeline.
  - Includes travel arcs and going home on long gaps.
  - `src/lib/clock.ts` is the time machine: play, speeds, and skipping quiet hours.
- **Navigation:** OSRM foot routing (routing.openstreetmap.de) with follow-me mode, next turn and arrival. Google Maps handles transit, plus the Uber deep link and an offline compass.

## Verified
- Typecheck and build pass.
- Two-browser sync works against `scripts/dev-api.mjs`.
- Production API reads/writes were checked with a temporary self-test endpoint, since removed.
- Offline reload via the service worker works.
- Offline map download works with mocked tiles.
- Live presence works.
- Navigation works with mocked routing.
- Editor time-zone and midnight handling work.
- The position engine was simulated for all three people across the trip.

Test scripts used (Playwright, run against `vite preview` + `scripts/dev-api.mjs`): two-phone sync, live GPS, mocked-OSRM navigation, editor tz/midnight, offline reload, offline download, and an axe-core WCAG 2 AA audit of every screen in light and dark (0 violations).

## Not verifiable from the build container
These hosts are blocked by its proxy: real OpenFreeMap tiles/styles, Open-Meteo weather, OSRM routing, and er-api rates. The code paths were exercised with mocks; check them on a phone.

## Data placeholders (edit in the app)
- Arto's flights are calendar-confirmed: GVA T1 → PRG T2, 15 Nov 15:25–17:00 (EZS1563); return 20 Nov 20:15–21:50 (EZS1564), all CET. Airport transfers remain estimates.
- Alexey's Kožlany connection.
- The outbound flight number (W6 7859 likely).
- Apartment door code, Wi-Fi and host in Notes.

## Shared sightseeing revision
- Must-do events carry `mustDo: true`: Castle on 16 Nov; Korzo Národní, Louvre, Letná and the 17:11 ceremony on 17 Nov; Pilsner Urquell brewery on 18 Nov; Old Town, bridge/Malá Strana/Kampa, Lokál dinner and the night bridge crossing on 19 Nov. All include Koryun, Alexey and Arto. Shared days start at 10:30 or later; Castle is 10:30–14:30. Korn remains Koryun + Alexey only, with preparation moved to 16:30.
- The 18 Nov brewery target is now 14:00 (not confirmed), with provisional late-morning outbound and early-evening return train windows. Book the afternoon English tour before selecting real train services; do not silently restore an early departure.
- No GTA sessions or chores are assigned to Arto. Setup is 20 Nov 21:00, play 22:00–00:30 and 21 Nov 14:30–16:15, Koryun + Alexey only, after Arto’s 20:15 departure. The midnight launch and Friday club placeholder were removed. Shared Thursday afternoon is free.
- Friday 20 is flexible before Arto’s 17:15 estimated airport transfer. The Kutná Hora day trip is now an unscheduled idea; Jewish Quarter and Prague Sounds are optional alternatives.
- Booking instructions are in the `must-do` guide, event notes/links and Prep. No tickets or reservations were purchased. Louvre’s linked booking page currently blocks reservations through 10 Jan 2027; recheck before visiting.
- The live state previously saved seed records at revision 5. Eleven exact envelopes in `src/data/seedRevisions.ts` follow the new seed through `rebaseLegacySeedRecord`; changed/newer edits and tombstones are preserved. This handles older saved copies without changing their timestamps or issuing sync writes. The latest addition marks the exact old Wenceslas seed stop as Plan B only.
- Production sync returned persistent Vercel Blob ETag conflicts on the concert edit. That edit was published through the existing deployment branch. Do not bypass `ifMatch` or overwrite unrelated server data to work around this.
- PWA update fix: with `injectRegister: false`, explicitly set Workbox `skipWaiting` and `clientsClaim`. Without these, the prior worker kept serving an old plan even after a normal reload. The virtual registration uses `autoUpdate`; verify the generated worker activates immediately after deployment.
- Arrival shows two full alternative timetables on 15 Nov in Plan, with shared activities once before/after them. A = display-only preview: Arto airport → Klášterní šenk at Břevnov, all three meet for 18:30–20:00 dinner, then estimated 20:00–20:50 travel to base and Arto bag drop 20:50–21:00. B = existing editable provisional events: base/bag drop first, U Slovanské lípy dinner at 19:15, with Vinohradský pivovar as a farther alternative. A is presentation-only, outside SEED/DB; do not add both sets as active events because tentative events also affect map positions, reminders and calendar export. Choosing A replaces B and Koryun/Alexey’s Wenceslas stop. Guide `arrival-social` has booking/route details. No reservations made. Břevnov booking form needs ≥24 h and staff confirmation; same-day call +420 220 406 294. Airport → Břevnov estimates: taxi 20–30 min, public transport 40–60 min (191 → Vypich → 22/25 two stops → Břevnovský klášter + walk). U Vystřelenýho oka is closed Sundays. Monday Castle/Strahov/dancing stay unchanged.
- Arto’s Monday solo plan is now a tentative La Macumba intermediate Cuban class 18:00–19:30, nearby dinner, and social 21:00–23:30. Confirm 16 Nov holiday-eve operation, a single-lesson place/price and instruction language; the published class fee is for a longer course. Backup is DanceDifferent Bachata 1 at 18:00. The earlier solo downhill stroll was removed. No bookings or instructor messages were made.

## Free-tier budget (Vercel Hobby)
Blob allows ~100K simple / 10K advanced ops a month. The app polls at 20 s, the server memo lasts 6 s, CDN `s-maxage` is 5, edits are batched (1.2 s), and GPS is shared at most every 90 s when moving. Expected trip usage is ~20K reads and ~3–5K writes.

## Backups
The server writes a snapshot to `prague-crew/backups/YYYY-MM-DD-N.json` (one per 6-hour bucket) in the same Blob store. In-app: Settings → Backup/Restore (JSON).

## Ideas not done yet
- Push notifications. The `.ics` calendar export covers reminders instead.
- Photo memories per day.
- A Cloudflare Worker backend alternative. The client already supports a custom server URL in Settings.
