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
          'Evening: Old Town lights, dinner at U Medvídků, welcome beer with Arto.',
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
          'Walk ~12–15 min north to Dalimilova, or take the tram from Husinecká.',
        ],
      },
      {
        h: 'AE route in detail',
        steps: [
          'AE bus stop is right outside arrivals; pay the driver 200 CZK (PID tickets NOT valid).',
          'Get off at Praha hlavní nádraží (last stop).',
          'Walk east ~15 min (Husitská / Seifertova), or tram 5/9/15/26 two stops to Husinecká.',
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
          'Tram stop Husinecká (Seifertova street): trams to Hlavní nádraží, Václavské náměstí, Národní, Malá Strana.',
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
    summary: 'O2 arena · with Architects + Pixel Grip · show 19:30.',
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
    title: 'GTA VI night (19 Nov)',
    icon: 'gamepad-2',
    summary: 'Release day on Xbox Series X. Pre-load, unlock at midnight, snacks.',
    for: ['alexey'],
    sections: [
      {
        h: 'Checklist',
        steps: [
          'Pre-order digital, pre-load from 12 Nov on home internet (~200+ GB).',
          'Bring: Xbox, power cable, HDMI cable, controllers, batteries/charger.',
          'Ask the host: TV with free HDMI? Wi-Fi speed (for the day-one patch)?',
          'Wed 18 Nov evening: set up, update, test sign-in, buy supplies.',
          '00:00 Thu 19 Nov: unlock (midnight local, rolling by region).',
        ],
      },
      {
        h: 'Supplies',
        bullets: ['Beer (Pilsner, Kozel, Budvar, cheapest in Albert/Billa/Lidl)', 'Chips, nuts, energy drinks', 'Pizza/burgers via Wolt or Foodora'],
        tip: 'House rule: pass the controller after every mission. Whoever fails a mission buys the next round.',
      },
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
          'Tue 17: Public holiday (Velvet Revolution). Korzo Národní street festival with ~160 free events. Shops open normally.',
          'Thu 19: GTA VI release day.',
          '~19–25 Nov: French Film Festival (cinemas).',
          'National Gallery (Trade Fair Palace): “NGP 230 Years” exhibition.',
          'Christmas markets open Sat 28 Nov, after the trip. Some decorations will already be up.',
        ],
      },
    ],
  },
];
