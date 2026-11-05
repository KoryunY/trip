import maplibregl, { type GeoJSONSource, type Map as MLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Compass, Crosshair, Layers, Navigation, Route as RouteIcon, Users, X, Footprints, ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LngLat, PlaceCategory } from '../../shared/types';
import { presenceFresh } from '../components/CrewList';
import { CrewStrip, HomeChip, PersonCard, PlaceCard } from '../components/map/MapCards';
import { TimeMachine } from '../components/TimeMachine';
import { toast } from '../components/ui';
import { useTimeState, useNow } from '../lib/clock';
import { useCrew } from '../lib/crew';
import { bboxOf, distance, fmtDistance } from '../lib/geo';
import { useLocation, startWatch, locateOnce, startCompass } from '../lib/location';
import { buildStyle, type BaseStyleName } from '../lib/mapstyle';
import { useIsDark } from '../lib/theme';
import { CAT, KIND_HEX } from '../lib/meta';
import { crewTrails, travelLegs } from '../lib/positions';
import { route as fetchRoute, routeProgress, type RouteResult } from '../lib/routing';
import { useDB, useMe, usePresence, useSettings, setSettings } from '../lib/store';
import { dayKey, durationLabel, zonedToUtc } from '../lib/time';

const dayStartMs = (ms: number) => zonedToUtc(dayKey(ms), '00:00');
import { mapsLink } from '../lib/trip';
import { clearMapIntent, openSheet, useMapIntent } from '../lib/ui';
import { t as tx } from '../i18n';

const PRAGUE: LngLat = [14.44, 50.083];

