import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Expense, Note } from '../../../shared/types';
import { CURRENCIES, fmtMoney, toCZK } from '../../lib/rates';
import { remove, save, uid, useDB, useMe } from '../../lib/store';
import { dayKey, isoInTz, zonedToUtc } from '../../lib/time';
import { Sheet, toast } from '../ui';
import { PeoplePicker } from './PlacePicker';

export function ExpenseEditor({ id, onClose }: { id?: string; onClose: () => void }) {
  const db = useDB();
  const me = useMe()!;
  const existing = id ? db.expenses.find((e) => e.id === id) : undefined;
  const [f, setF] = useState<Expense>(
    existing ?? { id: uid('x-'), title: '', amount: 0, currency: 'CZK', paidBy: me, split: db.people.map((p) => p.id), date: new Date().toISOString() },
  );
  const [amountStr, setAmountStr] = useState(existing ? String(existing.amount) : '');
  const set = (p: Partial<Expense>) => setF((x) => ({ ...x, ...p }));
  const amount = Number(amountStr.replace(',', '.'));
  const valid = f.title.trim() && amount > 0 && f.split.length > 0;
  const submit = () => {
    if (!valid) return;
    save('expenses', { ...f, title: f.title.trim(), amount });
    toast(existing ? 'Expense saved' : 'Expense added');
    onClose();
  };
  return (
    <Sheet
      title={existing ? 'Edit expense' : 'New expense'}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" style={{ flex: 1 }} disabled={!valid} onClick={submit}>
            Save
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
          <label htmlFor="x-title">What</label>
          <input id="x-title" value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="Beers at Lokál, Uber, apartment…" autoFocus={!existing} />
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="x-amt">Amount</label>
            <input id="x-amt" inputMode="decimal" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label htmlFor="x-cur">Currency</label>
            <select id="x-cur" value={f.currency} onChange={(e) => set({ currency: e.target.value })}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        {amount > 0 && f.currency !== 'CZK' && <p className="muted" style={{ marginTop: -6, fontSize: 13 }}>≈ {fmtMoney(toCZK(amount, f.currency), 'CZK')}</p>}
        <div className="field">
          <label htmlFor="x-paid">Paid by</label>
          <select id="x-paid" value={f.paidBy} onChange={(e) => set({ paidBy: e.target.value })}>
            {db.people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="lbl">Split between</span>
          <PeoplePicker value={f.split} onChange={(v) => set({ split: v })} />
          {amount > 0 && f.split.length > 0 && (
            <span className="muted" style={{ fontSize: 13 }}>
              {fmtMoney(amount / f.split.length, f.currency)} each
            </span>
          )}
        </div>
        <div className="field">
          <label htmlFor="x-date">Date</label>
          <input
            id="x-date"
            type="date"
            value={dayKey(Date.parse(f.date))}
            onChange={(e) => e.target.value && set({ date: isoInTz(zonedToUtc(e.target.value, '12:00')) })}
          />
        </div>
        <div className="field">
          <label htmlFor="x-note">Note</label>
          <input id="x-note" value={f.note ?? ''} onChange={(e) => set({ note: e.target.value })} />
        </div>
        {existing && (
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              const copy = { ...existing };
              remove('expenses', existing.id);
              onClose();
              toast('Expense deleted', { label: 'Undo', run: () => save('expenses', copy) });
            }}
          >
            <Trash2 /> Delete expense
          </button>
        )}
      </form>
    </Sheet>
  );
}

export function NoteEditor({ id, onClose }: { id?: string; onClose: () => void }) {
  const db = useDB();
  const me = useMe()!;
  const existing = id ? db.notes.find((n) => n.id === id) : undefined;
  const [f, setF] = useState<Note>(existing ?? { id: uid('n-'), title: '', body: '', by: me });
  const set = (p: Partial<Note>) => setF((x) => ({ ...x, ...p }));
  const submit = () => {
    if (!f.title.trim()) return;
    save('notes', { ...f, title: f.title.trim() });
    onClose();
  };
  return (
    <Sheet
      title={existing ? 'Edit note' : 'New note'}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" style={{ flex: 1 }} disabled={!f.title.trim()} onClick={submit}>
            Save
          </button>
        </>
      }
    >
      <div className="form">
        <div className="field">
          <label htmlFor="n-title">Title</label>
          <input id="n-title" value={f.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="n-body">Note</label>
          <textarea id="n-body" style={{ minHeight: 220 }} value={f.body} onChange={(e) => set({ body: e.target.value })} />
        </div>
        <label className="set-row">
          <input type="checkbox" checked={Boolean(f.pinned)} onChange={(e) => set({ pinned: e.target.checked })} /> Pin to top
        </label>
        {existing && (
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              remove('notes', existing.id);
              onClose();
            }}
          >
            <Trash2 /> Delete note
          </button>
        )}
      </div>
    </Sheet>
  );
}
