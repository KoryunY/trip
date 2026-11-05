import type { LegacySeedRecord } from '../lib/seedRevision';

/**
 * Exact prior saved seed corrections that follow the shared sightseeing revision.
 * Match the whole original envelope; newer edits and deletions remain untouched.
 * These are the pre-revision records from the shared state, not user credentials.
 */
export const LEGACY_SEED_RECORDS: readonly LegacySeedRecord[] = [
  {
    "col": "events",
    "id": "castle",
    "u": 1793888072546,
    "by": "arto",
    "data": {
      "id": "castle",
      "title": "Prague Castle: St. Vitus Cathedral, Old Royal Palace, Golden Lane",
      "kind": "sight",
      "start": "2026-11-14T12:15:00+01:00",
      "end": "2026-11-14T14:30:00+01:00",
      "placeId": "prague-castle",
      "people": [
        "koryun",
        "alexey"
      ],
      "status": "planned",
      "notes": "Tram 22 or 23 to Pražský hrad. The courtyards are free; the circuit ticket covers the cathedral interior, Old Royal Palace and Golden Lane. Changing of the guard at noon at the main gate."
    }
  },
  {
    "col": "events",
    "id": "strahov-brewery",
    "u": 1793888072547,
    "by": "arto",
    "data": {
      "id": "strahov-brewery",
      "title": "Late lunch + beer: Strahov Monastery Brewery",
      "kind": "beer",
      "start": "2026-11-14T14:40:00+01:00",
      "end": "2026-11-14T15:50:00+01:00",
      "placeId": "strahov-brewery",
      "people": [
        "koryun",
        "alexey"
      ],
      "status": "planned",
      "notes": "St. Norbert beers brewed on site. Try the amber and the seasonal."
    }
  },
  {
    "col": "events",
    "id": "malastrana",
    "u": 1793888072549,
    "by": "arto",
    "data": {
      "id": "malastrana",
      "title": "Down through Malá Strana: Lennon Wall, Kampa, Charles Bridge at dusk",
      "kind": "sight",
      "start": "2026-11-14T16:40:00+01:00",
      "end": "2026-11-14T18:30:00+01:00",
      "placeId": "charles-bridge",
      "people": [
        "koryun",
        "alexey"
      ],
      "status": "planned"
    }
  },
  {
    "col": "events",
    "id": "lokal-dlouha",
    "u": 1793888072550,
    "by": "arto",
    "data": {
      "id": "lokal-dlouha",
      "title": "Dinner: Lokál Dlouhááá (tank Pilsner)",
      "kind": "beer",
      "start": "2026-11-14T18:45:00+01:00",
      "end": "2026-11-14T20:30:00+01:00",
      "placeId": "lokal-dlouha",
      "people": [
        "koryun",
        "alexey"
      ],
      "status": "planned",
      "notes": "Huge beer hall, fresh unpasteurised Pilsner Urquell from tanks. Busy on Saturdays, so arrive early or reserve."
    }
  },
  {
    "col": "events",
    "id": "lucerna",
    "u": 1793888072551,
    "by": "arto",
    "data": {
      "id": "lucerna",
      "title": "Saturday night: Lucerna Music Bar '80s & '90s party",
      "kind": "party",
      "start": "2026-11-14T22:00:00+01:00",
      "end": "2026-11-15T02:00:00+01:00",
      "placeId": "lucerna-music-bar",
      "people": [
        "koryun",
        "alexey"
      ],
      "status": "tentative",
      "notes": "Cult video party every Friday and Saturday. Plan B: Palác Akropolis in Žižkov, 5 min from home."
    }
  },
  {
    "col": "events",
    "id": "vysehrad",
    "u": 1793888072555,
    "by": "arto",
    "data": {
      "id": "vysehrad",
      "title": "Vyšehrad fortress: walls, basilica, river views",
      "kind": "sight",
      "start": "2026-11-15T12:45:00+01:00",
      "end": "2026-11-15T14:30:00+01:00",
      "placeId": "vysehrad",
      "people": [
        "koryun",
        "alexey"
      ],
      "status": "planned",
      "notes": "Metro C to Vyšehrad. Free. Slavín cemetery (Dvořák, Mucha), and great views of the Vltava."
    }
  },
  {
    "col": "events",
    "id": "naplavka-dancing",
    "u": 1793888072556,
    "by": "arto",
    "data": {
      "id": "naplavka-dancing",
      "title": "Riverside walk: Náplavka → Dancing House",
      "kind": "walk",
      "start": "2026-11-15T14:30:00+01:00",
      "end": "2026-11-15T15:30:00+01:00",
      "placeId": "dancing-house",
      "people": [
        "koryun",
        "alexey"
      ],
      "status": "planned"
    }
  },
  {
    "col": "events",
    "id": "fri-night",
    "u": 1793888072562,
    "by": "arto",
    "data": {
      "id": "fri-night",
      "title": "Friday night out: Karlovy Lázně (5 floors) or Lucerna",
      "kind": "party",
      "start": "2026-11-20T22:00:00+01:00",
      "end": "2026-11-21T02:00:00+01:00",
      "placeId": "karlovy-lazne",
      "people": [
        "koryun",
        "alexey"
      ],
      "status": "tentative"
    }
  },
  {
    "col": "events",
    "id": "souvenirs",
    "u": 1793888072565,
    "by": "arto",
    "data": {
      "id": "souvenirs",
      "title": "Souvenirs & beer to take home: Havelské market, Old Town",
      "kind": "shopping",
      "start": "2026-11-21T14:00:00+01:00",
      "end": "2026-11-21T16:00:00+01:00",
      "placeId": "havelske-trziste",
      "people": [
        "koryun",
        "alexey"
      ],
      "status": "planned",
      "notes": "Supermarkets are cheapest for beer/Becherovka to take home. Liquids go in checked baggage only!"
    }
  },
  {
    "col": "events",
    "id": "arto-to-base",
    "u": 1793888072553,
    "by": "arto",
    "data": {
      "id": "arto-to-base",
      "title": "Arto: airport → base",
      "kind": "transit",
      "start": "2026-11-15T17:30:00+01:00",
      "end": "2026-11-15T18:30:00+01:00",
      "fromPlaceId": "prg-t2",
      "toPlaceId": "base",
      "people": [
        "arto"
      ],
      "status": "tentative",
      "notes": "Estimated transfer after the 17:00 landing at Terminal 2; allow 30 min to exit, then about 1 h to the base. Adjust for the actual arrival and transport."
    }
  }
];
