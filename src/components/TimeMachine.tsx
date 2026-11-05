import { CalendarDays, FastForward, Pause, Play, RotateCcw } from 'lucide-react';
import { useMemo } from 'react';
import { rangeBounds, SPEEDS, timeMachine, useNow, useTimeState } from '../lib/clock';
import { addDays, dayKey, fmtDayMonth, fmtDayShort, hhmm, tripDays, zonedToUtc, fmtWeekday } from '../lib/time';
import { openSheet } from '../lib/ui';
import { t as tx } from '../i18n';

export const MOMENTS: { label: string; emoji: string; at: string }[] = [
  { label: tx('Takeoff EVN'), emoji: '🛫', at: '2026-11-13T02:30:00+01:00' },
  { label: tx('Landing'), emoji: '🛬', at: '2026-11-13T06:50:00+01:00' },
  { label: tx('Crew complete'), emoji: '🤝', at: '2026-11-15T18:45:00+01:00' },
  { label: tx('Castle'), emoji: '🏰', at: '2026-11-16T10:30:00+01:00' },
  { label: tx('KORN'), emoji: '🎸', at: '2026-11-16T19:45:00+01:00' },
  { label: tx('17 Nov'), emoji: '🕯️', at: '2026-11-17T11:30:00+01:00' },
  { label: tx('Plzeň'), emoji: '🍺', at: '2026-11-18T11:00:00+01:00' },
  { label: tx('GTA VI'), emoji: '🎮', at: '2026-11-19T00:05:00+01:00' },
  { label: tx('Farewell'), emoji: '🥂', at: '2026-11-21T19:00:00+01:00' },
  { label: tx('Flight home'), emoji: '✈️', at: '2026-11-22T08:30:00+01:00' },
];

/** Timelapse controls: play, the date/time button (opens the "Jump to" picker), speed, back-to-live and a scrubber. */
export function TimeMachine({ slider = true }: { slider?: boolean; compact?: boolean }) {
  const ts = useTimeState();
  const now = useNow(10_000);
  const t = ts.mode === 'live' ? now : ts.sim;
  const [a, b] = rangeBounds();
  const span = b - a;
  const ticks = useMemo(() => {
    const trip = new Set(tripDays());
    const out: { k: string; at: number; trip: boolean }[] = [];
    let k = dayKey(a);
    for (let i = 0; i < 40; i++) {
      const at = zonedToUtc(k, '00:00');
      if (at > b) break;
      if (at > a) out.push({ k, at, trip: trip.has(k) });
      k = addDays(k, 1);
    }
    return out;
  }, [a, b]);
  const speedIdx = SPEEDS.findIndex((s) => s.v === ts.speed);
  const live = ts.mode === 'live';
  const nowPct = ((now - a) / span) * 100;
  return (
    <div className="tm">
      <div className="tm-row">
        <button className="tm-play" onClick={() => timeMachine.toggle()} aria-label={ts.playing ? tx('Pause timelapse') : tx('Play timelapse')}>
          {ts.playing ? <Pause /> : <Play />}
        </button>
        <button className="tm-when" onClick={() => openSheet({ t: 'timePicker' })} aria-label={tx('Pick a date and time')}>
          <span className="tm-time tnum">{hhmm(t)}</span>
          <span className="tm-date">
            {fmtWeekday(t)} {fmtDayMonth(t)}
          </span>
          {live ? <span className="tm-flag live">{tx('LIVE')}</span> : <span className="tm-flag">{ts.playing ? tx('PLAYING') : tx('TIME TRAVEL')}</span>}
          <CalendarDays className="tm-cal" aria-hidden />
        </button>
        <button className="tm-speed" onClick={() => timeMachine.setSpeed(SPEEDS[(speedIdx + 1) % SPEEDS.length].v)} aria-label={tx('Change playback speed')}>
          <FastForward aria-hidden />
          {SPEEDS[speedIdx >= 0 ? speedIdx : 2].label}
        </button>
        {!live && (
          <button className="tm-live" onClick={() => timeMachine.goLive()} aria-label={tx('Back to live')}>
            <RotateCcw aria-hidden />
          </button>
        )}
      </div>
      {slider && (
        <div className="tm-track">
          <input
            type="range"
            min={a}
            max={b}
            step={60_000}
            value={Math.max(a, Math.min(b, t))}
            aria-label={tx('Scrub through the trip')}
            aria-valuetext={`${fmtDayShort(t)} ${hhmm(t)}`}
            onChange={(e) => {
              timeMachine.pause();
              timeMachine.setSim(Number(e.target.value));
            }}
          />
          <div className="tm-ticks" aria-hidden>
            {ticks.map((x) => (
              <span key={x.k} className={x.trip ? 'trip' : ''} style={{ left: `${((x.at - a) / span) * 100}%` }}>
                {Number(x.k.slice(8))}
              </span>
            ))}
            {nowPct >= 0 && nowPct <= 100 && <i className="tm-now" style={{ left: `${nowPct}%` }} />}
          </div>
        </div>
      )}
    </div>
  );
}
