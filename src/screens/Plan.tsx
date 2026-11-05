import { CalendarPlus, Filter, Lightbulb, Plus, Sunrise, Sunset, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Fragment, useEffect, useRef } from 'react';
import type { Idea } from '../../shared/types';
import { EventRow } from '../components/EventRow';
import { SyncBadge } from '../components/SyncBadge';
import { Avatar, AvatarStack, Empty } from '../components/ui';
import { useTripTime } from '../lib/clock';
import { CAT, DAY_THEMES, KIND, SUN } from '../lib/meta';
import { go, useRoute } from '../lib/router';
import { save, useDB, useMe, useSettings, setSettings } from '../lib/store';
import { dayKey, fmtDayLong, tripDays, TRIP_END_DAY, TRIP_START_DAY } from '../lib/time';
import { eventsOnDay, evStart, presentOnDay, voteScore } from '../lib/trip';
import { openSheet } from '../lib/ui';
import { useWeather, wmo, NORMAL } from '../lib/weather';

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

  useEffect(() => {
    const el = stripRef.current?.querySelector('[aria-current="true"]') as HTMLElement | null;
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [sel]);

  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
          <div className="appbar-title">
            <h1>Plan</h1>
            <div className="sub">13–22 Nov · tap anything to edit</div>
          </div>
          <button
            className={`icon-btn ${onlyMine ? 'on-accent' : ''}`}
            onClick={() => setSettings({ onlyMine: !onlyMine })}
            aria-pressed={onlyMine}
            aria-label={onlyMine ? 'Showing only my events' : 'Showing everyone’s events'}
            title={onlyMine ? 'Only mine' : 'Everyone'}
          >
            <Filter />
          </button>
          <SyncBadge />
        </div>
        <div className="daystrip" ref={stripRef} role="tablist" aria-label="Days">
          {days.map((d) => {
            const ms = Date.parse(`${d}T12:00:00+01:00`);
            const present = presentOnDay(db.people, d);
            return (
              <button key={d} role="tab" className={`daychip ${d === today ? 'is-today' : ''}`} aria-current={sel === d} aria-selected={sel === d} onClick={() => go(`plan/${d}`)}>
                <span className="dc-w">{new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/Prague' }).format(ms)}</span>
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
            <span className="dc-w">Ideas</span>
          </button>
        </div>
      </header>
      <div className="wrap">{isIdeas ? <IdeasView /> : <DayView day={sel} t={t} onlyMine={onlyMine} />}</div>
      <button
        className="fab"
        onClick={() =>
          isIdeas
            ? openSheet({ t: 'ideaEdit' })
            : openSheet({ t: 'eventEdit', draft: { start: `${sel}T12:00:00+01:00`, end: `${sel}T13:00:00+01:00` } })
        }
      >
        <Plus aria-hidden /> {isIdeas ? 'Idea' : 'Event'}
      </button>
    </>
  );
}

function DayView({ day, t, onlyMine }: { day: string; t: number; onlyMine: boolean }) {
  const db = useDB();
  const me = useMe()!;
  const weather = useWeather();
  const all = eventsOnDay(db.events, day);
  const events = onlyMine ? all.filter((e) => e.people.includes(me)) : all;
  const present = presentOnDay(db.people, day);
  const theme = DAY_THEMES[day];
  const w = weather?.days?.[day];
  const ms = Date.parse(`${day}T12:00:00+01:00`);
  const nowIdx = events.findIndex((e) => evStart(e) > t);
  const isToday = dayKey(t) === day;
  return (
    <>
      <div className="day-head card">
        <div className="day-head-top">
          <div>
            <div className="eyebrow">{fmtDayLong(ms)}</div>
            <h2 className="day-title">
              {theme?.emoji} {theme?.title ?? 'Free day'}
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
            <span>{present.length === 3 ? 'Full crew' : present.length ? present.map((p) => p.name).join(' & ') : 'Nobody here yet'}</span>
          </span>
          {SUN[day] && (
            <span className="sun">
              <Sunrise aria-hidden /> {SUN[day][0]} <Sunset aria-hidden /> {SUN[day][1]}
            </span>
          )}
        </div>
      </div>
      <div className="card ev-list day-list">
        {events.length === 0 && (
          <Empty icon={<CalendarPlus />}>
            Nothing planned{onlyMine ? ' for you' : ''}. Add an event or schedule an idea.
          </Empty>
        )}
        {events.map((e, i) => (
          <Fragment key={e.id}>
            {isToday && i === nowIdx && <NowLine />}
            <EventRow ev={e} t={t} onClick={() => openSheet({ t: 'event', id: e.id })} />
          </Fragment>
        ))}
        {isToday && nowIdx === -1 && events.length > 0 && <NowLine />}
      </div>
      {!onlyMine && <p className="hint">Tentative = not booked yet. Dates in grey are placeholders: edit them when you know more.</p>}
    </>
  );
}

function NowLine() {
  return (
    <div className="now-line" aria-label="Current time">
      <span>now</span>
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
        <h2>Ideas & votes</h2>
        <p className="muted">Thumbs-up what you’re into. The top ones get a slot in the plan.</p>
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
                  {scheduled && <span className="pill ok">scheduled</span>}
                </span>
              </button>
              <div className="idea-votes">
                <button className={`vote ${idea.votes?.[me] === 1 ? 'on' : ''}`} onClick={() => vote(idea, 1)} aria-label="Vote up" aria-pressed={idea.votes?.[me] === 1}>
                  <ThumbsUp />
                </button>
                <span className="tnum score">{score > 0 ? `+${score}` : score}</span>
                <button className={`vote down ${idea.votes?.[me] === -1 ? 'on' : ''}`} onClick={() => vote(idea, -1)} aria-label="Vote down" aria-pressed={idea.votes?.[me] === -1}>
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
