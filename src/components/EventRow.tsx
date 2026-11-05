import { Check, MapPin } from 'lucide-react';
import type { TripEvent } from '../../shared/types';
import { KIND } from '../lib/meta';
import { useDB } from '../lib/store';
import { endLocal, localTimeNote, phaseOf, progressOf, startLocal } from '../lib/trip';
import { AvatarStack } from './ui';
import { t as tx } from '../i18n';

export function EventRow({ ev, t, onClick, showDay }: { ev: TripEvent; t: number; onClick?: () => void; showDay?: string }) {
  const db = useDB();
  const k = KIND[ev.kind] ?? KIND.other;
  const Icon = k.icon;
  const phase = phaseOf(ev, t);
  const where = ev.fromPlaceId
    ? `${db.place[ev.fromPlaceId]?.name ?? '?'} → ${db.place[ev.toPlaceId ?? '']?.name ?? '?'}`
    : ev.placeId
      ? db.place[ev.placeId]?.name
      : null;
  const everyone = ev.people.length >= db.people.length;
  const local = localTimeNote(ev);
  return (
    <button className={`ev ${phase} ${ev.status}`} onClick={onClick} style={{ ['--kc' as string]: k.color }}>
      <span className="ev-time tnum">
        {showDay && <span className="ev-day">{showDay}</span>}
        <span className="a">{startLocal(ev)}</span>
        <span className="b">{endLocal(ev)}</span>
      </span>
      <span className="ev-rail" aria-hidden>
        <span className="ev-ico">{phase === 'past' ? <Check /> : <Icon />}</span>
      </span>
      <span className="ev-main">
        <span className="ev-title">{ev.title}</span>
        <span className="ev-meta">
          {where && (
            <span className="ev-where">
              <MapPin aria-hidden />
              {where}
            </span>
          )}
        </span>
        <span className="ev-tags">
          {phase === 'now' && <span className="pill live">{tx("NOW")}</span>}
          {phase === 'soon' && <span className="pill warn">{tx("SOON")}</span>}
          {ev.status === 'tentative' && <span className="pill">{tx("tentative")}</span>}
          {ev.status === 'confirmed' && phase !== 'past' && <span className="pill ok">{tx("confirmed")}</span>}
          {ev.status === 'cancelled' && <span className="pill danger">{tx("cancelled")}</span>}
          {local && <span className="pill info">{local}</span>}
          {!everyone && <AvatarStack people={ev.people.map((id) => db.person[id])} />}
        </span>
        {phase === 'now' && (
          <span className="progress ev-progress" aria-label={tx("progress")}>
            <i style={{ width: `${progressOf(ev, t) * 100}%` }} />
          </span>
        )}
      </span>
    </button>
  );
}
