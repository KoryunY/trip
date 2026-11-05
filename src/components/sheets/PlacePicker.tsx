import type { PlaceCategory } from '../../../shared/types';
import { CAT, CAT_ORDER } from '../../lib/meta';
import { useDB } from '../../lib/store';
import { t as tx } from '../../i18n';

export function PlacePicker({ id, value, onChange, allowNone = true }: { id: string; value: string | null | undefined; onChange: (v: string | null) => void; allowNone?: boolean }) {
  const db = useDB();
  const by = (c: PlaceCategory) => db.places.filter((p) => p.category === c);
  return (
    <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      {allowNone && <option value="">{tx("— none —")}</option>}
      {CAT_ORDER.map((c) => {
        const list = by(c);
        if (!list.length) return null;
        return (
          <optgroup key={c} label={`${CAT[c].emoji} ${CAT[c].plural}`}>
            {list.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}

export function PeoplePicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const db = useDB();
  return (
    <div className="people-pick">
      {db.people.map((p) => {
        const on = value.includes(p.id);
        return (
          <button
            type="button"
            key={p.id}
            className={`pp ${on ? 'on' : ''}`}
            style={{ ['--c' as string]: p.color }}
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== p.id) : [...value, p.id])}
          >
            <span className="avatar sm" style={{ ['--c' as string]: p.color }}>
              {p.name[0]}
            </span>
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
