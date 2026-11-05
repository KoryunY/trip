import { ExternalLink, ImageOff, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Place } from '../../shared/types';
import { usePhotos, type Photo } from '../lib/photos';
import { t as tx } from '../i18n';

/** Horizontal gallery of low-res photos for a place (Wikimedia Commons). */
export function PhotoStrip({ place }: { place: Place }) {
  const { photos, loading } = usePhotos(place, 6);
  const [open, setOpen] = useState<Photo | null>(null);
  if (!loading && photos.length === 0) {
    return navigator.onLine ? null : (
      <div className="ph-none">
        <ImageOff aria-hidden /> {tx('Photos load when you’re online')}
      </div>
    );
  }
  return (
    <div className="ph">
      <div className="ph-strip" role="list" aria-label={tx('Photos')}>
        {loading && !photos.length
          ? [0, 1, 2].map((i) => <div key={i} className="ph-img skeleton" aria-hidden />)
          : photos.map((p) => (
              <button key={p.thumb} role="listitem" className="ph-img" onClick={() => setOpen(p)} aria-label={p.title}>
                <img src={p.thumb} alt={p.title} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
              </button>
            ))}
      </div>
      {photos.length > 0 && <div className="ph-credit">{tx('Photos: Wikimedia Commons (may show the area nearby)')}</div>}
      {open &&
        createPortal(
          <div className="lightbox" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)}>
            <img src={open.thumb} alt={open.title} />
            <div className="lightbox-bar" onClick={(e) => e.stopPropagation()}>
              <span className="lightbox-t">{open.title}</span>
              <a className="icon-btn" href={open.page} target="_blank" rel="noreferrer" aria-label={tx('Open on Wikimedia Commons')}>
                <ExternalLink />
              </a>
              <button className="icon-btn" onClick={() => setOpen(null)} aria-label={tx('Close')}>
                <X />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/** single thumbnail (first photo) for compact cards */
export function PlaceThumb({ place, size = 64 }: { place: Place; size?: number }) {
  const { photos, loading } = usePhotos(place, 6);
  const p = photos[0];
  return (
    <span className={`ph-thumb ${loading ? 'skeleton' : ''}`} style={{ width: size, height: size }} aria-hidden>
      {p ? <img src={p.thumb} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" /> : null}
    </span>
  );
}
