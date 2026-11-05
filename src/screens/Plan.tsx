import { CalendarPlus, CalendarRange, Users, Lightbulb, Plus, Sunrise, Sunset, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Fragment, useEffect, useRef } from 'react';
import type { Idea, TripEvent } from '../../shared/types';
import { EventRow } from '../components/EventRow';
import { SyncBadge } from '../components/SyncBadge';
import { Avatar, AvatarStack, Empty } from '../components/ui';
import { useTripTime } from '../lib/clock';
import { CAT, DAY_THEMES, KIND, KIND_HEX, SUN } from '../lib/meta';
import { go, useRoute } from '../lib/router';
import { save, useDB, useMe, useSettings, setSettings } from '../lib/store';
import { dayKey, fmtDayLong, fmtWeekday, tripDays, TRIP_END_DAY, TRIP_START_DAY } from '../lib/time';
import { eventsOnDay, evStart, evEnd, presentOnDay, voteScore, startLocal } from '../lib/trip';
import { openSheet } from '../lib/ui';
import { useWeather, wmo, NORMAL } from '../lib/weather';
import { t as tx } from '../i18n';

export function PlanScreen() {
  const route = useRoute();
  const { t } = useTripTime(30_000, 5 * 60_000);
  const days = tripDays();
  const today = dayKey(t);
  const defaultDay = today < TRIP_START_DAY ? TRIP_START_DAY : today > TRIP_END_DAY ? TRIP_START_DAY : today;
  const sel = route.path[0] || defaultDay;
  const isIdeas = sel === 'ideas';
  const { onlyMine } = useSettings();
  const stripRef = useRef<HTMLDivElement>(null);
  const db = useDB();
  const me = useMe()!;

  useEffect(() => {
    const el = stripRef.current?.querySelector('[aria-current="true"]') as HTMLElement | null;
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [sel]);

  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
          <div className="appbar-title">
            <h1>{tx("Plan")}</h1>
            <div className="sub">{tx("13–22 Nov · tap anything to edit")}</div>
          </div>
          <button
            className="mine-toggle"
            onClick={() => setSettings({ onlyMine: !onlyMine })}
            aria-pressed={onlyMine}
            aria-label={onlyMine ? tx("Showing only my events. Tap to show everyone") : tx("Showing everyone. Tap to show only mine")}
          >
            {onlyMine ? <Avatar person={db.person[me]} size="sm" /> : <Users aria-hidden style={{ width: 16, height: 16 }} />}
            {onlyMine ? tx("Mine") : tx("Everyone")}
          </button>
          <SyncBadge />
        </div>
        <div className="daystrip" ref={stripRef} role="tablist" aria-label={tx("Days")}>
          <button role="tab" className="daychip ideas" aria-current={sel === 'all'} aria-selected={sel === 'all'} onClick={() => go('plan/all')}>
            <CalendarRange aria-hidden />
            <span className="dc-w">{tx("All")}</span>
          </button>
          {days.map((d) => {
            const ms = Date.parse(`${d}T12:00:00+01:00`);
            const present = presentOnDay(db.people, d);
            return (
              <button key={d} role="tab" className={`daychip ${d === today ? 'is-today' : ''}`} aria-current={sel === d} aria-selected={sel === d} onClick={() => go(`plan/${d}`)}>
                <span className="dc-w">{fmtWeekday(ms)}</span>
                <span className="dc-n tnum">{Number(d.slice(8))}</span>
                <span className="dc-dots" aria-hidden>
                  {present.map((p) => (
                    <i key={p.id} style={{ background: p.color }} />
                  ))}
                </span>
              </button>
            );
          })}
          <button role="tab" className="daychip ideas" aria-current={isIdeas} aria-selected={isIdeas} onClick={() => go('plan/ideas')}>
            <Lightbulb aria-hidden />
            <span className="dc-w">{tx("Ideas")}</span>
          </button>
        </div>
      </header>
      <div className="wrap">
        {isIdeas ? <IdeasView /> : sel === 'all' ? <Overview t={t} onlyMine={onlyMine} /> : <DayView day={sel} t={t} onlyMine={onlyMine} />}
      </div>
      <button
        className="fab"
        onClick={() =>
          isIdeas
            ? openSheet({ t: 'ideaEdit' })
            : openSheet({
                t: 'eventEdit',
                draft: { start: `${sel === 'all' ? defaultDay : sel}T12:00:00+01:00`, end: `${sel === 'all' ? defaultDay : sel}T13:00:00+01:00` },
              })
        }
      >
        <Plus aria-hidden /> {isIdeas ? tx("Idea") : tx("Event")}
      </button>
    </>
  );
}

