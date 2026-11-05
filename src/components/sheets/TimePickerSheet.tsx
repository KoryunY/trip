import { Radio } from 'lucide-react';
import { useState } from 'react';
import { realNow, timeMachine, useTimeState } from '../../lib/clock';
import { DAY_THEMES } from '../../lib/meta';
import { addDays, dayKey, fmtDayMonth, fmtWeekday, hhmm, tripDays, zonedToUtc } from '../../lib/time';
import { mapIntent } from '../../lib/ui';
import { useRoute } from '../../lib/router';
import { t as tx } from '../../i18n';
import { Sheet } from '../ui';
import { MOMENTS } from '../TimeMachine';

const SLOTS: { label: string; time: string; emoji: string }[] = [
  { label: tx('Morning'), time: '09:00', emoji: '🌅' },
  { label: tx('Midday'), time: '12:30', emoji: '☀️' },
  { label: tx('Afternoon'), time: '15:30', emoji: '🌤️' },
  { label: tx('Evening'), time: '19:30', emoji: '🌆' },
  { label: tx('Night'), time: '23:00', emoji: '🌙' },
];

/** "Jump to…": pick a day + time of the trip (friendlier than dragging the slider). */
export function TimePickerSheet({ onClose }: { onClose: () => void }) {
  const ts = useTimeState();
  const route = useRoute();
  const cur = ts.mode === 'live' ? realNow() : ts.sim;
  const days = [addDays(tripDays()[0], -1), ...tripDays()];
  const today = dayKey(realNow());
  const [day, setDay] = useState(days.includes(dayKey(cur)) ? dayKey(cur) : days[1]);
  const [time, setTime] = useState(days.includes(dayKey(cur)) ? hhmm(cur) : '09:00');

  const apply = (ms: number) => {
    timeMachine.pause();
    timeMachine.setSim(ms);
    onClose();
    if (route.tab !== 'map') mapIntent({ fitCrew: true });
  };

  return (
    <Sheet
      title={tx('Jump to…')}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {tx('Cancel')}
          </button>
          <button className="btn primary" style={{ flex: 1 }} onClick={() => apply(zonedToUtc(day, time))}>
            {tx('Show {day}, {time}', { day: `${fmtWeekday(zonedToUtc(day, '12:00'))} ${fmtDayMonth(zonedToUtc(day, '12:00'))}`, time })}
          </button>
        </>
      }
    >
      <div className="tp">
        {ts.mode !== 'live' && (
          <button
            className="tp-live"
            onClick={() => {
              timeMachine.goLive();
              onClose();
            }}
          >
            <Radio aria-hidden /> {tx('Back to live (right now)')}
          </button>
        )}

        <div className="eyebrow">{tx('Day')}</div>
        <div className="tp-days" role="radiogroup" aria-label={tx('Day')}>
          {days.map((d, i) => {
            const ms = zonedToUtc(d, '12:00');
            const theme = DAY_THEMES[d];
            return (
              <button key={d} role="radio" aria-checked={day === d} className={`tp-day ${day === d ? 'on' : ''} ${d === today ? 'today' : ''}`} onClick={() => setDay(d)}>
                <span className="tp-w">{fmtWeekday(ms)}</span>
                <span className="tp-n tnum">{Number(d.slice(8))}</span>
                <span className="tp-e" aria-hidden>
                  {i === 0 ? '🧳' : theme?.emoji ?? '·'}
                </span>
              </button>
            );
          })}
        </div>
        {DAY_THEMES[day] && <div className="tp-theme">{DAY_THEMES[day].title}</div>}

        <div className="eyebrow" style={{ marginTop: 6 }}>
          {tx('Time')}
        </div>
        <div className="tp-slots">
          {SLOTS.map((s) => (
            <button key={s.time} className={`tp-slot ${time === s.time ? 'on' : ''}`} onClick={() => setTime(s.time)}>
              <span aria-hidden>{s.emoji}</span>
              <span className="tp-sl">{s.label}</span>
              <span className="tp-st tnum">{s.time}</span>
            </button>
          ))}
        </div>
        <label className="tp-exact">
          <span>{tx('Exact time')}</span>
          <input className="input" type="time" value={time} onChange={(e) => e.target.value && setTime(e.target.value)} />
        </label>

        <div className="eyebrow" style={{ marginTop: 6 }}>
          {tx('Key moments')}
        </div>
        <div className="tp-moments">
          {MOMENTS.map((m) => {
            const at = Date.parse(m.at);
            return (
              <button key={m.at} className="tp-moment" onClick={() => apply(at)}>
                <span className="tp-me" aria-hidden>
                  {m.emoji}
                </span>
                <span className="tp-ml">{m.label}</span>
                <span className="muted tnum">
                  {fmtDayMonth(at)} · {hhmm(at)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
