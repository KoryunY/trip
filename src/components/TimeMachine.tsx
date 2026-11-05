import { FastForward, Pause, Play, RotateCcw } from 'lucide-react';
import { useMemo } from 'react';
import { rangeBounds, SPEEDS, timeMachine, useNow, useTimeState } from '../lib/clock';
import { addDays, dayKey, fmtDayMonth, fmtDayShort, hhmm, tripDays, zonedToUtc, fmtWeekday } from '../lib/time';
import { t as tx } from '../i18n';

const MOMENTS: { label: string; at: string }[] = [
  { label: tx('Takeoff EVN'), at: '2026-11-13T02:30:00+01:00' },
  { label: tx('Landing'), at: '2026-11-13T06:50:00+01:00' },
  { label: tx('Crew complete'), at: '2026-11-14T10:45:00+01:00' },
  { label: tx('Castle'), at: '2026-11-14T13:00:00+01:00' },
  { label: tx('KORN'), at: '2026-11-16T19:45:00+01:00' },
  { label: tx('17 Nov'), at: '2026-11-17T11:30:00+01:00' },
  { label: tx('Plzeň'), at: '2026-11-18T11:00:00+01:00' },
  { label: tx('GTA VI'), at: '2026-11-19T00:05:00+01:00' },
  { label: tx('Farewell'), at: '2026-11-21T19:00:00+01:00' },
  { label: tx('Flight home'), at: '2026-11-22T08:30:00+01:00' },
];

export function TimeMachine({ compact }: { compact?: boolean }) {
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
    <div className={`tm ${compact ? 'compact' : ''}`}>
      <div className="tm-row">
        <button className="tm-play" onClick={() => timeMachine.toggle()} aria-label={ts.playing ? tx("Pause timelapse") : tx("Play timelapse")}>
          {ts.playing ? <Pause /> : <Play />}
        </button>
        <div className="tm-label">
          <span className="tm-time tnum">
            {hhmm(t)} <span className="tm-date">{fmtWeekday(t)} {fmtDayMonth(t)}</span>
          </span>
          <span className="tm-sub">
            {live ? (
              <span className="pill live">{tx("● LIVE")}</span>
            ) : (
              <span className="pill info">{ts.playing ? tx("Playing timelapse") : tx("Time travel")}</span>
            )}
          </span>
        </div>
        <button
          className="tm-speed"
          onClick={() => timeMachine.setSpeed(SPEEDS[(speedIdx + 1) % SPEEDS.length].v)}
          aria-label={tx("Change playback speed")}
        >
          <FastForward aria-hidden />
          {SPEEDS[speedIdx >= 0 ? speedIdx : 2].label}
        </button>
        {!live && (
          <button className="tm-live" onClick={() => timeMachine.goLive()} aria-label={tx("Back to live")}>
            <RotateCcw aria-hidden />{tx("Live")}</button>
        )}
      </div>
      <div className="tm-track">
        <input
          type="range"
          min={a}
          max={b}
          step={60_000}
          value={Math.max(a, Math.min(b, t))}
          aria-label={tx("Scrub through the trip")}
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
      {!compact && (
        <div className="chips tm-moments">
          {MOMENTS.map((m) => {
            const at = Date.parse(m.at);
            const active = !live && Math.abs(t - at) < 30 * 60_000;
            return (
              <button
                key={m.label}
                className="chip"
                aria-pressed={active}
                onClick={() => {
                  timeMachine.pause();
                  timeMachine.setSim(at);
                }}
              >
                {m.label}
                <span className="muted tnum" style={{ fontWeight: 500 }}>
                  {dayKey(at).slice(8)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
