import { CalendarPlus, CloudDownload, Download, LogOut, MapPinned, Moon, RefreshCw, Smartphone, Trash2, Upload, Radio, Server } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, Segmented, Toggle, toast } from '../components/ui';
import { buildICS, download } from '../lib/ics';
import { startWatch } from '../lib/location';
import { cancelOffline, clearOffline, downloadOffline, offlineCacheSize, tileList, useOffline } from '../lib/offline';
import {
  clearLocalCache,
  exportBackup,
  importBackup,
  serverInfo,
  setMe,
  setSettings,
  useDB,
  useMe,
  useSettings,
} from '../lib/store';
import { poll, flush, stopPresence, useSyncState } from '../lib/sync';
import { relTime } from '../lib/time';
import { SubBar } from './More';

export function SettingsView() {
  const db = useDB();
  const me = useMe()!;
  const s = useSettings();
  const sync = useSyncState();
  const off = useOffline();
  const [usage, setUsage] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [standalone] = useState(() => matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true);
  useEffect(() => {
    offlineCacheSize().then(setUsage);
  }, [off.finishedAt, off.running]);
  const tiles = tileList().length;
  const pct = off.total ? Math.round((off.done / off.total) * 100) : 0;
  const statusText: Record<string, string> = {
    idle: 'Connecting…',
    syncing: 'Syncing…',
    synced: 'Synced with the crew',
    offline: 'Offline: changes are saved on this phone and sync later',
    local: 'No server yet: changes stay on this phone',
    error: `Sync error: ${sync.error ?? ''}`,
  };
  return (
    <>
      <SubBar title="Settings" />
      <div className="wrap settings">
        {/* identity */}
        <section className="section" style={{ marginTop: 8 }}>
          <div className="section-h">
            <h2>You are</h2>
          </div>
          <div className="card pad">
            <div className="who-pick">
              {db.people.map((p) => (
                <button key={p.id} className={`who-opt ${p.id === me ? 'on' : ''}`} onClick={() => setMe(p.id)} aria-pressed={p.id === me}>
                  <Avatar person={p} size="lg" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
            <button className="btn sm ghost" style={{ marginTop: 10 }} onClick={() => setMe(null)}>
              <LogOut /> Sign out
            </button>
          </div>
        </section>

        {/* offline */}
        <section className="section">
          <div className="section-h">
            <h2>Offline map</h2>
          </div>
          <div className="card pad form">
            <p className="ink2" style={{ fontSize: 14 }}>
              Saves street-level map tiles for Prague (plus Plzeň, Kutná Hora and a Europe overview) on this phone, so the map, places and the
              crew timelapse work with no internet. ~{tiles.toLocaleString()} tiles, roughly 25–60 MB. Use Wi-Fi.
            </p>
            {off.running ? (
              <>
                <div className="progress" style={{ height: 10 }}>
                  <i style={{ width: `${pct}%`, background: 'var(--info)' }} />
                </div>
                <div className="muted tnum" style={{ fontSize: 13 }}>
                  {off.done.toLocaleString()} / {off.total.toLocaleString()} · {(off.bytes / 1e6).toFixed(1)} MB{off.failed ? ` · ${off.failed} failed` : ''}
                </div>
                <button className="btn" onClick={cancelOffline}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                {off.finishedAt && (
                  <div className="banner ok">
                    <MapPinned aria-hidden />
                    <span>
                      Offline map saved {relTime(off.finishedAt, Date.now())}
                      {off.failed ? ` (${off.failed} tiles failed, run again to retry)` : ''}.
                    </span>
                  </div>
                )}
                {off.error && <div className="banner danger">{off.error}</div>}
                <button className="btn primary" onClick={() => downloadOffline()}>
                  <CloudDownload /> {off.finishedAt ? 'Update offline map' : 'Download offline map'}
                </button>
                {off.finishedAt && (
                  <button className="btn ghost sm" onClick={() => clearOffline().then(() => toast('Offline map removed'))}>
                    <Trash2 /> Remove offline map
                  </button>
                )}
              </>
            )}
            {usage != null && <div className="muted" style={{ fontSize: 12.5 }}>Storage used by this app: {(usage / 1e6).toFixed(1)} MB</div>}
          </div>
        </section>

        {/* live location */}
        <section className="section">
          <div className="section-h">
            <h2>Live location</h2>
          </div>
          <div className="card pad">
            <div className="set-row">
              <Radio aria-hidden />
              <span className="grow">
                <b>Share my live location with the crew</b>
                <span className="muted d-block">While the app is open, your GPS dot appears on everyone’s map (updates ~every minute).</span>
              </span>
              <Toggle
                on={s.shareLocation}
                label="Share live location"
                onChange={(v) => {
                  setSettings({ shareLocation: v });
                  if (v) {
                    startWatch();
                    toast('Sharing your location while the app is open');
                  } else void stopPresence();
                }}
              />
            </div>
          </div>
        </section>

        {/* sync */}
        <section className="section">
          <div className="section-h">
            <h2>Sync</h2>
          </div>
          <div className="card pad form">
            <div className="set-row">
              <Server aria-hidden />
              <span className="grow">
                <b>{statusText[sync.status]}</b>
                <span className="muted d-block">
                  {sync.lastOk ? `Last sync ${relTime(sync.lastOk, Date.now())}` : 'Not synced yet'}
                  {sync.pending ? ` · ${sync.pending} change(s) waiting` : ''} · rev {serverInfo().rev}
                  {sync.backend ? ` · ${sync.backend}` : ''}
                </span>
              </span>
              <button
                className="icon-btn"
                aria-label="Sync now"
                onClick={async () => {
                  await flush();
                  await poll();
                  toast('Synced');
                }}
              >
                <RefreshCw />
              </button>
            </div>
            <details>
              <summary className="muted" style={{ fontSize: 13.5 }}>
                Advanced: server URL & trip key
              </summary>
              <div className="form" style={{ marginTop: 12 }}>
                <div className="field">
                  <label htmlFor="api">Server URL (blank = this site)</label>
                  <input id="api" placeholder="https://… (e.g. a Cloudflare Worker)" defaultValue={s.apiBase} onBlur={(e) => setSettings({ apiBase: e.target.value.trim() })} />
                </div>
                <div className="field">
                  <label htmlFor="key">Trip key (only if the server requires one)</label>
                  <input id="key" defaultValue={s.tripKey} onBlur={(e) => setSettings({ tripKey: e.target.value.trim() })} />
                </div>
              </div>
            </details>
          </div>
        </section>

        {/* appearance */}
        <section className="section">
          <div className="section-h">
            <h2>Appearance</h2>
          </div>
          <div className="card pad form">
            <div className="field">
              <span className="lbl">
                <Moon style={{ display: 'inline', width: 14, verticalAlign: -2 }} /> Theme
              </span>
              <Segmented
                label="Theme"
                value={s.theme}
                onChange={(v) => setSettings({ theme: v })}
                options={[
                  { v: 'auto', label: 'Auto' },
                  { v: 'light', label: 'Light' },
                  { v: 'dark', label: 'Dark' },
                ]}
              />
            </div>
            <div className="field">
              <span className="lbl">Map style</span>
              <Segmented
                label="Map style"
                value={s.mapStyle}
                onChange={(v) => setSettings({ mapStyle: v })}
                options={[
                  { v: 'liberty', label: 'Detailed' },
                  { v: 'positron', label: 'Clean' },
                  { v: 'bright', label: 'Bright' },
                  { v: 'dark', label: 'Dark' },
                ]}
              />
            </div>
          </div>
        </section>

        {/* calendar & backup */}
        <section className="section">
          <div className="section-h">
            <h2>Calendar & backup</h2>
          </div>
          <div className="card pad form">
            <button
              className="btn"
              onClick={() => {
                const mine = db.events.filter((e) => e.people.includes(me));
                download(`prague-${me}.ics`, buildICS(mine, db.place, `Prague Crew · ${db.person[me]?.name}`), 'text/calendar');
              }}
            >
              <CalendarPlus /> Add my plan to phone calendar (.ics)
            </button>
            <p className="muted" style={{ fontSize: 12.5, marginTop: -6 }}>
              Gives reminders 30 min before (2 h before flights/concert). Re-export after big plan changes.
            </p>
            <div className="grid2">
              <button className="btn" onClick={() => download(`prague-crew-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(exportBackup(), null, 2), 'application/json')}>
                <Download /> Backup
              </button>
              <button className="btn" onClick={() => fileRef.current?.click()}>
                <Upload /> Restore
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const n = importBackup(JSON.parse(await f.text()));
                  toast(`Restored ${n} records`);
                } catch (err) {
                  toast(String((err as Error).message));
                }
                e.target.value = '';
              }}
            />
            <button
              className="btn ghost sm"
              onClick={() => {
                if (confirm('Clear the cached copy on this phone and re-download from the server? Unsynced changes are lost.')) {
                  clearLocalCache();
                  void poll();
                }
              }}
            >
              <Trash2 /> Reset local cache
            </button>
          </div>
        </section>

        {!standalone && (
          <section className="section">
            <div className="banner info">
              <Smartphone aria-hidden />
              <span>
                <b>Install it like an app:</b> iPhone → Safari Share → “Add to Home Screen”. Android → Chrome ⋮ → “Install app”. Opens full-screen and works offline.
              </span>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