const ARRIVAL_PLAN_B_IDS = new Set(['wenceslas', 'arto-to-base', 'arto-settle-in', 'vinohradsky']);

// Presentation-only alternatives. These are never saved or passed to event consumers.
const ARRIVAL_PLAN_A_STEPS = [
  { id: 'airport', time: '17:30–18:30', title: 'Arto: airport → Břevnov', people: ['arto'], estimated: true },
  { id: 'meet', time: '17:30–18:30', title: 'Koryun & Alexey: to Klášterní šenk', people: ['koryun', 'alexey'], note: 'Skip the Wenceslas Square stop.' },
  { id: 'dinner', time: '18:30–20:00', title: 'Dinner together at Klášterní šenk', people: ['koryun', 'alexey', 'arto'] },
  { id: 'base', time: '20:00–20:50', title: 'Together: Břevnov → base', people: ['koryun', 'alexey', 'arto'], estimated: true },
  { id: 'settle', time: '20:50–21:00', title: 'Arto: bag drop & freshen up', people: ['arto'] },
];

function DayView({ day, t, onlyMine }: { day: string; t: number; onlyMine: boolean }) {
  const db = useDB();
  const me = useMe()!;
  const weather = useWeather();
  const all = eventsOnDay(db.events, day);
  const events = onlyMine ? all.filter((e) => e.people.includes(me)) : all;
  const present = presentOnDay(db.people, day);
  const theme = DAY_THEMES[day];
  const lead = all.find((e) => ['concert', 'gaming', 'flight', 'train', 'beer', 'party', 'sight'].includes(e.kind) && e.status !== 'cancelled');
  const accent = lead ? KIND_HEX[lead.kind] : '#f2a007';
  const w = weather?.days?.[day];
  const ms = Date.parse(`${day}T12:00:00+01:00`);
  const nextEventId = events.find((e) => evStart(e) > t)?.id;
  const isToday = dayKey(t) === day;
  const isArrivalDay = day === '2026-11-15';
  const arrivalSplit = Date.parse('2026-11-15T17:30:00+01:00');
  const beforeArrival = events.filter((e) => !ARRIVAL_PLAN_B_IDS.has(e.id) && evStart(e) < arrivalSplit);
  const planB = events.filter((e) => ARRIVAL_PLAN_B_IDS.has(e.id));
  const afterArrival = events.filter((e) => !ARRIVAL_PLAN_B_IDS.has(e.id) && evStart(e) >= arrivalSplit);
  const planA = ARRIVAL_PLAN_A_STEPS.filter((step) => !onlyMine || step.people.includes(me));
  const showEndLine = isToday && !nextEventId && events.length > 0;
  const renderEvent = (e: TripEvent) => (
    <Fragment key={e.id}>
      {isToday && e.id === nextEventId && <NowLine />}
      <EventRow ev={e} t={t} onClick={() => openSheet({ t: 'event', id: e.id })} />
    </Fragment>
  );
  return (
    <>
      <div className="day-head card" style={{ ['--dc' as string]: accent }}>
        <div className="day-head-top">
          <div>
            <div className="eyebrow">{fmtDayLong(ms)}</div>
            <h2 className="day-title">
              {theme?.emoji} {theme?.title ?? tx("Free day")}
            </h2>
          </div>
          <div className="day-wx">
            <span className="day-wx-e">{w ? wmo(w.code).emoji : '🌥️'}</span>
            <span className="tnum">
              {w ? Math.round(w.tmax) : NORMAL.tmax}° <span className="muted">/ {w ? Math.round(w.tmin) : NORMAL.tmin}°</span>
            </span>
          </div>
        </div>
        <div className="day-head-meta">
          <span className="who">
            <AvatarStack people={present} size="md" />
            <span>{present.length === 3 ? tx("Full crew") : present.length ? present.map((p) => p.name).join(` ${tx('&')} `) : tx("Nobody here yet")}</span>
          </span>
          {SUN[day] && (
            <span className="sun">
              <Sunrise aria-hidden /> {SUN[day][0]} <Sunset aria-hidden /> {SUN[day][1]}
            </span>
          )}
        </div>
      </div>
      {isArrivalDay ? (
        <>
          {beforeArrival.length > 0 && <div className="card ev-list day-list">{beforeArrival.map(renderEvent)}</div>}
          <section className="arrival-options" aria-labelledby="arrival-plans-title">
            <div className="arrival-options-heading">
              <div>
                <h3 id="arrival-plans-title">{tx("Arrival timetable · choose A or B")}</h3>
                <p className="muted">{tx("Choose one arrival plan; times are provisional.")}</p>
              </div>
              <button className="btn sm" onClick={() => go('guide/arrival-social')}>
                {tx("Travel & booking details")}
              </button>
            </div>
            <div className="arrival-options-grid">
              <section className="card arrival-option" aria-labelledby="arrival-plan-a-title">
                <div className="arrival-option-header">
                  <span className="pill">{tx("Alternative preview")}</span>
                  <h4 id="arrival-plan-a-title">{tx("Plan A: Břevnov dinner")}</h4>
                  <p>{tx("Preview only; replaces Plan B if chosen.")}</p>
                </div>
                <ol className="arrival-option-steps">
                  {planA.map((step) => (
                    <li className="arrival-step" key={step.id}>
                      <div className="arrival-step-time tnum">
                        <span>{step.time}</span>
                        {step.estimated && <span className="arrival-step-estimate">{tx("Estimated")}</span>}
                      </div>
                      <div className="arrival-step-main">
                        <div className="arrival-step-title">{tx(step.title)}</div>
                        {step.note && <p className="arrival-step-note">{tx(step.note)}</p>}
                        <div className="arrival-step-people">
                          <AvatarStack people={step.people.map((id) => db.person[id])} />
                          <span>{step.people.map((id) => db.person[id]?.name ?? id).join(', ')}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
                {planA.length === 0 && <p className="arrival-option-empty muted">{tx("No steps for you in this option.")}</p>}
              </section>
              <section className="card arrival-option" aria-labelledby="arrival-plan-b-title">
                <div className="arrival-option-header">
                  <span className="pill info">{tx("Current provisional draft")}</span>
                  <h4 id="arrival-plan-b-title">{tx("Plan B: Base first")}</h4>
                  <p>{tx("Draft events below can be edited.")}</p>
                </div>
                <div className="ev-list">{planB.map(renderEvent)}</div>
                {planB.length === 0 && <p className="arrival-option-empty muted">{tx("No steps for you in this option.")}</p>}
              </section>
            </div>
          </section>
          {(afterArrival.length > 0 || showEndLine) && (
            <div className="card ev-list day-list">
              {afterArrival.map(renderEvent)}
              {showEndLine && <NowLine />}
            </div>
          )}
        </>
      ) : (
        <div className="card ev-list day-list">
          {events.length === 0 && (
            <Empty icon={<CalendarPlus />}>{tx("Nothing planned")}{onlyMine ? tx(" for you") : ''}{tx(". Add an event or schedule an idea.")}</Empty>
          )}
          {events.map(renderEvent)}
          {showEndLine && <NowLine />}
        </div>
      )}
      {!onlyMine && <p className="hint">{tx("Tentative = not booked yet. Dates in grey are placeholders: edit them when you know more.")}</p>}
    </>
  );
}

function NowLine() {
  return (
    <div className="now-line" aria-label={tx("Current time")}>
      <span>{tx("now")}</span>
    </div>
  );
}

function IdeasView() {
  const db = useDB();
  const me = useMe()!;
  const ideas = [...db.ideas].sort((a, b) => voteScore(b.votes) - voteScore(a.votes));
  const vote = (idea: Idea, v: number) => {
    const cur = idea.votes?.[me] ?? 0;
    const votes = { ...(idea.votes ?? {}) };
    if (cur === v) delete votes[me];
    else votes[me] = v;
    save('ideas', { ...idea, votes });
    navigator.vibrate?.(8);
  };
  return (
    <>
      <div className="ideas-intro">
        <h2>{tx("Ideas & votes")}</h2>
        <p className="muted">{tx("Thumbs-up what you’re into. The top ones get a slot in the plan.")}</p>
      </div>
      <div className="ideas">
        {ideas.map((idea) => {
          const K = (KIND[idea.kind] ?? KIND.other).icon;
          const place = idea.placeId ? db.place[idea.placeId] : undefined;
          const score = voteScore(idea.votes);
          const ups = Object.entries(idea.votes ?? {}).filter(([, v]) => v > 0).map(([p]) => db.person[p]);
          const scheduled = idea.scheduledEventId && db.event[idea.scheduledEventId];
          return (
            <div key={idea.id} className="card idea">
              <button className="idea-main" onClick={() => openSheet({ t: 'idea', id: idea.id })}>
                <span className="ico-tile" style={{ color: (KIND[idea.kind] ?? KIND.other).color }}>
                  <K />
                </span>
                <span className="grow">
                  <span className="t">{idea.title}</span>
                  <span className="s">
                    {place ? `${CAT[place.category]?.emoji ?? ''} ${place.name}` : ''}
                    {idea.cost ? `${place ? ' · ' : ''}${idea.cost}` : ''}
                  </span>
                  {scheduled && <span className="pill ok">{tx("scheduled")}</span>}
                </span>
              </button>
              <div className="idea-votes">
                <button className={`vote ${idea.votes?.[me] === 1 ? 'on' : ''}`} onClick={() => vote(idea, 1)} aria-label={tx("Vote up")} aria-pressed={idea.votes?.[me] === 1}>
                  <ThumbsUp />
                </button>
                <span className="tnum score">{score > 0 ? `+${score}` : score}</span>
                <button className={`vote down ${idea.votes?.[me] === -1 ? 'on' : ''}`} onClick={() => vote(idea, -1)} aria-label={tx("Vote down")} aria-pressed={idea.votes?.[me] === -1}>
                  <ThumbsDown />
                </button>
                <span className="grow" />
                {ups.map((p) => p && <Avatar key={p.id} person={p} size="sm" />)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const HIGHLIGHT_KINDS = new Set(['flight', 'concert', 'gaming', 'beer', 'sight', 'party', 'train', 'food']);

function Overview({ t, onlyMine }: { t: number; onlyMine: boolean }) {
  const db = useDB();
  const me = useMe()!;
  const weather = useWeather();
  const today = dayKey(t);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector('.ov-day.today')?.scrollIntoView({ block: 'start' });
  }, []);
  return (
    <div className="overview" ref={ref}>
      {tripDays().map((d, i) => {
        const evs = eventsOnDay(db.events, d).filter((e) => e.status !== 'cancelled' && (!onlyMine || e.people.includes(me)));
        const key = evs.filter((e) => HIGHLIGHT_KINDS.has(e.kind)).slice(0, 5);
        const present = presentOnDay(db.people, d);
        const theme = DAY_THEMES[d];
        const w = weather?.days?.[d];
        const ms = Date.parse(`${d}T12:00:00+01:00`);
        const done = evs.length > 0 && evs.every((e) => evEnd(e) <= t);
        return (
          <button key={d} className={`card ov-day ${d === today ? 'today' : ''} ${done ? 'done' : ''}`} onClick={() => go(`plan/${d}`)}>
            <div className="ov-head">
              <span className="ov-date">
                <span className="dc-w">{fmtWeekday(ms)}</span>
                <span className="dc-n tnum">{Number(d.slice(8))}</span>
              </span>
              <span className="grow">
                <span className="eyebrow">{tx("Day ")}{i + 1}{d === today ? tx(" · today") : done ? tx(" · done ✓") : ''}</span>
                <span className="ov-title">
                  {theme?.emoji} {theme?.title}
                </span>
              </span>
              <span className="ov-side">
                <AvatarStack people={present} size="sm" />
                <span className="muted tnum" style={{ fontSize: 12 }}>
                  {w ? `${wmo(w.code).emoji} ${Math.round(w.tmax)}°` : `${NORMAL.tmax}°`}
                </span>
              </span>
            </div>
            <ul className="ov-list">
              {key.map((e) => (
                <li key={e.id} className={evEnd(e) <= t ? 'past' : ''}>
                  <span className="tnum">{startLocal(e)}</span>
                  <span className="kind-dot" style={{ background: (KIND[e.kind] ?? KIND.other).color }} />
                  <span className="ov-ev">{e.title}</span>
                </li>
              ))}
              {evs.length > key.length && <li className="more muted">+{evs.length - key.length}{tx(" more")}</li>}
              {evs.length === 0 && <li className="muted">{tx("Nothing planned yet")}</li>}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
