import { ArrowRight, Clock, Copy, ExternalLink, Footprints, MapPin, Pencil, Ticket, Trash2, UserMinus, UserPlus, Wallet, Map as MapIcon, Navigation } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { EventKind, EventStatus, TripEvent } from '../../../shared/types';
import { useNow } from '../../lib/clock';
import { KIND, KIND_ORDER, CAT } from '../../lib/meta';
import { isSeed, remove, resetToSeed, save, uid, useDB, useMe, getDB } from '../../lib/store';
import { durationLabel, fmtDayLong, isoInTz, relTime, tripDays, zonedToUtc, dayKey, hhmm, TZ, TZ_LABEL, fmtDayShort, addDays } from '../../lib/time';
import { endLocal, endTz, localTimeNote, startLocal, startTz, mapsLink, eventDay } from '../../lib/trip';
import { openSheet, replaceSheet, closeSheet, showPlaceOnMap, navigateTo } from '../../lib/ui';
import { distance } from '../../lib/geo';
import { useWeather, weatherAt, wmo } from '../../lib/weather';
import { Avatar, Segmented, Sheet, toast } from '../ui';
import { PeoplePicker, PlacePicker } from './PlacePicker';
import { t as tx } from '../../i18n';
import { PlaceThumb } from '../PhotoStrip';

export function EventSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const db = useDB();
  const me = useMe()!;
  const now = useNow(30_000);
  const ev = db.event[id];
  if (!ev) {
    return (
      <Sheet title={tx("Event removed")} onClose={onClose}>
        <p className="muted">{tx("This event no longer exists.")}</p>
      </Sheet>
    );
  }
  const k = KIND[ev.kind] ?? KIND.other;
  const Icon = k.icon;
  const s = Date.parse(ev.start);
  const e = Date.parse(ev.end);
  const place = ev.placeId ? db.place[ev.placeId] : undefined;
  const from = ev.fromPlaceId ? db.place[ev.fromPlaceId] : undefined;
  const to = ev.toPlaceId ? db.place[ev.toPlaceId] : undefined;
  const target = place ?? to;
  const meta = db.meta[`events:${ev.id}`];
  const iAmIn = ev.people.includes(me);
  const when = now >= e ? tx("Done") : now >= s ? tx('Now · ends {when}', { when: relTime(e, now) }) : relTime(s, now);
  const local = localTimeNote(ev);
  const toggleMe = () => {
    save('events', { ...ev, people: iAmIn ? ev.people.filter((p) => p !== me) : [...ev.people, me] });
    toast(iAmIn ? tx("You’re out of this one") : tx("You’re in!"));
  };
  const del = () => {
    const copy = { ...ev };
    remove('events', ev.id);
    onClose();
    toast(tx("Event deleted"), { label: tx("Undo"), run: () => save('events', copy) });
  };
  return (
    <Sheet
      title={ev.title}
      onClose={onClose}
      actions={
        <button className="icon-btn" aria-label={tx("Edit event")} onClick={() => replaceSheet({ t: 'eventEdit', id: ev.id })}>
          <Pencil />
        </button>
      }
    >
      <div className="ev-detail">
        <div className="evd-top">
          <span className="ico-tile" style={{ background: k.color, color: '#fff' }}>
            <Icon />
          </span>
          <div className="grow">
            <div className="evd-when">
              {fmtDayLong(Date.parse(ev.start), startTz(ev))} · {startLocal(ev)}–{endLocal(ev)}
            </div>
            <div className="muted" style={{ fontSize: 13.5 }}>
              {k.label} · {durationLabel(e - s)} · <b className={now >= s && now < e ? 'live-txt' : ''}>{when}</b>
            </div>
          </div>
        </div>
        <div className="evd-pills">
          <EventWeather ev={ev} />
          <span className={`pill ${ev.status === 'confirmed' ? 'ok' : ev.status === 'cancelled' ? 'danger' : ev.status === 'tentative' ? 'warn' : ''}`}>{tx(ev.status)}</span>
          {local && (
            <span className="pill info">
              <Clock /> {local}{tx(" · Prague ")}{hhmm(s)}–{hhmm(e)}
            </span>
          )}
        </div>

        {(from || place) && (
          <div className="evd-where card">
            {from && to ? (
              <div className="evd-route">
                <button className="link-row" onClick={() => openSheet({ t: 'place', id: from.id })}>
                  <MapPin aria-hidden /> {from.name}
                </button>
                <ArrowRight className="muted" aria-hidden />
                <button className="link-row" onClick={() => openSheet({ t: 'place', id: to.id })}>
                  <MapPin aria-hidden /> {to.name}
                </button>
              </div>
            ) : place ? (
              <button className="link-row" onClick={() => openSheet({ t: 'place', id: place.id })}>
                <PlaceThumb place={place} size={52} fallback={<span className="pl-thumb-fb" style={{ background: CAT[place.category]?.color }}>{CAT[place.category]?.emoji}</span>} />
                <span className="grow">
                  <b>{place.name}</b>
                  {place.address && <span className="muted d-block">{place.address}</span>}
                </span>
              </button>
            ) : null}
          </div>
        )}

        {target && (
          <div className="evd-actions">
            {!['flight', 'train', 'bus'].includes(ev.kind) && distance([db.place.base.lon, db.place.base.lat], [target.lon, target.lat]) < 12_000 && (
              <button className="btn sm" onClick={() => navigateTo(target.lat, target.lon, target.name)}>
                <Footprints />{tx(" Walk route")}</button>
            )}
            <a className="btn sm" href={mapsLink(target.lat, target.lon, 'transit')} target="_blank" rel="noreferrer">
              <Navigation />{tx(" Transit")}</a>
            <button className="btn sm" onClick={() => showPlaceOnMap(target)}>
              <MapIcon />{tx(" Map")}</button>
          </div>
        )}

        <div className="evd-people">
          <div className="eyebrow">{tx("Who")}</div>
          <div className="evd-people-list">
            {ev.people.map((pid) => (
              <span key={pid} className="evd-person">
                <Avatar person={db.person[pid]} size="md" /> {db.person[pid]?.name ?? pid}
              </span>
            ))}
            {!ev.people.length && <span className="muted">{tx("Nobody yet")}</span>}
          </div>
          <button className={`btn sm ${iAmIn ? '' : 'accent'}`} onClick={toggleMe}>
            {iAmIn ? <UserMinus /> : <UserPlus />} {iAmIn ? tx("I’m out") : tx("I’m in")}
          </button>
        </div>

        <ShiftRow ev={ev} />

        {ev.booking && (
          <div className="evd-line">
            <Ticket aria-hidden /> {ev.booking}
          </div>
        )}
        {ev.cost && (
          <div className="evd-line">
            <Wallet aria-hidden /> {ev.cost}
          </div>
        )}
        {ev.notes && <p className="prose evd-notes">{ev.notes}</p>}
        {ev.links?.map((l) => (
          <a key={l.url} className="evd-line link" href={l.url} target={l.url.startsWith('#') ? undefined : tx("_blank")} rel="noreferrer" onClick={() => l.url.startsWith('#') && closeSheet()}>
            <ExternalLink aria-hidden /> {l.label}
          </a>
        ))}

        <div className="evd-foot">
          <button
            className="btn sm"
            onClick={() => {
              const copy: TripEvent = { ...ev, id: uid('e-'), title: tx('{title} (copy)', { title: ev.title }) };
              save('events', copy);
              replaceSheet({ t: 'eventEdit', id: copy.id });
            }}
          >
            <Copy />{tx(" Duplicate")}</button>
          <button className="btn sm danger" onClick={del}>
            <Trash2 />{tx(" Delete")}</button>
        </div>
        {meta && (
          <p className="muted evd-meta">{tx("Last edited by ")}{db.person[meta.by]?.name ?? meta.by} · {relTime(meta.u, Date.now())}
            {isSeed('events', ev.id) && (
              <>
                {' · '}
                <button className="linkish" onClick={() => resetToSeed('events', ev.id)}>{tx("restore original")}</button>
              </>
            )}
          </p>
        )}
      </div>
    </Sheet>
  );
}

