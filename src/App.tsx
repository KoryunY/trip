import { useEffect, useState, type ReactNode } from 'react';
import { TabBar } from './components/TabBar';
import { SheetHost } from './components/SheetHost';
import { Toasts } from './components/ui';
import { Login } from './screens/Login';
import { NowScreen } from './screens/Now';
import { MapScreen } from './screens/MapScreen';
import { PlanScreen } from './screens/Plan';
import { PrepScreen } from './screens/Prep';
import { MoreScreen } from './screens/More';
import { useRoute, type Tab } from './lib/router';
import { useMe, useSettings } from './lib/store';
import { startSync } from './lib/sync';

function useTheme() {
  const { theme } = useSettings();
  const [sysDark, setSysDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const on = () => setSysDark(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const dark = theme === 'dark' || (theme === 'auto' && sysDark);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e0e11' : '#f5f2ec');
  }, [dark]);
  return dark;
}

function Screen({ active, full, children }: { active: boolean; full?: boolean; children: ReactNode }) {
  return (
    <section className={`screen ${full ? 'full' : ''}`} hidden={!active} aria-hidden={!active}>
      {children}
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
  }, []);
  useEffect(() => {
    setVisited((v) => (v.has(route.tab) ? v : new Set([...v, route.tab])));
  }, [route.tab]);

  if (!me) return <Login />;
  const t = route.tab;
  return (
    <div className="app">
      <main className="screens">
        <Screen active={t === 'now'}>{visited.has('now') && <NowScreen />}</Screen>
        <Screen active={t === 'map'} full>
          {visited.has('map') && <MapScreen active={t === 'map'} />}
        </Screen>
        <Screen active={t === 'plan'}>{visited.has('plan') && <PlanScreen />}</Screen>
        <Screen active={t === 'prep'}>{visited.has('prep') && <PrepScreen />}</Screen>
        <Screen active={t === 'more'}>{visited.has('more') && <MoreScreen />}</Screen>
      </main>
      <TabBar />
      <SheetHost />
      <Toasts />
    </div>
  );
}
