import { BookOpen, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../../shared/types';
import { SyncBadge } from '../components/SyncBadge';
import { Avatar, CheckBox, Segmented } from '../components/ui';
import { TASK_CAT, TASK_CAT_ORDER } from '../lib/meta';
import { go } from '../lib/router';
import { save, useDB, useMe } from '../lib/store';
import { taskComplete, taskDoneFor, taskStats } from '../lib/trip';
import { openSheet } from '../lib/ui';

export function toggleTask(task: Task, pid: string) {
  const done = { ...(task.done ?? {}) };
  if (task.mode === 'any') {
    if (Object.keys(done).length) for (const k of Object.keys(done)) delete done[k];
    else done[pid] = Date.now();
  } else if (done[pid]) delete done[pid];
  else done[pid] = Date.now();
  save('tasks', { ...task, done });
}

export function PrepScreen() {
  const db = useDB();
  const me = useMe()!;
  const [scope, setScope] = useState<'mine' | 'all' | 'open'>('mine');
  const tasks = db.tasks.filter((t) => (scope === 'mine' ? t.assignees.includes(me) : scope === 'open' ? !taskComplete(t) : true));
  const groups = TASK_CAT_ORDER.map((c) => ({ c, items: tasks.filter((t) => t.category === c) })).filter((g) => g.items.length);
  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
          <div className="appbar-title">
            <h1>Prep</h1>
            <div className="sub">Checklist for all three of us</div>
          </div>
          <SyncBadge />
        </div>
      </header>
      <div className="wrap">
        <div className="card pad crew-progress">
          {db.people.map((p) => {
            const s = taskStats(db.tasks, p.id);
            return (
              <div key={p.id} className="cp-row">
                <Avatar person={p} size="md" />
                <span className="cp-name">{p.name}</span>
                <span className="progress grow">
                  <i style={{ width: `${s.pct * 100}%`, background: p.color }} />
                </span>
                <span className="tnum cp-n">
                  {s.done}/{s.total}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ margin: '14px 0 4px' }}>
          <Segmented
            label="Which tasks"
            value={scope}
            onChange={setScope}
            options={[
              { v: 'mine', label: 'Mine' },
              { v: 'open', label: 'Open' },
              { v: 'all', label: 'Everything' },
            ]}
          />
        </div>
        {groups.map(({ c, items }) => {
          const Icon = TASK_CAT[c].icon;
          return (
            <section key={c} className="section">
              <div className="section-h">
                <h2 className="cat-h">
                  <Icon aria-hidden /> {TASK_CAT[c].label}
                </h2>
                <span className="muted tnum" style={{ fontSize: 13 }}>
                  {items.filter((t) => (scope === 'mine' ? taskDoneFor(t, me) : taskComplete(t))).length}/{items.length}
                </span>
              </div>
              <div className="card list">
                {items.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </section>
          );
        })}
        {groups.length === 0 && <div className="empty">Nothing here. Nice work! 🎉</div>}
        <button className="btn block" style={{ marginTop: 22 }} onClick={() => go('guides')}>
          <BookOpen /> Read the guides (baggage, eSIM, airport…)
        </button>
      </div>
      <button className="fab" onClick={() => openSheet({ t: 'taskEdit', draft: { assignees: [me] } })}>
        <Plus aria-hidden /> Task
      </button>
    </>
  );
}

export function TaskRow({ task }: { task: Task }) {
  const db = useDB();
  const me = useMe()!;
  const mineToDo = task.assignees.includes(me) || task.mode === 'any';
  const doneMe = taskDoneFor(task, me);
  const complete = taskComplete(task);
  return (
    <div className={`row task ${complete ? 'complete' : ''}`}>
      {mineToDo ? (
        <CheckBox on={doneMe} onChange={() => toggleTask(task, me)} label={`Mark “${task.title}” ${doneMe ? 'not done' : 'done'}`} />
      ) : (
        <span className="check ghost" aria-hidden />
      )}
      <button className="grow task-main" onClick={() => openSheet({ t: 'task', id: task.id })}>
        <span className="t">
          {task.title}
          {task.priority === 'high' && !complete && <span className="pill danger task-prio">important</span>}
        </span>
        <span className="task-who">
          {task.assignees.map((pid) => (
            <Avatar key={pid} person={db.person[pid]} size="sm" done={task.mode === 'any' ? complete : Boolean(task.done?.[pid])} />
          ))}
          {task.mode === 'any' && <span className="s">anyone</span>}
          {task.due && <span className="s">· by {new Date(task.due).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
        </span>
      </button>
      <ChevronRight className="chev" aria-hidden />
    </div>
  );
}
