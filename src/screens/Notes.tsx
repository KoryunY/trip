import { Pin, Plus } from 'lucide-react';
import { useDB } from '../lib/store';
import { openSheet } from '../lib/ui';
import { SubBar } from './More';
import { Avatar } from '../components/ui';

export function NotesView() {
  const db = useDB();
  const notes = [...db.notes].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  return (
    <>
      <SubBar
        title="Shared notes"
        sub="Everyone can edit"
        right={
          <button className="icon-btn" onClick={() => openSheet({ t: 'noteEdit' })} aria-label="New note">
            <Plus />
          </button>
        }
      />
      <div className="wrap">
        {notes.map((n) => (
          <button key={n.id} className="card pad note" onClick={() => openSheet({ t: 'noteEdit', id: n.id })}>
            <span className="note-h">
              {n.pinned && <Pin aria-hidden />}
              <b>{n.title}</b>
              {n.by && <Avatar person={db.person[n.by]} size="sm" />}
            </span>
            <span className="prose">{n.body}</span>
          </button>
        ))}
      </div>
    </>
  );
}
