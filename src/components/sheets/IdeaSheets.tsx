import { CalendarPlus, Pencil, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { EventKind, Idea } from '../../../shared/types';
import { KIND, KIND_ORDER } from '../../lib/meta';
import { remove, save, uid, useDB, useMe } from '../../lib/store';
import { voteScore } from '../../lib/trip';
import { openSheet, replaceSheet } from '../../lib/ui';
import { Avatar, Sheet, toast } from '../ui';
import { PlacePicker } from './PlacePicker';

export function IdeaSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const db = useDB();
  const me = useMe()!;
  const idea = db.ideas.find((i) => i.id === id);
  if (!idea) {
    return (
      <Sheet title="Idea removed" onClose={onClose}>
        <p className="muted">Gone.</p>
      </Sheet>
    );
  }
  const place = idea.placeId ? db.place[idea.placeId] : undefined;
  const my = idea.votes?.[me] ?? 0;
  const vote = (v: number) => {
    const votes = { ...(idea.votes ?? {}) };
    if (my === v) delete votes[me];
    else votes[me] = v;
    save('ideas', { ...idea, votes });
  };
  return (
    <Sheet
      title={idea.title}
      onClose={onClose}
      actions={
        <button className="icon-btn" aria-label="Edit idea" onClick={() => replaceSheet({ t: 'ideaEdit', id: idea.id })}>
          <Pencil />
        </button>
      }
    >
      <div className="form">
        <div className="evd-pills">
          <span className="pill">{KIND[idea.kind]?.label}</span>
          {idea.durationMin && <span className="pill">~{Math.round(idea.durationMin / 60)} h</span>}
          {idea.cost && <span className="pill warn">{idea.cost}</span>}
        </div>
        {idea.notes && <p className="prose">{idea.notes}</p>}
        {place && (
          <button className="link-row card pad" onClick={() => openSheet({ t: 'place', id: place.id })}>
            📍 <b>{place.name}</b>
          </button>
        )}
        <div className="pl-votes">
          <button className={`vote ${my === 1 ? 'on' : ''}`} onClick={() => vote(1)} aria-label="Vote up" aria-pressed={my === 1}>
            <ThumbsUp />
          </button>
          <button className={`vote down ${my === -1 ? 'on' : ''}`} onClick={() => vote(-1)} aria-label="Vote down" aria-pressed={my === -1}>
            <ThumbsDown />
          </button>
          <span className="tnum score">{voteScore(idea.votes)}</span>
          {Object.entries(idea.votes ?? {}).map(([pid, v]) => (
            <span key={pid} className="vote-who">
              <Avatar person={db.person[pid]} size="sm" /> {v > 0 ? '👍' : '👎'}
            </span>
          ))}
        </div>
        <button
          className="btn accent"
          onClick={() => {
            const newId = uid('e-');
            save('ideas', { ...idea, scheduledEventId: newId });
            replaceSheet({
              t: 'eventEdit',
              draft: {
                id: newId,
                title: idea.title,
                kind: idea.kind,
                placeId: idea.placeId,
                notes: idea.notes,
                cost: idea.cost,
                start: '2026-11-20T14:00:00+01:00',
                end: new Date(Date.parse('2026-11-20T14:00:00+01:00') + (idea.durationMin ?? 120) * 60_000).toISOString(),
              },
            });
          }}
        >
          <CalendarPlus /> Schedule it
        </button>
      </div>
    </Sheet>
  );
}

export function IdeaEditor({ id, draft, onClose }: { id?: string; draft?: Partial<Idea>; onClose: () => void }) {
  const db = useDB();
  const me = useMe()!;
  const existing = id ? db.ideas.find((i) => i.id === id) : undefined;
  const [f, setF] = useState<Idea>(existing ?? { id: uid('i-'), title: '', kind: 'sight', votes: { [me]: 1 }, addedBy: me, ...draft });
  const set = (p: Partial<Idea>) => setF((x) => ({ ...x, ...p }));
  const submit = () => {
    if (!f.title.trim()) return;
    save('ideas', { ...f, title: f.title.trim() });
    toast(existing ? 'Idea saved' : 'Idea added: now get votes!');
    onClose();
  };
  return (
    <Sheet
      title={existing ? 'Edit idea' : 'New idea'}
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
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="field">
          <label htmlFor="id-title">Idea</label>
          <input id="id-title" value={f.title} onChange={(e) => set({ title: e.target.value })} autoFocus={!existing} />
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="id-kind">Type</label>
            <select id="id-kind" value={f.kind} onChange={(e) => set({ kind: e.target.value as EventKind })}>
              {KIND_ORDER.map((k) => (
                <option key={k} value={k}>
                  {KIND[k].label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="id-dur">Hours needed</label>
            <input id="id-dur" type="number" min={0.5} step={0.5} value={(f.durationMin ?? 120) / 60} onChange={(e) => set({ durationMin: Math.round(Number(e.target.value) * 60) })} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="id-place">Place</label>
          <PlacePicker id="id-place" value={f.placeId} onChange={(v) => set({ placeId: v })} />
        </div>
        <div className="field">
          <label htmlFor="id-cost">Cost</label>
          <input id="id-cost" value={f.cost ?? ''} onChange={(e) => set({ cost: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="id-notes">Notes</label>
          <textarea id="id-notes" value={f.notes ?? ''} onChange={(e) => set({ notes: e.target.value })} />
        </div>
        {existing && (
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              remove('ideas', existing.id);
              onClose();
            }}
          >
            <Trash2 /> Delete idea
          </button>
        )}
      </form>
    </Sheet>
  );
}
