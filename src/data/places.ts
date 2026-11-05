// Generated from researched data (scripts/build-places.mjs). "approx: true" = position not double-checked.
import type { Place } from '../../shared/types';

export const PLACES: Place[] = [
  {
    "id": "base",
    "name": "Our base · Dalimilova 261/14",
    "category": "home",
    "lat": 50.086,
    "lon": 14.45005,
    "address": "Dalimilova 261/14, 130 00 Praha 3 – Žižkov",
    "area": "Žižkov",
    "blurb": "Our base at the foot of Vítkov hill (the building also houses Jump In Hostel / Sleep Easy listings). Nearest trams: Lipanská (~330 m) and Husinecká (~400 m); Jiřího z Poděbrad metro A is a ~12 min walk south. For cash, use bank ATMs (ČSOB/KB/Česká spořitelna), not Euronet.",
    "tags": [
      "home",
      "zizkov",
      "base"
    ]
  },
  {
    "id": "prg",
    "name": "Prague Airport · Terminal 1",
    "category": "transport",
    "lat": 50.1075,
    "lon": 14.26722,
    "address": "Aviatická 1017, 161 00 Praha 6 – Ruzyně",
    "area": "Ruzyně (Airport)",
    "blurb": "Non-Schengen terminal (Yerevan flights). Exit → AE bus, trolleybus 59, Uber pickup. Bolt pickup reportedly on Departures level.",
    "hours": "Arrivals hall 24/7",
    "url": "https://www.prg.aero/en",
    "tags": [
      "airport",
      "arrival",
      "AE",
      "59",
      "non-schengen"
    ]
  },
  {
    "id": "hl-n",
    "name": "Praha hlavní nádraží (Main Station)",
    "category": "transport",
    "lat": 50.08306,
    "lon": 14.4359,
    "address": "Wilsonova 300/8, 120 00 Praha 2",
    "area": "Nové Město / Vinohrady",
    "blurb": "Main rail hub for day trips to Plzeň, Kutná Hora and Karlštejn, and the AE airport bus terminus. From home it's ~1 km (15 min walk), or one or two tram stops from Husinecká. Metro C is underneath.",
    "tags": [
      "train",
      "metro-c",
      "AE",
      "daytrips"
    ]
  },
  {
    "id": "florenc",
    "name": "Florenc – bus station (ÚAN) + metro B/C",
    "category": "transport",
    "lat": 50.08946,
    "lon": 14.44039,
    "address": "Křižíkova 2110/2b, 186 00 Praha 8 – Karlín",
    "area": "Karlín / Florenc",
    "blurb": "Prague's main long-distance coach terminal (FlixBus, RegioJet and others), with the Florenc metro interchange (lines B and C) just north-west. About 800 m from home as the crow flies; walk via Husitská (~12–15 min).",
    "tags": [
      "bus",
      "coach",
      "metro-b",
      "metro-c"
    ]
  },
  {
    "id": "tram-husinecka",
    "name": "Husinecká (tram stop)",
    "category": "transport",
    "lat": 50.085,
    "lon": 14.44472,
    "address": "Seifertova, 130 00 Praha 3 – Žižkov",
    "area": "Žižkov",
    "blurb": "Second-closest tram stop, ~5 min walk. Trams on Seifertova (5, 9, 15, 26) run to Hlavní nádraží and on to Václavské náměstí, Národní and Malá Strana.",
    "tags": [
      "tram",
      "nearby"
    ]
  },
  {
    "id": "tram-lipanska",
    "name": "Lipanská (tram stop)",
    "category": "transport",
    "lat": 50.08396,
    "lon": 14.45343,
    "address": "Seifertova, 130 00 Praha 3 – Žižkov",
    "area": "Žižkov",
    "blurb": "Closest tram stop to the flat (~330 m, 5 min). Same Seifertova trams as Husinecká, heading west to the centre and east to Olšanské náměstí.",
    "tags": [
      "tram",
      "nearby"
    ]
  },
  {
    "id": "metro-jiriho-z-podebrad",
    "name": "Jiřího z Poděbrad (metro A)",
    "category": "transport",
    "lat": 50.07783,
    "lon": 14.4503,
    "address": "náměstí Jiřího z Poděbrad, 120 00 Praha 3 – Vinohrady",
    "area": "Vinohrady",
    "blurb": "Nearest metro (line A), ~12 min walk south past the TV Tower. Line A goes to Muzeum, Můstek, Staroměstská, Malostranská and Nádraží Veleslavín (for trolleybus 59 to the airport). The square above has cafés, and a farmers' market on some days.",
    "url": "https://pid.cz",
    "tags": [
      "metro-a",
      "nearby"
    ]
  },
  {
    "id": "metro-ceskomoravska",
    "name": "Českomoravská (metro B) – for O2 arena",
    "category": "transport",
    "lat": 50.10611,
    "lon": 14.49194,
    "address": "Drahobejlova / Českomoravská, 190 00 Praha 9",
    "area": "Libeň / Vysočany",
    "blurb": "Metro B stop for the O2 arena, a few minutes' walk away. It reopened on 20 March 2026 after a 439-day reconstruction.",
    "url": "https://pid.cz",
    "tags": [
      "metro-b",
      "o2-arena"
    ]
  },
  {
    "id": "metro-nadrazi-veleslavin",
    "name": "Nádraží Veleslavín (metro A + trolleybus 59)",
    "category": "transport",
    "lat": 50.09574,
    "lon": 14.34786,
    "address": "Evropská, 162 00 Praha 6 – Veleslavín",
    "area": "Veleslavín",
    "blurb": "Interchange between metro A and the airport trolleybus 59 (the former bus 119), which runs to Letiště roughly every few minutes and takes ~15–20 min. A normal PID ticket covers it.",
    "url": "https://pid.cz/trolejbusy/",
    "tags": [
      "metro-a",
      "airport",
      "59"
    ]
  },
  {
    "id": "zlicin",
    "name": "Zličín (metro B terminus + bus terminal)",
    "category": "transport",
    "lat": 50.05361,
    "lon": 14.29056,
    "address": "Zličín, 155 00 Praha 5",
    "area": "Zličín",
    "blurb": "Western end of metro B and a big regional bus terminal. Buses towards west Bohemia, such as the Kralovice/Kožlany direction, leave from here, so check IDOS for the exact bay.",
    "tags": [
      "metro-b",
      "regional-bus",
      "kozlany"
    ]
  },
  {
    "id": "metro-muzeum",
    "name": "Muzeum (metro A/C)",
    "category": "transport",
    "lat": 50.0796,
    "lon": 14.4312,
    "address": "Wilsonova / Václavské náměstí, 110 00 Praha 1",
    "area": "Nové Město",
    "blurb": "A/C interchange at the top of Wenceslas Square, by the National Museum. Handy for switching from line A (JzP) to line C (Hlavní nádraží, Florenc, Vyšehrad).",
    "tags": [
      "metro-a",
      "metro-c"
    ]
  },
  {
    "id": "o2-arena",
    "name": "O2 arena",
    "category": "venue",
    "lat": 50.10478,
    "lon": 14.49362,
    "address": "Českomoravská 2345/17a, 190 00 Praha 9",
    "area": "Libeň / Vysočany",
    "blurb": "Prague's main concert and ice-hockey arena. Take metro B to Českomoravská (reopened March 2026); allow ~35–40 min from Žižkov via Florenc.",
    "url": "https://www.o2arena.cz",
    "tags": [
      "concert",
      "arena",
      "hockey"
    ]
  },
  {
    "id": "charles-bridge",
    "name": "Charles Bridge (Karlův most)",
    "category": "sight",
    "lat": 50.08639,
    "lon": 14.41194,
    "address": "Karlův most, 110 00 Praha 1",
    "area": "Old Town / Malá Strana",
    "blurb": "The 14th-century statue-lined bridge. It's packed from mid-morning, so cross early (before 8:00) or late at night for the moody, lamp-lit version.",
    "hours": "Open 24/7",
    "price": "Free",
    "tags": [
      "landmark",
      "must-see",
      "photo",
      "free"
    ]
  },
  {
    "id": "old-town-square",
    "name": "Old Town Square + Astronomical Clock",
    "category": "sight",
    "lat": 50.087,
    "lon": 14.42076,
    "address": "Staroměstské náměstí 1, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Prague's main square, with the Orloj on the Old Town Hall. The apostles parade on the hour; stand a little back from the scrum, then look at the Týn church across the square.",
    "hours": "Square 24/7; clock show on the hour (daytime/evening)",
    "price": "Square free; Old Town Hall tower paid",
    "tags": [
      "landmark",
      "must-see",
      "free"
    ]
  },
  {
    "id": "prague-castle",
    "name": "Prague Castle – main gate (Hradčanské náměstí)",
    "category": "sight",
    "lat": 50.08975,
    "lon": 14.3984,
    "address": "Hradčanské náměstí / Pražský hrad, 119 08 Praha 1",
    "area": "Hradčany",
    "blurb": "Main entrance to the castle complex from Hradčanské náměstí (changing of the guard on the hour). Security check at the gate. The grounds are free; the circuit ticket covers St. Vitus, the Old Royal Palace and Golden Lane.",
    "hours": "Grounds roughly 6:00–22:00; interiors shorter in winter (check hrad.cz)",
    "price": "Grounds free; interiors with circuit ticket",
    "url": "https://www.hrad.cz/en",
    "tags": [
      "castle",
      "must-see",
      "unesco"
    ],
    "approx": true
  },
  {
    "id": "st-vitus-cathedral",
    "name": "St. Vitus Cathedral",
    "category": "sight",
    "lat": 50.09086,
    "lon": 14.40054,
    "address": "III. nádvoří 48/2, Pražský hrad, 119 01 Praha 1",
    "area": "Hradčany (Prague Castle)",
    "blurb": "Gothic cathedral at the heart of the castle; don't miss the Mucha stained-glass window. You can peek into the front section for free; go early to beat the queue.",
    "price": "Main nave with castle ticket",
    "url": "https://www.hrad.cz/en",
    "tags": [
      "church",
      "castle",
      "must-see"
    ]
  },
  {
    "id": "golden-lane",
    "name": "Golden Lane (Zlatá ulička)",
    "category": "sight",
    "lat": 50.09205,
    "lon": 14.40422,
    "address": "Zlatá ulička, Pražský hrad, 119 00 Praha 1",
    "area": "Hradčany (Prague Castle)",
    "blurb": "Row of tiny colourful houses inside the castle walls; Kafka wrote at no. 22. Covered by the castle circuit ticket during opening hours and often free to walk after the interiors close (check).",
    "price": "With castle circuit ticket",
    "url": "https://www.hrad.cz/en",
    "tags": [
      "castle",
      "kafka",
      "photo"
    ]
  },
  {
    "id": "malostranske-namesti",
    "name": "Malá Strana Square + St. Nicholas Church",
    "category": "sight",
    "lat": 50.08814,
    "lon": 14.40348,
    "address": "Malostranské náměstí, 118 00 Praha 1",
    "area": "Malá Strana",
    "blurb": "Baroque heart of the Lesser Town, dominated by St. Nicholas Church. Good stop between Charles Bridge and the climb up Nerudova to the castle.",
    "hours": "Square 24/7",
    "tags": [
      "square",
      "baroque",
      "free"
    ]
  },
  {
    "id": "lennon-wall",
    "name": "Lennon Wall",
    "category": "sight",
    "lat": 50.08624,
    "lon": 14.40695,
    "address": "Velkopřevorské náměstí, 118 00 Praha 1",
    "area": "Malá Strana",
    "blurb": "Ever-changing graffiti wall opposite the French embassy, a 2-minute walk from Kampa. Quick photo stop.",
    "hours": "Open 24/7",
    "price": "Free",
    "tags": [
      "street-art",
      "free",
      "photo"
    ]
  },
  {
    "id": "kampa-island",
    "name": "Kampa Island + Kampa Park",
    "category": "sight",
    "lat": 50.085,
    "lon": 14.40833,
    "address": "Na Kampě, 118 00 Praha 1",
    "area": "Malá Strana",
    "blurb": "Quiet island park under Charles Bridge with Černý's crawling babies outside Museum Kampa and river views across to the Old Town. Nice for a breather.",
    "hours": "Open 24/7",
    "price": "Free",
    "tags": [
      "park",
      "river",
      "free",
      "cerny"
    ]
  },
  {
    "id": "petrin-tower",
    "name": "Petřín Lookout Tower",
    "category": "viewpoint",
    "lat": 50.08354,
    "lon": 14.39505,
    "address": "Petřínské sady 633, 118 00 Praha 1",
    "area": "Malá Strana (Petřín hill)",
    "blurb": "Mini Eiffel Tower on Petřín hill with 299 steps to a 360° view. Combine it with the funicular up from Újezd and a walk down through the orchards, or across to Strahov.",
    "price": "Paid entry",
    "tags": [
      "view",
      "tower",
      "petrin"
    ]
  },
  {
    "id": "petrin-funicular-ujezd",
    "name": "Petřín funicular – Újezd lower station",
    "category": "transport",
    "lat": 50.08261,
    "lon": 14.40379,
    "address": "Újezd, 118 00 Praha 1",
    "area": "Malá Strana",
    "blurb": "Funicular up Petřín, valid with a normal PID ticket. After a long closure for slope stabilisation and a full track rebuild, PID announced a reopening with new cars in late September 2026; check pid.cz before relying on it.",
    "price": "PID ticket",
    "url": "https://pid.cz/lanova-draha/",
    "tags": [
      "funicular",
      "petrin",
      "pid"
    ],
    "approx": true
  },
  {
    "id": "strahov-monastery",
    "name": "Strahov Monastery & Library",
    "category": "sight",
    "lat": 50.08607,
    "lon": 14.38948,
    "address": "Strahovské nádvoří 1/132, 118 00 Praha 1",
    "area": "Hradčany",
    "blurb": "Premonstratensian monastery with the stunning Theological and Philosophical library halls (viewed from the doorway). Great view over Prague from the terrace below, and its own brewery next door.",
    "price": "Library paid",
    "tags": [
      "monastery",
      "library",
      "view"
    ]
  },
  {
    "id": "letna-metronome",
    "name": "Letná Park – Metronome viewpoint",
    "category": "viewpoint",
    "lat": 50.09473,
    "lon": 14.41575,
    "address": "Letenské sady, 170 00 Praha 7",
    "area": "Letná",
    "blurb": "Giant metronome on the plinth of the demolished Stalin statue, with the classic view of the bridges stacked over the Vltava. Skaters hang out here; the Letná beer garden is usually closed by November.",
    "hours": "Open 24/7",
    "price": "Free",
    "tags": [
      "view",
      "park",
      "free",
      "sunset"
    ]
  },
  {
    "id": "vysehrad",
    "name": "Vyšehrad (Basilica of Sts Peter & Paul)",
    "category": "viewpoint",
    "lat": 50.06436,
    "lon": 14.41779,
    "address": "Štulcova, 128 00 Praha 2 – Vyšehrad",
    "area": "Vyšehrad",
    "blurb": "Old fortress on a cliff above the Vltava, with the neo-Gothic basilica and Vyšehrad Cemetery (Dvořák, Mucha). Walk the ramparts for river views. Much calmer than the castle; metro C to Vyšehrad.",
    "hours": "Grounds open all day",
    "price": "Grounds free",
    "url": "https://praha-vysehrad.cz/en",
    "tags": [
      "fortress",
      "view",
      "cemetery",
      "free"
    ]
  },
  {
    "id": "dancing-house",
    "name": "Dancing House (Tančící dům)",
    "category": "sight",
    "lat": 50.07552,
    "lon": 14.4141,
    "address": "Jiráskovo náměstí 1981/6 (Rašínovo nábřeží 80), 120 00 Praha 2",
    "area": "Nové Město (riverside)",
    "blurb": "Gehry and Milunić's 'Fred & Ginger' building on the embankment. There's a rooftop bar/gallery with a view; it combines well with a Náplavka riverside walk.",
    "price": "Exterior free; rooftop/gallery paid",
    "tags": [
      "architecture",
      "riverside",
      "photo"
    ]
  },
  {
    "id": "wenceslas-square",
    "name": "Wenceslas Square (Václavské náměstí)",
    "category": "sight",
    "lat": 50.08152,
    "lon": 14.4273,
    "address": "Václavské náměstí, 110 00 Praha 1",
    "area": "Nové Město",
    "blurb": "The long boulevard-square of 1968 and 1989, running up to the St. Wenceslas statue and the National Museum. On 17 November it's the centre of Velvet Revolution commemorations.",
    "hours": "Open 24/7",
    "price": "Free",
    "tags": [
      "history",
      "1989",
      "free"
    ]
  },
  {
    "id": "national-museum",
    "name": "National Museum (historic building)",
    "category": "museum",
    "lat": 50.07905,
    "lon": 14.43106,
    "address": "Václavské náměstí 68, 110 00 Praha 1",
    "area": "Nové Město",
    "blurb": "Grand neo-Renaissance museum at the top of Wenceslas Square. The domed Pantheon and the staircase alone are worth it, and the dome gives a view down the square.",
    "price": "Paid entry",
    "url": "https://www.nm.cz/en",
    "tags": [
      "museum",
      "architecture"
    ]
  },
  {
    "id": "municipal-house",
    "name": "Municipal House (Obecní dům)",
    "category": "sight",
    "lat": 50.08773,
    "lon": 14.42781,
    "address": "náměstí Republiky 1090/5, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Art Nouveau showpiece with Smetana Hall, a gorgeous café and a Pilsner restaurant downstairs. Guided tours show off Mucha's rooms. Right next to the Powder Tower.",
    "price": "Tours paid; café free to enter",
    "url": "https://www.obecnidum.cz/en/",
    "tags": [
      "art-nouveau",
      "cafe",
      "concerts"
    ]
  },
  {
    "id": "powder-tower",
    "name": "Powder Tower (Prašná brána)",
    "category": "sight",
    "lat": 50.08725,
    "lon": 14.42776,
    "address": "náměstí Republiky 5, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Gothic gate tower where the Royal Route to the castle begins. You can climb it for a view down Celetná.",
    "price": "Tower climb paid",
    "tags": [
      "gothic",
      "tower",
      "royal-route"
    ]
  },
  {
    "id": "old-new-synagogue",
    "name": "Jewish Quarter – Old-New Synagogue",
    "category": "sight",
    "lat": 50.09007,
    "lon": 14.4186,
    "address": "Červená 2, 110 00 Praha 1 – Josefov",
    "area": "Josefov",
    "blurb": "Europe's oldest active synagogue (13th c.) and home of the Golem legend. It needs a separate ticket from the Jewish Museum circuit. Closed on Saturdays and Jewish holidays.",
    "price": "Paid entry",
    "tags": [
      "jewish-quarter",
      "synagogue",
      "history"
    ]
  },
  {
    "id": "josefov-old-jewish-cemetery",
    "name": "Josefov – Old Jewish Cemetery & Jewish Museum",
    "category": "sight",
    "lat": 50.08989,
    "lon": 14.41719,
    "address": "Široká 3 (Pinkas Synagogue entrance), 110 00 Praha 1 – Josefov",
    "area": "Josefov",
    "blurb": "Layered gravestones of the old ghetto cemetery, seen on the Jewish Museum circuit (Pinkas, Maisel and Spanish synagogues). The Pinkas Synagogue's wall of Holocaust victims' names is very moving. Closed Saturdays.",
    "price": "Jewish Museum circuit ticket",
    "tags": [
      "jewish-quarter",
      "museum",
      "history"
    ]
  },
  {
    "id": "klementinum",
    "name": "Klementinum (Baroque Library & Astronomical Tower)",
    "category": "sight",
    "lat": 50.08674,
    "lon": 14.41715,
    "address": "Mariánské náměstí 5 / Karlova 1, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Former Jesuit college with a jaw-dropping Baroque library hall and an astronomical tower with a top Old Town view. Guided tours only, roughly every 30 min; book ahead.",
    "price": "Guided tour, paid",
    "tags": [
      "library",
      "baroque",
      "view"
    ]
  },
  {
    "id": "zizkov-tower",
    "name": "Žižkov Television Tower",
    "category": "viewpoint",
    "lat": 50.08105,
    "lon": 14.45114,
    "address": "Mahlerovy sady 2699/1, 130 00 Praha 3",
    "area": "Žižkov",
    "blurb": "Žižkov's sci-fi landmark with Černý's crawling babies, ~8 min walk from home. Observation deck at 93 m, a bar/restaurant at 66 m, and a one-room hotel.",
    "price": "Observation deck paid",
    "url": "https://www.towerpark.cz",
    "tags": [
      "view",
      "cerny",
      "nearby",
      "zizkov"
    ]
  },
  {
    "id": "vitkov",
    "name": "National Monument at Vítkov",
    "category": "viewpoint",
    "lat": 50.08872,
    "lon": 14.44998,
    "address": "U Památníku 1900, 130 00 Praha 3",
    "area": "Žižkov",
    "blurb": "Huge Jan Žižka equestrian statue and a functionalist memorial on Vítkov hill, right above the flat (~10 min uphill). Free panorama over the city from the terrace, especially good at sunset.",
    "hours": "Hilltop/park open all day; interior/roof terrace has set hours",
    "price": "Hilltop free; interior paid",
    "tags": [
      "view",
      "history",
      "nearby",
      "free",
      "sunset"
    ]
  },
  {
    "id": "riegrovy-sady",
    "name": "Riegrovy sady viewpoint",
    "category": "viewpoint",
    "lat": 50.08011,
    "lon": 14.44087,
    "address": "Riegrovy sady, 120 00 Praha 2 – Vinohrady",
    "area": "Vinohrady",
    "blurb": "Sloping park with a classic sunset view towards the castle, ~12–15 min walk from home. The famous beer garden is seasonal, so expect it to be shut in mid-November.",
    "hours": "Park open all day",
    "price": "Free",
    "tags": [
      "park",
      "view",
      "sunset",
      "free"
    ]
  },
  {
    "id": "naplavka",
    "name": "Náplavka riverside (Rašínovo nábřeží)",
    "category": "sight",
    "lat": 50.07031,
    "lon": 14.41408,
    "address": "Rašínovo nábřeží, 120 00 Praha 2",
    "area": "Nové Město (riverside)",
    "blurb": "Riverside promenade with boat bars and Saturday farmers' market stalls, between the Dancing House and the railway bridge. Best on a Saturday morning.",
    "hours": "Farmers' market Sat ~8:00–14:00 (Feb–Dec)",
    "tags": [
      "riverside",
      "market",
      "saturday"
    ]
  },
  {
    "id": "narodni-memorial",
    "name": "17 November 1989 memorial (Národní 16)",
    "category": "sight",
    "lat": 50.08185,
    "lon": 14.41792,
    "address": "Národní 118/16 (Kaňkův dům), 110 00 Praha 1",
    "area": "Nové Město",
    "blurb": "Bronze 'hands' plaque marking where riot police beat student marchers on 17 November 1989, sparking the Velvet Revolution. On 17 Nov (during our trip!) the street fills with candles, concerts and crowds.",
    "hours": "Open 24/7",
    "price": "Free",
    "tags": [
      "1989",
      "velvet-revolution",
      "17-november",
      "free"
    ]
  },
  {
    "id": "rudolfinum",
    "name": "Rudolfinum",
    "category": "venue",
    "lat": 50.08997,
    "lon": 14.41553,
    "address": "Alšovo nábřeží 12, 110 00 Praha 1",
    "area": "Old Town / Josefov",
    "blurb": "Neo-Renaissance concert hall (Czech Philharmonic, Dvořák Hall) and art gallery on the riverbank by Mánes Bridge. Worth checking for a concert during our week.",
    "tags": [
      "concerts",
      "classical",
      "gallery"
    ]
  },
  {
    "id": "namesti-miru-st-ludmila",
    "name": "Náměstí Míru + Basilica of St. Ludmila",
    "category": "sight",
    "lat": 50.07548,
    "lon": 14.43723,
    "address": "náměstí Míru, 120 00 Praha 2 – Vinohrady",
    "area": "Vinohrady",
    "blurb": "Vinohrady's main square, with the twin-spired neo-Gothic St. Ludmila (now a basilica) and the Vinohrady Theatre. Metro A Náměstí Míru, one stop from JzP. A Christmas market usually starts here in late November.",
    "hours": "Square 24/7",
    "price": "Free",
    "tags": [
      "square",
      "church",
      "vinohrady"
    ]
  },
  {
    "id": "havlickovy-sady-grebovka",
    "name": "Havlíčkovy sady (Grébovka)",
    "category": "sight",
    "lat": 50.06885,
    "lon": 14.44474,
    "address": "Havlíčkovy sady, 120 00 Praha 2 – Vinohrady",
    "area": "Vinohrady",
    "blurb": "Romantic park with a city vineyard, a grotto and a hilltop vineyard pavilion serving local wine. A lovely autumn walk south of Vinohrady.",
    "hours": "Park open all day",
    "price": "Free",
    "tags": [
      "park",
      "vineyard",
      "wine"
    ]
  },
  {
    "id": "kafka-rotating-head",
    "name": "Franz Kafka rotating head (Quadrio)",
    "category": "sight",
    "lat": 50.08166,
    "lon": 14.42081,
    "address": "Charvátova / Quadrio, Spálená 22, 110 00 Praha 1",
    "area": "Nové Město",
    "blurb": "David Černý's 42-layer mirrored steel head that periodically spins and reassembles, next to Národní třída metro. It's back running after a general overhaul.",
    "hours": "Rotates periodically through the day",
    "price": "Free",
    "url": "https://quadrio.cz/en/franz-kafka",
    "tags": [
      "cerny",
      "kafka",
      "free",
      "photo"
    ]
  },
  {
    "id": "prague-zoo",
    "name": "Prague Zoo (optional)",
    "category": "sight",
    "lat": 50.11632,
    "lon": 14.40678,
    "address": "U Trojského zámku 3/120, 171 00 Praha 7 – Troja",
    "area": "Troja",
    "blurb": "One of Europe's best zoos, on a hillside in Troja. Allow half a day. Bus 112 from Nádraží Holešovice (metro C).",
    "price": "Paid entry",
    "url": "https://www.zoopraha.cz/en",
    "tags": [
      "zoo",
      "optional",
      "half-day"
    ],
    "approx": true
  },
  {
    "id": "dox-centre",
    "name": "DOX Centre for Contemporary Art (optional)",
    "category": "museum",
    "lat": 50.10696,
    "lon": 14.4479,
    "address": "Poupětova 1, 170 00 Praha 7 – Holešovice",
    "area": "Holešovice",
    "blurb": "Big contemporary-art centre with the Gulliver airship on the roof. Pair it with Cross Club or Holešovice market nearby.",
    "price": "Paid entry",
    "url": "https://www.dox.cz/en",
    "tags": [
      "art",
      "contemporary",
      "optional"
    ]
  },
  {
    "id": "u-fleku",
    "name": "U Fleků",
    "category": "beer",
    "lat": 50.0789,
    "lon": 14.41698,
    "address": "Křemencova 11, 110 00 Praha 1",
    "area": "Nové Město",
    "blurb": "Brewing its 13° dark lager since 1499: huge halls, accordion music, very touristy, but a rite of passage. Watch out for the Becherovka shots waiters push on you, which are charged.",
    "hours": "Daily 10:00–23:00",
    "price": "Pricier than average",
    "url": "https://en.ufleku.cz",
    "tags": [
      "brewery",
      "dark-lager",
      "historic",
      "touristy"
    ]
  },
  {
    "id": "lokal-dlouha",
    "name": "Lokál Dlouhááá",
    "category": "beer",
    "lat": 50.09074,
    "lon": 14.42576,
    "address": "Dlouhá 730/33, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Long canteen-style hall pouring super-fresh tank Pilsner Urquell, with honest Czech food (svíčková, schnitzel, fried cheese) at fair prices. Book for evenings.",
    "hours": "Mon–Sat 11:00–24:00, Sun 11:00–22:00",
    "url": "https://lokal-dlouha.ambi.cz/en",
    "tags": [
      "pilsner",
      "tank-beer",
      "czech-food",
      "food"
    ]
  },
  {
    "id": "u-zlateho-tygra",
    "name": "U Zlatého tygra",
    "category": "beer",
    "lat": 50.0858,
    "lon": 14.41792,
    "address": "Husova 228/17, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Legendary smoky-era locals' pub (Hrabal's haunt; Havel brought Clinton here). Pilsner only. Tables are mostly reserved, so arrive right at 15:00 opening for a seat.",
    "hours": "Daily 15:00–23:00",
    "tags": [
      "pilsner",
      "historic",
      "locals"
    ]
  },
  {
    "id": "u-medvidku",
    "name": "U Medvídků",
    "category": "beer",
    "lat": 50.08284,
    "lon": 14.41838,
    "address": "Na Perštýně 345/7, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Historic Budvar beer hall with its own tiny brewery, famous for the super-strong X-Beer 33. A good spot for a mix of classic Budvar and house brews.",
    "hours": "Mon–Sat ~11:30–23:00, Sun ~12:00–22:00",
    "url": "https://umedvidku.cz",
    "tags": [
      "budvar",
      "brewery",
      "historic"
    ]
  },
  {
    "id": "strahov-brewery",
    "name": "Klášterní pivovar Strahov",
    "category": "beer",
    "lat": 50.08675,
    "lon": 14.38847,
    "address": "Strahovské nádvoří 301, 118 00 Praha 1",
    "area": "Hradčany",
    "blurb": "Monastery brewpub (St. Norbert beers: amber, dark, IPA) in the Strahov courtyard. The perfect refuel after the castle or Petřín.",
    "hours": "Daily 10:00–22:00",
    "url": "https://www.klasterni-pivovar.cz",
    "tags": [
      "brewery",
      "monastery",
      "castle-area"
    ]
  },
  {
    "id": "pivovarsky-dum",
    "name": "Pivovarský dům",
    "category": "beer",
    "lat": 50.07543,
    "lon": 14.42374,
    "address": "Ječná / Lípová 15, 120 00 Praha 2",
    "area": "Nové Město",
    "blurb": "Brewpub known for oddball specials (coffee, banana, nettle beer) alongside a solid house lager. Order a tasting tray.",
    "hours": "Daily 11:00–23:30",
    "tags": [
      "brewery",
      "tasting-flight"
    ]
  },
  {
    "id": "vinohradsky-pivovar",
    "name": "Vinohradský pivovar",
    "category": "beer",
    "lat": 50.0753,
    "lon": 14.45761,
    "address": "Korunní 2506/106, 101 00 Praha 10 – Vinohrady",
    "area": "Vinohrady",
    "blurb": "Big neighbourhood brewpub, ~1.3 km from home, with excellent house 11° and 12° lagers, decent food and a local crowd.",
    "hours": "Mon–Sat 11:00–24:00, Sun 11:00–22:00",
    "url": "https://www.vinohradskypivovar.cz",
    "tags": [
      "brewery",
      "local",
      "near-home"
    ]
  },
  {
    "id": "u-vystreleneho-oka",
    "name": "U Vystřelenýho oka",
    "category": "beer",
    "lat": 50.08715,
    "lon": 14.44956,
    "address": "U Božích bojovníků 606/3, 130 00 Praha 3 – Žižkov",
    "area": "Žižkov",
    "blurb": "Gritty, beloved Žižkov pub under Vítkov hill, literally a 2-minute walk from the flat. Cheap Pilsner, loud regulars, real local flavour.",
    "price": "Cheap",
    "tags": [
      "pilsner",
      "dive",
      "nearby",
      "zizkov",
      "locals"
    ]
  },
  {
    "id": "beergeek-bar",
    "name": "BeerGeek Bar",
    "category": "beer",
    "lat": 50.07701,
    "lon": 14.45002,
    "address": "Vinohradská 988/62, 130 00 Praha 3 – Vinohrady",
    "area": "Vinohrady",
    "blurb": "Craft-beer mecca with a big rotating tap list of Czech and foreign brews, right by Jiřího z Poděbrad (~13 min walk). Late hours.",
    "hours": "Daily 15:00–02:00",
    "tags": [
      "craft-beer",
      "late",
      "near-home"
    ]
  },
  {
    "id": "zly-casy",
    "name": "Zlý časy",
    "category": "beer",
    "lat": 50.06427,
    "lon": 14.44203,
    "address": "Čestmírova 390/5, 140 00 Praha 4 – Nusle",
    "area": "Nusle",
    "blurb": "Prague's pioneering craft-beer pub (since 2006): three bars and around 48 taps of Czech small breweries. Metro C Pražského povstání or tram to Náměstí Bratří Synků. Reservation recommended.",
    "hours": "Mon–Fri 15:00–02:00, Sat 17:00–02:00, Sun 17:00–23:30",
    "url": "https://zlycasy.eu",
    "tags": [
      "craft-beer",
      "48-taps",
      "locals"
    ]
  },
  {
    "id": "pivovar-u-tomase",
    "name": "Pivovar U sv. Tomáše",
    "category": "beer",
    "lat": 50.08928,
    "lon": 14.40679,
    "address": "Letenská 12/33 (Hotel Augustine), 118 00 Praha 1",
    "area": "Malá Strana",
    "blurb": "Revived Augustinian monastery brewery under the Augustine hotel: vaulted cellars and house-brewed lagers, near Malostranská metro. Check opening days; it has had limited hours.",
    "hours": "Wed–Sun 16:00–23:00 (per kudyznudy.cz)",
    "tags": [
      "brewery",
      "monastery",
      "malá-strana"
    ]
  },
  {
    "id": "u-kalicha",
    "name": "Hostinec U Kalicha",
    "category": "beer",
    "lat": 50.0736,
    "lon": 14.42795,
    "address": "Na Bojišti 1733/12-14, 120 00 Praha 2",
    "area": "Nové Město",
    "blurb": "The Good Soldier Švejk's pub from Hašek's novel: Švejk murals and themed Czech food. Touristy, but fun for a literary pint near I. P. Pavlova.",
    "hours": "Mon–Tue 12:00–22:00, Wed–Sat 12:00–23:00, Sun 12:00–22:00",
    "url": "https://ukalicha.cz/en/",
    "tags": [
      "svejk",
      "literary",
      "czech-food"
    ]
  },
  {
    "id": "u-pivrnce",
    "name": "Pivnice U Pivrnce",
    "category": "beer",
    "lat": 50.08835,
    "lon": 14.41854,
    "address": "Maiselova 60/3, 110 00 Praha 1 – Josefov",
    "area": "Josefov / Old Town",
    "blurb": "Pub decorated with Petr Urban's cheeky 'Pivrnec' cartoons, with hearty Czech food. A reasonable-value stop near Old Town Square and the Jewish Quarter.",
    "hours": "Roughly 11:00/11:30–23:00/24:00 (sources vary)",
    "tags": [
      "czech-food",
      "old-town"
    ]
  },
  {
    "id": "pivovar-narodni",
    "name": "Pivovar Národní",
    "category": "beer",
    "lat": 50.08132,
    "lon": 14.41546,
    "address": "Národní 139/8, 110 00 Praha 1",
    "area": "Nové Město",
    "blurb": "Central brewpub near the National Theatre with its own lagers. Handy before or after the 17 November events on Národní.",
    "hours": "Daily 11:00–23:00",
    "url": "https://www.pivovarnarodni.eu/en/",
    "tags": [
      "brewery",
      "central"
    ]
  },
  {
    "id": "lokal-u-bile-kuzelky",
    "name": "Lokál U Bílé kuželky",
    "category": "beer",
    "lat": 50.08765,
    "lon": 14.40752,
    "address": "Míšeňská 66/12, 118 00 Praha 1",
    "area": "Malá Strana",
    "blurb": "The Malá Strana Lokál, steps from Charles Bridge: tank Pilsner and the same reliable Czech menu. A good lunch stop on a castle day.",
    "hours": "Mon–Sat 11:00–24:00, Sun 11:00–23:00",
    "url": "https://lokal-ubilekuzelky.ambi.cz/en/",
    "tags": [
      "pilsner",
      "tank-beer",
      "czech-food",
      "food"
    ]
  },
  {
    "id": "u-sadu",
    "name": "Pivnice U Sadu",
    "category": "beer",
    "lat": 50.08082,
    "lon": 14.4491,
    "address": "Škroupovo náměstí 1282/5, 130 00 Praha 3 – Žižkov",
    "area": "Žižkov",
    "blurb": "Žižkov institution near the TV Tower (~580 m from home), with a quirky junk-shop interior, Pilsner and a kitchen open late. Open from morning to the small hours.",
    "hours": "Daily ~8:00–02:00/04:00 (sources vary)",
    "url": "https://www.usadu.cz",
    "tags": [
      "zizkov",
      "late",
      "czech-food",
      "near-home"
    ]
  },
  {
    "id": "hostinec-u-rotundy",
    "name": "Hostinec U Rotundy",
    "category": "beer",
    "lat": 50.08259,
    "lon": 14.41449,
    "address": "Karoliny Světlé 1035/17, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "No-frills old-school pub by the Romanesque Rotunda of the Holy Cross, with cheap Pilsner and lunch menus. A local refuge minutes from the tourist river.",
    "hours": "Daily ~11:00–22:00/23:00",
    "price": "Cheap",
    "url": "http://www.urotundy.cz",
    "tags": [
      "pilsner",
      "locals",
      "cheap"
    ]
  },
  {
    "id": "u-slovanske-lipy",
    "name": "U Slovanské lípy",
    "category": "beer",
    "lat": 50.08753,
    "lon": 14.4535,
    "address": "Tachovské náměstí 288/6, 130 00 Praha 3 – Žižkov",
    "area": "Žižkov",
    "blurb": "Friendly Žižkov pub ~300 m from the flat at the foot of Vítkov, with daily lunch menus. A good 'local' for a quick pint.",
    "hours": "Daily 11:00–23:00 (Sun may close 22:00)",
    "url": "https://uslovanskelipy.cz",
    "tags": [
      "zizkov",
      "nearby",
      "locals"
    ]
  },
  {
    "id": "vycep-korunni",
    "name": "Výčep (Korunní)",
    "category": "food",
    "lat": 50.0753,
    "lon": 14.45352,
    "address": "Korunní 1304/92, 101 00 Praha 10 – Vinohrady",
    "area": "Vinohrady",
    "blurb": "Modern Czech pub-restaurant with Wallachian (Valašsko) roots and a Michelin Bib Gourmand (2025). Great Czech classics and well-kept beer ~1.2 km from home. Book ahead.",
    "hours": "Mon–Fri 11:00–23:00, Sat 12:00–23:00, Sun 12:00–22:00",
    "tags": [
      "czech-food",
      "bib-gourmand",
      "beer",
      "near-home"
    ]
  },
  {
    "id": "kantyna",
    "name": "Kantýna",
    "category": "food",
    "lat": 50.08346,
    "lon": 14.42887,
    "address": "Politických vězňů 1511/5 (Palác Ringhoffer), 110 00 Praha 1",
    "area": "Nové Město",
    "blurb": "Butcher-shop-meets-canteen in a former bank, just off Wenceslas Square. Pick your meat at the counter, grab a tank Pilsner, eat standing or at the bar. Fast, great value.",
    "hours": "Mon–Sat 11:30–23:00, Sun 11:30–22:00",
    "url": "https://kantyna.ambi.cz",
    "tags": [
      "czech-food",
      "meat",
      "pilsner"
    ]
  },
  {
    "id": "nase-maso",
    "name": "Naše maso",
    "category": "food",
    "lat": 50.0908,
    "lon": 14.4269,
    "address": "Dlouhá 727/39, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Tiny butcher's shop famous for its burgers, meatloaf and sausages, eaten standing at the counter, next door to Lokál Dlouhááá.",
    "hours": "Mon–Thu 11:00–22:00, Fri–Sat 10:00–22:00, Sun closed",
    "url": "https://nasemaso.ambi.cz/en/",
    "tags": [
      "burger",
      "butcher",
      "quick-bite"
    ]
  },
  {
    "id": "cafe-louvre",
    "name": "Café Louvre",
    "category": "food",
    "lat": 50.08212,
    "lon": 14.4189,
    "address": "Národní 22 (1st floor), 110 00 Praha 1",
    "area": "Nové Město",
    "blurb": "Grand 1902 café-restaurant upstairs on Národní (Kafka and Einstein were regulars). Good-value Czech lunches and breakfasts, plus a billiard room.",
    "hours": "Mon–Fri 08:00–23:30, Sat–Sun 09:00–23:30",
    "url": "https://www.cafelouvre.cz/en",
    "tags": [
      "historic-cafe",
      "czech-food",
      "breakfast"
    ],
    "approx": true
  },
  {
    "id": "manifesto-andel",
    "name": "Manifesto Market Anděl",
    "category": "food",
    "lat": 50.0715,
    "lon": 14.4045,
    "address": "Ostrovského 34, 150 00 Praha 5 – Anděl",
    "area": "Smíchov / Anděl",
    "blurb": "Food-hall market (about 13 street-food vendors plus bars) in a blue-scaffolding structure near Anděl metro B. Open year-round, good for groups with different cravings. The original Florenc site closed in 2022.",
    "hours": "Roughly daily 11:00/12:00–22:00 (Thu–Sat to 24:00 per contact page)",
    "url": "https://www.manifestomarket.com/prague/andel/en/",
    "tags": [
      "street-food",
      "food-hall",
      "groups"
    ],
    "approx": true
  },
  {
    "id": "mr-hotdog",
    "name": "Mr. HotDog",
    "category": "food",
    "lat": 50.1,
    "lon": 14.43,
    "address": "Kamenická 24, 170 00 Praha 7 – Holešovice",
    "area": "Letná / Holešovice",
    "blurb": "Cult hot-dog and burger joint in Letná, a good bite after the Metronome viewpoint. Note it's in Holešovice, not Žižkov.",
    "hours": "Daily 11:30–22:00",
    "tags": [
      "hot-dog",
      "burger",
      "quick-bite"
    ],
    "approx": true
  },
  {
    "id": "kuchyn-hradcany",
    "name": "Kuchyň",
    "category": "food",
    "lat": 50.0892,
    "lon": 14.3972,
    "address": "Hradčanské náměstí 1 (Salmovský palác), 118 00 Praha 1",
    "area": "Hradčany",
    "blurb": "Czech home cooking served from pots in the kitchen, with a terrace view at the castle gates. The best non-tourist-trap lunch on castle day.",
    "tags": [
      "czech-food",
      "castle-area",
      "view"
    ],
    "approx": true
  },
  {
    "id": "eska",
    "name": "Eska (Karlín)",
    "category": "food",
    "lat": 50.0925,
    "lon": 14.451,
    "address": "Pernerova 49, 186 00 Praha 8 – Karlín",
    "area": "Karlín",
    "blurb": "Ambiente's industrial-chic bakery and restaurant doing modern Czech food (fermented and smoked things, great bread). Breakfast at the bakery counter is a treat.",
    "tags": [
      "modern-czech",
      "bakery",
      "brunch"
    ],
    "approx": true
  },
  {
    "id": "bistro-proti-proudu",
    "name": "Bistro Proti Proudu",
    "category": "food",
    "lat": 50.093,
    "lon": 14.444,
    "address": "Březinova 22, 186 00 Praha 8 – Karlín",
    "area": "Karlín",
    "blurb": "Small Karlín bistro for good coffee, breakfast and lunch specials, ~15 min walk or one stop over the hill from home.",
    "tags": [
      "brunch",
      "coffee",
      "bistro"
    ],
    "approx": true
  },
  {
    "id": "tavern-vinohrady",
    "name": "The Tavern (burgers)",
    "category": "food",
    "lat": 50.0788,
    "lon": 14.4425,
    "address": "Chopinova 26, 120 00 Praha 2 – Vinohrady",
    "area": "Vinohrady",
    "blurb": "American-run burger bar by Riegrovy sady with craft-beer taps; one of Prague's best burgers. Small, so expect a wait.",
    "tags": [
      "burger",
      "craft-beer"
    ],
    "approx": true
  },
  {
    "id": "cafe-pavlac",
    "name": "Café Pavlač",
    "category": "cafe",
    "lat": 50.0838,
    "lon": 14.446,
    "address": "Víta Nejedlého 23, 130 00 Praha 3 – Žižkov",
    "area": "Žižkov",
    "blurb": "Cosy Žižkov café with a courtyard (pavlač), good breakfasts and cakes, ~5 min from Husinecká.",
    "tags": [
      "cafe",
      "breakfast",
      "near-home",
      "zizkov"
    ],
    "approx": true
  },
  {
    "id": "cafe-kaaba",
    "name": "Café Kaaba",
    "category": "cafe",
    "lat": 50.0777,
    "lon": 14.4352,
    "address": "Mánesova 20, 120 00 Praha 2 – Vinohrady",
    "area": "Vinohrady",
    "blurb": "Retro 1950s/60s-style Vinohrady café with good coffee and a newspaper vibe, between Muzeum and JzP.",
    "tags": [
      "cafe",
      "retro",
      "vinohrady"
    ],
    "approx": true
  },
  {
    "id": "muj-salek-kavy",
    "name": "Můj šálek kávy",
    "category": "cafe",
    "lat": 50.093,
    "lon": 14.4525,
    "address": "Křižíkova 386/105, 186 00 Praha 8 – Karlín",
    "area": "Karlín",
    "blurb": "Specialty-coffee café and brunch favourite in Karlín, near Křižíkova metro B. Popular at weekends.",
    "tags": [
      "specialty-coffee",
      "brunch"
    ],
    "approx": true
  },
  {
    "id": "palac-akropolis",
    "name": "Palác Akropolis",
    "category": "nightlife",
    "lat": 50.082,
    "lon": 14.449,
    "address": "Kubelíkova 1548/27, 130 00 Praha 3 – Žižkov",
    "area": "Žižkov",
    "blurb": "Žižkov's legendary music club, theatre and bar, ~450 m from the flat. Check the programme for gigs during our week; the bars downstairs are good even without a ticket.",
    "tags": [
      "live-music",
      "club",
      "near-home",
      "zizkov"
    ],
    "approx": true
  },
  {
    "id": "bukowskis",
    "name": "Bukowski's Bar",
    "category": "nightlife",
    "lat": 50.08311,
    "lon": 14.44856,
    "address": "Bořivojova 689/86, 130 00 Praha 3 – Žižkov",
    "area": "Žižkov",
    "blurb": "Dark, candlelit cocktail bar (since 2008) named after the writer, ~340 m from home. Strong drinks, late hours, good for a nightcap.",
    "hours": "Daily 19:00–03:00",
    "tags": [
      "cocktails",
      "bar",
      "late",
      "near-home",
      "zizkov"
    ]
  },
  {
    "id": "roxy",
    "name": "Roxy",
    "category": "nightlife",
    "lat": 50.09074,
    "lon": 14.42576,
    "address": "Dlouhá 33, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Big club in a crumbling former theatre: electronic nights and concerts. Same building as Lokál Dlouhááá, so dinner first, then dance.",
    "tags": [
      "club",
      "electronic",
      "concerts"
    ],
    "approx": true
  },
  {
    "id": "cross-club",
    "name": "Cross Club",
    "category": "nightlife",
    "lat": 50.10866,
    "lon": 14.4426,
    "address": "Plynární 1096/23, 170 00 Praha 7 – Holešovice",
    "area": "Holešovice",
    "blurb": "Steampunk industrial club built from scrap metal and machines, with multiple stages, DnB/techno and cheap drinks. Near Nádraží Holešovice (metro C). Worth seeing even just for a beer.",
    "tags": [
      "club",
      "steampunk",
      "alternative"
    ],
    "approx": true
  },
  {
    "id": "karlovy-lazne",
    "name": "Karlovy Lázně",
    "category": "nightlife",
    "lat": 50.0856,
    "lon": 14.4137,
    "address": "Smetanovo nábřeží 198/1, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Five-floor mega-club at the Old Town end of Charles Bridge, with a different genre per floor. Very touristy but a guaranteed party.",
    "tags": [
      "club",
      "touristy",
      "multi-floor"
    ],
    "approx": true
  },
  {
    "id": "chapeau-rouge",
    "name": "Chapeau Rouge",
    "category": "nightlife",
    "lat": 50.0884,
    "lon": 14.4246,
    "address": "Jakubská 647/2, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Long-running Old Town bar and club behind Týn church, with gigs and DJs in the basement. Rowdy and late.",
    "tags": [
      "bar",
      "club",
      "late"
    ],
    "approx": true
  },
  {
    "id": "atrium-flora",
    "name": "Atrium Flora mall (supermarket, pharmacy, ATMs, phone shops)",
    "category": "shop",
    "lat": 50.0778,
    "lon": 14.462,
    "address": "Vinohradská 2828/151, 130 00 Praha 3 (Flora metro A)",
    "area": "Žižkov / Vinohrady border",
    "blurb": "Nearest big one-stop shop (~1.3 km): a large supermarket, pharmacy, bank ATMs and mobile-operator shops for SIM cards, all under one roof by Flora metro. Check exact tenants on arrival.",
    "tags": [
      "supermarket",
      "pharmacy",
      "atm",
      "sim"
    ],
    "approx": true
  },
  {
    "id": "palladium",
    "name": "Palladium mall (supermarket, phone shops, ATMs)",
    "category": "shop",
    "lat": 50.089,
    "lon": 14.4292,
    "address": "náměstí Republiky 1078/1, 110 00 Praha 1",
    "area": "Old Town / Nové Město",
    "blurb": "Central mall opposite the Municipal House, with a basement supermarket, operator stores (O2 / T-Mobile / Vodafone) for SIMs, and bank ATMs. Metro B Náměstí Republiky.",
    "tags": [
      "supermarket",
      "sim",
      "atm",
      "mall"
    ],
    "approx": true
  },
  {
    "id": "left-luggage-hlavni-nadrazi",
    "name": "Left luggage – Praha hlavní nádraží",
    "category": "service",
    "lat": 50.08306,
    "lon": 14.4359,
    "address": "Wilsonova 300/8, 120 00 Praha 2 (inside the station)",
    "area": "Nové Město / Vinohrady",
    "blurb": "Luggage lockers and a staffed left-luggage office inside the main station. Useful on arrival/departure days or before a day trip. Follow the 'úschovna zavazadel' signs.",
    "tags": [
      "luggage",
      "station"
    ],
    "approx": true
  },
  {
    "id": "pilsner-urquell",
    "name": "Plzeň – Pilsner Urquell Brewery",
    "category": "daytrip",
    "lat": 49.7475,
    "lon": 13.3869,
    "address": "U Prazdroje 64/7, 301 00 Plzeň",
    "area": "Plzeň",
    "blurb": "Brewery tour with unfiltered lager from oak barrels in the cellars. ~1.5 h by train from Hlavní nádraží, then a 10 min walk from Plzeň hl.n. Book the tour online.",
    "price": "Tour paid (book ahead)",
    "tags": [
      "daytrip",
      "brewery",
      "pilsner",
      "train"
    ],
    "approx": true
  },
  {
    "id": "sedlec-ossuary",
    "name": "Kutná Hora – Sedlec Ossuary",
    "category": "daytrip",
    "lat": 49.96194,
    "lon": 15.28833,
    "address": "Zámecká 127, 284 03 Kutná Hora – Sedlec",
    "area": "Kutná Hora",
    "blurb": "The 'bone church', decorated with the bones of ~40,000 people. ~1 h train to Kutná Hora hl.n., then a 10–15 min walk. Combine it with St. Barbara's Cathedral in town.",
    "price": "Paid entry",
    "tags": [
      "daytrip",
      "unesco",
      "train"
    ],
    "approx": true
  },
  {
    "id": "karlstejn",
    "name": "Karlštejn Castle",
    "category": "daytrip",
    "lat": 49.93917,
    "lon": 14.18806,
    "address": "Karlštejn 172, 267 18 Karlštejn",
    "area": "Karlštejn",
    "blurb": "Fairy-tale Gothic castle of Charles IV. ~40 min by train (S7) from Hlavní nádraží or Smíchov, then a 25–30 min uphill walk through the village. Interiors by guided tour; winter schedule is limited.",
    "price": "Guided tour paid",
    "tags": [
      "daytrip",
      "castle",
      "train"
    ],
    "approx": true
  },
  {
    "id": "kozlany",
    "name": "Kožlany (Alexey’s home)",
    "category": "city",
    "lat": 49.9933,
    "lon": 13.5403,
    "address": "náměstí, 331 44 Kožlany",
    "area": "Kožlany (Plzeň-sever)",
    "blurb": "Small west-Bohemian town and Alexey's home turf. Regional buses run from Praha-Zličín (check IDOS for connections).",
    "tags": [
      "daytrip",
      "friends",
      "bus"
    ],
    "approx": true
  },
  {
    "id": "zurich-home",
    "name": "Zürich HB (main station)",
    "category": "city",
    "lat": 47.37802,
    "lon": 8.54019,
    "address": "Bahnhofplatz, 8001 Zürich, Switzerland",
    "area": "Zürich",
    "blurb": "Zürich main railway station. Direct day and night trains connect Zürich and Prague.",
    "tags": [
      "origin",
      "switzerland",
      "train"
    ],
    "approx": true
  },
  {
    "id": "evn",
    "name": "Zvartnots Airport (EVN)",
    "category": "transport",
    "lat": 40.14722,
    "lon": 44.39611,
    "address": "Zvartnots, Armavir Province, Armenia",
    "area": "Yerevan",
    "blurb": "Departure airport for friends coming from Armenia. Flights from EVN arrive at Prague Terminal 1 (non-Schengen).",
    "tags": [
      "origin",
      "armenia",
      "airport"
    ],
    "approx": true
  },
  {
    "id": "yerevan-home",
    "name": "Yerevan (Koryun’s home)",
    "category": "city",
    "lat": 40.17722,
    "lon": 44.51278,
    "address": "Republic Square, Yerevan 0010, Armenia",
    "area": "Yerevan (Kentron)",
    "blurb": "Central square of Yerevan, used as the reference point for the Armenian side of the trip.",
    "tags": [
      "origin",
      "armenia"
    ],
    "approx": true
  },
  {
    "id": "prg-t2",
    "name": "Prague Airport · Terminal 2",
    "category": "transport",
    "lat": 50.1059,
    "lon": 14.2738,
    "address": "Aviatická, 161 00 Praha 6 – Ruzyně",
    "area": "Ruzyně",
    "blurb": "Schengen terminal (flights from Geneva land here). AE bus and trolleybus 59 stop outside arrivals.",
    "tags": [
      "airport"
    ],
    "approx": true
  },
  {
    "id": "zrh",
    "name": "Zürich Airport (ZRH)",
    "category": "transport",
    "lat": 47.45819,
    "lon": 8.55547,
    "address": "Kloten, Switzerland",
    "area": "Zürich",
    "blurb": "Zürich Airport, Switzerland.",
    "tags": [
      "airport"
    ],
    "approx": true
  },
  {
    "id": "gva",
    "name": "Geneva Airport · Terminal 1",
    "category": "transport",
    "lat": 46.2381,
    "lon": 6.10895,
    "address": "Geneva Airport, Switzerland",
    "area": "Geneva",
    "blurb": "Arto’s easyJet flights to/from Prague use Terminal 1.",
    "tags": [
      "airport"
    ],
    "approx": true
  },
  {
    "id": "plzen-hln",
    "name": "Plzeň hlavní nádraží",
    "category": "transport",
    "lat": 49.74336,
    "lon": 13.38635,
    "address": "Nádražní, 301 00 Plzeň",
    "area": "Plzeň",
    "blurb": "Plzeň main station. ~10 min walk to the Pilsner Urquell brewery gate.",
    "tags": [
      "train"
    ],
    "approx": true
  },
  {
    "id": "plzen-square",
    "name": "Plzeň · náměstí Republiky",
    "category": "sight",
    "lat": 49.74771,
    "lon": 13.37757,
    "address": "náměstí Republiky, 301 00 Plzeň",
    "area": "Plzeň",
    "blurb": "Huge main square with St. Bartholomew Cathedral (climb the tallest church tower in Czechia) and the entrance to the historic underground.",
    "tags": [
      "daytrip"
    ],
    "approx": true
  },
  {
    "id": "galerie-harfa",
    "name": "Galerie Harfa",
    "category": "food",
    "lat": 50.10552,
    "lon": 14.49262,
    "address": "Českomoravská 2420/15a, 190 00 Praha 9",
    "area": "Vysočany",
    "blurb": "Shopping centre attached to the O2 arena: food court, supermarket, toilets. Easy pre-show dinner.",
    "tags": [
      "pre-show"
    ],
    "approx": true
  },
  {
    "id": "lucerna-music-bar",
    "name": "Lucerna Music Bar",
    "category": "nightlife",
    "lat": 50.08113,
    "lon": 14.42536,
    "address": "Vodičkova 36 (Lucerna passage), 110 00 Praha 1",
    "area": "New Town",
    "blurb": "Legendary '80s & '90s video parties every Friday and Saturday night. Cheap entry, all-ages crowd, singalong guaranteed.",
    "hours": "Party nights Fri–Sat from ~21:00",
    "tags": [
      "party"
    ],
    "approx": true
  },
  {
    "id": "havelske-trziste",
    "name": "Havelské tržiště (market)",
    "category": "shop",
    "lat": 50.08483,
    "lon": 14.42152,
    "address": "Havelská, 110 00 Praha 1",
    "area": "Old Town",
    "blurb": "Open-air market street in the Old Town: souvenirs, fruit, marionettes. Compare prices; supermarkets are cheaper for beer to take home.",
    "tags": [
      "souvenirs"
    ],
    "approx": true
  }
];
