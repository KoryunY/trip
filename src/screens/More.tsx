import { ArrowLeft, Share2, BookOpen, ChevronRight, Lightbulb, MapPin, Receipt, Settings as SettingsIcon, StickyNote, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { SyncBadge } from '../components/SyncBadge';
import { Avatar, toast } from '../components/ui';
import { shareApp } from '../components/InstallBanner';
import { GUIDES } from '../data/guides';
import { back, go, useRoute } from '../lib/router';
import { useDB } from '../lib/store';
import { GuideView, GuidesList } from './Guides';
import { PlacesView } from './Places';
import { ExpensesView } from './Expenses';
import { NotesView } from './Notes';
import { SettingsView } from './Settings';
import { openSheet } from '../lib/ui';
import { TripNumbers } from '../components/TripNumbers';
import { t as tx } from '../i18n';
import { guides } from '../i18n/guides';
import { QuickToggles } from '../components/QuickToggles';

export function SubBar({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <header className="appbar">
      <div className="appbar-inner">
        <button className="icon-btn" onClick={() => back('more')} aria-label={tx("Back")}>
          <ArrowLeft />
        </button>
        <div className="appbar-title">
          <h1 style={{ fontSize: 20 }}>{title}</h1>
          {sub && <div className="sub">{sub}</div>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function MoreScreen() {
  const route = useRoute();
  const [a, b] = route.path;
  if (a === 'guide' && b) return <GuideView id={b} />;
  if (a === 'guides') return <GuidesList />;
  if (a === 'places') return <PlacesView />;
  if (a === 'expenses') return <ExpensesView />;
  if (a === 'notes') return <NotesView />;
  if (a === 'settings') return <SettingsView />;
  return <MoreMenu />;
}

function MoreMenu() {
  const db = useDB();
  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
          <div className="appbar-title">
            <h1>{tx("More")}</h1>
            <div className="sub">{tx("Guides, places, money, notes, settings")}</div>
          </div>
          <QuickToggles />
          <SyncBadge />
        </div>
      </header>
      <div className="wrap">
        <div className="card list" style={{ marginTop: 8 }}>
          <MenuRow icon={<BookOpen />} title={tx("Guides")} sub={tx('{n} practical guides: airport, baggage, eSIM, money…', { n: GUIDES.length })} onClick={() => go('guides')} />
          <MenuRow icon={<MapPin />} title={tx("Places")} sub={tx('{n} places: beer, sights, food, transport', { n: db.places.length })} onClick={() => go('places')} />
          <MenuRow icon={<Lightbulb />} title={tx("Ideas & votes")} sub="Decide what to do together" onClick={() => go('plan/ideas')} />
          <MenuRow icon={<Receipt />} title={tx("Expenses & split")} sub="Who paid what, who owes whom" onClick={() => go('expenses')} />
          <MenuRow icon={<StickyNote />} title={tx("Shared notes")} sub="Apartment info, contacts, bookings" onClick={() => go('notes')} />
          <MenuRow icon={<SettingsIcon />} title={tx("Settings & offline")} sub="Offline map, sync, theme, backup" onClick={() => go('settings')} />
          <MenuRow
            icon={<Share2 />}
            title={tx("Send the app to the crew")}
            sub={location.host}
            onClick={async () => {
              if ((await shareApp()) === 'copied') toast(tx("Link copied"));
            }}
          />
        </div>

        <section className="section">
          <div className="section-h">
            <h2>
              <Users style={{ display: 'inline', width: 18, verticalAlign: '-3px' }} />{tx(" Crew")}</h2>
          </div>
          <div className="card list">
            {db.people.map((p) => (
              <button key={p.id} className="row" onClick={() => openSheet({ t: 'person', id: p.id })}>
                <Avatar person={p} />
                <span className="grow">
                  <span className="t">{p.name}</span>
                  <span className="s">{p.from}</span>
                </span>
                <ChevronRight className="chev" />
              </button>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-h">
            <h2>{tx("Trip in numbers")}</h2>
          </div>
          <TripNumbers />
        </section>

        <section className="section">
          <div className="section-h">
            <h2>{tx("Popular guides")}</h2>
          </div>
          <div className="guide-grid">
            {guides().slice(0, 6).map((g) => (
              <button key={g.id} className="card guide-card" onClick={() => go(`guide/${g.id}`)}>
                <span className="t">{g.title}</span>
                <span className="s">{g.summary}</span>
              </button>
            ))}
          </div>
        </section>
        <p className="hint" style={{ textAlign: 'center', marginTop: 28 }}>{tx("Prague Crew · built for Koryun, Alexey & Arto · 13–22 Nov 2026")}</p>
      </div>
    </>
  );
}

function MenuRow({ icon, title, sub, onClick }: { icon: ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button className="row" onClick={onClick}>
      <span className="ico-tile">{icon}</span>
      <span className="grow">
        <span className="t">{title}</span>
        <span className="s">{sub}</span>
      </span>
      <ChevronRight className="chev" />
    </button>
  );
}