const FILTERS: { id: string; label: string; cats: PlaceCategory[] | null }[] = [
  { id: 'all', label: tx('All'), cats: null },
  { id: 'plan', label: tx('⭐ In plan'), cats: null },
  { id: 'beer', label: tx('🍺 Beer'), cats: ['beer'] },
  { id: 'sight', label: tx('🏛️ Sights'), cats: ['sight', 'viewpoint', 'museum'] },
  { id: 'food', label: tx('🍽️ Food & cafés'), cats: ['food', 'cafe'] },
  { id: 'night', label: tx('🎉 Night'), cats: ['nightlife', 'venue'] },
  { id: 'transport', label: tx('🚉 Transport'), cats: ['transport'] },
  { id: 'more', label: tx('🛒 Other'), cats: ['shop', 'service', 'daytrip', 'city', 'home'] },
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
  const [styleOpen, setStyleOpen] = useState(false);
  const [noteHidden, setNoteHidden] = useState(false);
  const [navFollow, setNavFollow] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const [sel, setSel] = useState<{ type: 'person' | 'place'; id: string } | null>(null);
  const [followPid, setFollowPid] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<(s: { type: 'person' | 'place'; id: string }) => void>(() => {});
  const crewMarkers = useRef<Map<string, { m: maplibregl.Marker; el: HTMLDivElement }>>(new Map());
  const meMarker = useRef<maplibregl.Marker | null>(null);
  const liveMarkers = useRef<Map<string, maplibregl.Marker>>(new Map());

  const dark = useIsDark();
  const styleName: BaseStyleName = settings.mapStyle === 'liberty' && dark ? 'dark' : settings.mapStyle;

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
    // any user gesture (drag, pinch, rotate) stops auto-following
    map.on('movestart', (e) => {
      if ((e as { originalEvent?: Event }).originalEvent) {
        setFollow(false);
        setFollowPid(null);
      }
    });
    map.on('click', (e) => {
      // tap on empty map clears the selection (place taps are handled by the layer handler)
      const hits = map.getLayer('places') ? map.queryRenderedFeatures(e.point, { layers: ['places'] }) : [];
      if (!hits.length) setSel(null);
    });
    // long-press (touch) / right-click: add a place here
    const addAt = (ll: maplibregl.LngLat) =>
      openSheet({ t: 'placeEdit', draft: { lat: Number(ll.lat.toFixed(5)), lon: Number(ll.lng.toFixed(5)), category: 'sight' } });
    let press: { t: ReturnType<typeof setTimeout>; x: number; y: number } | null = null;
    const cancelPress = () => {
      if (press) clearTimeout(press.t);
      press = null;
    };
    let lastTouch = 0;
    map.on('touchstart', (e) => {
      lastTouch = Date.now();
      cancelPress();
      if (e.originalEvent.touches.length !== 1) return;
      const ll = e.lngLat;
      press = { x: e.point.x, y: e.point.y, t: setTimeout(() => {
        press = null;
        navigator.vibrate?.(15);
        addAt(ll);
      }, 650) };
    });
    map.on('touchmove', (e) => {
      if (press && Math.hypot(e.point.x - press.x, e.point.y - press.y) > 10) cancelPress();
    });
    map.on('touchend', cancelPress);
    map.on('touchcancel', cancelPress);
    map.on('movestart', cancelPress);
    map.on('contextmenu', (e) => {
      if (Date.now() - lastTouch < 2000) return; // touch devices: handled by long-press above
      addAt(e.lngLat);
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
    buildStyle(styleName, dark).then(({ style, remote, hasGlyphs }) => {
      if (cancelled) return;
      setRemote(remote);
      setHasGlyphs(hasGlyphs);
      map.setStyle(style, { diff: false });
    });
    return () => {
      cancelled = true;
    };
  }, [styleName, dark]);

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
    if (!map.getSource('trails')) map.addSource('trails', { type: 'geojson', data: empty });
    if (!map.getLayer('trails'))
      map.addLayer({
        id: 'trails',
        type: 'line',
        source: 'trails',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1.5, 15, 5], 'line-opacity': 0.55, 'line-offset': ['get', 'off'] },
      });
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
    if (!map.getSource('sel')) map.addSource('sel', { type: 'geojson', data: empty });
    if (!map.getLayer('sel-halo'))
      map.addLayer({
        id: 'sel-halo',
        type: 'circle',
        source: 'sel',
        paint: { 'circle-radius': 22, 'circle-color': '#f2a007', 'circle-opacity': 0.28, 'circle-stroke-width': 3, 'circle-stroke-color': '#f2a007' },
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
          'text-color': dark ? '#f4f2ee' : '#18171b',
          'text-halo-color': dark ? '#18181d' : '#ffffff',
          'text-halo-width': 1.6,
        },
      });
    const onClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0];
      if (f?.properties?.id) selectRef.current({ type: 'place', id: String(f.properties.id) });
    };
    const enter = () => (map.getCanvas().style.cursor = 'pointer');
    const leave = () => (map.getCanvas().style.cursor = '');
    map.on('click', 'places', onClick);
    map.on('mouseenter', 'places', enter);
    map.on('mouseleave', 'places', leave);
    return () => {
      map.off('click', 'places', onClick);
      map.off('mouseenter', 'places', enter);
      map.off('mouseleave', 'places', leave);
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

  // ── today's trails ("where we've been") ──
  const trailBucket = Math.floor(t / (10 * 60_000));
  useEffect(() => {
    const map = mapRef.current;
    const src = map?.getSource('trails') as GeoJSONSource | undefined;
    if (!src) return;
    const tt = trailBucket * 10 * 60_000;
    const from = Math.max(dayStartMs(tt), Date.parse('2026-11-12T20:00:00+01:00'));
    if (!showTrails || tt <= from) {
      src.setData({ type: 'FeatureCollection', features: [] });
      return;
    }
    const trails = crewTrails(db.people, db.events, db.place, from, tt, db);
    src.setData({
      type: 'FeatureCollection',
      features: trails
        .filter((tr) => tr.path.length > 1)
        .map((tr, i) => ({
          type: 'Feature' as const,
          properties: { color: tr.color, off: (i - 1) * 2.5 },
          geometry: { type: 'LineString' as const, coordinates: tr.path },
        })),
    });
  }, [trailBucket, db, ready, showTrails]);

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
        elm.setAttribute('role', 'button');
        elm.tabIndex = 0;
        const pid = pos.person;
        const open = (ev: Event) => {
          ev.stopPropagation();
          selectRef.current({ type: 'person', id: pid });
        };
        elm.addEventListener('click', open);
        elm.addEventListener('keydown', (ev) => (ev.key === 'Enter' || ev.key === ' ') && open(ev));
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
      const sig = `${person.color}|${person.name}|${pos.mode}|${icon}|${n > 1}|${pos.label}|${pos.person === me}`;
      if (entry.el.dataset.sig !== sig) {
        entry.el.dataset.sig = sig;
        entry.el.style.setProperty('--c', person.color);
        entry.el.dataset.mode = pos.mode;
        entry.el.classList.toggle('grouped', n > 1);
        entry.el.innerHTML = `<span class="cm-av">${person.name[0]}</span>${moving ? `<span class="cm-badge">${icon}</span>` : ''}<span class="cm-label">${person.name}</span>`;
        entry.el.setAttribute('aria-label', `${person.name}: ${pos.label}`);
        entry.el.title = `${person.name}: ${pos.label}`;
        entry.el.classList.toggle('me', pos.person === me);
      }
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
        m.getElement().title = tx('{name} · live GPS', { name: person.name });
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
  const bottomPad = () => (dockRef.current?.offsetHeight ?? 200) + 90;
  const fitCrew = useCallback(
    (animate = true) => {
      const map = mapRef.current;
      if (!map || !crew.length) return;
      const pts = crew.map((c) => c.p);
      const [w, s, e, n] = bboxOf(pts);
      const spread = distance([w, s], [e, n]);
      const duration = animate ? 800 : 0;
      if (spread < 300) {
        const far = distance([map.getCenter().lng, map.getCenter().lat], pts[0]) > 40_000;
        const opts = { center: pts[0], zoom: Math.max(map.getZoom(), 14.5), padding: { top: 80, bottom: bottomPad(), left: 40, right: 40 } };
        if (far) map.jumpTo(opts);
        else map.easeTo({ ...opts, duration });
      } else
        map.fitBounds(
          [
            [w, s],
            [e, n],
          ],
          { padding: { top: 110, bottom: bottomPad(), left: 60, right: 60 }, maxZoom: 15, duration, linear: true },
        );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [crew],
  );
  const lastFit = useRef({ at: 0, sig: '' });
  useEffect(() => {
    if (!follow || followPid || !ready || !active) return;
    const sig = crew.map((c) => `${c.p[0].toFixed(3)},${c.p[1].toFixed(3)}`).join('|');
    const nowMs = performance.now();
    if (sig === lastFit.current.sig) return; // nobody moved: don't fight the user
    if (ts.playing && nowMs - lastFit.current.at < 900) return;
    lastFit.current = { at: nowMs, sig };
    fitCrew(!ts.playing || ts.speed <= 3600_000);
  }, [crew, follow, followPid, ready, active, ts.playing, ts.speed, fitCrew]);

  // ── camera helpers: smooth, never the zoom-out-then-in "fly" arc ──
  const focusOn = useCallback((center: LngLat, zoom?: number) => {
    const map = mapRef.current;
    if (!map) return;
    const z = zoom ?? Math.max(map.getZoom(), 15);
    const pad = { top: 80, bottom: bottomPad(), left: 30, right: 30 };
    const far = distance([map.getCenter().lng, map.getCenter().lat], center) > 40_000;
    if (far) map.jumpTo({ center, zoom: z, padding: pad });
    else map.easeTo({ center, zoom: z, padding: pad, duration: 650 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = useCallback(
    (s: { type: 'person' | 'place'; id: string }) => {
      setSel(s);
      setFollow(false);
      if (s.type === 'person') {
        const pos = crew.find((c) => c.person === s.id);
        if (pos) focusOn(pos.p);
        setFollowPid(s.id);
      } else {
        setFollowPid(null);
        const pl = db.place[s.id];
        if (pl) focusOn([pl.lon, pl.lat], Math.max(mapRef.current?.getZoom() ?? 15, 15));
      }
    },
    [crew, db.place, focusOn],
  );
  selectRef.current = select;

  // big time jumps (picker, moments, back to live) re-frame the crew unless following one person
  const lastT = useRef(t);
  useEffect(() => {
    const jump = Math.abs(t - lastT.current) > 2 * 3600_000 && !ts.playing;
    lastT.current = t;
    if (jump && !followPid && ready) {
      lastFit.current.sig = '';
      setFollow(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  // follow one person (camera stays on them as they move)
  useEffect(() => {
    if (!followPid || !ready || !active) return;
    const pos = crew.find((c) => c.person === followPid);
    const map = mapRef.current;
    if (!pos || !map) return;
    const c = map.getCenter();
    if (distance([c.lng, c.lat], pos.p) < 15) return;
    if (distance([c.lng, c.lat], pos.p) > 40_000) map.jumpTo({ center: pos.p, padding: { top: 80, bottom: bottomPad(), left: 30, right: 30 } });
    else map.easeTo({ center: pos.p, duration: ts.playing ? 250 : 600, padding: { top: 80, bottom: bottomPad(), left: 30, right: 30 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crew, followPid, ready, active]);

  // highlight the selected place
  useEffect(() => {
    const src = mapRef.current?.getSource('sel') as GeoJSONSource | undefined;
    if (!src) return;
    const pl = sel?.type === 'place' ? db.place[sel.id] : undefined;
    src.setData(
      pl
        ? { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [pl.lon, pl.lat] } }] }
        : { type: 'FeatureCollection', features: [] },
    );
  }, [sel, db.place, ready]);
  // mark the selected crew marker
  useEffect(() => {
    for (const [pid, e] of crewMarkers.current) e.el.classList.toggle('selected', sel?.type === 'person' && sel.id === pid);
  }, [sel, crew]);

  // ── intents from other screens ──
  useEffect(() => {
    if (!intent || !ready) return;
    const map = mapRef.current!;
    if (intent.focus) {
      setFollow(false);
      setFollowPid(null);
      if (intent.focus.placeId) setSel({ type: 'place', id: intent.focus.placeId });
      focusOn(intent.focus.lngLat, intent.focus.zoom ?? 16);
    }
    if (intent.fitCrew) {
      setSel(null);
      setFollowPid(null);
      setFollow(true);
      lastFit.current.sig = '';
      fitCrew();
    }
    if (intent.route) {
      setFollow(false);
      startNav(intent.route.to, intent.route.name);
    }
    if (intent.person) select({ type: 'person', id: intent.person });
    void map;
    clearMapIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, ready]);

  // ── follow-me navigation ──
  const prog = nav?.res && loc.fix ? routeProgress(nav.res, [loc.fix.lon, loc.fix.lat]) : null;
  const distToDest = nav && loc.fix ? distance([loc.fix.lon, loc.fix.lat], nav.to) : null;
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !navFollow || !loc.fix) return;
    const heading = loc.compass ?? loc.fix.heading;
    map.easeTo({ center: [loc.fix.lon, loc.fix.lat], zoom: Math.max(map.getZoom(), 17), bearing: heading ?? map.getBearing(), pitch: 45, duration: 700 });
  }, [navFollow, loc.fix, loc.compass]);
  useEffect(() => {
    if (nav && distToDest != null && distToDest < 35 && navFollow) {
      setNavFollow(false);
      toast(tx('You’ve arrived at {place} 🎉', { place: nav.name }));
      navigator.vibrate?.([60, 60, 120]);
    }
  }, [distToDest, nav, navFollow]);

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
      if (!fix) toast(tx("No GPS fix, so the route starts from the base"));
    } catch (err) {
      // offline or routing down: straight line + compass
      const src = mapRef.current?.getSource('route') as GeoJSONSource | undefined;
      src?.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [from, to] } });
      setNav({ to, name, err: navigator.onLine ? String((err as Error).message) : tx("Offline: straight-line direction shown. Use the compass.") });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const stopNav = () => {
    setNav(null);
    setNavFollow(false);
    mapRef.current?.easeTo({ pitch: 0, bearing: 0, duration: 500 });
    const src = mapRef.current?.getSource('route') as GeoJSONSource | undefined;
    src?.setData({ type: 'FeatureCollection', features: [] });
  };

  const locateMe = async () => {
    setFollow(false);
    startWatch();
    const fix = await locateOnce();
    if (fix) focusOn([fix.lon, fix.lat], 16);
    else toast(loc.error ?? tx("Could not get your location"));
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
        {!remote && !noteHidden && (
          <div className="map-offline-note" role="status">
            <span>{tx("No street map right now. Settings → Download offline map.")}</span>
            <button onClick={() => setNoteHidden(true)} aria-label={tx("Dismiss")}>
              <X />
            </button>
          </div>
        )}
      </div>
      {/* right controls */}
      <div className="map-controls">
        <button className="icon-btn raised" onClick={() => setStyleOpen((v) => !v)} aria-label={tx("Map style")} aria-expanded={styleOpen}>
          <Layers />
        </button>
        <button className={`icon-btn raised ${follow ? 'on' : ''}`} onClick={() => (setFollow(true), fitCrew())} aria-label={tx("Follow the crew")} aria-pressed={follow}>
          <Users />
        </button>
        <button className="icon-btn raised" onClick={locateMe} aria-label={tx("My location")}>
          <Crosshair />
        </button>
        <button
          className="icon-btn raised"
          onClick={() => openSheet({ t: 'compass', target: { lat: db.place.base.lat, lon: db.place.base.lon, name: 'Base' } })}
          aria-label={tx("Compass to base")}
        >
          <Compass />
        </button>
        {styleOpen && (
          <div className="style-pop card">
            <button className="chip" aria-pressed={showTrails} onClick={() => setShowTrails((v) => !v)}>{tx("〰 Today’s trails")}</button>
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
                <span className="t">{tx("To ")}{nav.name}</span>
                <span className="s">
                  {nav.loading
                    ? tx("Finding a walking route…")
                    : nav.res && prog
                      ? tx('{dist} left · ~{dur}', { dist: fmtDistance(prog.remaining), dur: durationLabel((prog.remaining / 1.3) * 1000) })
                      : nav.res
                        ? tx('{dur} walk · {dist}', { dur: durationLabel(nav.res.duration * 1000), dist: fmtDistance(nav.res.distance) })
                        : nav.err}
                </span>
              </span>
              <button className="icon-btn" onClick={stopNav} aria-label={tx("Stop navigation")}>
                <X />
              </button>
            </div>
            {navFollow && prog?.next && (
              <div className="nav-next">
                <b className="tnum">{fmtDistance(prog.next.inM)}</b> {prog.next.text}
              </div>
            )}
            {prog && prog.offRoute > 70 && nav.res && (
              <button className="btn sm danger" onClick={() => startNav(nav.to, nav.name)}>{tx("Off route: re-route from here")}</button>
            )}
            <div className="nav-actions">
              {nav.res && (
                <button
                  className={`btn sm ${navFollow ? 'primary' : 'accent'}`}
                  onClick={async () => {
                    if (!navFollow) {
                      startWatch();
                      await startCompass().catch(() => false);
                    } else mapRef.current?.easeTo({ pitch: 0, duration: 400 });
                    setNavFollow((v) => !v);
                  }}
                >
                  <Navigation /> {navFollow ? tx("Following you") : tx("Start")}
                </button>
              )}
              <a className="btn sm" href={mapsLink(nav.to[1], nav.to[0], 'transit', loc.fix ? [loc.fix.lon, loc.fix.lat] : undefined)} target="_blank" rel="noreferrer">
                <ExternalLink />{tx(" Transit (Google)")}</a>
              <a className="btn sm" href={mapsLink(nav.to[1], nav.to[0], 'walking')} target="_blank" rel="noreferrer">
                <Footprints />{tx(" Walk (Google)")}</a>
              <button className="btn sm" onClick={() => openSheet({ t: 'compass', target: { lat: nav.to[1], lon: nav.to[0], name: nav.name } })}>
                <Compass />{tx(" Compass")}</button>
            </div>
            {nav.res && nav.res.steps.length > 1 && (
              <details className="nav-steps">
                <summary>
                  <RouteIcon aria-hidden /> {nav.res.steps.length}{tx(" steps")}</summary>
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
          <div className="map-dock card" ref={dockRef}>
            {sel?.type === 'person' && crew.find((c) => c.person === sel.id) ? (
              <PersonCard
                pos={crew.find((c) => c.person === sel.id)!}
                t={t}
                following={followPid === sel.id}
                onFollow={() => setFollowPid((v) => (v === sel.id ? null : sel.id))}
                onClose={() => {
                  setSel(null);
                  setFollowPid(null);
                }}
                onRoute={(to, name) => startNav(to, name)}
              />
            ) : sel?.type === 'place' && db.place[sel.id] ? (
              <PlaceCard
                place={db.place[sel.id]}
                from={loc.fix ? [loc.fix.lon, loc.fix.lat] : [db.place.base.lon, db.place.base.lat]}
                onClose={() => setSel(null)}
                onRoute={(to, name) => {
                  setSel(null);
                  startNav(to, name);
                }}
              />
            ) : (
              <CrewStrip
                crew={crew}
                t={t}
                onPick={(pid) => select({ type: 'person', id: pid })}
                extra={
                  myDistHome != null && myDistHome > 150 ? (
                    <HomeChip dist={myDistHome} onGo={() => startNav([db.place.base.lon, db.place.base.lat], tx('Base'))} />
                  ) : null
                }
              />
            )}
            <TimeMachine />
          </div>
        )}
      </div>
    </div>
  );
}
