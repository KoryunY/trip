// Practical guides (static content, researched Nov 2026). Prices change, so double-check in apps.

export interface GuideSection {
  h?: string;
  body?: string;
  bullets?: string[];
  steps?: string[];
  table?: { head: string[]; rows: string[][] };
  tip?: string;
  warn?: string;
}

export interface Guide {
  id: string;
  title: string;
  icon: string; // lucide icon name key (see GuideIcon)
  summary: string;
  for?: string[]; // person ids it's most relevant to
  sections: GuideSection[];
  sources?: { label: string; url: string }[];
}

export const GUIDES: Guide[] = [
  {
    id: 'must-do',
    title: 'Must do together & booking plan',
    icon: 'users',
    summary: 'All three: Castle, Old Town, bridges, Czech dinner, Louvre, Letná and 17 November.',
    for: ['koryun', 'alexey', 'arto'],
    sections: [
      {
        body: 'Our shared window is Sun 15 Nov evening → Fri 20 Nov afternoon. Keep the essential visits together on 16, 17, 18 and 19 November, with daytime activities starting at 10:30 or later. GTA is for Koryun + Alexey after Arto leaves Prague on Fri 20. All times below are Prague local time (CET). These are plans; the bookings below are not yet made.',
        table: {
          head: ['Day', 'Together'],
          rows: [
            ['Sun 15', 'Choose one arrival plan: A — meet at Klášterní šenk in Břevnov for dinner 18:30–20:00, then base around 20:30–21:00; B — base first around 18:30, bag drop until 19:05, U Slovanské lípy dinner 19:15–20:30. The timeline currently keeps B as a provisional draft. Neither dinner is reserved.'],
            ['Mon 16', 'Castle 10:30–14:30 (arrive 10:15), Strahov lunch 14:45–15:45. Koryun + Alexey return for Korn preparation at 16:30. Arto returns to shower, then has a tentative solo salsa class 18:00–19:30 and social dancing from 21:00; see Arrival Plan A/B & Monday dancing.'],
            ['Tue 17', 'Korzo Národní 10:30–11:45; Café Louvre 12:00–13:15; Letná viewpoint 14:00–15:15; back to Národní 16:30–17:30 for Modlitba pro Martu at 17:11. Optional celebration/concert wandering 18:00–21:00.'],
            ['Wed 18', 'Plzeň brewery together: leave base 10:30; provisional train 11:15–12:40; lunch 13:00; target English tour 14:00–15:50, including exit buffer. The brewery is a shared must-do, but the slot and trains need confirmation. Dusk centre walk 16:15–17:15; provisional return train 17:45–19:10; easy dinner together 20:00.'],
            ['Thu 19', 'Old Town Square 10:30–11:30, clock at 11:00; Charles Bridge → Malá Strana → Lennon Wall → Kampa 11:30–13:30; lunch at base 14:15; free afternoon for rest or an optional visit; Lokál dinner 18:45–21:00; bridge after dark 21:15–22:00. No GTA while Arto is here.'],
            ['Fri 20', 'Choose one easy morning from 10:30: Vyšehrad 10:30–12:00 + riverside 12:15–13:00, Jewish Quarter or a Louvre retry. Arto packs 14:30–16:15, leaves for the airport 17:15, flies at 20:15. Gaming for Koryun + Alexey starts later that night.'],
          ],
        },
      },
      {
        h: 'Booking actions — not booked',
        table: {
          head: ['Visit', 'Action'],
          rows: [
            ['Castle · Mon 16, 10:30', 'Buy 3 main-circuit tickets via the official Castle page’s GetYourGuide link or on-site information centres. Current adult admission 450 CZK; check reduced eligibility and online price before paying. Arrive 10:15 for security and queues. Tower ticket separate.'],
            ['Lokál Dlouhááá · Thu 19, 18:45', 'Request a table for 3 through the official restaurant reservation link. Save the confirmation and check the table time limit; if unavailable, choose another evening before Arto leaves.'],
            ['Pilsner Urquell · Wed 18, target 14:00', 'Shared priority: select 18 Nov, English and 3 people in the official booking calendar (100 min, currently 430 CZK each). The 14:00 slot is unconfirmed; winter visitor-centre hours 10:00–18:00 do not guarantee an English tour then. Book the tour before choosing real trains; allow at least 45 min after station arrival, plus lunch time. If unavailable, rearrange a shared day instead of leaving early.'],
            ['Café Louvre · Tue 17, 12:00', 'Walk-in for 3: the current official notice says no reservations are accepted through 10 Jan 2027. Allow a queue and keep Friday morning as a retry. Recheck the notice before going; no table is held.'],
            ['Old Town, clock exterior, bridges, Kampa, Letná, Korzo street programme', 'No advance ticket or general reservation. Paid interiors, festival brunch/afterparty and capacity-limited activities are optional extras.'],
          ],
        },
        tip: 'A confirmed reservation belongs in the event’s booking field, with any changed time. “Planned” or “must do” does not mean paid or reserved.',
      },
      {
        h: '17 November: leave room for the atmosphere',
        bullets: [
          'Korzo’s published 2026 main programme runs 10:00–20:00. Return to Palác Metro before 17:00 for Modlitba pro Martu at 17:11–17:15; expect the busiest crowds then.',
          'Afterwards, optionally pass the light installation in the courtyard of Our Lady of the Snows (16:30–22:00) and continue to Concert for the Future on lower Wenceslas Square.',
          'The concert’s published KPB 2026 timetable runs from the 16:36 opening to 22:00. Our 18:00–21:00 window is flexible: join or leave when we want and find dinner nearby.',
        ],
      },
      {
        h: 'Optional alternatives — choose, do not stack',
        bullets: [
          'Jewish Quarter interiors are a good Friday alternative from 10:30: allow 2–3 h and return before Arto’s 14:30 packing time. November museum opening hours are 09:00–16:30; Old-New Synagogue 09:00–17:00, with an earlier Friday closure before Shabbat. Closed Saturdays and Jewish holidays. Check ticket inclusions in the official museum shop.',
          'Prague Sounds: Paul Hillier & Theatre of Voices, Wed 18 Nov 20:00, Divadlo X10 (doors 19:00). Ticketed alternative to the dinner at base; timing is tight after the provisional 19:10 train arrival from Plzeň. Choose only if the confirmed trains and everyone’s energy allow it.',
          'Prague Sounds: Steve Reich: 90, Thu 19 Nov 20:00, Rudolfinum (doors 19:00). This conflicts with our shared dinner/bridge plan: only choose it if all three agree to move those together. No concert tickets are booked.',
        ],
      },
    ],
    sources: [
      { label: 'Prague Castle · official tickets', url: 'https://www.hrad.cz/en/prague-castle-for-visitors/tickets' },
      { label: 'Prague Castle · opening hours', url: 'https://www.hrad.cz/en/prague-castle-for-visitors/opening-hours' },
      { label: 'Lokál Dlouhááá · official reservations', url: 'https://lokal-dlouha.ambi.cz/en/' },
      { label: 'Pilsner Urquell · tours and booking', url: 'https://www.prazdrojvisit.cz/en/tours/pilsner-urquell-brewery-tour/' },
      { label: 'Pilsen visitor centre · winter opening hours', url: 'https://www.prazdrojvisit.cz/en/contact?place=pilsen' },
      { label: 'ČD · actual train times and tickets', url: 'https://www.cd.cz/en/spojeni-a-jizdenka/' },
      { label: 'Café Louvre · current reservation notice', url: 'https://cafelouvre.apetee.com/en' },
      { label: 'Korzo Národní · 2026 programme', url: 'https://www.korzonarodni.cz/cs/program' },
      { label: 'Korzo Národní · visitor information', url: 'https://www.korzonarodni.cz/cs/pro-navstevniky' },
      { label: 'Concert for the Future · current KPB 2026 timetable', url: 'https://koncertprobudoucnost.cz/' },
      { label: 'Jewish Museum · hours', url: 'https://www.jewishmuseum.cz/en/info/visit/opening-hours/' },
      { label: 'Jewish Museum · admission and official booking', url: 'https://www.jewishmuseum.cz/en/info/visit/admission/' },
      { label: 'Prague Sounds · Paul Hillier and booking', url: 'https://praguesounds.cz/en/event/paul-hillier-theatre-of-voices-6aGvb0' },
      { label: 'Prague Sounds · Steve Reich and booking', url: 'https://praguesounds.cz/cs/event/steve-reich-90-4HUsSU' },
    ],
  },
  {
    id: 'arrival-social',
    title: 'Arto: arrival Plan A/B & Monday dancing',
    icon: 'users',
    summary: 'Sunday: Břevnov dinner or base first — choose one. Monday: Cuban salsa class and a social.',
    for: ['arto'],
    sections: [
      {
        h: 'Sun 15 Nov · Plan A: meet for dinner in Břevnov',
        body: 'Plan A takes Arto directly from Prague T2 to Klášterní šenk, Markétská 28/1, for Czech food and Benedict monastery beer. With the small under-seat bag, there is no need to visit the apartment first. Save Divoká Šárka for daylight.',
        steps: [
          '17:00 landing; aim to leave T2 around 17:30. Allow roughly 20–30 min by taxi, or 40–60 min by public transport, including waiting and the walk. These are estimates.',
          'Public transport: bus 191 towards Na Knížecí → Vypich, then tram 22 or 25 two stops to Břevnovský klášter, followed by a short walk. Check departures for 15 Nov in PID before travelling.',
          'Koryun + Alexey meet Arto at the restaurant; no airport pickup is needed. For Plan A, they skip the optional Wenceslas Square stop and leave enough time to reach Břevnov for 18:30.',
          '18:30–20:00: dinner together at Klášterní šenk, open daily 11:30–23:00. Afterwards go to the apartment, arriving roughly 20:30–21:00, then catch up at base from 21:00.',
        ],
        tip: 'If choosing A, request a table for 3 on Sun 15 Nov at 18:30 and mention the 17:00 flight arrival. The official form needs at least 24 h notice and the booking is valid only after staff confirmation. For same-day arrangements, or if the flight is late, call +420 220 406 294. No reservation has been made.',
      },
      {
        h: 'Plan B: base first, then dinner nearby',
        body: 'B is the provisional plan currently shown in the timeline. Drop the bag and freshen up, then have a Czech pub dinner within walking distance of the apartment. Choose A or B before reserving a table.',
        steps: [
          '17:30–18:30: estimated airport → base transfer. Save a 59 + metro A route or use Uber Airport for the door-to-door option.',
          '18:30–19:05: drop bags, freshen up and meet Koryun + Alexey.',
          '19:15–20:30: dinner for all three at U Slovanské lípy, about 5 min from base. Open daily 11:00–23:00; reservations +420 734 743 094. No table is reserved; check kitchen hours if arriving late.',
          '21:00: catch-up at base. If the flight or transfer runs late, adjust the dinner time.',
        ],
        bullets: [
          'Alternative within B: Vinohradský pivovar on Korunní, 19:15–20:45, open Sunday 11:00–22:00. It is 20–25 min on foot from base, so shorten the bag drop and leave around 18:50–18:55 if walking. Reservations +420 602 549 557 or rezervace@vinohradskypivovar.cz; no table reserved.',
          'U Vystřelenýho oka is closed on Sundays. For a late airport delay, U Václava Pilsner in T2’s public area is a food fallback, open Sunday 07:00–21:00.',
        ],
      },
      {
        h: 'Mon 16 Nov · salsa class + social, tentative',
        body: 'After the shared Castle visit and Strahov lunch, this is Arto’s solo evening while Koryun + Alexey go to Korn. La Macumba’s intermediate Cuban salsa fits the intended style; the instructor must still confirm the level and one-off attendance.',
        table: {
          head: ['Time', 'Plan'],
          rows: [
            ['15:50–16:40', 'Return from Strahov to base; travel estimate.'],
            ['16:40–17:10', 'Shower, change and rest. Bring comfortable dance shoes.'],
            ['17:10–17:45', 'Travel to La Macumba, Štefánikova 230/7, near Anděl.'],
            ['18:00–19:30', 'Tentative intermediate Cuban salsa class. Solo attendance and partner rotation allowed.'],
            ['19:45–20:30', 'Dinner at Na Verandách, Nádražní 43/84; Monday 11:00–23:00. No table reserved.'],
            ['21:00–23:30', 'Tentative La Macumba social: salsa, bachata and kizomba. The recurring Monday party runs 21:00–03:00 with free entry; leave when ready.'],
            ['23:30–00:15', 'Estimated return to base; check the actual night route or take a taxi.'],
          ],
        },
      },
      {
        h: 'Confirm before booking; choose one class',
        bullets: [
          'La Macumba’s programme is a recurring Monday schedule, not a dated confirmation for 16 Nov, the eve of the public holiday. Confirm that date, English instruction, level, a single-class place and its price. The published two-month course fee is not a drop-in quote. Nothing is booked and no enquiries have been sent.',
          'Backup class: DanceDifferent Bachata 1, Monday 18:00–19:00, Fügnerovo nám. 5. Published single lesson 350 CZK; no partner needed, partners rotate. Confirm the 16 Nov slot, English and placement for beginner-plus experience. Use this instead of the La Macumba class, then keep the social if confirmed.',
          'Jorge y Mónica/Ruelto classes are on a published break 16–22 Nov, so they are unavailable that week.',
        ],
      },
    ],
    sources: [
      { label: 'U Slovanské lípy · official menu and hours', url: 'https://uslovanskelipy.cz/' },
      { label: 'Vinohradský pivovar · Korunní hours', url: 'https://www.vinohradskypivovar.cz/cs/korunni/' },
      { label: 'U Vystřelenýho oka · opening hours', url: 'https://www.uvoka.cz/okokontakt/' },
      { label: 'Prague Airport · U Václava in T2 public area', url: 'https://www.prg.aero/en/pilsner-urquell-original-restaurant?terminal=reset' },
      { label: 'Klášterní šenk · hours and reservations', url: 'https://www.klasternisenk.cz/en/' },
      { label: 'PID · bus 191 timetable valid from 29 Aug 2026', url: 'https://pid.cz/zastavkove-jizdni-rady/?cid=191&from=1787954400&type=bus' },
      { label: 'PID · tram 25 timetable valid from 13 Nov 2026', url: 'https://pid.cz/zastavkove-jizdni-rady/?cid=25&from=1794524400&type=tram' },
      { label: 'La Macumba · recurring Monday programme', url: 'https://www.lamacumba.cz/pondeli/' },
      { label: 'Salsa Cubana con Leon · intermediate class and joining rules', url: 'https://salsacubanaconleon.cz/kurz-salsy-praha-stredne-pokrocili' },
      { label: 'Na Verandách · official restaurant and hours', url: 'https://www.phnaverandach.cz/en/' },
      { label: 'DanceDifferent · recurring timetable', url: 'https://dancedifferent.cz/en/timetable/' },
      { label: 'DanceDifferent · single-class price', url: 'https://dancedifferent.cz/en/price-list-group-lessons/' },
      { label: 'DanceDifferent · solo attendance and partner rotation', url: 'https://dancedifferent.cz/en/' },
      { label: 'DanceDifferent · level and entry requirements', url: 'https://dancedifferent.cz/en/how-to-join/' },
      { label: 'Jorge y Mónica · term dates and November break', url: 'https://jorgemonica.com/' },
      { label: 'Prague Airport · public transport', url: 'https://www.prg.aero/en/public-transport-buses' },
      { label: 'Prague Airport · official airport taxi', url: 'https://www.prg.aero/en/taxi' },
    ],
  },
  {
    id: 'firstdays',
    title: 'First days: solo, duo, trio',
    icon: 'users',
    summary: 'Koryun solo on Fri → Koryun + Alexey from Sat → full crew from Sun 15 evening.',
    sections: [
      {
        h: '1 · Koryun solo (Fri 13, 06:45 → evening)',
        steps: [
          'Land 06:45, EES kiosk + passport booth (budget up to 1–1.5 h).',
          'Airport → base: trolleybus 59 + metro A (46 CZK) or AE bus (200 CZK) + 15 min walk.',
          'Bag drop at the apartment (ask the host!) or left-luggage at Hlavní nádraží.',
          'Breakfast at Café Pavlač, then the setup run at Atrium Flora (ATM, SIM shop, pharmacy, Albert).',
          'Vítkov hill viewpoint (10 min walk), lunch menu at U Slovanské lípy.',
          'Nap 14:30–17:00. You’ll have been up since ~01:00 Yerevan time.',
          'Evening: Old Town lights + dinner at U Medvídků, then a solo early night.',
        ],
        tip: 'Low on energy? Swap the Old Town walk for the Žižkov TV Tower deck (10 min from base) and an early beer downstairs.',
      },
      {
        h: '2 · Duo: Koryun + Alexey from Saturday 14',
        steps: [
          'Alexey: Kožlany → Plzeň (bus) → train to Praha hl.n. (~1 h 15), or Rakovník + bus 404 to Zličín. Check idos.cz the evening before.',
          'Bring the Xbox in hand luggage; a backpack-sized bag is fine on buses/trains.',
          '10:45 breakfast with Koryun + Alexey, optional Žižkov TV Tower, Naše maso lunch and the Strahov sunset. Eska or Cross Club are optional duo plans.',
          'Keep the main Castle visit for Mon 16 and the proper Lokál dinner for Thu 19, when all three can go together.',
        ],
        tip: 'Whoever arrives first gets the keys from the host and shares the door code in Notes.',
      },
      {
        h: '3 · Trio from Sunday 15 evening',
        steps: [
          'Arto: easyJet EZS1563, Geneva T1 15:25 → Prague T2 17:00 (CET). Schengen flight, no passport control for Swiss.',
          'Choose one Sunday arrival plan: A — Arto goes straight from T2 to Klášterní šenk for dinner with the crew at 18:30; B — airport → base around 17:30–18:30, bag drop, then U Slovanské lípy at 19:15. Neither table is reserved; the timeline currently keeps B as a provisional draft.',
          'For A, Koryun + Alexey skip the optional Wenceslas stop and meet at the restaurant; no airport pickup is needed. For B, use trolleybus 59 + metro A or AE + a walk to the base. Full routes, booking rules and the Vinohradský alternative are in Arrival Plan A/B & Monday dancing.',
          '21:00: relaxed cards, beer and catch-up at the base. Shared day plans start at 10:30 or later; GTA waits until after Arto leaves Prague on Fri 20.',
        ],
        bullets: ['If Arto lands late: join the crew at the base for the 21:00 chill night instead.'],
      },
      {
        h: 'If plans shift',
        bullets: [
          'If Arto’s Sunday flight is delayed, adjust the airport transfer and dinner plans in Plan.',
          'If Alexey arrives later on Sat, shorten the optional duo stops. The essential Castle and Old Town walks are saved for the shared days.',
          'Everyone edits their own travel events in Plan, and the map/timelapse update automatically.',
        ],
      },
    ],
  },
  {
    id: 'arrival',
    title: 'Arrival day, step by step',
    icon: 'plane-landing',
    summary: 'Fri 13 Nov: from the Wizz desk in Yerevan to a nap in Žižkov.',
    for: ['koryun'],
    sections: [
      {
        h: 'Night before (Thu 12 Nov)',
        steps: [
          'Online check-in in the Wizz app (closes 3 h before departure). Save the boarding pass + screenshot.',
          'Install the eSIM on home Wi-Fi (don’t activate data yet).',
          'Order the taxi to Zvartnots for ~02:00.',
          'Hand luggage: passport + visa, insurance PDF, return booking, apartment address, power bank, pen.',
          'Bag fits 40×30×20 cm, or you bought Priority / a checked bag online.',
        ],
      },
      {
        h: 'Zvartnots (EVN), 02:30–05:30',
        steps: [
          'Go to the Wizz desk even if checked in online: non-EU passports need the document check + boarding-pass stamp. The desk closes 40 min before departure.',
          'Passport control and security, then boarding. The gate closes 30 min before.',
        ],
      },
      {
        h: 'Landing in Prague, 06:45',
        steps: [
          'Set your watch 3 h back (Prague = UTC+1).',
          'EES: register your face at a self-service kiosk, then the passport booth. Allow up to 1–1.5 h.',
          'Turn on the eSIM data roaming, or use the free airport Wi-Fi.',
          'Buy a 90-min ticket (46 CZK) in the PID Lítačka app, or pay the AE bus driver 200 CZK by card.',
        ],
        tip: 'Tired with a bag? AE bus to Hlavní nádraží, then walk 15 min east to Dalimilova. Or Bolt from the Departures level.',
      },
      {
        h: 'Morning in Žižkov',
        steps: [
          'Drop the bag (if the host allows early), else left-luggage at Hlavní nádraží.',
          'Breakfast, then cash from a bank ATM and groceries.',
          'Easy walk up Vítkov hill, lunch menu at U Slovanské lípy, then NAP.',
          'Evening: Old Town lights, dinner at U Medvídků, then an early night. Arto arrives on Sun 15.',
        ],
      },
    ],
  },
  {
    id: 'airport',
    title: 'Airport → base: options compared',
    icon: 'bus',
    summary: 'Václav Havel Airport T1 to Dalimilova 261/14, Žižkov.',
    sections: [
      {
        table: {
          head: ['Option', 'Price', 'Time', 'Best for'],
          rows: [
            ['Trolleybus 59 → metro A', '46 CZK (app)', '45–55 min', 'Cheapest; light bag'],
            ['Airport Express (AE) → Hlavní nádraží + walk', '200 CZK (driver, card OK)', '35–45 min + 15 walk', 'Bags, simplest'],
            ['Bus 100 → metro B Zličín', '46 CZK', '~60 min', 'Backup'],
            ['Bolt', '~450–700 CZK', '25–35 min', 'Door to door, split 2–3 ways'],
            ['Uber (official airport partner)', '~620–850 CZK fixed', '25–35 min', 'Fixed price, pickup at arrivals'],
          ],
        },
      },
      {
        h: 'Cheapest route in detail',
        steps: [
          'Buy a 90-minute ticket (46 CZK) in PID Lítačka and activate it before boarding.',
          'Trolleybus 59 from T1 to Nádraží Veleslavín (~16 min).',
          'Metro A (green) towards Depo Hostivař → Jiřího z Poděbrad (≈ 8 stops).',
          'Walk ~12 min north to Dalimilova.',
        ],
      },
      {
        h: 'AE route in detail',
        steps: [
          'AE bus stop is right outside arrivals; pay the driver 200 CZK (PID tickets NOT valid).',
          'Get off at Praha hlavní nádraží (last stop).',
          'Walk east ~15 min, or tram 5/9/15/26 two stops (Husinecká → Lipanská) and walk 330 m.',
        ],
      },
      {
        warn: 'Ignore taxi touts inside the terminal. Official Uber staff wear red vests. Metered taxis are capped at 42 CZK/km since Oct 2026.',
      },
    ],
    sources: [
      { label: 'DPP Airport Express', url: 'https://www.dpp.cz/en/bus-ae-airport-express' },
      { label: 'Prague Airport taxi', url: 'https://www.prg.aero/en/taxi' },
    ],
  },
  {
    id: 'baggage',
    title: 'Wizz Air: baggage & check-in',
    icon: 'luggage',
    summary: 'What fits for free, what to buy, and the non-EU desk rule.',
    for: ['koryun'],
    sections: [
      {
        table: {
          head: ['Option', 'Size / weight', 'Price (online, per flight)'],
          rows: [
            ['Free personal item (all fares)', '40×30×20 cm, ≤10 kg, under seat', 'Free'],
            ['WIZZ Priority', '+ trolley 55×40×23 cm, 10 kg', '≈ €5–60'],
            ['Checked bag 10 kg', '—', '≈ €8.50–65'],
            ['Checked bag 20 kg', '—', '≈ €13–86'],
            ['At the airport / gate', 'oversized cabin bag', '≈ €60–120 (gate fee ≈ €65)'],
          ],
        },
      },
      {
        h: 'What to take (laptop + 10 days of clothes)',
        bullets: [
          'A laptop backpack is fine ONLY if it fits 40×30×20 cm. Wizz checks with sizers.',
          '10 days of November clothes rarely fit in that. Buy WIZZ Priority (cabin trolley) or a 20 kg checked bag for both flights, online and early.',
          'Wear the bulkiest items (jacket, boots, hoodie) on the plane.',
          'Bringing beer/Becherovka home? Liquids >100 ml must go in a checked bag.',
        ],
      },
      {
        h: 'Check-in rules',
        bullets: [
          'Online check-in is free: opens 48 h before (30 days if you bought a seat), closes 3 h before.',
          'Airport check-in costs extra (~€13 pre-bought, €40–50 at the desk).',
          'Non-EU passport: even after online check-in, go to the Wizz desk for the document check + boarding-pass stamp. The desk closes 40 min before departure.',
          'Keep a PDF/printed boarding pass as backup; not every airport accepts mobile.',
        ],
        warn: 'Don’t skip the desk stamp! Without it boarding can be refused.',
      },
    ],
    sources: [
      { label: 'Wizz baggage', url: 'https://www.wizzair.com/en-gb/help-centre/booking-information-and-services/baggage/baggage-allowance' },
      { label: 'Wizz check-in', url: 'https://www.wizzair.com/en-gb/help-centre/check-in-and-boarding/check-in/check-in-process' },
    ],
  },
  {
    id: 'border',
    title: 'Border, EES & registration',
    icon: 'shield-check',
    summary: 'Biometric entry, documents to carry, and the 3-day Foreign Police rule.',
    for: ['koryun'],
    sections: [
      {
        h: 'Entry/Exit System (EES)',
        bullets: [
          'Fully live since April 2026. Passport stamps are replaced by a digital record.',
          'Visa holders give a face photo (fingerprints are already on file from the visa).',
          'At PRG: self-service kiosk first, then the booth. Queues of 60–90 min have happened.',
          'Arto (Swiss) and Alexey (Czech) are not affected.',
        ],
      },
      {
        h: 'Carry (printed or offline)',
        bullets: ['Return ticket W6 7860', 'Address: Dalimilova 261/14, 130 00 Praha 3', 'Travel insurance ≥ €30,000', 'Bank card + some cash'],
      },
      {
        h: 'Foreign Police registration',
        body:
          'Non-EU visitors must have their place of stay reported within 3 working days of arrival (≈ by Thu 19 Nov; 17 Nov is a holiday). Accommodation providers usually do it. Ask the host to confirm! If not, register at the Foreign Police in Prague. Fine up to 3,000 CZK.',
      },
    ],
    sources: [{ label: 'Czech Police: reporting residence', url: 'https://policie.gov.cz/clanek/reporting-of-the-place-of-aliens-residence.aspx' }],
  },
  {
    id: 'esim',
    title: 'eSIM & mobile data',
    icon: 'smartphone',
    summary: 'Buy before you fly; 10 GB is plenty for maps and messages.',
    sections: [
      {
        table: {
          head: ['Provider', 'Plan', 'Price'],
          rows: [
            ['Ubigi', '10 GB / 30 days', '≈ $14'],
            ['Saily', '10 GB / 30 days', '≈ $15'],
            ['Airalo', '10 GB / 30 days', '≈ $16'],
            ['Nomad', '10 GB / 30 days', '≈ $16'],
            ['Nomad', 'Unlimited 10 days', '≈ $31'],
            ['Holafly', 'Unlimited 10 days', '≈ $37'],
          ],
        },
      },
      {
        h: 'How to',
        steps: [
          'Check the phone supports eSIM and is carrier-unlocked.',
          'Buy + install at home on Wi-Fi (scan QR / in-app).',
          'On landing: set the eSIM as the data line and turn ON data roaming for it.',
          'Keep your home SIM for calls/SMS but turn ITS data roaming OFF.',
        ],
      },
      {
        bullets: [
          'Airport SIM shops exist but are pricier and sometimes only in Terminal 2.',
          'Arto: Swiss plans are not covered by EU free roaming. Check your add-ons or buy an eSIM.',
          'The apartment and most cafés have Wi-Fi.',
        ],
      },
    ],
  },
  {
    id: 'transport',
    title: 'Getting around Prague',
    icon: 'tram-front',
    summary: 'Tickets, apps, and the trams near the base.',
    sections: [
      {
        table: {
          head: ['Ticket', 'App', 'Machine / card'],
          rows: [
            ['30 min', '36 CZK', '39 CZK'],
            ['90 min', '46 CZK', '50 CZK'],
            ['24 hours', '140 CZK', '150 CZK'],
            ['72 hours', '340 CZK', '350 CZK'],
            ['Airport Express', '—', '200 CZK (own fare)'],
          ],
        },
      },
      {
        bullets: [
          'PID Lítačka app = cheapest. Activate the ticket BEFORE boarding.',
          'Every tram and bus has a contactless card terminal (pre-validated ticket).',
          'Paper tickets must be stamped in the yellow validator (in trams, or before the metro escalators).',
          'Inspectors in plain clothes; the fine is 1,200 CZK on the spot.',
          'Metro runs ~05:00–00:00. Night trams (91–99) run every 20–30 min, hub at Lazarská.',
        ],
      },
      {
        h: 'From the base',
        bullets: [
          'Tram stops Lipanská (~330 m) and Husinecká (~400 m) on Seifertova: trams towards Hlavní nádraží, Václavské náměstí and the centre.',
          'Metro A: Jiřího z Poděbrad (~12–15 min walk).',
          'Metro B/C: Florenc (~15 min walk), direct to O2 arena (B).',
          'Hlavní nádraží (trains to Plzeň / Kutná Hora): ~15 min walk.',
        ],
        tip: 'For ~10 days of normal use: 3 × 72 h tickets (1,020 CZK) or just 46 CZK rides; you will walk a lot anyway.',
      },
    ],
    sources: [{ label: 'PID tariff 2026', url: 'https://pid.cz/en/new-pid-tariff-from-1-january-2026-dont-pay-more-than-you-have-to/' }],
  },
  {
    id: 'money',
    title: 'Money, prices & tipping',
    icon: 'wallet',
    summary: 'CZK only. Cards everywhere, bank ATMs, always pay in CZK.',
    sections: [
      {
        table: {
          head: ['', 'CZK'],
          rows: [
            ['1 EUR', '≈ 24.3'],
            ['1 CHF', '≈ 26.4'],
            ['1,000 AMD', '≈ 61'],
            ['1 USD', '≈ 21 (approx.)'],
          ],
        },
      },
      {
        bullets: [
          'ATMs: use bank ATMs (ČSOB, KB, Česká spořitelna, Air Bank). Avoid Euronet (blue/yellow).',
          'Card terminal or ATM asks “with or without conversion”? Choose WITHOUT (pay in CZK).',
          'Avoid exchange booths in the Old Town and at the airport.',
          'Tipping: round up or ~10% in restaurants; round up per round in pubs.',
          'Beer 0.5 l: 55–75 CZK in local pubs, 90–180 CZK in Old Town tourist spots.',
          'Lunch menu (polední menu) 180–250 CZK on weekdays, best value in town.',
        ],
      },
    ],
  },
  {
    id: 'korn',
    title: 'Korn night (Mon 16 Nov)',
    icon: 'guitar',
    summary: 'Koryun + Alexey · O2 arena · Architects + Pixel Grip · show 19:30.',
    for: ['koryun', 'alexey'],
    sections: [
      {
        bullets: [
          'Doors usually 1.5 h before, so ~18:00. Support acts first.',
          'Bags max 40×30×20 cm. No bottles, food, glass, or alcohol from outside.',
          'Bag deposit: 20 / 50 / 100 CZK (small / backpack / large). Leave the laptop at home.',
          'Earplugs, power bank, ID, tickets downloaded offline.',
        ],
      },
      {
        h: 'Getting there',
        steps: [
          'Walk ~15 min to Florenc (or tram).',
          'Metro B (yellow) towards Černý Most, 4 stops → Českomoravská (reopened 2026).',
          'The arena is right next to the station. Food at Galerie Harfa next door.',
        ],
        tip: 'After the show the station is packed. Walk 10 min to Palmovka (metro B) or take trams 7/8 from Arena Libeň jih.',
      },
    ],
    sources: [
      { label: 'O2 arena: Korn', url: 'https://www.o2arena.cz/korn-in-prague-legendary-band-to-perform-at-o2-arena-with-special-guests-architects-and-pixel-grip/' },
      { label: 'Visitor rules', url: 'https://www.o2arena.cz/en/for-visitors/rules-for-visitors/' },
    ],
  },
  {
    id: 'gta',
    title: 'GTA VI: Koryun & Alexey only',
    icon: 'gamepad-2',
    summary: 'Play only after Arto leaves Prague: Friday night and Saturday afternoon.',
    for: ['koryun', 'alexey'],
    sections: [
      {
        h: 'Checklist',
        steps: [
          'Xbox Series X|S digital pre-load starts Tue 10 Nov at 00:00 GMT (01:00 CET). Download at home before travelling; allow up to 212 GB free space.',
          'Bring: Xbox, power cable, HDMI cable, controllers, batteries/charger.',
          'Ask the host: TV with free HDMI? Wi-Fi speed (for the day-one patch)?',
          'Release fact: Rockstar confirms 00:00 local time on Thu 19 Nov for Xbox Series X|S and PS5. This is not our play date: no launch-night or daytime GTA while Arto is in Prague.',
          'Fri 20 Nov, 21:00–21:45: Koryun + Alexey set up the Xbox, test sign-in, check controllers and buy supplies. Arto’s flight leaves Prague at 20:15.',
          'Fri 20 Nov, 22:00 → Sat 21 Nov, 00:30: GTA night for Koryun + Alexey only, after Arto’s scheduled Geneva arrival at 21:50.',
          'Sat 21 Nov, 14:30–16:15: another optional GTA session for Koryun + Alexey. Stop in time for Koryun’s packing/check-in at 16:30; souvenirs move to Friday afternoon.',
        ],
      },
      {
        h: 'Supplies',
        bullets: ['Beer (Pilsner, Kozel, Budvar, cheapest in Albert/Billa/Lidl)', 'Chips, nuts, energy drinks', 'Pizza/burgers via Wolt or Foodora'],
        tip: 'House rule: pass the controller after every mission. Whoever fails a mission buys the next round.',
      },
    ],
    sources: [
      { label: 'Rockstar · regional release and pre-load times (updated 3 Nov 2026)', url: 'https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s' },
      { label: 'Rockstar · pre-load FAQ and disk space', url: 'https://support.rockstargames.com/articles/7nPqOA2uCbpEQHXx7KVrYd/grand-theft-auto-vi-pre-load-faq' },
    ],
  },
  {
    id: 'beer',
    title: 'Czech beer 101',
    icon: 'beer',
    summary: 'How to order, what the degrees mean, and where to drink.',
    sections: [
      {
        bullets: [
          '“Jedno pivo, prosím” = one beer please. “Ještě jedno” = one more. “Zaplatíme” = we’ll pay.',
          'Degrees (10°, 12°) measure the wort strength, not alcohol: 10° ≈ 4%, 12° ≈ 5%.',
          'Světlé = pale lager, tmavé = dark, polotmavé = amber, nefiltrované = unfiltered.',
          'Tankové pivo = unpasteurised tank beer (fresher; Lokál, U Medvídků).',
          'Mlíko = a glass of almost pure foam, drink in one go. Šnyt = half foam, half beer.',
          'The waiter marks your beers on a paper slip and refills automatically. Put a beer mat on top of your glass to stop.',
        ],
      },
      {
        h: 'Our beer map',
        bullets: [
          'Classic halls: Lokál Dlouhááá, U Medvídků, U Zlatého tygra, U Fleků',
          'Brewpubs: Strahov Monastery, Pivovarský dům, Vinohradský pivovar',
          'Craft: BeerGeek Bar, Zlý časy',
          'Žižkov locals: U Vystřelenýho oka, U Sadu',
          'Pilgrimage: Pilsner Urquell brewery, Plzeň',
        ],
      },
    ],
  },
  {
    id: 'departure',
    title: 'Departure day (Sun 22 Nov)',
    icon: 'plane-takeoff',
    summary: 'W6 7860 at 07:20. Leave the base at 04:15.',
    for: ['koryun'],
    sections: [
      {
        steps: [
          'Fri/Sat: online check-in (opens 48 h before), boarding pass in the app + PDF.',
          'Sat evening: pack, weigh the bag, schedule Bolt/Uber for 04:15.',
          '04:00 alarm (set three). Leave keys as agreed with the host.',
          '04:15 ride → PRG T1 (~25–30 min, ~500–700 CZK).',
          '~04:45 Wizz desk: document check + stamp. Then security and passport control (EES exit).',
          '07:20 departure → 14:15 Yerevan.',
        ],
        warn: 'Public transport is NOT an option: the metro starts ~04:45 and you would reach the airport too late.',
      },
    ],
  },
  {
    id: 'packing',
    title: 'Weather & packing',
    icon: 'cloud-sun',
    summary: 'Mid-November: 1–8 °C, grey, sunset ~16:15.',
    sections: [
      {
        bullets: [
          'Highs ~8 °C, lows ~1–2 °C. About 9 wet days per month. Early frost/snow is possible.',
          'Sunrise ~07:15, sunset ~16:15. Plan outdoor sights before 16:00.',
          'Layers: warm jacket, hoodie, thermal top, beanie, gloves, scarf.',
          'Waterproof walking shoes (cobblestones + rain).',
          'Compact umbrella, power bank, earplugs, sunglasses (low sun).',
          'Plugs: type E (230 V). Armenian/EU 2-pin fit; Swiss 3-pin need an adapter.',
        ],
      },
    ],
  },
  {
    id: 'emergency',
    title: 'Emergency & health',
    icon: 'siren',
    summary: '112 works everywhere, in English, without a SIM.',
    sections: [
      {
        table: {
          head: ['Number', 'What'],
          rows: [
            ['112', 'EU emergency (English)'],
            ['155', 'Ambulance'],
            ['158', 'Police'],
            ['156', 'Prague City Police (theft, minor)'],
            ['150', 'Fire'],
          ],
        },
      },
      {
        bullets: [
          'Hospital for foreigners: Motol University Hospital (foreigners’ department).',
          'Pharmacy = Lékárna (green cross). 24/7 one at Palackého 5 (Nové Město).',
          'Lost/stolen passport: police report (158) + Armenian embassy in Prague.',
          'Pickpockets: Old Town Square, Charles Bridge, trams 22/23, metro. Front pockets.',
        ],
      },
    ],
  },
  {
    id: 'phrases',
    title: 'Czech survival phrases',
    icon: 'languages',
    summary: 'Ten phrases that make waiters smile.',
    sections: [
      {
        table: {
          head: ['Czech', 'Say it like', 'Means'],
          rows: [
            ['Dobrý den', 'DOB-ree den', 'Hello (formal)'],
            ['Ahoj', 'AH-hoy', 'Hi / bye (friends)'],
            ['Děkuju', 'DYEH-koo-yoo', 'Thank you'],
            ['Prosím', 'PRO-seem', 'Please / here you go'],
            ['Pivo', 'PIH-vo', 'Beer'],
            ['Na zdraví!', 'na ZDRAH-vee', 'Cheers!'],
            ['Účet, prosím', 'OO-chet PRO-seem', 'The bill, please'],
            ['Kde je…?', 'gdeh yeh', 'Where is…?'],
            ['Nemluvím česky', 'NEM-loo-veem CHES-kee', 'I don’t speak Czech'],
            ['Promiňte', 'PRO-meen-teh', 'Excuse me / sorry'],
          ],
        },
        tip: 'Toast rule: look each other in the eye when clinking glasses.',
      },
    ],
  },
  {
    id: 'whatson',
    title: 'What’s on 13–22 Nov',
    icon: 'calendar-days',
    summary: 'Holidays, festivals, and what you will just miss.',
    sections: [
      {
        bullets: [
          'Fri 13: Friday the 13th arrival. Fitting for a Korn trip.',
          'Mon 16: KORN + Architects + Pixel Grip, O2 arena, 19:30.',
          'Tue 17: Public holiday (Velvet Revolution). Korzo Národní 10:00–20:00, Modlitba pro Martu 17:11, then optional Concert for the Future on Wenceslas Square (programme until 22:00). Keep the afternoon/evening flexible together.',
          'Thu 19: GTA VI release day, but no gaming during Arto’s stay. Koryun + Alexey play Fri 20 from 22:00 and optionally Sat 21 afternoon, after Arto leaves Prague.',
          '~19–25 Nov: French Film Festival (cinemas).',
          'National Gallery (Trade Fair Palace): “NGP 230 Years” exhibition.',
          'Christmas markets open Sat 28 Nov, after the trip. Some decorations will already be up.',
        ],
      },
    ],
  },
];
