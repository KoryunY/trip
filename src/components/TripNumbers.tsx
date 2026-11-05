import { useMemo } from 'react';
import { distance } from '../lib/geo';
import { crewTrails } from '../lib/positions';
import { useDB } from '../lib/store';
import { Avatar } from './ui';
import { t as tx } from '../i18n';

const FROM = Date.parse('2026-11-12T20:00:00+01:00');
const TO = Date.parse('2026-11-22T18:00:00+01:00');

export function TripNumbers() {
  const db = useDB();
  const stats = useMemo(() => {
    const trails = crewTrails(db.people, db.events, db.place, FROM, TO, db, 2 * 60_000);
    const base: [number, number] = [db.place.base.lon, db.place.base.lat];
    const inPrague = (p: [number, number]) => distance(p, base) < 20_000;
    const per = trails.map((tr) => {
      let air = 0;
      let ground = 0;
      for (let i = 1; i < tr.path.length; i++) {
        const d = distance(tr.path[i - 1], tr.path[i]);
        if (inPrague(tr.path[i - 1]) && inPrague(tr.path[i])) ground += d;
        else air += d;
      }
      return { person: tr.person, air, ground };
    });
    const live = db.events.filter((e) => e.status !== 'cancelled');
    const count = (k: string) => live.filter((e) => e.kind === k).length;
    return { per, beer: count('beer'), sights: count('sight'), nights: count('party'), gaming: count('gaming'), places: db.places.length };
  }, [db]);
  return (
    <div className="card pad numbers">
      <div className="numbers-grid">
        <div>
          <b className="tnum">10</b>
          <span>{tx("days")}</span>
        </div>
        <div>
          <b className="tnum">{stats.beer}</b>
          <span>{tx("beer stops")}</span>
        </div>
        <div>
          <b className="tnum">{stats.sights}</b>
          <span>{tx("sights")}</span>
        </div>
        <div>
          <b className="tnum">{stats.nights}</b>
          <span>{tx("nights out")}</span>
        </div>
        <div>
          <b className="tnum">1</b>
          <span>{tx("Korn show")}</span>
        </div>
        <div>
          <b className="tnum">{stats.gaming}</b>
          <span>{tx("gaming sessions")}</span>
        </div>
      </div>
      <div className="numbers-km">
        {stats.per.map((p) => (
          <div key={p.person} className="exp-bal-row">
            <Avatar person={db.person[p.person]} size="sm" />
            <span className="grow">{db.person[p.person]?.name}</span>
            <span className="tnum muted" style={{ fontSize: 13 }}>
              {Math.round(p.air / 1000).toLocaleString()}{tx(" km travelling · ")}{Math.round(p.ground / 1000)}{tx(" km in Prague")}</span>
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 12 }}>{tx("Based on the current plan; updates as you edit it.")}</p>
    </div>
  );
}
