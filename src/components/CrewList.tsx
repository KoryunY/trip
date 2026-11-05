import { ChevronRight, Radio } from 'lucide-react';
import type { Person, Presence } from '../../shared/types';
import { useCrew, nextEventFor } from '../lib/crew';
import type { PersonPos } from '../lib/positions';
import { useDB, usePresence, useMe, type DB } from '../lib/store';
import { fmtDayShort, hhmm, relTime } from '../lib/time';
import { openSheet } from '../lib/ui';
import { Avatar } from './ui';
import { KIND } from '../lib/meta';

export function crewLine(pos: PersonPos, db: DB, t: number): { title: string; sub: string } {
  const ev = pos.eventId ? db.event[pos.eventId] : undefined;
  const nxt = nextEventFor(pos.person, db.events, t);
  const nextTxt = nxt ? `Next: ${nxt.title} · ${relTime(Date.parse(nxt.start), t)}` : 'Nothing else planned';
  switch (pos.mode) {
    case 'travel':
      return {
        title: ev?.title ?? pos.label,
        sub: `${Math.round((pos.progress ?? 0) * 100)}% · arrives ${ev ? hhmm(Date.parse(ev.end)) : ''}${ev?.tz && ev.kind === 'flight' ? ' Prague time' : ''}`,
      };
    case 'moving':
      return { title: pos.label, sub: nxt ? `${nxt.title} at ${hhmm(Date.parse(nxt.start))}` : '' };
    case 'event':
      return { title: ev?.title ?? pos.label, sub: ev ? `Until ${hhmm(Date.parse(ev.end))} · ${db.place[ev.placeId ?? '']?.name ?? ''}` : nextTxt };
    default:
      return { title: pos.label, sub: nextTxt };
  }
}

export function presenceFresh(p: Presence | undefined, t: number) {
  return Boolean(p && Math.abs(t - p.ts) < 20 * 60_000);
}

export function CrewList({ t, live, onPick }: { t: number; live: boolean; onPick?: (pid: string) => void }) {
  const db = useDB();
  const crew = useCrew(t);
  const presence = usePresence();
  const me = useMe();
  return (
    <div className="card list crew-list">
      {crew.map((pos) => {
        const person = db.person[pos.person] as Person;
        const line = crewLine(pos, db, t);
        const pr = presence[pos.person];
        const isLive = live && presenceFresh(pr, Date.now());
        const ev = pos.eventId ? db.event[pos.eventId] : undefined;
        const KI = ev ? (KIND[ev.kind] ?? KIND.other).icon : null;
        return (
          <button key={pos.person} className="row" onClick={() => (onPick ? onPick(pos.person) : openSheet({ t: 'person', id: pos.person }))}>
            <Avatar person={person} size="lg" />
            <span className="grow">
              <span className="t crew-name">
                {person.name}
                {pos.person === me && <span className="muted"> (you)</span>}
                {isLive && (
                  <span className="pill live crew-live">
                    <Radio /> live
                  </span>
                )}
              </span>
              <span className="crew-status">
                {KI && <KI aria-hidden />}
                {line.title}
              </span>
              <span className="s">{isLive && pr ? `GPS ${relTime(pr.ts, Date.now())} · ${line.sub}` : line.sub}</span>
              {pos.mode === 'travel' && (
                <span className="progress" style={{ marginTop: 6 }}>
                  <i style={{ width: `${(pos.progress ?? 0) * 100}%`, background: person.color }} />
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
