import { ChevronRight, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PlaceCategory } from '../../shared/types';
import { CAT, CAT_ORDER } from '../lib/meta';
import { distance, fmtDistance } from '../lib/geo';
import { useLocation } from '../lib/location';
import { useDB } from '../lib/store';
import { voteScore } from '../lib/trip';
import { openSheet } from '../lib/ui';
import { SubBar } from './More';

export function PlacesView() {
  const db = useDB();
  const loc = useLocation();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<PlaceCategory | 'all'>('all');
  const origin: [number, number] = loc.fix ? [loc.fix.lon, loc.fix.lat] : [db.place.base.lon, db.place.base.lat];
  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return db.places
      .filter((p) => (cat === 'all' || p.category === cat) && (!qq || `${p.name} ${p.area ?? ''} ${p.address ?? ''} ${(p.tags ?? []).join(' ')}`.toLowerCase().includes(qq)))
      .map((p) => ({ p, d: distance(origin, [p.lon, p.lat]) }))
      .sort((a, b) => a.d - b.d);
  }, [db.places, q, cat, origin[0], origin[1]]);
  const cats = CAT_ORDER.filter((c) => db.places.some((p) => p.category === c));
  return (
    <>
      <SubBar
        title="Places"
        sub={`Sorted by distance from ${loc.fix ? 'you' : 'the base'}`}
        right={
          <button className="icon-btn" onClick={() => openSheet({ t: 'placeEdit', draft: { category: 'sight', lat: origin[1], lon: origin[0] } })} aria-label="Add place">
            <Plus />
          </button>
        }
      />
      <div className="wrap">
        <label className="search">
          <Search aria-hidden />
          <input className="input" placeholder="Search places, areas, tags…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search places" />
        </label>
        <div className="chips" style={{ margin: '10px -16px 4px' }}>
          <button className="chip" aria-pressed={cat === 'all'} onClick={() => setCat('all')}>
            All
          </button>
          {cats.map((c) => (
            <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {CAT[c].emoji} {CAT[c].plural}
            </button>
          ))}
        </div>
        <div className="card list" style={{ marginTop: 10 }}>
          {list.map(({ p, d }) => (
            <button key={p.id} className="row" onClick={() => openSheet({ t: 'place', id: p.id })}>
              <span className="ico-tile" style={{ background: CAT[p.category]?.color, color: '#fff' }}>
                <span aria-hidden style={{ fontSize: 18 }}>
                  {CAT[p.category]?.emoji}
                </span>
              </span>
              <span className="grow">
                <span className="t">{p.name}</span>
                <span className="s">
                  {fmtDistance(d)} · {p.area ?? CAT[p.category]?.label}
                  {voteScore(p.votes) > 0 ? ` · 👍 ${voteScore(p.votes)}` : ''}
                </span>
              </span>
              <ChevronRight className="chev" />
            </button>
          ))}
          {!list.length && <div className="empty">No places match.</div>}
        </div>
      </div>
    </>
  );
}
