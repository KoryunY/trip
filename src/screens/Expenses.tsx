import { ArrowRight, Plus, Receipt } from 'lucide-react';
import { useState } from 'react';
import { Avatar, Empty } from '../components/ui';
import { CURRENCIES, fmtMoney, fromCZK, toCZK, useRates } from '../lib/rates';
import { useDB, useMe } from '../lib/store';
import { fmtDayShort } from '../lib/time';
import { openSheet } from '../lib/ui';
import { SubBar } from './More';

export function balances(expenses: { amount: number; currency: string; paidBy: string; split: string[] }[], people: string[]) {
  const bal: Record<string, number> = Object.fromEntries(people.map((p) => [p, 0]));
  for (const e of expenses) {
    const czk = toCZK(e.amount, e.currency);
    const share = e.split.length ? czk / e.split.length : 0;
    bal[e.paidBy] = (bal[e.paidBy] ?? 0) + czk;
    for (const p of e.split) bal[p] = (bal[p] ?? 0) - share;
  }
  return bal;
}

export function settleUp(bal: Record<string, number>) {
  const debtors = Object.entries(bal).filter(([, v]) => v < -1).map(([p, v]) => ({ p, v: -v })).sort((a, b) => b.v - a.v);
  const creditors = Object.entries(bal).filter(([, v]) => v > 1).map(([p, v]) => ({ p, v })).sort((a, b) => b.v - a.v);
  const out: { from: string; to: string; czk: number }[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const x = Math.min(debtors[i].v, creditors[j].v);
    out.push({ from: debtors[i].p, to: creditors[j].p, czk: x });
    debtors[i].v -= x;
    creditors[j].v -= x;
    if (debtors[i].v < 1) i++;
    if (creditors[j].v < 1) j++;
  }
  return out;
}

export function ExpensesView() {
  const db = useDB();
  const me = useMe()!;
  useRates();
  const [cur, setCur] = useState('CZK');
  const bal = balances(db.expenses, db.people.map((p) => p.id));
  const total = db.expenses.reduce((s, e) => s + toCZK(e.amount, e.currency), 0);
  const transfers = settleUp(bal);
  const show = (czk: number) => fmtMoney(fromCZK(czk, cur), cur);
  return (
    <>
      <SubBar
        title="Expenses & split"
        sub="Converted to CZK at current rates"
        right={
          <select className="input cur-sel" value={cur} onChange={(e) => setCur(e.target.value)} aria-label="Display currency">
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        }
      />
      <div className="wrap">
        <div className="card pad exp-sum">
          <div>
            <div className="eyebrow">Crew total</div>
            <div className="exp-total tnum">{show(total)}</div>
          </div>
          <div className="exp-bal">
            {db.people.map((p) => (
              <div key={p.id} className="exp-bal-row">
                <Avatar person={p} size="sm" />
                <span className="grow">{p.name}</span>
                <span className={`tnum ${bal[p.id] > 1 ? 'pos' : bal[p.id] < -1 ? 'neg' : 'muted'}`}>
                  {bal[p.id] > 1 ? '+' : ''}
                  {show(bal[p.id])}
                </span>
              </div>
            ))}
          </div>
        </div>
        {transfers.length > 0 && (
          <section className="section">
            <div className="section-h">
              <h2>Settle up</h2>
            </div>
            <div className="card list">
              {transfers.map((x, i) => (
                <div key={i} className="row">
                  <Avatar person={db.person[x.from]} size="md" />
                  <ArrowRight className="chev" aria-hidden />
                  <Avatar person={db.person[x.to]} size="md" />
                  <span className="grow">
                    <b>{db.person[x.from]?.name}</b> pays <b>{db.person[x.to]?.name}</b>
                  </span>
                  <b className="tnum">{show(x.czk)}</b>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="section">
          <div className="section-h">
            <h2>All expenses</h2>
          </div>
          <div className="card list">
            {db.expenses.length === 0 && (
              <Empty icon={<Receipt />}>
                No expenses yet. Add the apartment, tickets, rounds of beer… The app works out who owes whom.
              </Empty>
            )}
            {db.expenses.map((e) => (
              <button key={e.id} className="row" onClick={() => openSheet({ t: 'expenseEdit', id: e.id })}>
                <Avatar person={db.person[e.paidBy]} size="md" />
                <span className="grow">
                  <span className="t">{e.title}</span>
                  <span className="s">
                    {db.person[e.paidBy]?.name} paid · split {e.split.length === db.people.length ? 'between all' : e.split.map((p) => db.person[p]?.name).join(', ')} · {fmtDayShort(Date.parse(e.date))}
                  </span>
                </span>
                <span className="tnum" style={{ fontWeight: 700 }}>
                  {fmtMoney(e.amount, e.currency)}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
      <button className="fab" onClick={() => openSheet({ t: 'expenseEdit' })} aria-label={`Add expense paid by ${db.person[me]?.name}`}>
        <Plus aria-hidden /> Expense
      </button>
    </>
  );
}
