import {
  BookOpen,
  Bus,
  CalendarDays,
  CloudSun,
  Gamepad2,
  Guitar,
  Languages,
  Luggage,
  PlaneLanding,
  PlaneTakeoff,
  ShieldCheck,
  Siren,
  Smartphone,
  TramFront,
  Wallet,
  Beer,
  Users,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { GUIDES, type GuideSection } from '../data/guides';
import { guides } from '../i18n/guides';
import { go } from '../lib/router';
import { useDB, useMe } from '../lib/store';
import { SubBar } from './More';
import { Avatar } from '../components/ui';
import { t as tx } from '../i18n';

export const GUIDE_ICON: Record<string, LucideIcon> = {
  'plane-landing': PlaneLanding,
  'plane-takeoff': PlaneTakeoff,
  bus: Bus,
  luggage: Luggage,
  'shield-check': ShieldCheck,
  smartphone: Smartphone,
  'tram-front': TramFront,
  wallet: Wallet,
  guitar: Guitar,
  'gamepad-2': Gamepad2,
  beer: Beer,
  'cloud-sun': CloudSun,
  siren: Siren,
  languages: Languages,
  'calendar-days': CalendarDays,
  users: Users,
};

const GUIDE_COLOR: Record<string, string> = {
  'plane-landing': '#2563eb',
  'plane-takeoff': '#2563eb',
  bus: '#0891b2',
  luggage: '#7c3aed',
  'shield-check': '#16a34a',
  smartphone: '#0ea5e9',
  'tram-front': '#dc2626',
  wallet: '#9333ea',
  guitar: '#e11d48',
  'gamepad-2': '#16a34a',
  beer: '#d97706',
  'cloud-sun': '#0284c7',
  siren: '#dc2626',
  languages: '#c026d3',
  'calendar-days': '#ea580c',
  users: '#f97316',
};

export function GuidesList() {
  const me = useMe()!;
  const db = useDB();
  const all = guides();
  const mine = all.filter((g) => g.for?.includes(me));
  const rest = all.filter((g) => !g.for?.includes(me));
  const Row = ({ g }: { g: (typeof GUIDES)[number] }) => {
    const Icon = GUIDE_ICON[g.icon] ?? BookOpen;
    return (
      <button className="row" onClick={() => go(`guide/${g.id}`)}>
        <span className="ico-tile tinted" style={{ ['--tc' as string]: GUIDE_COLOR[g.icon] ?? '#d97706' }}>
          <Icon />
        </span>
        <span className="grow">
          <span className="t">{g.title}</span>
          <span className="s">{g.summary}</span>
        </span>
        {g.for?.map((p) => <Avatar key={p} person={db.person[p]} size="sm" />)}
        <ChevronRight className="chev" />
      </button>
    );
  };
  return (
    <>
      <SubBar title={tx("Guides")} sub={tx("Researched Nov 2026; prices can change")} />
      <div className="wrap">
        {mine.length > 0 && (
          <section className="section" style={{ marginTop: 8 }}>
            <div className="section-h">
              <h2>{tx("For you")}</h2>
            </div>
            <div className="card list">
              {mine.map((g) => (
                <Row key={g.id} g={g} />
              ))}
            </div>
          </section>
        )}
        <section className="section">
          <div className="section-h">
            <h2>{tx("Everyone")}</h2>
          </div>
          <div className="card list">
            {rest.map((g) => (
              <Row key={g.id} g={g} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function Section({ s }: { s: GuideSection }) {
  return (
    <div className="g-sec">
      {s.h && <h3>{s.h}</h3>}
      {s.body && <p className="g-body">{s.body}</p>}
      {s.table && (
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr>
                {s.table.head.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} className={j === 0 ? 'strong' : ''}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {s.steps && (
        <ol className="g-steps">
          {s.steps.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ol>
      )}
      {s.bullets && (
        <ul className="g-bullets">
          {s.bullets.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      )}
      {s.tip && (
        <div className="banner ok">
          <Lightbulb aria-hidden />
          <span>{s.tip}</span>
        </div>
      )}
      {s.warn && (
        <div className="banner danger">
          <TriangleAlert aria-hidden />
          <span>{s.warn}</span>
        </div>
      )}
    </div>
  );
}

export function GuideView({ id }: { id: string }) {
  const g = guides().find((x) => x.id === id);
  if (!g) return <SubBar title={tx("Guide not found")} />;
  const Icon = GUIDE_ICON[g.icon] ?? BookOpen;
  return (
    <>
      <SubBar title={g.title} />
      <div className="wrap guide">
        <div className="guide-hero">
          <span className="ico-tile big">
            <Icon />
          </span>
          <p>{g.summary}</p>
        </div>
        {g.sections.map((s, i) => (
          <Section key={i} s={s} />
        ))}
        {g.sources && (
          <div className="g-sources">
            <div className="eyebrow">{tx("Sources")}</div>
            {g.sources.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden /> {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
