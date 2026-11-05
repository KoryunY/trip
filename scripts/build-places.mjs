// Converts researched places.json into src/data/places.ts with app ids + extra places.
import fs from 'node:fs';
const src = process.argv[2];
const raw = JSON.parse(fs.readFileSync(src, 'utf8'));
const RENAME = {
  'home-dalimilova': 'base',
  'airport-t1': 'prg',
  'praha-hlavni-nadrazi': 'hl-n',
  'metro-zlicin': 'zlicin',
  'old-town-square-astronomical-clock': 'old-town-square',
  'vitkov-national-monument': 'vitkov',
  'lokal-dlouhaaa': 'lokal-dlouha',
  'zizkov-tv-tower': 'zizkov-tower',
  'narodni-17-november-memorial': 'narodni-memorial',
  'eska-karlin': 'eska',
  'daytrip-pilsner-urquell': 'pilsner-urquell',
  'daytrip-sedlec-ossuary': 'sedlec-ossuary',
  'daytrip-karlstejn': 'karlstejn',
  'daytrip-kozlany': 'kozlany',
  'pivnice-u-sadu': 'u-sadu',
  'petrin-lookout-tower': 'petrin-tower',
  'yerevan-zvartnots-evn': 'evn',
  'yerevan-republic-square': 'yerevan-home',
  'zurich-hb': 'zurich-home',
};
const out = raw.map((p) => {
  const { note, verified, ...rest } = p;
  const o = { ...rest, id: RENAME[p.id] ?? p.id, lat: Number(p.lat.toFixed(5)), lon: Number(p.lon.toFixed(5)) };
  if (!verified) o.approx = true;
  for (const k of Object.keys(o)) if (o[k] === null) delete o[k];
  return o;
});
const byId = Object.fromEntries(out.map((p) => [p.id, p]));
byId['base'].name = 'Our base · Dalimilova 261/14';
byId['yerevan-home'].name = 'Yerevan (Koryun’s home)';
byId['yerevan-home'].category = 'city';
byId['zurich-home'].name = 'Zürich HB (main station)';
byId['zurich-home'].category = 'city';
byId['zurich-home'].blurb = 'Zürich main railway station. Direct day and night trains connect Zürich and Prague.';
byId['kozlany'].name = 'Kožlany (Alexey’s home)';
byId['kozlany'].category = 'city';
byId['evn'].name = 'Zvartnots Airport (EVN)';
byId['prg'].name = 'Prague Airport · Terminal 1';
byId['prg'].blurb = 'Non-Schengen terminal (Yerevan flights). Exit → AE bus, trolleybus 59, Uber pickup. Bolt pickup reportedly on Departures level.';
Object.assign(byId['u-vystreleneho-oka'], {
  hours: 'Mon–Sat 16:30–01:00; Sun closed',
  url: 'https://www.uvoka.cz/okokontakt/',
});
Object.assign(byId['u-slovanske-lipy'], {
  hours: 'Daily 11:00–23:00',
  url: 'https://uslovanskelipy.cz/',
});
Object.assign(byId['vinohradsky-pivovar'], {
  hours: 'Mon–Sat 11:00–24:00; Sun 11:00–22:00',
  url: 'https://www.vinohradskypivovar.cz/cs/korunni/',
});
const extra = [
  { id: 'prg-t2', name: 'Prague Airport · Terminal 2', category: 'transport', lat: 50.1059, lon: 14.2738, address: 'Aviatická, 161 00 Praha 6 – Ruzyně', area: 'Ruzyně', blurb: 'Schengen terminal (flights from Geneva land here). AE bus and trolleybus 59 stop outside arrivals.', tags: ['airport'], approx: true },
  { id: 'zrh', name: 'Zürich Airport (ZRH)', category: 'transport', lat: 47.45819, lon: 8.55547, address: 'Kloten, Switzerland', area: 'Zürich', blurb: 'Zürich Airport, Switzerland.', tags: ['airport'], approx: true },
  // Airport-wide coordinates: https://ourairports.com/airports/LSGG/
  { id: 'gva', name: 'Geneva Airport · Terminal 1', category: 'transport', lat: 46.23810, lon: 6.10895, address: 'Geneva Airport, Switzerland', area: 'Geneva', blurb: 'Arto’s easyJet flights to/from Prague use Terminal 1.', tags: ['airport'], approx: true },
  // Approximate pin: https://govisit.ai/places/gers/01597a1f-c8c2-4439-8df4-8ef952464b17/cs
  { id: 'la-macumba', name: 'La Macumba · Latin music bar', category: 'nightlife', lat: 50.072685, lon: 14.403747, address: 'Štefánikova 230/7, 150 00 Praha 5 – Smíchov', area: 'Anděl / Smíchov', blurb: 'Monday Cuban salsa intermediate class 18:00–19:30, then salsa, bachata and kizomba social from 21:00. Social entry is free; confirm the 16 Nov programme, class drop-in, level and teaching language.', hours: 'Monday bar 18:00–03:00; DJ/social from 21:00', price: 'Social entry free; class price to confirm', url: 'https://www.lamacumba.cz/pondeli/', tags: ['salsa', 'bachata', 'dance', 'social'], approx: true },
  // Coordinates from the map embedded on the restaurant’s official website.
  { id: 'na-verandach', name: 'Potrefená husa Na Verandách', category: 'food', lat: 50.06850, lon: 14.40664, address: 'Nádražní 43/84, 150 00 Praha 5 – Smíchov', area: 'Smíchov', blurb: 'Czech brewery restaurant inside the Staropramen brewery, near Anděl. Food plus tank and barrel beer. Reservations: +420 257 191 200 or manager@phnaverandach.cz.', hours: 'Mon–Sat 11:00–23:00; Sun 11:00–22:00', url: 'https://www.phnaverandach.cz/en/', tags: ['czech', 'brewery', 'dinner', 'andel'], approx: true },
  // Coordinates from the Google Maps link on the studio’s official timetable page.
  { id: 'dancedifferent', name: 'DanceDifferent · Salsa & Bachata studio', category: 'venue', lat: 50.07157, lon: 14.43003, address: 'Fügnerovo nám. 5, 120 00 Praha 2 – Nové Město', area: 'Nové Město', blurb: 'Monday Bachata 1 18:00–19:00 and Cuban Salsa 1 19:00–20:00. Solo attendance is possible. Complete beginners need a Level 0 introduction before Level 1; confirm your level, 16 Nov availability and English instruction with the studio.', hours: 'Monday: Bachata 1 18:00–19:00; Cuban Salsa 1 19:00–20:00', price: '350 CZK per single group lesson', url: 'https://dancedifferent.cz/en/timetable/', tags: ['salsa', 'bachata', 'dance', 'classes'], approx: true },
  { id: 'plzen-hln', name: 'Plzeň hlavní nádraží', category: 'transport', lat: 49.74336, lon: 13.38635, address: 'Nádražní, 301 00 Plzeň', area: 'Plzeň', blurb: 'Plzeň main station. ~10 min walk to the Pilsner Urquell brewery gate.', tags: ['train'], approx: true },
  { id: 'plzen-square', name: 'Plzeň · náměstí Republiky', category: 'sight', lat: 49.74771, lon: 13.37757, address: 'náměstí Republiky, 301 00 Plzeň', area: 'Plzeň', blurb: 'Huge main square with St. Bartholomew Cathedral (climb the tallest church tower in Czechia) and the entrance to the historic underground.', tags: ['daytrip'], approx: true },
  { id: 'galerie-harfa', name: 'Galerie Harfa', category: 'food', lat: 50.10552, lon: 14.49262, address: 'Českomoravská 2420/15a, 190 00 Praha 9', area: 'Vysočany', blurb: 'Shopping centre attached to the O2 arena: food court, supermarket, toilets. Easy pre-show dinner.', tags: ['pre-show'], approx: true },
  { id: 'lucerna-music-bar', name: 'Lucerna Music Bar', category: 'nightlife', lat: 50.08113, lon: 14.42536, address: 'Vodičkova 36 (Lucerna passage), 110 00 Praha 1', area: 'New Town', blurb: "Legendary '80s & '90s video parties every Friday and Saturday night. Cheap entry, all-ages crowd, singalong guaranteed.", hours: 'Party nights Fri–Sat from ~21:00', tags: ['party'], approx: true },
  { id: 'havelske-trziste', name: 'Havelské tržiště (market)', category: 'shop', lat: 50.08483, lon: 14.42152, address: 'Havelská, 110 00 Praha 1', area: 'Old Town', blurb: 'Open-air market street in the Old Town: souvenirs, fruit, marionettes. Compare prices; supermarkets are cheaper for beer to take home.', tags: ['souvenirs'], approx: true },
];
for (const e of extra) if (!byId[e.id]) out.push(e);
const header = `// Generated from researched data (scripts/build-places.mjs). "approx: true" = position not double-checked.\nimport type { Place } from '../../shared/types';\n\nexport const PLACES: Place[] = `;
fs.writeFileSync('src/data/places.ts', header + JSON.stringify(out, null, 2) + ';\n');
console.log('places', out.length);
