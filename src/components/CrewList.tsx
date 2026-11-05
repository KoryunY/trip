import { ChevronRight, Radio } from 'lucide-react';
import type { Person, Presence } from '../../shared/types';
import { useCrew, nextEventFor } from '../lib/crew';
import type { PersonPos } from '../lib/positions';
import { useDB, usePresence, useMe, type DB } from '../lib/store';
import { fmtDayShort, hhmm, relTime } from '../lib/time';
import { openSheet } from '../lib/ui';
import { Avatar } from './ui';
import { KIND } from '../lib/meta';
import { distance, fmtDistance } from '../lib/geo';
import { t as tx } from '../i18n';

export function crewLine(pos: PersonPos, db: DB, t: number): { title: string; sub: string } {
  const ev = pos.eventId ? db.event[pos.eventId] : undefined;
  const nxt = nextEventFor(pos.person, db.events, t);
  const nextTxt = nxt ? tx('Next: {title} · {when}', { title: nxt.title, when: relTime(Date.parse(nxt.start), t) }) : tx("Nothing else planned");
  switch (pos.mode) {
    case 'travel':
      return {
        title: ev?.title ?? pos.label,
        sub: tx('{pct}% · arrives {time}', { pct: Math.round((pos.progress ?? 0) * 100), time: ev ? hhmm(Date.parse(ev.end)) : '' }) + (ev?.tz && ev.kind === 'flight' ? tx(" Prague time") : ''),
      };
    case 'moving':
      return { title: pos.label, sub: nxt ? tx('{title} at {time}', { title: nxt.title, time: hhmm(Date.parse(nxt.start)) }) : '' };
    case 'event':
      return { title: ev?.title ?? pos.label, sub: ev ? tx('Until {time} · {place}', { time: hhmm(Date.parse(ev.end)), place: db.place[ev.placeId ?? '']?.name ?? '' }) : nextTxt };
    default:
      return { title: pos.label, sub: nextTxt };
  }
}

/** human label for a live GPS fix: nearest known place, or distance from the base */
export function liveLabel(pr: Presence, db: DB): string {
  let best: { name: string; d: number } | null = null;
  for (const pl of db.places) {
    const d = distance([pr.lon, pr.lat], [pl.lon, pl.lat]);
    if (!best || d < best.d) best = { name: pl.name, d };
  }
  if (best && best.d < 120) return tx('At {place}', { place: best.name });
  if (best && best.d < 400) return tx('Near {place}', { place: best.name });
  const base = db.place.base;
  if (base) {
    const d = distance([pr.lon, pr.lat], [base.lon, base.lat]);
    return d < 60_000 ? tx('{dist} from the base', { dist: fmtDistance(d) }) : tx('{dist} away', { dist: fmtDistance(d) });
  }
  return tx('Live location');
}

export function presenceFresh(p: Presence | undefined, t: number) {
  return Boolean(p && Math.abs(t - p.ts) < 20 * 60_000);
}

function sameStatus(a: PersonPos, b: PersonPos) {
  if (a.eventId || b.eventId) return a.eventId === b.eventId;
  return a.mode === b.mode && a.label === b.label && distance(a.p, b.p) < 60;
}

export function groupCrew(crew: PersonPos[]) {
  const groups: PersonPos[][] = [];
  for (const pos of crew) {
    const g = groups.find((x) => sameStatus(x[0], pos));
    if (g) g.push(pos);
    else groups.push([pos]);
  }
  return groups;
}

export function namesOf(people: (Person | undefined)[], total: number) {
  const n = people.filter(Boolean).map((p) => p!.name);
  if (n.length === total && total > 2) return tx('Everyone');
  return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} ${tx('&')} ${n[n.length - 1]}`;
}

export function CrewList({ t, live, onPick }: { t: number; live: boolean; onPick?: (pid: string) => void }) {
  const db = useDB();
  const crew = useCrew(t);
  const presence = usePresence();
  const me = useMe();
  const groups = groupCrew(crew);
  return (
    <div className="card list crew-list">
      {groups.map((grp) => {
        const pos = grp[0];
        const people = grp.map((g) => db.person[g.person] as Person);
        const line = crewLine(pos, db, t);
        const liveOnes = grp.filter((g) => live && presenceFresh(presence[g.person], Date.now()));
        const ev = pos.eventId ? db.event[pos.eventId] : undefined;
        const KI = ev ? (KIND[ev.kind] ?? KIND.other).icon : null;
        const solo = grp.length === 1;
        const pr = presence[pos.person];
        return (
          <button
            key={grp.map((g) => g.person).join('-')}
            className="row"
            onClick={() => (onPick ? onPick(pos.person) : solo || !ev ? openSheet({ t: 'person', id: pos.person }) : openSheet({ t: 'event', id: ev.id }))}
          >
            {solo ? (
              <Avatar person={people[0]} size="lg" />
            ) : (
              <span className={`crew-cluster n${grp.length}`}>
                {people.map((p) => (
                  <Avatar key={p.id} person={p} size="md" />
                ))}
              </span>
            )}
            <span className="grow">
              <span className="t crew-name">
                {solo ? people[0].name : namesOf(people, db.people.length)}
                {solo && pos.person === me && <span className="muted">{tx(" (you)")}</span>}
                {!solo && <span className="muted">{tx(" together")}</span>}
                {liveOnes.length > 0 && (
                  <span className="pill live crew-live">
                    <Radio />{tx(" live")}</span>
                )}
              </span>
              <span className="crew-status">
                {solo && liveOnes.length > 0 && pr ? (
                  <>📍 {liveLabel(pr, db)}</>
                ) : (
                  <>
                    {KI && <KI aria-hidden />}
                    {line.title}
                  </>
                )}
              </span>
              <span className="s">{solo && liveOnes.length > 0 && pr ? `GPS ${relTime(pr.ts, Date.now())} · plan: ${line.title}` : line.sub}</span>
              {pos.mode === 'travel' && (
                <span className="progress" style={{ marginTop: 6 }}>
                  <i style={{ width: `${(pos.progress ?? 0) * 100}%`, background: people[0].color }} />
                </span>
              )}
            </span>
            <ChevronRight className="chev" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

export function fmtWhen(ms: number) {
  return `${fmtDayShort(ms)} · ${hhmm(ms)}`;
}
