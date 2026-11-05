import { Cloud, CloudOff, RefreshCw, TriangleAlert, Smartphone } from 'lucide-react';
import { go } from '../lib/router';
import { useSyncState } from '../lib/sync';

export function SyncBadge() {
  const s = useSyncState();
  const map = {
    idle: { icon: RefreshCw, label: 'Connecting', cls: '' },
    syncing: { icon: RefreshCw, label: 'Syncing', cls: 'spin' },
    synced: { icon: Cloud, label: 'Synced', cls: 'ok' },
    offline: { icon: CloudOff, label: 'Offline', cls: 'off' },
    local: { icon: Smartphone, label: 'This phone only', cls: 'off' },
    error: { icon: TriangleAlert, label: 'Sync error', cls: 'err' },
  } as const;
  const m = map[s.status];
  const Icon = m.icon;
  return (
    <button className={`sync-badge ${m.cls}`} onClick={() => go('settings')} aria-label={`${m.label}${s.pending ? `, ${s.pending} unsynced changes` : ''}`}>
      <Icon aria-hidden />
      {s.pending > 0 && <span className="n">{s.pending}</span>}
    </button>
  );
}
