import maplibregl, { type GeoJSONSource, type Map as MLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Compass, Crosshair, Layers, Navigation, Route as RouteIcon, Users, X, Footprints, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LngLat, PlaceCategory } from '../../shared/types';
import { crewLine, groupCrew, namesOf, presenceFresh } from '../components/CrewList';
import { TimeMachine } from '../components/TimeMachine';
import { toast } from '../components/ui';
import { useTimeState, useNow } from '../lib/clock';
import { useCrew } from '../lib/crew';
import { bboxOf, distance, fmtDistance } from '../lib/geo';
import { useLocation, startWatch, locateOnce } from '../lib/location';
import { buildStyle, type BaseStyleName } from '../lib/mapstyle';
import { CAT, KIND_HEX } from '../lib/meta';
import { travelLegs } from '../lib/positions';
import { route as fetchRoute, type RouteResult } from '../lib/routing';
import { useDB, useMe, usePresence, useSettings, setSettings } from '../lib/store';
import { durationLabel } from '../lib/time';
import { mapsLink } from '../lib/trip';
import { clearMapIntent, openSheet, useMapIntent } from '../lib/ui';

const PRAGUE: LngLat = [14.44, 50.083];

const FILTERS: { id: string; label: string; cats: PlaceCategory[] | null }[] = [
  { id: 'all', label: 'All', cats: null },
  { id: 'plan', label: '⭐ In plan', cats: null },
  { id: 'beer', label: '🍺 Beer', cats: ['beer'] },
  { id: 'sight', label: '🏛️ Sights', cats: ['sight', 'viewpoint', 'museum'] },
  { id: 'food', label: '🍽️ Food & cafés', cats: ['food', 'cafe'] },
  { id: 'night', label: '🎉 Night', cats: ['nightlife', 'venue'] },
  { id: 'transport', label: '🚉 Transport', cats: ['transport'] },
  { id: 'more', label: '🛒 Other', cats: ['shop', 'service', 'daytrip', 'city', 'home'] },
];

function isDark() {
  return document.documentElement.dataset.theme === 'dark';
}

