import { Map as MapIcon, Pencil, Radio } from 'lucide-react';
import { useState } from 'react';
import type { Person } from '../../../shared/types';
import { useTripTime } from '../../lib/clock';
import { useCrew } from '../../lib/crew';
import { save, useDB, usePresence, useMe } from '../../lib/store';
import { dayKey, hhmm, isoInTz, relTime, zonedToUtc, fmtDayShort } from '../../lib/time';
import { mapIntent, openSheet } from '../../lib/ui';
import { eventDay } from '../../lib/trip';
import { crewLine, presenceFresh } from '../CrewList';
import { EventRow } from '../EventRow';
import { Avatar, Sheet, toast } from '../ui';
import { t as tx } from '../../i18n';

export function PersonSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const db = useDB();
  const me = useMe();
  const { t, live } = useTripTime(15_000, 60_000);
  const crew = useCrew(t);
  const presence = usePresence();
  const p = db.person[id];
  const [edit, setEdit] = useState(false);
  if (!p) return null;
  const pos = crew.find((c) => c.person === id);
  const line = pos ? crewLine(pos, db, t) : null;
  const pr = presence[id];
  const upcoming = db.events.filter((e) => e.people.includes(id) && Date.parse(e.end) > t && e.status !== 'cancelled').slice(0, 5);
  return (
    <Sheet
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar person={p} size="lg" /> {p.name}
        </span>
      }
      label={p.name}
      onClose={onClose}
      actions={
        <button className="icon-btn" aria-label={tx("Edit person")} onClick={() => setEdit((v) => !v)}>
          <Pencil />
        </button>
      }
    >
      {edit ? (
        <PersonEditor p={p} onDone={() => setEdit(false)} />
      ) : (
        <div className="form">
          {line && (
            <div className="card pad">
              <div className="eyebrow">{live ? tx("Right now (planned)") : `At ${fmtDayShort(t)} ${hhmm(t)}`}</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginTop: 4 }}>{line.title}</div>
              <div className="muted" style={{ fontSize: 13.5 }}>
                {line.sub}
              </div>
              {live && presenceFresh(pr, Date.now()) && (
                <div className="pill live" style={{ marginTop: 8 }}>
                  <Radio />{tx(" live GPS ")}{relTime(pr.ts, Date.now())}
                </div>
              )}
              <button className="btn sm" style={{ marginTop: 10 }} onClick={() => mapIntent({ person: id })}>
                <MapIcon />{tx(" Show on map")}</button>
            </div>
          )}
          <dl className="kv">
            <dt>{tx("From")}</dt>
            <dd>{p.from ?? p.homeName}</dd>
            <dt>{tx("In Prague")}</dt>
            <dd>
              {p.stayFrom ? `${fmtDayShort(Date.parse(p.stayFrom))} ${hhmm(Date.parse(p.stayFrom))}` : '?'} →{' '}
              {p.stayTo ? `${fmtDayShort(Date.parse(p.stayTo))} ${hhmm(Date.parse(p.stayTo))}` : '?'}
            </dd>
            {p.phone && (
              <>
                <dt>{tx("Phone")}</dt>
                <dd>
                  <a href={`tel:${p.phone}`}>{p.phone}</a>
                </dd>
              </>
            )}
          </dl>
          {p.note && <p className="prose">{p.note}</p>}
          <div>
            <div className="eyebrow" style={{ margin: '6px 2px 8px' }}>
              {p.id === me ? tx('Your next events') : tx('{name}’s next events', { name: p.name })}</div>
            <div className="card ev-list">
              {upcoming.map((e) => (
                <EventRow key={e.id} ev={e} t={t} showDay={eventDay(e).slice(8) + '/11'} onClick={() => openSheet({ t: 'event', id: e.id })} />
              ))}
              {!upcoming.length && <div className="empty">{tx("Nothing upcoming")}</div>}
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function PersonEditor({ p, onDone }: { p: Person; onDone: () => void }) {
  const [f, setF] = useState<Person>(p);
  const set = (x: Partial<Person>) => setF((y) => ({ ...y, ...x }));
  const part = (iso: string | null | undefined) => (iso ? { d: dayKey(Date.parse(iso)), t: hhmm(Date.parse(iso)) } : { d: '', t: '' });
  const a = part(f.stayFrom);
  const b = part(f.stayTo);
  const mk = (d: string, t: string) => (d && t ? isoInTz(zonedToUtc(d, t)) : null);
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        save('people', f);
        toast(tx("Saved"));
        onDone();
      }}
    >
      <div className="grid2">
        <div className="field">
          <label htmlFor="pp-name">{tx("Name")}</label>
          <input id="pp-name" value={f.name} onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="pp-color">{tx("Colour")}</label>
          <input id="pp-color" type="color" value={f.color} onChange={(e) => set({ color: e.target.value })} style={{ padding: 4 }} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="pp-from">{tx("Coming from")}</label>
        <input id="pp-from" value={f.from ?? ''} onChange={(e) => set({ from: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="pp-home">{tx("Home city (label)")}</label>
        <input id="pp-home" value={f.homeName} onChange={(e) => set({ homeName: e.target.value })} />
      </div>
      <div className="grid2">
        <div className="field">
          <label htmlFor="pp-hlat">{tx("Home lat")}</label>
          <input id="pp-hlat" inputMode="decimal" value={f.home[1]} onChange={(e) => set({ home: [f.home[0], Number(e.target.value)] })} />
        </div>
        <div className="field">
          <label htmlFor="pp-hlon">{tx("Home lon")}</label>
          <input id="pp-hlon" inputMode="decimal" value={f.home[0]} onChange={(e) => set({ home: [Number(e.target.value), f.home[1]] })} />
        </div>
      </div>
      <div className="eyebrow">{tx("At the base (Prague time)")}</div>
      <div className="grid2">
        <div className="field">
          <label htmlFor="pp-fd">{tx("From day")}</label>
          <input id="pp-fd" type="date" value={a.d} onChange={(e) => set({ stayFrom: mk(e.target.value, a.t || '12:00') })} />
        </div>
        <div className="field">
          <label htmlFor="pp-ft">{tx("time")}</label>
          <input id="pp-ft" type="time" value={a.t} onChange={(e) => set({ stayFrom: mk(a.d, e.target.value) })} />
        </div>
        <div className="field">
          <label htmlFor="pp-td">{tx("Until day")}</label>
          <input id="pp-td" type="date" value={b.d} onChange={(e) => set({ stayTo: mk(e.target.value, b.t || '12:00') })} />
        </div>
        <div className="field">
          <label htmlFor="pp-tt">{tx("time")}</label>
          <input id="pp-tt" type="time" value={b.t} onChange={(e) => set({ stayTo: mk(b.d, e.target.value) })} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="pp-phone">{tx("Phone")}</label>
        <input id="pp-phone" type="tel" value={f.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="pp-note">{tx("Note")}</label>
        <textarea id="pp-note" value={f.note ?? ''} onChange={(e) => set({ note: e.target.value })} />
      </div>
      <button className="btn primary" type="submit">{tx("Save")}</button>
    </form>
  );
}
