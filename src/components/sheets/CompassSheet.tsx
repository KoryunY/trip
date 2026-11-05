import { Navigation2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { bearing, compassName, distance, fmtDistance, walkMinutes } from '../../lib/geo';
import { startCompass, startWatch, stopCompass, useLocation } from '../../lib/location';
import { navigateTo } from '../../lib/ui';
import { Sheet } from '../ui';
import { t as tx } from '../../i18n';

export function CompassSheet({ target, onClose }: { target: { lat: number; lon: number; name: string }; onClose: () => void }) {
  const loc = useLocation();
  const [needsTap, setNeedsTap] = useState(false);
  useEffect(() => {
    startWatch();
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    if (DOE?.requestPermission) setNeedsTap(true);
    else void startCompass();
    return () => stopCompass();
  }, []);
  const fix = loc.fix;
  const d = fix ? distance([fix.lon, fix.lat], [target.lon, target.lat]) : null;
  const b = fix ? bearing([fix.lon, fix.lat], [target.lon, target.lat]) : null;
  const heading = loc.compass ?? fix?.heading ?? null;
  const rot = b != null ? b - (heading ?? 0) : 0;
  return (
    <Sheet title={`Compass → ${target.name}`} onClose={onClose}>
      <div className="compass">
        <div className="compass-dial" aria-hidden>
          <div className="compass-arrow" style={{ transform: `rotate(${rot}deg)` }}>
            <Navigation2 />
          </div>
          {heading == null && <span className="compass-n" style={{ transform: 'translate(-50%, 0)' }}>N</span>}
        </div>
        {d != null ? (
          <>
            <div className="compass-d tnum">{fmtDistance(d)}</div>
            <div className="muted">
              {compassName(b!)} · ~{walkMinutes(d)}{tx(" min walk")}</div>
          </>
        ) : (
          <div className="muted">{loc.error ?? tx("Waiting for GPS…")}</div>
        )}
        {heading == null && fix && <p className="muted" style={{ fontSize: 13, textAlign: 'center' }}>{tx("No compass sensor: the arrow points as if your phone faces north.")}</p>}
        {needsTap && !loc.compassAllowed && (
          <button className="btn accent" onClick={async () => setNeedsTap(!(await startCompass()))}>{tx("Enable compass")}</button>
        )}
        <p className="muted" style={{ fontSize: 13, textAlign: 'center' }}>{tx("Works offline: straight-line direction to ")}{target.name}{tx(". Good after a few beers 🍺")}</p>
        <button className="btn" onClick={() => navigateTo(target.lat, target.lon, target.name)}>{tx("Show walking route on map")}</button>
      </div>
    </Sheet>
  );
}
