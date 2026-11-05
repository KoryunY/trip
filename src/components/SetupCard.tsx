import { CalendarPlus, CloudDownload, Radio, Smartphone, X, Check } from 'lucide-react';
import { useState } from 'react';
import { buildICS, download } from '../lib/ics';
import { startWatch } from '../lib/location';
import { downloadOffline, useOffline } from '../lib/offline';
import { setSettings, useDB, useMe, useSettings } from '../lib/store';
import { go } from '../lib/router';
import { toast } from './ui';

const LS = 'pc.setup.v1';
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(LS) || '{}') as { hidden?: boolean; ics?: boolean };
  } catch {
    return {};
  }
};
const write = (v: object) => {
  try {
    localStorage.setItem(LS, JSON.stringify({ ...read(), ...v }));
  } catch {
    /* ignore */
  }
};

export function SetupCard() {
  const db = useDB();
  const me = useMe()!;
  const s = useSettings();
  const off = useOffline();
  const [st, setSt] = useState(read);
  const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
  const items = [
    {
      done: Boolean(off.finishedAt),
      icon: CloudDownload,
      label: off.running ? `Downloading offline map… ${off.total ? Math.round((off.done / off.total) * 100) : 0}%` : 'Download the offline map',
      run: () => void downloadOffline(),
    },
    {
      done: s.shareLocation,
      icon: Radio,
      label: 'Share live location with the crew',
      run: () => {
        setSettings({ shareLocation: true });
        startWatch();
        toast('Sharing your location while the app is open');
      },
    },
    {
      done: Boolean(st.ics),
      icon: CalendarPlus,
      label: 'Add my plan to the phone calendar',
      run: () => {
        download(`prague-${me}.ics`, buildICS(db.events.filter((e) => e.people.includes(me)), db.place, `Prague Crew · ${db.person[me]?.name}`), 'text/calendar');
        write({ ics: true });
        setSt(read());
      },
    },
    { done: standalone, icon: Smartphone, label: 'Install on the home screen', run: () => go('settings') },
  ];
  const left = items.filter((i) => !i.done).length;
  if (st.hidden || left === 0) return null;
  return (
    <div className="card pad setup">
      <div className="setup-h">
        <b>Get your phone trip-ready</b>
        <span className="muted tnum">
          {items.length - left}/{items.length}
        </span>
        <button
          className="icon-btn"
          style={{ width: 34, height: 34 }}
          aria-label="Hide"
          onClick={() => {
            write({ hidden: true });
            setSt(read());
          }}
        >
          <X />
        </button>
      </div>
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <button key={it.label} className={`setup-item ${it.done ? 'done' : ''}`} onClick={it.done ? undefined : it.run} disabled={it.done}>
            <span className="setup-ico">{it.done ? <Check /> : <Icon />}</span>
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
