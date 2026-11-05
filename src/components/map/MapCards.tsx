import { CalendarPlus, ChevronRight, Crosshair, Footprints, Info, LocateFixed, Navigation, Radio, X } from 'lucide-react';
import type { LngLat, Place } from '../../../shared/types';
import { t as tx } from '../../i18n';
import { CAT } from '../../lib/meta';
import { distance, fmtDistance, walkMinutes } from '../../lib/geo';
import type { PersonPos } from '../../lib/positions';
import { useDB, useMe, usePresence } from '../../lib/store';
import { relTime } from '../../lib/time';
import { openSheet } from '../../lib/ui';
import { crewLine, groupCrew, namesOf, presenceFresh, liveLabel } from '../CrewList';
import { PlaceThumb } from '../PhotoStrip';
import { Avatar } from '../ui';

/** Horizontal strip of crew chips: tap one to center + follow that person. */
export function CrewStrip({ crew, t, onPick, extra }: { crew: PersonPos[]; t: number; onPick: (pid: string) => void; extra?: React.ReactNode }) {
  const db = useDB();
  return (
    <div className="crew-strip" role="list" aria-label={tx('Crew')}>
      {groupCrew(crew).map((grp) => {
        const pos = grp[0];
        const people = grp.map((g) => db.person[g.person]).filter(Boolean);
        if (!people.length) return null;
        const line = crewLine(pos, db, t);
        return (
          <button key={grp.map((g) => g.person).join('-')} role="listitem" className="crew-chip" onClick={() => onPick(pos.person)}>
            <span className="stack">
              {people.map((p) => (
                <Avatar key={p.id} person={p} size="md" />
              ))}
            </span>
            <span className="crew-chip-txt">
              <b>{people.length > 1 ? namesOf(people, db.people.length) : people[0].name}</b>
              <span>{line.title}</span>
            </span>
          </button>
        );
      })}
      {extra}
    </div>
  );
}

export function PersonCard({
  pos,
  t,
  following,
  onFollow,
  onClose,
  onRoute,
}: {
  pos: PersonPos;
  t: number;
  following: boolean;
  onFollow: () => void;
  onClose: () => void;
  onRoute: (to: LngLat, name: string) => void;
}) {
  const db = useDB();
  const me = useMe();
  const presence = usePresence();
  const person = db.person[pos.person];
  if (!person) return null;
  const line = crewLine(pos, db, t);
  const pr = presence[pos.person];
  const live = presenceFresh(pr, Date.now());
  return (
    <div className="sel-card" style={{ ['--c' as string]: person.color }}>
      <div className="sel-head">
        <Avatar person={person} size="lg" />
        <div className="grow">
          <div className="sel-name">
            {person.name}
            {pos.person === me && <span className="muted"> {tx('(you)')}</span>}
          </div>
          <div className="sel-title">{line.title}</div>
          <div className="sel-sub">{line.sub}</div>
          {live && pr && (
            <div className="sel-live">
              <Radio aria-hidden /> {liveLabel(pr, db)} · {relTime(pr.ts, Date.now())}
            </div>
          )}
        </div>
        <button className="icon-btn" onClick={onClose} aria-label={tx('Close')}>
          <X />
        </button>
      </div>
      {pos.mode === 'travel' && (
        <span className="progress" style={{ marginTop: 2 }}>
          <i style={{ width: `${(pos.progress ?? 0) * 100}%`, background: person.color }} />
        </span>
      )}
      <div className="sel-actions">
        <button className={`btn sm ${following ? 'primary' : ''}`} onClick={onFollow} aria-pressed={following}>
          <Crosshair /> {following ? tx('Following') : tx('Follow')}
        </button>
        {live && pr && pos.person !== me && (
          <button className="btn sm" onClick={() => onRoute([pr.lon, pr.lat], person.name)}>
            <Footprints /> {tx('Walk to them')}
          </button>
        )}
        <button className="btn sm" onClick={() => openSheet({ t: 'person', id: person.id })}>
          <Info /> {tx('Details')}
        </button>
      </div>
    </div>
  );
}

export function PlaceCard({ place, from, onClose, onRoute }: { place: Place; from: LngLat; onClose: () => void; onRoute: (to: LngLat, name: string) => void }) {
  const c = CAT[place.category] ?? CAT.sight;
  const d = distance(from, [place.lon, place.lat]);
  return (
    <div className="sel-card place">
      <div className="sel-head">
        <button className="sel-thumb" onClick={() => openSheet({ t: 'place', id: place.id })} aria-label={tx('Details')}>
          <PlaceThumb place={place} size={72} />
          <span className="sel-cat" style={{ background: c.color }} aria-hidden>
            {c.emoji}
          </span>
        </button>
        <div className="grow">
          <div className="sel-name">{place.name}</div>
          <div className="sel-sub">
            {c.label}
            {place.area ? ` · ${place.area}` : ''} · {fmtDistance(d)}
            {d < 6000 ? ` · ~${walkMinutes(d)} ${tx('min')}` : ''}
          </div>
          {place.blurb && <div className="sel-blurb">{place.blurb}</div>}
        </div>
        <button className="icon-btn" onClick={onClose} aria-label={tx('Close')}>
          <X />
        </button>
      </div>
      <div className="sel-actions">
        <button className="btn sm primary" onClick={() => onRoute([place.lon, place.lat], place.name)}>
          <Navigation /> {tx('Route')}
        </button>
        <button
          className="btn sm"
          onClick={() =>
            openSheet({
              t: 'eventEdit',
              draft: { title: place.name, placeId: place.id, kind: place.category === 'beer' ? 'beer' : place.category === 'food' || place.category === 'cafe' ? 'food' : 'sight' },
            })
          }
        >
          <CalendarPlus /> {tx('Add to plan')}
        </button>
        <button className="btn sm" onClick={() => openSheet({ t: 'place', id: place.id })}>
          {tx('More')} <ChevronRight />
        </button>
      </div>
    </div>
  );
}

export function HomeChip({ dist, onGo }: { dist: number; onGo: () => void }) {
  return (
    <button className="crew-chip home" onClick={onGo}>
      <span className="home-ico" aria-hidden>
        <LocateFixed />
      </span>
      <span className="crew-chip-txt">
        <b>{tx('Take me home')}</b>
        <span>{fmtDistance(dist)}</span>
      </span>
    </button>
  );
}
