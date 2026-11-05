import { ArrowLeftRight, Beer, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNow } from '../../lib/clock';
import { CURRENCIES, fmtMoney, fromCZK, toCZK, useRates } from '../../lib/rates';
import { useDB } from '../../lib/store';
import { relTime } from '../../lib/time';
import { isPresent } from '../../lib/trip';
import { Avatar, Sheet } from '../ui';
import { t as tx } from '../../i18n';

const QUICK: { label: string; czk: number }[] = [
  { label: tx('Beer 0.5 l (local pub)'), czk: 65 },
  { label: tx('Beer in the Old Town'), czk: 120 },
  { label: tx('90-min transit ticket'), czk: 46 },
  { label: tx('Lunch menu'), czk: 220 },
  { label: tx('Airport Express'), czk: 200 },
  { label: tx('Bolt to the airport'), czk: 600 },
];

export function ConverterSheet({ onClose }: { onClose: () => void }) {
  const { at } = useRates();
  const [amt, setAmt] = useState('100');
  const [cur, setCur] = useState('CZK');
  const n = Number(amt.replace(',', '.')) || 0;
  const czk = toCZK(n, cur);
  return (
    <Sheet title={tx("Money converter")} onClose={onClose}>
      <div className="form">
        <div className="conv-in">
          <input className="input conv-amt tnum" inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value)} aria-label={tx("Amount")} />
          <select className="input conv-cur" value={cur} onChange={(e) => setCur(e.target.value)} aria-label={tx("Currency")}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="card list">
          {CURRENCIES.filter((c) => c !== cur).map((c) => (
            <div key={c} className="row conv-row">
              <ArrowLeftRight className="chev" aria-hidden />
              <span className="grow tnum conv-v">{fmtMoney(fromCZK(czk, c), c)}</span>
            </div>
          ))}
        </div>
        <div className="eyebrow">{tx("Typical prices")}</div>
        <div className="card list">
          {QUICK.map((q) => (
            <button key={q.label} className="row" onClick={() => (setAmt(String(q.czk)), setCur('CZK'))}>
              <span className="grow">
                <span className="t">{q.label}</span>
                <span className="s tnum">
                  {q.czk}{tx(" CZK ≈ ")}{fmtMoney(fromCZK(q.czk, 'EUR'), 'EUR')} ≈ {fmtMoney(fromCZK(q.czk, 'AMD'), 'AMD')} ≈ {fmtMoney(fromCZK(q.czk, 'CHF'), 'CHF')}
                </span>
              </span>
            </button>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 12.5 }}>
          {at ? `Live rates from ${relTime(at, Date.now())}` : tx("Offline rates (Nov 2026): 1 EUR ≈ 24.3 CZK, 1 CHF ≈ 26.4 CZK, 1 CZK ≈ 16.5 AMD")}{tx(". Always pay in CZK at card terminals.")}</p>
      </div>
    </Sheet>
  );
}

export function RouletteSheet({ onClose }: { onClose: () => void }) {
  const db = useDB();
  const now = useNow(60_000);
  const here = db.people.filter((p) => isPresent(p, now));
  const pool = here.length >= 2 ? here : db.people;
  const [idx, setIdx] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const target = Math.floor(Math.random() * pool.length);
    const steps = pool.length * 4 + target;
    let i = 0;
    const tick = () => {
      setIdx(i % pool.length);
      i++;
      if (i <= steps) timer.current = setTimeout(tick, 60 + (i / steps) ** 3 * 380);
      else {
        setSpinning(false);
        navigator.vibrate?.([30, 40, 60]);
      }
    };
    tick();
  };
  const winner = idx != null && !spinning ? pool[idx] : null;
  return (
    <Sheet title={tx("Who buys the next round?")} onClose={onClose}>
      <div className="roulette">
        <div className="roulette-ring">
          {pool.map((p, i) => (
            <div key={p.id} className={`roulette-p ${idx === i ? 'on' : ''}`}>
              <Avatar person={p} size="xl" />
              <span>{p.name}</span>
            </div>
          ))}
        </div>
        <div className="roulette-result" aria-live="polite">
          {winner ? (
            <>
              <Beer aria-hidden /> <b>{winner.name}</b>{tx(" buys this round. Na zdraví!")}</>
          ) : (
            'Fate decides. No appeals.'
          )}
        </div>
        <button className="btn accent block" onClick={spin} disabled={spinning}>
          <RefreshCw /> {winner ? tx("Spin again") : tx("Spin")}
        </button>
      </div>
    </Sheet>
  );
}
