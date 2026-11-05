import {
  Play,
  ArrowLeftRight,
  ArrowRight,
  Beer,
  Users,
  BookOpen,
  Bus,
  ClipboardCheck,
  Compass,
  Footprints,
  House,
  Languages,
  Luggage,
  Map as MapIcon,
  Siren,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, Segmented } from '../components/ui';
import { CrewList } from '../components/CrewList';
import { EventRow } from '../components/EventRow';
import { Skyline } from '../components/Skyline';
import { SetupCard } from '../components/SetupCard';
import { SyncBadge } from '../components/SyncBadge';
import { TimeMachine } from '../components/TimeMachine';
import { timeMachine, useNow, useTripTime } from '../lib/clock';
import { useLocation } from '../lib/location';
import { distance, fmtDistance, walkMinutes } from '../lib/geo';
import { DAY_THEMES, SUN } from '../lib/meta';
import { go } from '../lib/router';
import { isSeed, useActivity, useDB, useMe } from '../lib/store';
import { countdownParts, dayKey, fmtDayLong, relTime, tripDays, hhmm } from '../lib/time';
import { eventDay, eventsOnDay, myOpenTasks, taskStats, TRIP_START_MS, TRIP_END_MS, evEnd, evStart } from '../lib/trip';
import { openSheet, mapIntent } from '../lib/ui';
import { useWeather, wmo, NORMAL } from '../lib/weather';