/** draw a category pin as an image for the symbol layer (works offline, no sprite needed) */
function makePin(color: string, emoji: string, big = false): ImageData {
  const s = big ? 44 : 34;
  const r = 2;
  const c = document.createElement('canvas');
  c.width = s * r;
  c.height = s * r;
  const g = c.getContext('2d')!;
  g.scale(r, r);
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
  g.fillStyle = '#ffffff';
  g.fill();
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2);
  g.fillStyle = color;
  g.fill();
  g.font = `${big ? 22 : 16}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(emoji, s / 2, s / 2 + 1);
  return g.getImageData(0, 0, s * r, s * r);
}

export function MapScreen({ active }: { active: boolean }) {
  const db = useDB();
  const me = useMe()!;
  const settings = useSettings();
  const presence = usePresence();
  const ts = useTimeState();
  const now = useNow(15_000);
  const t = ts.mode === 'live' ? now : ts.sim;
  const live = ts.mode === 'live';
  const crew = useCrew(t);
  const loc = useLocation();
  const intent = useMapIntent();

  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [ready, setReady] = useState(0); // increments on each style load
  const [remote, setRemote] = useState(true);
  const [hasGlyphs, setHasGlyphs] = useState(true);
  const [filter, setFilter] = useState('all');
  const [follow, setFollow] = useState(true);
  const [nav, setNav] = useState<{ to: LngLat; name: string; res?: RouteResult; err?: string; loading?: boolean } | null>(null);
  const [panel, setPanel] = useState(true);
  const [styleOpen, setStyleOpen] = useState(false);
  const crewMarkers = useRef<Map<string, { m: maplibregl.Marker; el: HTMLDivElement }>>(new Map());
  const meMarker = useRef<maplibregl.Marker | null>(null);
  const liveMarkers = useRef<Map<string, maplibregl.Marker>>(new Map());

  const styleName: BaseStyleName = settings.mapStyle === 'liberty' && isDark() ? 'dark' : settings.mapStyle;

  // ── create map ──
  useEffect(() => {
    if (!el.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: el.current,
      style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': isDark() ? '#1c1d22' : '#f2efe9' } }] },
      center: PRAGUE,
      zoom: 12.5,
      attributionControl: { compact: true },
      maxPitch: 60,
      dragRotate: true,
      pitchWithRotate: false,
      fadeDuration: 150,
    });
    map.touchZoomRotate.enableRotation();
    mapRef.current = map;
    map.on('style.load', () => setReady((r) => r + 1));
    map.on('dragstart', () => setFollow(false));
    // long-press / right-click: add a place here
    map.on('contextmenu', (e) => {
      openSheet({ t: 'placeEdit', draft: { lat: Number(e.lngLat.lat.toFixed(5)), lon: Number(e.lngLat.lng.toFixed(5)), category: 'sight' } });
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── load style (and on style/theme change) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;
    buildStyle(styleName, isDark()).then(({ style, remote, hasGlyphs }) => {
      if (cancelled) return;
      setRemote(remote);
      setHasGlyphs(hasGlyphs);
      map.setStyle(style, { diff: false });
    });
    return () => {
      cancelled = true;
    };
  }, [styleName]);

  useEffect(() => {
    if (active) setTimeout(() => mapRef.current?.resize(), 30);
  }, [active]);

  // ── overlay sources/layers (after each style load) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    for (const [cat, meta] of Object.entries(CAT)) {
      const id = `pin-${cat}`;
      if (!map.hasImage(id)) map.addImage(id, makePin(meta.color, meta.emoji, cat === 'home'), { pixelRatio: 2 });
    }
    const empty = { type: 'FeatureCollection' as const, features: [] };
    if (!map.getSource('legs')) map.addSource('legs', { type: 'geojson', data: empty });
    if (!map.getSource('route')) map.addSource('route', { type: 'geojson', data: empty });
    if (!map.getSource('places')) map.addSource('places', { type: 'geojson', data: empty });
    if (!map.getLayer('legs-casing'))
      map.addLayer({
        id: 'legs-casing',
        type: 'line',
        source: 'legs',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['linear'], ['zoom'], 3, 3, 14, 7], 'line-opacity': 0.7 },
      });
    if (!map.getLayer('legs'))
      map.addLayer({
        id: 'legs',
        type: 'line',
        source: 'legs',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1.5, 14, 4],
          'line-dasharray': [2, 1.5],
          'line-opacity': 0.85,
        },
      });
    if (!map.getLayer('route-casing'))
      map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 10 },
      });
    if (!map.getLayer('route'))
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#2563eb', 'line-width': 6 },
      });
    if (!map.getLayer('places'))
      map.addLayer({
        id: 'places',
        type: 'symbol',
        source: 'places',
        layout: {
          'icon-image': ['concat', 'pin-', ['get', 'cat']],
          'icon-size': ['interpolate', ['linear'], ['zoom'], 9, 0.55, 13, 0.8, 16, 1],
          'icon-allow-overlap': true,
          'icon-padding': 0,
          'symbol-sort-key': ['get', 'rank'],
          ...(hasGlyphs
            ? {
                'text-field': ['step', ['zoom'], '', 13.5, ['get', 'name']],
                'text-font': ['Noto Sans Bold'],
                'text-size': 12,
                'text-offset': [0, 1.35],
                'text-anchor': 'top',
                'text-optional': true,
                'text-max-width': 9,
              }
            : {}),
        },
        paint: {
          'text-color': isDark() ? '#f4f2ee' : '#18171b',
          'text-halo-color': isDark() ? '#18181d' : '#ffffff',
          'text-halo-width': 1.6,
        },
      });
    const onClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0];
      if (f?.properties?.id) openSheet({ t: 'place', id: String(f.properties.id) });
    };
    map.on('click', 'places', onClick);
    map.on('mouseenter', 'places', () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', 'places', () => (map.getCanvas().style.cursor = ''));
    return () => {
      map.off('click', 'places', onClick);
    };
  }, [ready, hasGlyphs]);

  // ── place data ──
  const planPlaceIds = useMemo(() => {
    const s = new Set<string>();
    for (const e of db.events) {
      if (e.status === 'cancelled') continue;
      for (const id of [e.placeId, e.fromPlaceId, e.toPlaceId]) if (id) s.add(id);
    }
    return s;
  }, [db.events]);
  useEffect(() => {
    const map = mapRef.current;
    const src = map?.getSource('places') as GeoJSONSource | undefined;
    if (!src) return;
    const f = FILTERS.find((x) => x.id === filter)!;
    const feats = db.places
      .filter((p) => (filter === 'plan' ? planPlaceIds.has(p.id) : !f.cats || f.cats.includes(p.category)))
      .map((p) => ({
        type: 'Feature' as const,
        properties: { id: p.id, name: p.name, cat: p.category, rank: p.category === 'home' ? 0 : planPlaceIds.has(p.id) ? 1 : 2 },
        geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },
      }));
    src.setData({ type: 'FeatureCollection', features: feats });
  }, [db.places, filter, planPlaceIds, ready]);

  // ── travel legs ──
  const legs = useMemo(() => travelLegs(db.events, db.place), [db.events, db.place]);
  const tBucket = Math.floor(t / 60_000);
  useEffect(() => {
    const map = mapRef.current;
    const src = map?.getSource('legs') as GeoJSONSource | undefined;
    if (!src) return;
    const tt = tBucket * 60_000;
    // show legs active within ±12h of the cursor (keeps the map readable)
    const feats = legs
      .filter((l) => l.end > tt - 3 * 3600_000 && l.start < tt + 12 * 3600_000)
      .map((l) => ({
        type: 'Feature' as const,
        properties: { color: l.kind === 'flight' ? '#3b82f6' : (KIND_HEX[l.kind as keyof typeof KIND_HEX] ?? '#64748b') },
        geometry: { type: 'LineString' as const, coordinates: l.path },
      }));
    src.setData({ type: 'FeatureCollection', features: feats });
  }, [legs, tBucket, ready]);

  // ── crew markers ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const seen = new Set<string>();
    // group co-located people so all avatars stay visible
    const groups = new Map<string, string[]>();
    for (const pos of crew) {
      const key = `${pos.p[0].toFixed(4)},${pos.p[1].toFixed(4)}`;
      groups.set(key, [...(groups.get(key) ?? []), pos.person]);
    }
    for (const pos of crew) {
      const person = db.person[pos.person];
      if (!person) continue;
      seen.add(pos.person);
      let entry = crewMarkers.current.get(pos.person);
      if (!entry) {
        const elm = document.createElement('div');
        elm.className = 'crew-marker';
        elm.addEventListener('click', (ev) => {
          ev.stopPropagation();
          openSheet({ t: 'person', id: pos.person });
        });
        const m = new maplibregl.Marker({ element: elm, anchor: 'center' }).setLngLat(pos.p).addTo(map);
        entry = { m, el: elm };
        crewMarkers.current.set(pos.person, entry);
      }
      const key = `${pos.p[0].toFixed(4)},${pos.p[1].toFixed(4)}`;
      const grp = groups.get(key)!;
      const idx = grp.indexOf(pos.person);
      const n = grp.length;
      const R = n > 2 ? 25 : 22;
      const off: [number, number] = n > 1 ? [Math.cos((idx / n) * Math.PI * 2 - Math.PI / 2) * R, Math.sin((idx / n) * Math.PI * 2 - Math.PI / 2) * R] : [0, 0];
      entry.m.setLngLat(pos.p);
      entry.m.setOffset(off);
      const moving = pos.mode === 'travel' || pos.mode === 'moving';
      const icon = pos.mode === 'travel' ? (db.event[pos.eventId ?? '']?.kind === 'flight' ? '✈️' : '🚆') : pos.mode === 'moving' ? '🚶' : '';
      entry.el.style.setProperty('--c', person.color);
      entry.el.dataset.mode = pos.mode;
      entry.el.classList.toggle('grouped', n > 1);
      entry.el.innerHTML = `<span class="cm-av">${person.name[0]}</span>${moving ? `<span class="cm-badge">${icon}</span>` : ''}<span class="cm-label">${person.name}</span>`;
      entry.el.setAttribute('aria-label', `${person.name}: ${pos.label}`);
      entry.el.title = `${person.name}: ${pos.label}`;
      entry.el.classList.toggle('me', pos.person === me);
    }
    for (const [pid, entry] of crewMarkers.current) {
      if (!seen.has(pid)) {
        entry.m.remove();
        crewMarkers.current.delete(pid);
      }
    }
  }, [crew, db.person, me, ready]);

  // ── live GPS markers (friends who share) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const keep = new Set<string>();
    if (live) {
      for (const [pid, p] of Object.entries(presence)) {
        if (pid === me || !presenceFresh(p, Date.now())) continue;
        const person = db.person[pid];
        if (!person) continue;
        keep.add(pid);
        let m = liveMarkers.current.get(pid);
        if (!m) {
          const elm = document.createElement('div');
          elm.className = 'live-marker';
          m = new maplibregl.Marker({ element: elm }).setLngLat([p.lon, p.lat]).addTo(map);
          liveMarkers.current.set(pid, m);
        }
        m.getElement().style.setProperty('--c', person.color);
        m.getElement().innerHTML = `<span>${person.name[0]}</span>`;
        m.getElement().title = `${person.name} · live GPS`;
        m.setLngLat([p.lon, p.lat]);
      }
    }
    for (const [pid, m] of liveMarkers.current) {
      if (!keep.has(pid)) {
        m.remove();
        liveMarkers.current.delete(pid);
      }
    }
  }, [presence, live, me, db.person, ready]);

  // ── my GPS ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loc.fix) return;
    if (!meMarker.current) {
      const elm = document.createElement('div');
      elm.className = 'me-dot';
      elm.innerHTML = '<i class="me-head"></i><b></b>';
      meMarker.current = new maplibregl.Marker({ element: elm, rotationAlignment: 'map' }).setLngLat([loc.fix.lon, loc.fix.lat]).addTo(map);
    }
    meMarker.current.setLngLat([loc.fix.lon, loc.fix.lat]);
    const heading = loc.compass ?? loc.fix.heading;
    const head = meMarker.current.getElement().querySelector('.me-head') as HTMLElement;
    if (head) {
      head.style.display = heading == null ? 'none' : 'block';
      head.style.transform = `rotate(${heading ?? 0}deg)`;
    }
  }, [loc.fix, loc.compass]);

  // ── follow crew during playback ──
  const fitCrew = useCallback(
    (animate = true) => {
      const map = mapRef.current;
      if (!map || !crew.length) return;
      const pts = crew.map((c) => c.p);
      const [w, s, e, n] = bboxOf(pts);
      const spread = distance([w, s], [e, n]);
      if (spread < 300) map.easeTo({ center: pts[0], zoom: Math.max(map.getZoom(), 14.5), duration: animate ? 700 : 0 });
      else
        map.fitBounds(
          [
            [w, s],
            [e, n],
          ],
          { padding: { top: 120, bottom: panel ? 330 : 170, left: 60, right: 60 }, maxZoom: 15, duration: animate ? 700 : 0 },
        );
    },
    [crew, panel],
  );
  const lastFit = useRef(0);
  useEffect(() => {
    if (!follow || !ready || !active) return;
    const nowMs = performance.now();
    if (ts.playing && nowMs - lastFit.current < 900) return;
    lastFit.current = nowMs;
    fitCrew(!ts.playing);
  }, [crew, follow, ready, active, ts.playing, fitCrew]);

  // ── intents from other screens ──
  useEffect(() => {
    if (!intent || !ready) return;
    const map = mapRef.current!;
    if (intent.focus) {
      setFollow(false);
      map.flyTo({ center: intent.focus.lngLat, zoom: intent.focus.zoom ?? 16, duration: 900 });
    }
    if (intent.fitCrew) {
      setFollow(true);
      setPanel(true);
      fitCrew();
    }
    if (intent.route) {
      setFollow(false);
      startNav(intent.route.to, intent.route.name);
    }
    if (intent.person) {
      const pos = crew.find((c) => c.person === intent.person);
      if (pos) {
        setFollow(false);
        map.flyTo({ center: pos.p, zoom: 15 });
      }
    }
    clearMapIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, ready]);

  // ── navigation ──
  const startNav = useCallback(async (to: LngLat, name: string) => {
    setNav({ to, name, loading: true });
    startWatch();
    const fix = await locateOnce();
    const from: LngLat = fix ? [fix.lon, fix.lat] : [db.place.base.lon, db.place.base.lat];
    try {
      const res = await fetchRoute(from, to, 'foot');
      setNav({ to, name, res });
      const src = mapRef.current?.getSource('route') as GeoJSONSource | undefined;
      src?.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: res.path } });
      const [w, s, e, n] = bboxOf(res.path);
      mapRef.current?.fitBounds(
        [
          [w, s],
          [e, n],
        ],
        { padding: { top: 110, bottom: 260, left: 50, right: 50 }, maxZoom: 17 },
      );
      if (!fix) toast('No GPS fix, so the route starts from the base');
    } catch (err) {
      // offline or routing down: straight line + compass
      const src = mapRef.current?.getSource('route') as GeoJSONSource | undefined;
      src?.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [from, to] } });
      setNav({ to, name, err: navigator.onLine ? String((err as Error).message) : 'Offline: straight-line direction shown. Use the compass.' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const stopNav = () => {
    setNav(null);
    const src = mapRef.current?.getSource('route') as GeoJSONSource | undefined;
    src?.setData({ type: 'FeatureCollection', features: [] });
  };

  const locateMe = async () => {
    setFollow(false);
    startWatch();
    const fix = await locateOnce();
    if (fix) mapRef.current?.flyTo({ center: [fix.lon, fix.lat], zoom: 16 });
    else toast(loc.error ?? 'Could not get your location');
  };

  const myDistHome = loc.fix ? distance([loc.fix.lon, loc.fix.lat], [db.place.base.lon, db.place.base.lat]) : null;

  return (
    <div className="map-screen">
      <div ref={el} className="map" />
      {/* top overlay */}
      <div className="map-top">
        <div className="chips map-filters">
          {FILTERS.map((f) => (
            <button key={f.id} className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        {!remote && (
          <div className="map-offline-note">
            Offline map mode: download the offline map in Settings to see streets without internet.
          </div>
        )}
      </div>
      {/* right controls */}
      <div className="map-controls">
        <button className="icon-btn raised" onClick={() => setStyleOpen((v) => !v)} aria-label="Map style" aria-expanded={styleOpen}>
          <Layers />
        </button>
        <button className={`icon-btn raised ${follow ? 'on' : ''}`} onClick={() => (setFollow(true), fitCrew())} aria-label="Follow the crew" aria-pressed={follow}>
          <Users />
        </button>
        <button className="icon-btn raised" onClick={locateMe} aria-label="My location">
          <Crosshair />
        </button>
        <button
          className="icon-btn raised"
          onClick={() => openSheet({ t: 'compass', target: { lat: db.place.base.lat, lon: db.place.base.lon, name: 'Base' } })}
          aria-label="Compass to base"
        >
          <Compass />
        </button>
        {styleOpen && (
          <div className="style-pop card">
            {(['liberty', 'positron', 'bright', 'dark'] as const).map((s) => (
              <button
                key={s}
                className="chip"
                aria-pressed={settings.mapStyle === s}
                onClick={() => {
                  setSettings({ mapStyle: s });
                  setStyleOpen(false);
                }}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* bottom panel */}
      <div className="map-bottom">
        {nav ? (
          <div className="card nav-card">
            <div className="nav-head">
              <span className="ico-tile" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}>
                <Navigation />
              </span>
              <span className="grow">
                <span className="t">To {nav.name}</span>
                <span className="s">
                  {nav.loading
                    ? 'Finding a walking route…'
                    : nav.res
                      ? `${durationLabel(nav.res.duration * 1000)} walk · ${fmtDistance(nav.res.distance)}`
                      : nav.err}
                </span>
              </span>
              <button className="icon-btn" onClick={stopNav} aria-label="Stop navigation">
                <X />
              </button>
            </div>
            <div className="nav-actions">
              <a className="btn sm" href={mapsLink(nav.to[1], nav.to[0], 'transit', loc.fix ? [loc.fix.lon, loc.fix.lat] : undefined)} target="_blank" rel="noreferrer">
                <ExternalLink /> Transit (Google)
              </a>
              <a className="btn sm" href={mapsLink(nav.to[1], nav.to[0], 'walking')} target="_blank" rel="noreferrer">
                <Footprints /> Walk (Google)
              </a>
              <button className="btn sm" onClick={() => openSheet({ t: 'compass', target: { lat: nav.to[1], lon: nav.to[0], name: nav.name } })}>
                <Compass /> Compass
              </button>
            </div>
            {nav.res && nav.res.steps.length > 1 && (
              <details className="nav-steps">
                <summary>
                  <RouteIcon aria-hidden /> {nav.res.steps.length} steps
                </summary>
                <ol>
                  {nav.res.steps.map((s, i) => (
                    <li key={i}>
                      {s.text} <span className="muted">· {fmtDistance(s.distance)}</span>
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </div>
        ) : (
          <div className={`card map-panel ${panel ? '' : 'collapsed'}`}>
            <button className="map-panel-toggle" onClick={() => setPanel((v) => !v)} aria-expanded={panel} aria-label={panel ? 'Collapse panel' : 'Expand panel'}>
              {panel ? <ChevronDown /> : <ChevronUp />}
            </button>
            {panel && (
              <div className="map-crew">
                {groupCrew(crew).map((grp) => {
                  const pos = grp[0];
                  const people = grp.map((g) => db.person[g.person]).filter(Boolean);
                  if (!people.length) return null;
                  const line = crewLine(pos, db, t);
                  return (
                    <button
                      key={grp.map((g) => g.person).join('-')}
                      className="map-crew-row"
                      onClick={() => {
                        setFollow(false);
                        mapRef.current?.flyTo({ center: pos.p, zoom: Math.max(14, mapRef.current.getZoom()) });
                      }}
                    >
                      <span className="stack">
                        {people.map((person) => (
                          <span key={person.id} className="avatar sm" style={{ ['--c' as string]: person.color }}>
                            {person.name[0]}
                          </span>
                        ))}
                      </span>
                      <span className="map-crew-t">
                        <b>{people.length > 1 ? namesOf(people, db.people.length) : people[0].name}</b> {line.title}
                      </span>
                    </button>
                  );
                })}
                {myDistHome != null && myDistHome > 150 && (
                  <button className="btn sm home-btn" onClick={() => startNav([db.place.base.lon, db.place.base.lat], 'Base')}>
                    🏠 Home · {fmtDistance(myDistHome)}
                  </button>
                )}
              </div>
            )}
            <TimeMachine compact={!panel} />
          </div>
        )}
      </div>
    </div>
  );
}
