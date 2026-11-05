import { useSyncExternalStore } from 'react';

export type Tab = 'now' | 'map' | 'plan' | 'prep' | 'more';

export interface Route {
  tab: Tab;
  path: string[]; // e.g. ['guide','airport']
  params: URLSearchParams;
  raw: string;
}

function parse(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  const [pathPart, query = ''] = h.split('?');
  const segs = pathPart.split('/').filter(Boolean);
  const first = (segs[0] || 'now') as string;
  const tabs: Tab[] = ['now', 'map', 'plan', 'prep', 'more'];
  let tab: Tab = 'now';
  let path: string[] = [];
  if (tabs.includes(first as Tab)) {
    tab = first as Tab;
    path = segs.slice(1);
  } else {
    // sub pages live under "more"
    tab = 'more';
    path = segs;
  }
  return { tab, path, params: new URLSearchParams(query), raw: h };
}

let current = parse(location.hash);
const listeners = new Set<() => void>();
window.addEventListener('hashchange', () => {
  current = parse(location.hash);
  listeners.forEach((l) => l());
});

export function useRoute(): Route {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current,
  );
}

export function go(to: string) {
  const h = to.startsWith('#') ? to : `#/${to.replace(/^\//, '')}`;
  if (location.hash === h) {
    current = parse(h);
    listeners.forEach((l) => l());
  } else location.hash = h;
}

export function back(fallback = 'more') {
  if (history.length > 1) history.back();
  else go(fallback);
}