export function NowScreen() {
  const db = useDB();
  const me = useMe()!;
  const { t, live } = useTripTime(15_000, 5 * 60_000);
  const person = db.person[me];
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  const today = dayKey(t);
  const days = tripDays();
  const dayIdx = days.indexOf(today);
  const weather = useWeather();
  const activity = useActivity();

  const myArrival = useMemo(() => {
    const s = person?.stayFrom ? Date.parse(person.stayFrom) : TRIP_START_MS;
    return Number.isFinite(s) ? s : TRIP_START_MS;
  }, [person]);
  const firstMine = db.events.find((e) => e.people.includes(me) && e.status !== 'cancelled');

  const upcoming = db.events
    .filter((e) => e.status !== 'cancelled' && evEnd(e) > t && (scope === 'all' || e.people.includes(me)))
    .slice(0, 4);
  const todays = eventsOnDay(db.events, today).filter((e) => e.status !== 'cancelled');
  const stats = taskStats(db.tasks, me);
  const prio = (x: { priority?: string }) => (x.priority === 'high' ? 0 : x.priority === 'low' ? 2 : 1);
  const open = myOpenTasks(db.tasks, me).sort((a, b) => prio(a) - prio(b) || (a.due ?? '9999').localeCompare(b.due ?? '9999'));
  const phase = t < TRIP_START_MS - 6 * 3600_000 ? 'before' : t > TRIP_END_MS + 12 * 3600_000 ? 'after' : 'during';
  const cd = countdownParts(firstMine ? Math.min(evStart(firstMine), myArrival) : myArrival, t);
  const theme = DAY_THEMES[today];
  const w = weather?.days?.[today];

  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
          <button className="me-btn" onClick={() => go('settings')} aria-label="Profile & settings">
            <Avatar person={person} size="md" />
          </button>
          <div className="appbar-title">
            <h1>Hi, {person?.name ?? 'friend'}</h1>
            <div className="sub">{live ? fmtDayLong(t) : `Time travel · ${fmtDayLong(t)} ${hhmm(t)}`}</div>
          </div>
          <SyncBadge />
        </div>
      </header>
      <div className="wrap">
        {/* HERO */}
        <div className={`hero ${phase}`}>
          <Skyline className="hero-skyline" />
          {phase === 'before' && (
            <>
              <div className="eyebrow hero-eyebrow">Your Prague trip starts in</div>
              <div className="countdown tnum" role="timer">
                <span>
                  <b>{cd.days}</b>
                  <i>days</i>
                </span>
                <span>
                  <b>{cd.hours}</b>
                  <i>hrs</i>
                </span>
                <span>
                  <b>{cd.minutes}</b>
                  <i>min</i>
                </span>
              </div>
              {firstMine && (
                <button className="hero-next" onClick={() => openSheet({ t: 'event', id: firstMine.id })}>
                  <span>
                    <span className="eyebrow">First up</span>
                    <span className="hero-next-t">{firstMine.title}</span>
                    <span className="hero-next-s">
                      {fmtDayLong(evStart(firstMine), firstMine.tz)} · {hhmm(evStart(firstMine), firstMine.tz)}
                      {firstMine.tz && firstMine.tz !== 'Europe/Prague' ? ' local' : ''}
                    </span>
                  </span>
                  <ArrowRight aria-hidden />
                </button>
              )}
            </>
          )}
          {phase === 'during' && (
            <>
              <div className="eyebrow hero-eyebrow">
                {dayIdx >= 0 ? `Day ${dayIdx + 1} of ${days.length}` : 'On the way'} · {theme?.emoji}
              </div>
              <h2 className="hero-title">{theme?.title ?? 'Prague'}</h2>
              <div className="hero-meta">
                {w ? (
                  <span>
                    {wmo(w.code).emoji} {Math.round(w.tmax)}° / {Math.round(w.tmin)}°
                  </span>
                ) : (
                  <span>
                    🌡️ ~{NORMAL.tmax}° / {NORMAL.tmin}°
                  </span>
                )}
                {SUN[today] && <span>🌇 sunset {SUN[today][1]}</span>}
              </div>
            </>
          )}
          {phase === 'after' && (
            <>
              <div className="eyebrow hero-eyebrow">Na zdraví!</div>
              <h2 className="hero-title">That’s a wrap. What a trip.</h2>
            </>
          )}
        </div>

        <button className="watch-trip" onClick={playWholeTrip}>
          <span className="watch-ico">
            <Play aria-hidden />
          </span>
          <span className="grow">
            <b>Watch the whole trip</b>
            <span className="muted">Timelapse: everyone’s icons travel to Prague, explore, and fly home</span>
          </span>
        </button>

        <SetupCard />

        {/* CREW + TIME MACHINE */}
        <section className="section">
          <div className="section-h">
            <h2>The crew {live ? 'right now' : 'at that moment'}</h2>
            <button className="link" onClick={() => mapIntent({ fitCrew: true })}>
              On map
            </button>
          </div>
          <CrewList t={t} live={live} />
          <div className="card tm-card">
            <TimeMachine compact />
          </div>
        </section>

        {/* UP NEXT */}
        <section className="section">
          <div className="section-h">
            <h2>Up next</h2>
            <Segmented
              label="Whose events"
              value={scope}
              onChange={setScope}
              options={[
                { v: 'mine', label: 'Me' },
                { v: 'all', label: 'Crew' },
              ]}
            />
          </div>
          <div className="card ev-list">
            {upcoming.length ? (
              upcoming.map((e) => (
                <EventRow
                  key={e.id}
                  ev={e}
                  t={t}
                  showDay={eventDay(e) !== today ? eventDay(e).slice(8) + '/11' : undefined}
                  onClick={() => openSheet({ t: 'event', id: e.id })}
                />
              ))
            ) : (
              <div className="empty">Nothing left on the plan. Time to improvise 🍻</div>
            )}
          </div>
          <LeaveHint />
          {upcoming[0] && (upcoming[0].placeId || upcoming[0].toPlaceId) && (
            <div className="next-actions">
              {(() => {
                const pl = db.place[upcoming[0].placeId ?? upcoming[0].toPlaceId ?? ''];
                if (!pl) return null;
                return (
                  <>
                    <button className="btn sm" onClick={() => mapIntent({ route: { to: [pl.lon, pl.lat], name: pl.name } })}>
                      <Footprints /> Route to {pl.name.split('·')[0].trim().slice(0, 22)}
                    </button>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {relTime(evStart(upcoming[0]), t)}
                    </span>
                  </>
                );
              })()}
            </div>
          )}
        </section>

        {/* TODAY */}
        {phase === 'during' && todays.length > 0 && (
          <section className="section">
            <div className="section-h">
              <h2>Today’s plan</h2>
              <button className="link" onClick={() => go(`plan/${today}`)}>
                Full day
              </button>
            </div>
            <div className="today-strip">
              {todays.map((e) => {
                const past = evEnd(e) <= t;
                const nowE = evStart(e) <= t && evEnd(e) > t;
                return (
                  <button key={e.id} className={`today-item ${past ? 'past' : ''} ${nowE ? 'now' : ''}`} onClick={() => openSheet({ t: 'event', id: e.id })}>
                    <span className="tnum">{hhmm(evStart(e))}</span>
                    <span>{e.title}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* PREP */}
        <section className="section">
          <div className="section-h">
            <h2>Your prep</h2>
            <button className="link" onClick={() => go('prep')}>
              All tasks
            </button>
          </div>
          <div className="card pad prep-card">
            <div className="prep-top">
              <div className="ring" style={{ ['--p' as string]: stats.pct }} aria-label={`${stats.done} of ${stats.total} done`}>
                <span className="tnum">{Math.round(stats.pct * 100)}%</span>
              </div>
              <div>
                <div className="t" style={{ fontWeight: 700 }}>
                  {stats.done} of {stats.total} done
                </div>
                <div className="muted" style={{ fontSize: 13.5 }}>
                  {open.length ? `${open.filter((x) => x.priority === 'high').length} important left` : 'All set! 🎉'}
                </div>
              </div>
            </div>
            {open.slice(0, 3).map((task) => (
              <button key={task.id} className="prep-item" onClick={() => openSheet({ t: 'task', id: task.id })}>
                <ClipboardCheck aria-hidden />
                <span>{task.title}</span>
                {task.priority === 'high' && <span className="pill danger">!</span>}
              </button>
            ))}
          </div>
        </section>

        {/* WEATHER */}
        <WeatherStrip />

        {/* TOOLS */}
        <section className="section">
          <div className="section-h">
            <h2>Handy</h2>
          </div>
          <div className="tools">
            <Tool icon={House} label="Take me home" onClick={() => mapIntent({ route: { to: [db.place.base.lon, db.place.base.lat], name: 'Base' } })} />
            <Tool icon={Compass} label="Compass home" onClick={() => openSheet({ t: 'compass', target: { lat: db.place.base.lat, lon: db.place.base.lon, name: 'Base' } })} />
            <Tool icon={Bus} label="Airport ↔ base" onClick={() => go('guide/airport')} />
            <Tool icon={Luggage} label="Baggage rules" onClick={() => go('guide/baggage')} />
            <Tool icon={ArrowLeftRight} label="Converter" onClick={() => openSheet({ t: 'converter' })} />
            <Tool icon={Beer} label="Who buys the round?" onClick={() => openSheet({ t: 'roulette' })} />
            <Tool icon={Wallet} label="Expenses & split" onClick={() => go('expenses')} />
            <Tool icon={Users} label="First days plan" onClick={() => go('guide/firstdays')} />
            <Tool icon={Languages} label="Czech phrases" onClick={() => go('guide/phrases')} />
            <Tool icon={Siren} label="Emergency" onClick={() => go('guide/emergency')} />
            <Tool icon={BookOpen} label="All guides" onClick={() => go('guides')} />
            <Tool icon={MapIcon} label="Timelapse" onClick={() => mapIntent({ fitCrew: true })} />
          </div>
        </section>

        {/* ACTIVITY */}
        {activity.length > 0 && (
          <section className="section">
            <div className="section-h">
              <h2>Crew activity</h2>
            </div>
            <div className="card list">
              {[...activity]
                .reverse()
                .slice(0, 8)
                .map((a, i) => (
                  <div className="row act" key={i}>
                    <Avatar person={db.person[a.by]} size="md" />
                    <span className="grow">
                      <span className="t" style={{ fontWeight: 500 }}>
                        <b>{db.person[a.by]?.name ?? a.by}</b> {a.act === 'del' ? 'removed' : a.act === 'add' && !isSeed(a.col, a.id) ? 'added' : 'updated'}{' '}
                        {a.title}
                      </span>
                      <span className="s">
                        {a.col} · {relTime(a.ts, Date.now())}
                      </span>
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function playWholeTrip() {
  mapIntent({ fitCrew: true });
  timeMachine.pause();
  timeMachine.setSpeed(3 * 3600_000);
  timeMachine.setSim(Date.parse('2026-11-12T22:00:00+01:00'));
  setTimeout(() => timeMachine.play(), 900);
}

function Tool({ icon: Icon, label, onClick }: { icon: typeof House; label: string; onClick: () => void }) {
  return (
    <button className="tool" onClick={onClick}>
      <span className="tool-ico">
        <Icon aria-hidden />
      </span>
      <span>{label}</span>
    </button>
  );
}

function WeatherStrip() {
  const weather = useWeather();
  const days = tripDays();
  const have = days.filter((d) => weather?.days?.[d]);
  return (
    <section className="section">
      <div className="section-h">
        <h2>Prague weather</h2>
        <span className="muted" style={{ fontSize: 12.5 }}>
          {have.length ? 'Open-Meteo forecast' : 'November normals until the forecast reaches the trip'}
        </span>
      </div>
      <div className="wx-strip" tabIndex={0} role="group" aria-label="Weather for each trip day">
        {days.map((d) => {
          const w = weather?.days?.[d];
          const ms = Date.parse(`${d}T12:00:00+01:00`);
          return (
            <div key={d} className={`wx ${w ? '' : 'normal'}`}>
              <span className="wx-d">{new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/Prague' }).format(ms)}</span>
              <span className="wx-n tnum">{d.slice(8)}</span>
              <span className="wx-e">{w ? wmo(w.code).emoji : '🌥️'}</span>
              <span className="wx-t tnum">{w ? Math.round(w.tmax) : NORMAL.tmax}°</span>
              <span className="wx-l tnum">{w ? Math.round(w.tmin) : NORMAL.tmin}°</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** "Leave now" hint: my next event vs. walking time from my GPS position */
function LeaveHint() {
  const db = useDB();
  const me = useMe()!;
  const loc = useLocation();
  const now = useNow(30_000);
  if (!loc.fix) return null;
  const next = db.events.find((e) => e.status !== 'cancelled' && e.people.includes(me) && evStart(e) > now && (e.placeId || e.fromPlaceId));
  if (!next) return null;
  const pl = db.place[next.fromPlaceId ?? next.placeId ?? ''];
  if (!pl) return null;
  const d = distance([loc.fix.lon, loc.fix.lat], [pl.lon, pl.lat]);
  if (d < 150 || d > 15_000) return null;
  const walk = walkMinutes(d);
  const travel = d > 2500 ? Math.round(12 + d / 400) : walk; // rough tram/metro estimate when far
  const leaveIn = Math.round((evStart(next) - now) / 60_000) - travel - 5;
  if (leaveIn > 45) return null;
  return (
    <div className={`banner ${leaveIn <= 0 ? 'danger' : 'info'}`} style={{ marginTop: 10 }}>
      <Footprints aria-hidden />
      <span>
        {leaveIn <= 0 ? <b>Leave now</b> : <b>Leave in {leaveIn} min</b>} for {next.title}: {fmtDistance(d)} away, ~{travel} min {d > 2500 ? 'by tram/metro' : 'walk'}.
      </span>
    </div>
  );
}
