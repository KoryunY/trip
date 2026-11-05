import type { SyncItem } from '../../shared/types';

/** Exact saved envelopes from a previous built-in itinerary correction. */
export type LegacySeedRecord = Readonly<Pick<SyncItem, 'col' | 'id' | 'u' | 'by' | 'data'>>;

/** Compare JSON payloads without treating object-key order as an edit. */
function sameData(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, i) => sameData(value, b[i]));
  }
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length
    && keys.every((key) => Object.hasOwn(right, key) && sameData(left[key], right[key]));
}

/**
 * Apply only after ordinary last-writer-wins resolution. An exact historical
 * correction may follow the current seed without writing a new sync operation.
 * Any subsequent edit or deletion wins normally and remains untouched.
 */
export function rebaseLegacySeedRecord(
  winner: SyncItem | undefined,
  currentSeed: SyncItem | undefined,
  legacyRecords: readonly LegacySeedRecord[],
): SyncItem | undefined {
  if (!winner || winner.data === null) return winner;
  if (currentSeed && (currentSeed.col !== winner.col || currentSeed.id !== winner.id)) return winner;
  const matches = legacyRecords.some((legacy) =>
    legacy.col === winner.col && legacy.id === winner.id
    && legacy.u === winner.u && legacy.by === winner.by
    && legacy.data !== null && sameData(legacy.data, winner.data),
  );
  if (!matches) return winner;
  // A missing seed means this specifically allowlisted record was removed.
  // Keep the original envelope metadata so future local/server edits still win.
  return { ...winner, data: currentSeed?.data ?? null };
}