const TZ_OPTIONS = [
  { v: 'Europe/Prague', label: 'Prague' },
  { v: 'Asia/Yerevan', label: 'Yerevan' },
  { v: 'Europe/Zurich', label: 'Zürich' },
];

function toLocalParts(iso: string, tz: string) {
  const ms = Date.parse(iso);
  return { day: dayKey(ms, tz), time: hhmm(ms, tz) };
}

export function EventEditor({ id, draft, onClose }: { id?: string; draft?: Partial<TripEvent>; onClose: () => void }) {
  const db = useDB();
  const me = useMe()!;
  const existing = id ? db.event[id] : undefined;
  const base: TripEvent = useMemo(
    () =>
      existing ?? {
        id: uid('e-'),
        title: '',
        kind: 'sight',
        start: draft?.start ?? `${tripDays()[0]}T12:00:00+01:00`,
        end: draft?.end ?? `${tripDays()[0]}T13:00:00+01:00`,
        people: db.people.map((p) => p.id),
        status: 'planned',
        ...draft,
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [f, setF] = useState<TripEvent>(base);
  const [mode, setMode] = useState<'place' | 'travel'>(base.fromPlaceId ? 'travel' : 'place');
  const sTz = startTz(f);
  const eTz = endTz(f);
  const sp = toLocalParts(f.start, sTz);
  const ep = toLocalParts(f.end, eTz);
  const dur = Date.parse(f.end) - Date.parse(f.start);
  const days = tripDays();
  const dayOptions = Array.from(new Set([addDays(days[0], -1), ...days, sp.day])).sort();

  const set = (p: Partial<TripEvent>) => setF((x) => ({ ...x, ...p }));
  const setStart = (day: string, time: string, tz = sTz) => {
    const ms = zonedToUtc(day, time, tz);
    set({ start: isoInTz(ms, tz), end: isoInTz(ms + Math.max(dur, 0), eTz) });
  };
  const setEnd = (time: string) => {
    let ms = zonedToUtc(ep.day === sp.day ? sp.day : ep.day, time, eTz);
    // assume the end is after start: roll into next day if needed
    const st = Date.parse(f.start);
    if (ms <= st) ms = zonedToUtc(addDays(dayKey(st, eTz), 1), time, eTz);
    if (ms - st > 36 * 3600_000) ms = zonedToUtc(dayKey(st, eTz), time, eTz);
    if (ms <= st) ms = zonedToUtc(addDays(dayKey(st, eTz), 1), time, eTz);
    set({ end: isoInTz(ms, eTz) });
  };
  const valid = f.title.trim().length > 0 && Date.parse(f.end) >= Date.parse(f.start);
  const submit = () => {
    if (!valid) return;
    const out: TripEvent = { ...f, title: f.title.trim() };
    if (mode === 'place') {
      out.fromPlaceId = null;
      out.toPlaceId = null;
    } else out.placeId = null;
    if (!out.tz || out.tz === TZ) delete out.tz;
    if (!out.endTz || out.endTz === (out.tz ?? TZ)) delete out.endTz;
    save('events', out);
    toast(existing ? tx("Saved") : tx("Added to the plan"));
    onClose();
    if (!existing) openSheet({ t: 'event', id: out.id });
  };
  return (
    <Sheet
      title={existing ? tx("Edit event") : tx("New event")}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>{tx("Cancel")}</button>
          <button className="btn primary" style={{ flex: 1 }} disabled={!valid} onClick={submit}>
            {existing ? tx("Save") : tx("Add")}
          </button>
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
          <label htmlFor="ev-title">{tx("Title")}</label>
          <input id="ev-title" value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder={tx("e.g. Beer at U Fleků")} autoFocus={!existing} />
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="ev-kind">{tx("Type")}</label>
            <select id="ev-kind" value={f.kind} onChange={(e) => set({ kind: e.target.value as EventKind })}>
              {KIND_ORDER.map((k) => (
                <option key={k} value={k}>
                  {KIND[k].label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ev-day">{tx("Day")}</label>
            <select id="ev-day" value={sp.day} onChange={(e) => setStart(e.target.value, sp.time)}>
              {dayOptions.map((d) => (
                <option key={d} value={d}>
                  {fmtDayShort(Date.parse(`${d}T12:00:00+01:00`))}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="ev-start">{tx("Start (")}{TZ_LABEL[sTz] ?? sTz})</label>
            <input id="ev-start" type="time" value={sp.time} onChange={(e) => e.target.value && setStart(sp.day, e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="ev-end">{tx("End (")}{TZ_LABEL[eTz] ?? eTz})</label>
            <input id="ev-end" type="time" value={ep.time} onChange={(e) => e.target.value && setEnd(e.target.value)} />
          </div>
        </div>
        <p className="muted" style={{ fontSize: 12.5, marginTop: -6 }}>
          {durationLabel(Math.max(0, dur))}
          {eventDay(f) !== dayKey(Date.parse(f.end) - 1, eTz) ? tx(" · ends the next day") : ''}
        </p>
        <details>
          <summary className="muted" style={{ fontSize: 13.5 }}>{tx("Time zones (for flights from Yerevan / Zürich)")}</summary>
          <div className="grid2" style={{ marginTop: 10 }}>
            <div className="field">
              <label htmlFor="ev-tz">{tx("Start time zone")}</label>
              <select id="ev-tz" value={sTz} onChange={(e) => set({ tz: e.target.value })}>
                {TZ_OPTIONS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ev-etz">{tx("End time zone")}</label>
              <select id="ev-etz" value={eTz} onChange={(e) => set({ endTz: e.target.value })}>
                {TZ_OPTIONS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </details>
        <div className="field">
          <span className="lbl">{tx("Where")}</span>
          <Segmented
            label={tx("Location type")}
            value={mode}
            onChange={setMode}
            options={[
              { v: 'place', label: tx("At a place") },
              { v: 'travel', label: tx("Travel A → B") },
            ]}
          />
        </div>
        {mode === 'place' ? (
          <div className="field">
            <label htmlFor="ev-place">{tx("Place")}</label>
            <PlacePicker id="ev-place" value={f.placeId} onChange={(v) => set({ placeId: v })} />
          </div>
        ) : (
          <div className="grid2">
            <div className="field">
              <label htmlFor="ev-from">{tx("From")}</label>
              <PlacePicker id="ev-from" value={f.fromPlaceId} onChange={(v) => set({ fromPlaceId: v })} />
            </div>
            <div className="field">
              <label htmlFor="ev-to">{tx("To")}</label>
              <PlacePicker id="ev-to" value={f.toPlaceId} onChange={(v) => set({ toPlaceId: v })} />
            </div>
          </div>
        )}
        <button type="button" className="btn sm ghost" style={{ alignSelf: 'flex-start', marginTop: -6 }} onClick={() => openSheet({ t: 'placeEdit', draft: { category: 'sight', lat: getDB().place.base.lat, lon: getDB().place.base.lon } })}>{tx("+ New place")}</button>
        <div className="field">
          <span className="lbl">{tx("Who’s going")}</span>
          <PeoplePicker value={f.people} onChange={(v) => set({ people: v })} />
        </div>
        <div className="field">
          <span className="lbl">{tx("Status")}</span>
          <Segmented
            label={tx("Status")}
            value={f.status}
            onChange={(v) => set({ status: v as EventStatus })}
            options={[
              { v: 'planned', label: tx("Planned") },
              { v: 'tentative', label: tx("Maybe") },
              { v: 'confirmed', label: tx("Booked") },
              { v: 'cancelled', label: tx("Off") },
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="ev-notes">{tx("Notes")}</label>
          <textarea id="ev-notes" value={f.notes ?? ''} onChange={(e) => set({ notes: e.target.value })} placeholder={tx("Tips, what to bring, links…")} />
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="ev-booking">{tx("Booking / ticket")}</label>
            <input id="ev-booking" value={f.booking ?? ''} onChange={(e) => set({ booking: e.target.value })} placeholder={tx("ref, seat…")} />
          </div>
          <div className="field">
            <label htmlFor="ev-cost">{tx("Cost")}</label>
            <input id="ev-cost" value={f.cost ?? ''} onChange={(e) => set({ cost: e.target.value })} placeholder={tx("e.g. 430 CZK pp")} />
          </div>
        </div>
        {existing && (
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              const copy = { ...existing };
              remove('events', existing.id);
              onClose();
              toast(tx("Event deleted"), { label: tx("Undo"), run: () => save('events', copy) });
            }}
          >
            <Trash2 />{tx(" Delete event")}</button>
        )}
        <p className="muted" style={{ fontSize: 12 }}>{tx("Signed in as ")}{db.person[me]?.name}{tx(". Changes sync to everyone.")}</p>
      </form>
    </Sheet>
  );
}

/** "Running late?": shift this event (and optionally the rest of the same people's day) */
function ShiftRow({ ev }: { ev: TripEvent }) {
  const db = useDB();
  const [chain, setChain] = useState(true);
  const shift = (min: number) => {
    const ms = min * 60_000;
    const s0 = Date.parse(ev.start);
    const day = eventDay(ev);
    const move = (e: TripEvent): TripEvent => ({
      ...e,
      start: isoInTz(Date.parse(e.start) + ms, startTz(e)),
      end: isoInTz(Date.parse(e.end) + ms, endTz(e)),
    });
    const later = chain
      ? db.events.filter(
          (e) => e.id !== ev.id && Date.parse(e.start) >= s0 && eventDay(e) === day && e.people.some((p) => ev.people.includes(p)) && e.status !== 'cancelled',
        )
      : [];
    const before = [ev, ...later].map((e) => ({ ...e }));
    for (const e of [ev, ...later]) save('events', move(e));
    toast(`${min > 0 ? '+' : ''}${tx('{n} min', { n: min })}${later.length ? tx(' (+{n} later events)', { n: later.length }) : ''}`, {
      label: tx("Undo"),
      run: () => before.forEach((e) => save('events', e)),
    });
  };
  return (
    <div className="shift">
      <div className="eyebrow">{tx("Running late / early?")}</div>
      <div className="shift-btns">
        {[-15, 15, 30, 60].map((m) => (
          <button key={m} className="btn sm" onClick={() => shift(m)}>
            {m > 0 ? '+' : '−'}
            {Math.abs(m)}
            {tx('m')}
          </button>
        ))}
      </div>
      <label className="shift-chain">
        <input type="checkbox" checked={chain} onChange={(e) => setChain(e.target.checked)} />{tx(" also move the rest of that day")}</label>
    </div>
  );
}

function EventWeather({ ev }: { ev: TripEvent }) {
  const w = useWeather();
  const at = weatherAt(w, Date.parse(ev.start));
  if (!at) return null;
  return (
    <span className="pill info" title={tx("Forecast at start time")}>
      {wmo(at.code).emoji} {Math.round(at.temp)}°C
    </span>
  );
}
