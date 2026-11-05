import { CalendarPlus, CheckCheck, Car, Clock, Compass, ExternalLink, Footprints, Globe, LocateFixed, Map as MapIcon, Navigation, Pencil, ThumbsDown, ThumbsUp, Trash2, Wallet, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import type { Place, PlaceCategory } from '../../../shared/types';
import { CAT, CAT_ORDER } from '../../lib/meta';
import { distance, fmtDistance, walkMinutes } from '../../lib/geo';
import { locateOnce, useLocation } from '../../lib/location';
import { isSeed, remove, resetToSeed, save, uid, useDB, useMe } from '../../lib/store';
import { fmtDayShort, hhmm, relTime } from '../../lib/time';
import { mapsLink, uberLink, voteScore } from '../../lib/trip';
import { navigateTo, openSheet, replaceSheet, showPlaceOnMap } from '../../lib/ui';
import { Avatar, Sheet, toast } from '../ui';
import { t as tx } from '../../i18n';

export function PlaceSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const db = useDB();
  const me = useMe()!;
  const loc = useLocation();
  const p = db.place[id];
  if (!p) {
    return (
      <Sheet title={tx("Place removed")} onClose={onClose}>
        <p className="muted">{tx("This place no longer exists.")}</p>
      </Sheet>
    );
  }
  const c = CAT[p.category] ?? CAT.sight;
  const fromPt: [number, number] = loc.fix ? [loc.fix.lon, loc.fix.lat] : [db.place.base.lon, db.place.base.lat];
  const d = distance(fromPt, [p.lon, p.lat]);
  const events = db.events.filter((e) => [e.placeId, e.toPlaceId, e.fromPlaceId].includes(p.id));
  const myVote = p.votes?.[me] ?? 0;
  const vote = (v: number) => {
    const votes = { ...(p.votes ?? {}) };
    if (myVote === v) delete votes[me];
    else votes[me] = v;
    save('places', { ...p, votes });
  };
  const ups = Object.entries(p.votes ?? {}).filter(([, v]) => v > 0);
  return (
    <Sheet
      title={p.name}
      onClose={onClose}
      actions={
        <button className="icon-btn" aria-label={tx("Edit place")} onClick={() => replaceSheet({ t: 'placeEdit', id: p.id })}>
          <Pencil />
        </button>
      }
    >
      <div className="pl-detail">
        <div className="pl-top">
          <span className="ico-tile" style={{ background: c.color, color: '#fff', fontSize: 20 }}>
            {c.emoji}
          </span>
          <div className="grow">
            <div className="ink2" style={{ fontWeight: 600 }}>
              {c.label}
              {p.area ? ` · ${p.area}` : ''}
            </div>
            <div className="muted" style={{ fontSize: 13.5 }}>
              {loc.fix ? tx('{dist} from you', { dist: fmtDistance(d) }) : tx('{dist} from the base', { dist: fmtDistance(d) })}
              {d < 6000 ? tx(' · ~{n} min walk', { n: walkMinutes(d) }) : ''}
            </div>
          </div>
        </div>
        {p.blurb && <p className="pl-blurb">{p.blurb}</p>}
        <dl className="kv">
          {p.address && (
            <>
              <dt>{tx("Address")}</dt>
              <dd>{p.address}</dd>
            </>
          )}
          {p.hours && (
            <>
              <dt>
                <Clock className="kv-ico" />{tx(" Hours")}</dt>
              <dd>{p.hours}</dd>
            </>
          )}
          {p.price && (
            <>
              <dt>
                <Wallet className="kv-ico" />{tx(" Price")}</dt>
              <dd>{p.price}</dd>
            </>
          )}
        </dl>
        {p.approx && (
          <div className="banner" style={{ fontSize: 13 }}>
            <TriangleAlert aria-hidden />
            <span>{tx("Pin position is approximate. Double-check the address in Google Maps.")}</span>
          </div>
        )}
        <div className="pl-actions">
          <button className="btn sm primary" onClick={() => navigateTo(p.lat, p.lon, p.name)}>
            <Footprints />{tx(" Walk here")}</button>
          <a className="btn sm" href={mapsLink(p.lat, p.lon, 'transit', loc.fix ? [loc.fix.lon, loc.fix.lat] : undefined)} target="_blank" rel="noreferrer">
            <Navigation />{tx(" Transit")}</a>
          <a className="btn sm" href={uberLink(p.lat, p.lon, p.name)} target="_blank" rel="noreferrer">
            <Car />{tx(" Uber")}</a>
          <button className="btn sm" onClick={() => openSheet({ t: 'compass', target: { lat: p.lat, lon: p.lon, name: p.name } })}>
            <Compass />{tx(" Compass")}</button>
          <button className="btn sm" onClick={() => showPlaceOnMap(p)}>
            <MapIcon />{tx(" Map")}</button>
          {p.url && (
            <a className="btn sm" href={p.url} target="_blank" rel="noreferrer">
              <Globe />{tx(" Website")}</a>
          )}
        </div>
        {['sight', 'viewpoint', 'museum', 'beer', 'daytrip', 'venue', 'nightlife'].includes(p.category) && (
          <div className="been">
            <button
              className={`btn sm ${p.visited?.[me] ? 'primary' : ''}`}
              aria-pressed={Boolean(p.visited?.[me])}
              onClick={() => {
                const visited = { ...(p.visited ?? {}) };
                if (visited[me]) delete visited[me];
                else visited[me] = Date.now();
                save('places', { ...p, visited });
                if (!p.visited?.[me]) toast(tx("Ticked off ✓"));
              }}
            >
              <CheckCheck /> {p.visited?.[me] ? tx("Been here") : tx("Mark as been here")}
            </button>
            {Object.keys(p.visited ?? {}).map((pid) => (
              <Avatar key={pid} person={db.person[pid]} size="sm" done />
            ))}
          </div>
        )}
        <div className="pl-votes">
          <button className={`vote ${myVote === 1 ? 'on' : ''}`} onClick={() => vote(1)} aria-label={tx("I want to go")} aria-pressed={myVote === 1}>
            <ThumbsUp />
          </button>
          <button className={`vote down ${myVote === -1 ? 'on' : ''}`} onClick={() => vote(-1)} aria-label={tx("Not for me")} aria-pressed={myVote === -1}>
            <ThumbsDown />
          </button>
          <span className="tnum score">{voteScore(p.votes) > 0 ? `+${voteScore(p.votes)}` : voteScore(p.votes)}</span>
          {ups.map(([pid]) => (
            <Avatar key={pid} person={db.person[pid]} size="sm" />
          ))}
          <span className="grow" />
          <button
            className="btn sm accent"
            onClick={() =>
              replaceSheet({
                t: 'eventEdit',
                draft: {
                  title: p.name,
                  placeId: p.id,
                  kind: p.category === 'beer' ? 'beer' : p.category === 'food' || p.category === 'cafe' ? 'food' : p.category === 'nightlife' ? 'party' : 'sight',
                },
              })
            }
          >
            <CalendarPlus />{tx(" Add to plan")}</button>
        </div>
        {events.length > 0 && (
          <div className="pl-events">
            <div className="eyebrow">{tx("In the plan")}</div>
            {events.map((e) => (
              <button key={e.id} className="link-row" onClick={() => replaceSheet({ t: 'event', id: e.id })}>
                <span className="tnum muted">
                  {fmtDayShort(Date.parse(e.start))} {hhmm(Date.parse(e.start))}
                </span>
                <span className="grow">{e.title}</span>
              </button>
            ))}
          </div>
        )}
        <p className="muted" style={{ fontSize: 12, marginTop: 14 }}>
          {p.lat.toFixed(5)}, {p.lon.toFixed(5)}
          {db.meta[`places:${p.id}`] && ` · edited by ${db.person[db.meta[`places:${p.id}`].by]?.name ?? '?'} ${relTime(db.meta[`places:${p.id}`].u, Date.now())}`}
          {db.meta[`places:${p.id}`] && isSeed('places', p.id) && (
            <>
              {' · '}
              <button className="linkish" onClick={() => resetToSeed('places', p.id)}>{tx("restore original")}</button>
            </>
          )}
        </p>
      </div>
    </Sheet>
  );
}

