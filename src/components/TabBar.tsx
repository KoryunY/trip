import { CalendarDays, ClipboardCheck, House, LayoutGrid, Map } from 'lucide-react';
import { go, useRoute, type Tab } from '../lib/router';
import { useDB, useMe } from '../lib/store';
import { myOpenTasks } from '../lib/trip';

const TABS: { id: Tab; label: string; icon: typeof House }[] = [
  { id: 'now', label: 'Now', icon: House },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'plan', label: 'Plan', icon: CalendarDays },
  { id: 'prep', label: 'Prep', icon: ClipboardCheck },
  { id: 'more', label: 'More', icon: LayoutGrid },
];

export function TabBar() {
  const route = useRoute();
  const db = useDB();
  const me = useMe();
  const urgent = me ? myOpenTasks(db.tasks, me).filter((t) => t.priority === 'high').length : 0;
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar-inner">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = route.tab === t.id;
          return (
            <a
              key={t.id}
              href={`#/${t.id}`}
              className="tab"
              aria-current={active ? 'page' : undefined}
              onClick={(e) => {
                // tapping the active tab returns to its root
                if (active && route.path.length) {
                  e.preventDefault();
                  go(t.id);
                }
              }}
            >
              <span className="tab-ico">
                <Icon aria-hidden />
              </span>
              {t.label}
              {t.id === 'prep' && urgent > 0 && <span className="dot">{urgent}</span>}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
