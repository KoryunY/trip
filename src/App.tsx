import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { TabBar } from './components/TabBar';
import { SheetHost } from './components/SheetHost';
import { Toasts } from './components/ui';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './screens/Login';
import { NowScreen } from './screens/Now';
import { PlanScreen } from './screens/Plan';
import { PrepScreen } from './screens/Prep';
import { MoreScreen } from './screens/More';
import { useRoute, type Tab } from './lib/router';
import { useMe } from './lib/store';
import { useIsDark } from './lib/theme';
import { startSync } from './lib/sync';
import { setActivityProvider, onSkip } from './lib/clock';
import { getDB } from './lib/store';
import { toast } from './components/ui';
import { fmtDayShort, hhmm } from './lib/time';
import { t as tx } from './i18n';
import { closeAllSheets } from './lib/ui';

// MapLibre is heavy: load the map screen on demand (still precached for offline by the service worker)
const MapScreen = lazy(() => import('./screens/MapScreen').then((m) => ({ default: m.MapScreen })));

function useTheme() {
  const dark = useIsDark();
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e0e11' : '#f5f2ec');
  }, [dark]);
  return dark;
}

function Screen({ active, full, children }: { active: boolean; full?: boolean; children: ReactNode }) {
  return (
    <section className={`screen ${full ? 'full' : ''}`} hidden={!active} aria-hidden={!active}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </section>
  );
}

export default function App() {
  const me = useMe();
  const route = useRoute();
  useTheme();
  const [visited, setVisited] = useState<Set<Tab>>(() => new Set([route.tab]));
  useEffect(() => {
    startSync();
    // timelapse: the next moment anyone starts/ends something (used to skip quiet hours)
    setActivityProvider((t) => {
      let best: number | null = null;
      for (const e of getDB().events) {
        if (e.status === 'cancelled') continue;
        for (const x of [Date.parse(e.start), Date.parse(e.end)]) if (x > t && (best == null || x < best)) best = x;
      }
      return best;
    });
    return onSkip((_from, to) => toast(tx('⏩ Skipped quiet hours → {when}', { when: `${fmtDayShort(to)} ${hhmm(to)}` }), undefined, 1800));
  }, []);
  useEffect(() => {
    setVisited((v) => (v.has(route.tab) ? v : new Set([...v, route.tab])));
  }, [route.tab]);
  // navigating (tab bar, back button, links) closes any open sheet
  useEffect(() => {
    closeAllSheets();
  }, [route.raw]);

  if (!me) return <Login />;
  const t = route.tab;
  return (
    <div className="app">
      <main className="screens">
        <Screen active={t === 'now'}>{visited.has('now') && <NowScreen />}</Screen>
        <Screen active={t === 'map'} full>
          {visited.has('map') && (
            <Suspense fallback={<div className="map-loading">{tx("Loading map…")}</div>}>
              <MapScreen active={t === 'map'} />
            </Suspense>
          )}
        </Screen>
        <Screen active={t === 'plan'}>{visited.has('plan') && <PlanScreen />}</Screen>
        <Screen active={t === 'prep'}>{visited.has('prep') && <PrepScreen />}</Screen>
        <Screen active={t === 'more'}>{visited.has('more') && <MoreScreen />}</Screen>
      </main>
      <TabBar />
      <ErrorBoundary label={tx("this sheet")}>
        <SheetHost />
      </ErrorBoundary>
      <Toasts />
    </div>
  );
}