/** extracts lat,lon from pasted Google/Apple/Mapy links or "50.08, 14.42" */
export function parseCoords(s: string): { lat: number; lon: number } | null {
  const pats = [/@(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&](?:q|ll|query|daddr|destination)=(-?\d+\.\d+)(?:,|%2C)\s*(-?\d+\.\d+)/i, /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /^\s*(-?\d{1,2}\.\d+)\s*[, ]\s*(-?\d{1,3}\.\d+)\s*$/];
  for (const re of pats) {
    const m = s.match(re);
    if (m) return { lat: Number(m[1]), lon: Number(m[2]) };
  }
  const mapy = s.match(/[?&]x=(-?\d+\.\d+).*?[?&]y=(-?\d+\.\d+)/);
  if (mapy) return { lat: Number(mapy[2]), lon: Number(mapy[1]) };
  return null;
}

export function PlaceEditor({ id, draft, onClose }: { id?: string; draft?: Partial<Place>; onClose: () => void }) {
  const db = useDB();
  const existing = id ? db.place[id] : undefined;
  const [f, setF] = useState<Place>(
    existing ?? {
      id: uid('p-'),
      name: '',
      category: 'sight',
      lat: db.place.base.lat,
      lon: db.place.base.lon,
      ...draft,
    },
  );
  const [paste, setPaste] = useState('');
  const set = (p: Partial<Place>) => setF((x) => ({ ...x, ...p }));
  const valid = f.name.trim() && Number.isFinite(f.lat) && Number.isFinite(f.lon);
  const submit = () => {
    if (!valid) return;
    save('places', { ...f, name: f.name.trim() });
    toast(existing ? tx("Place saved") : tx("Place added"));
    onClose();
  };
  return (
    <Sheet
      title={existing ? tx("Edit place") : tx("New place")}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>{tx("Cancel")}</button>
          <button className="btn primary" style={{ flex: 1 }} disabled={!valid} onClick={submit}>{tx("Save")}</button>
        </>
      }
    >
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="field">
          <label htmlFor="pl-name">{tx("Name")}</label>
          <input id="pl-name" value={f.name} onChange={(e) => set({ name: e.target.value })} autoFocus={!existing} />
        </div>
        <div className="field">
          <label htmlFor="pl-cat">{tx("Category")}</label>
          <select id="pl-cat" value={f.category} onChange={(e) => set({ category: e.target.value as PlaceCategory })}>
            {CAT_ORDER.map((c) => (
              <option key={c} value={c}>
                {CAT[c].emoji} {CAT[c].label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pl-paste">{tx("Location: paste a Google/Mapy link or “lat, lon”")}</label>
          <input
            id="pl-paste"
            value={paste}
            placeholder={tx("https://maps.google.com/…@50.08,14.42…")}
            onChange={(e) => {
              setPaste(e.target.value);
              const c = parseCoords(e.target.value);
              if (c) {
                set({ lat: Number(c.lat.toFixed(5)), lon: Number(c.lon.toFixed(5)), approx: false });
                toast(tx("Coordinates found"));
              }
            }}
          />
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="pl-lat">{tx("Latitude")}</label>
            <input id="pl-lat" inputMode="decimal" value={f.lat} onChange={(e) => set({ lat: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label htmlFor="pl-lon">{tx("Longitude")}</label>
            <input id="pl-lon" inputMode="decimal" value={f.lon} onChange={(e) => set({ lon: Number(e.target.value) })} />
          </div>
        </div>
        <button
          type="button"
          className="btn sm"
          style={{ alignSelf: 'flex-start', marginTop: -4 }}
          onClick={async () => {
            const fix = await locateOnce();
            if (fix) set({ lat: Number(fix.lat.toFixed(5)), lon: Number(fix.lon.toFixed(5)), approx: false });
            else toast(tx("No GPS fix"));
          }}
        >
          <LocateFixed />{tx(" Use my current location")}</button>
        <p className="muted" style={{ fontSize: 12.5, marginTop: -6 }}>{tx("Tip: long-press anywhere on the map to add a place exactly there.")}</p>
        <div className="field">
          <label htmlFor="pl-addr">{tx("Address")}</label>
          <input id="pl-addr" value={f.address ?? ''} onChange={(e) => set({ address: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="pl-blurb">{tx("Why go / notes")}</label>
          <textarea id="pl-blurb" value={f.blurb ?? ''} onChange={(e) => set({ blurb: e.target.value })} />
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="pl-hours">{tx("Hours")}</label>
            <input id="pl-hours" value={f.hours ?? ''} onChange={(e) => set({ hours: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="pl-price">{tx("Price")}</label>
            <input id="pl-price" value={f.price ?? ''} onChange={(e) => set({ price: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="pl-url">{tx("Website")}</label>
          <input id="pl-url" type="url" value={f.url ?? ''} onChange={(e) => set({ url: e.target.value })} />
        </div>
        {existing && existing.id !== 'base' && (
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              const copy = { ...existing };
              remove('places', existing.id);
              onClose();
              toast(tx("Place deleted"), { label: tx("Undo"), run: () => save('places', copy) });
            }}
          >
            <Trash2 />{tx(" Delete place")}</button>
        )}
        {existing && (
          <a className="muted" style={{ fontSize: 12.5 }} href={mapsLink(f.lat, f.lon, 'walking')} target="_blank" rel="noreferrer">
            <ExternalLink style={{ display: 'inline', width: 12 }} />{tx(" Check this position in Google Maps")}</a>
        )}
      </form>
    </Sheet>
  );
}
