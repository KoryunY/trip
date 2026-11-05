import type { Place, TripEvent } from '../../shared/types';
import { t as tx } from '../i18n';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');
const utc = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function buildICS(events: TripEvent[], places: Record<string, Place>, name: string) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Prague Crew//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${esc(name)}`,
  ];
  for (const e of events) {
    if (e.status === 'cancelled') continue;
    const p = places[e.placeId ?? e.toPlaceId ?? ''];
    const from = e.fromPlaceId ? places[e.fromPlaceId] : undefined;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}@prague-crew`,
      `DTSTAMP:${utc(Date.now())}`,
      `DTSTART:${utc(Date.parse(e.start))}`,
      `DTEND:${utc(Date.parse(e.end))}`,
      `SUMMARY:${esc((e.status === 'tentative' ? '(?) ' : '') + e.title)}`,
    );
    if (p) lines.push(`LOCATION:${esc(from ? `${from.name} → ${p.name}` : `${p.name}${p.address ? ', ' + p.address : ''}`)}`, `GEO:${p.lat};${p.lon}`);
    const desc = [e.notes, e.booking ? `${tx('Booking')}: ${e.booking}` : '', e.cost ? `${tx('Cost')}: ${e.cost}` : ''].filter(Boolean).join('\n');
    if (desc) lines.push(`DESCRIPTION:${esc(desc)}`);
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(e.title)}`, `TRIGGER:-PT${['flight', 'concert', 'train'].includes(e.kind) ? 120 : 30}M`, 'END:VALARM', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  // fold long lines (RFC 5545)
  return lines
    .map((l) => {
      if (l.length <= 74) return l;
      const parts: string[] = [];
      for (let i = 0; i < l.length; i += 73) parts.push((i ? ' ' : '') + l.slice(i, i + 73));
      return parts.join('\r\n');
    })
    .join('\r\n');
}

export function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
