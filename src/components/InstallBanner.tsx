import { Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
let deferred: BIPEvent | null = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e as BIPEvent;
});

const isStandalone = () => matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const LS = 'pc.installHidden';

export function InstallBanner() {
  const [hidden, setHidden] = useState(() => {
    try {
      return isStandalone() || localStorage.getItem(LS) === '1';
    } catch {
      return isStandalone();
    }
  });
  const [canPrompt, setCanPrompt] = useState(Boolean(deferred));
  useEffect(() => {
    const on = () => setCanPrompt(true);
    window.addEventListener('beforeinstallprompt', on);
    return () => window.removeEventListener('beforeinstallprompt', on);
  }, []);
  if (hidden) return null;
  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(LS, '1');
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="card install-banner">
      <img src="/icons/icon-192.png" alt="" />
      <div className="grow">
        <b>Put Prague Crew on your home screen</b>
        <div className="muted">
          {isIOS() ? (
            <>
              Safari → <Share2 style={{ display: 'inline', width: 13, verticalAlign: -2 }} /> Share → “Add to Home Screen”. Works offline.
            </>
          ) : (
            'Full-screen, offline, one tap away.'
          )}
        </div>
      </div>
      {canPrompt && !isIOS() && (
        <button
          className="btn sm accent"
          onClick={async () => {
            await deferred?.prompt();
            const r = await deferred?.userChoice;
            if (r?.outcome === 'accepted') hide();
          }}
        >
          Install
        </button>
      )}
      <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={hide} aria-label="Dismiss">
        <X />
      </button>
    </div>
  );
}

export async function shareApp() {
  const data = { title: 'Prague Crew', text: 'Our Prague trip app: map, plan, prep. Pick your name and you’re in.', url: location.origin };
  try {
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(data.url);
      return 'copied';
    }
  } catch {
    /* cancelled */
  }
  return 'shared';
}
