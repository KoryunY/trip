import { BookOpen, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Task, TaskCategory } from '../../../shared/types';
import { GUIDES } from '../../data/guides';
import { TASK_CAT, TASK_CAT_ORDER } from '../../lib/meta';
import { go } from '../../lib/router';
import { remove, save, uid, useDB, useMe } from '../../lib/store';
import { relTime } from '../../lib/time';
import { taskComplete, taskDoneFor } from '../../lib/trip';
import { closeAllSheets, replaceSheet } from '../../lib/ui';
import { toggleTask } from '../../screens/Prep';
import { Avatar, CheckBox, Segmented, Sheet, toast } from '../ui';
import { PeoplePicker } from './PlacePicker';

export function TaskSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const db = useDB();
  const me = useMe()!;
  const task = db.tasks.find((t) => t.id === id);
  if (!task) {
    return (
      <Sheet title="Task removed" onClose={onClose}>
        <p className="muted">This task no longer exists.</p>
      </Sheet>
    );
  }
  const guide = task.guide ? GUIDES.find((g) => g.id === task.guide) : undefined;
  const complete = taskComplete(task);
  return (
    <Sheet
      title={task.title}
      onClose={onClose}
      actions={
        <button className="icon-btn" aria-label="Edit task" onClick={() => replaceSheet({ t: 'taskEdit', id: task.id })}>
          <Pencil />
        </button>
      }
    >
      <div className="form">
        <div className="evd-pills">
          <span className="pill">{TASK_CAT[task.category]?.label}</span>
          {task.priority === 'high' && <span className="pill danger">important</span>}
          {complete ? <span className="pill ok">done</span> : <span className="pill warn">open</span>}
          {task.due && <span className="pill info">by {new Date(task.due).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
        </div>
        {task.details && <p className="prose">{task.details}</p>}
        <div className="card list">
          {(task.mode === 'any' ? [me] : task.assignees).map((pid) => {
            const p = db.person[pid];
            const done = task.mode === 'any' ? complete : taskDoneFor(task, pid);
            const at = task.done?.[pid];
            return (
              <div key={pid} className="row">
                <CheckBox on={done} label={`${p?.name} done`} onChange={() => toggleTask(task, pid)} />
                <Avatar person={p} size="md" />
                <span className="grow">
                  <span className="t">{task.mode === 'any' ? 'Anyone of us' : p?.name}</span>
                  <span className="s">{done ? (at ? `done ${relTime(at, Date.now())}` : 'done') : 'not yet'}</span>
                </span>
              </div>
            );
          })}
        </div>
        {guide && (
          <button
            className="btn"
            onClick={() => {
              closeAllSheets();
              go(`guide/${guide.id}`);
            }}
          >
            <BookOpen /> Guide: {guide.title}
          </button>
        )}
        {task.link && (
          <a className="btn" href={task.link} target="_blank" rel="noreferrer">
            <ExternalLink /> Open link
          </a>
        )}
      </div>
    </Sheet>
  );
}

export function TaskEditor({ id, draft, onClose }: { id?: string; draft?: Partial<Task>; onClose: () => void }) {
  const db = useDB();
  const me = useMe()!;
  const existing = id ? db.tasks.find((t) => t.id === id) : undefined;
  const [f, setF] = useState<Task>(existing ?? { id: uid('t-'), title: '', category: 'other', assignees: [me], mode: 'each', priority: 'normal', ...draft });
  const set = (p: Partial<Task>) => setF((x) => ({ ...x, ...p }));
  const valid = f.title.trim() && f.assignees.length > 0;
  const submit = () => {
    if (!valid) return;
    save('tasks', { ...f, title: f.title.trim() });
    toast(existing ? 'Task saved' : 'Task added');
    onClose();
  };
  return (
    <Sheet
      title={existing ? 'Edit task' : 'New task'}
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
          <label htmlFor="tk-title">Task</label>
          <input id="tk-title" value={f.title} onChange={(e) => set({ title: e.target.value })} autoFocus={!existing} />
        </div>
        <div className="field">
          <label htmlFor="tk-details">Details</label>
          <textarea id="tk-details" value={f.details ?? ''} onChange={(e) => set({ details: e.target.value })} />
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="tk-cat">Category</label>
            <select id="tk-cat" value={f.category} onChange={(e) => set({ category: e.target.value as TaskCategory })}>
              {TASK_CAT_ORDER.map((c) => (
                <option key={c} value={c}>
                  {TASK_CAT[c].label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="tk-due">Due</label>
            <input id="tk-due" type="date" value={f.due ?? ''} onChange={(e) => set({ due: e.target.value || null })} />
          </div>
        </div>
        <div className="field">
          <span className="lbl">Who</span>
          <PeoplePicker value={f.assignees} onChange={(v) => set({ assignees: v })} />
        </div>
        <div className="field">
          <span className="lbl">Done when</span>
          <Segmented
            label="Completion mode"
            value={f.mode}
            onChange={(v) => set({ mode: v })}
            options={[
              { v: 'each', label: 'Each person ticks' },
              { v: 'any', label: 'Anyone does it' },
            ]}
          />
        </div>
        <div className="field">
          <span className="lbl">Priority</span>
          <Segmented
            label="Priority"
            value={f.priority ?? 'normal'}
            onChange={(v) => set({ priority: v })}
            options={[
              { v: 'high', label: 'Important' },
              { v: 'normal', label: 'Normal' },
              { v: 'low', label: 'Low' },
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="tk-link">Link</label>
          <input id="tk-link" type="url" value={f.link ?? ''} onChange={(e) => set({ link: e.target.value || null })} />
        </div>
        {existing && (
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              const copy = { ...existing };
              remove('tasks', existing.id);
              onClose();
              toast('Task deleted', { label: 'Undo', run: () => save('tasks', copy) });
            }}
          >
            <Trash2 /> Delete task
          </button>
        )}
      </form>
    </Sheet>
  );
}
