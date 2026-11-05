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
  ChevronRight,
  ExternalLink,
  Lightbulb,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { GUIDES, type GuideSection } from '../data/guides';
import { go } from '../lib/router';
import { useDB, useMe } from '../lib/store';
import { SubBar } from './More';
import { Avatar } from '../components/ui';

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
};

export function GuidesList() {
  const me = useMe()!;
  const db = useDB();
  const mine = GUIDES.filter((g) => g.for?.includes(me));
  const rest = GUIDES.filter((g) => !g.for?.includes(me));
  const Row = ({ g }: { g: (typeof GUIDES)[number] }) => {
    const Icon = GUIDE_ICON[g.icon] ?? BookOpen;
    return (
      <button className="row" onClick={() => go(`guide/${g.id}`)}>
        <span className="ico-tile">
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
      <SubBar title="Guides" sub="Researched Nov 2026; prices can change" />
      <div className="wrap">
        {mine.length > 0 && (
          <section className="section" style={{ marginTop: 8 }}>
            <div className="section-h">
              <h2>For you</h2>
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
            <h2>Everyone</h2>
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
  const g = GUIDES.find((x) => x.id === id);
  if (!g) return <SubBar title="Guide not found" />;
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
            <div className="eyebrow">Sources</div>
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
