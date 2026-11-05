// Open-Meteo forecast for Prague (free, no key). Cached for offline.
import { useEffect, useState } from 'react';

export interface DayWeather {
  date: string;
  code: number;
  tmax: number;
  tmin: number;
  pop: number | null;
  sunrise?: string;
  sunset?: string;
}
interface Cache {
  at: number;
  days: Record<string, DayWeather>;
  hourly?: { time: string[]; temp: number[]; code: number[] };
}
const LS = 'pc.weather.v1';
const read = (): Cache | null => {
  try {
    return JSON.parse(localStorage.getItem(LS) || 'null');
  } catch {
    return null;
  }
};
let cache: Cache | null = read();
let inflight: Promise<void> | null = null;

async function refresh() {
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=50.086&longitude=14.45&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&hourly=temperature_2m,weather_code&timezone=Europe%2FPrague&forecast_days=16';
  const r = await fetch(url);
  if (!r.ok) return;
  const j = await r.json();
  const days: Record<string, DayWeather> = { ...(cache?.days ?? {}) };
  j.daily.time.forEach((d: string, i: number) => {
    days[d] = {
      date: d,
      code: j.daily.weather_code[i],
      tmax: j.daily.temperature_2m_max[i],
      tmin: j.daily.temperature_2m_min[i],
      pop: j.daily.precipitation_probability_max?.[i] ?? null,
      sunrise: j.daily.sunrise?.[i]?.slice(11),
      sunset: j.daily.sunset?.[i]?.slice(11),
    };
  });
  cache = { at: Date.now(), days, hourly: { time: j.hourly.time, temp: j.hourly.temperature_2m, code: j.hourly.weather_code } };
  try {
    localStorage.setItem(LS, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
}

export function useWeather(): Cache | null {
  const [, setV] = useState(0);
  useEffect(() => {
    if (!cache || Date.now() - cache.at > 3 * 3600_000) {
      if (!inflight)
        inflight = refresh()
          .catch(() => {})
          .finally(() => {
            inflight = null;
          });
      inflight.then(() => setV((v) => v + 1));
    }
  }, []);
  return cache;
}

export function wmo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: '☀️', label: 'Clear' };
  if (code <= 2) return { emoji: '⛅', label: 'Partly cloudy' };
  if (code === 3) return { emoji: '☁️', label: 'Overcast' };
  if (code <= 48) return { emoji: '🌫️', label: 'Fog' };
  if (code <= 57) return { emoji: '🌦️', label: 'Drizzle' };
  if (code <= 67) return { emoji: '🌧️', label: 'Rain' };
  if (code <= 77) return { emoji: '🌨️', label: 'Snow' };
  if (code <= 82) return { emoji: '🌧️', label: 'Showers' };
  if (code <= 86) return { emoji: '🌨️', label: 'Snow showers' };
  return { emoji: '⛈️', label: 'Storm' };
}

/** November normals, used when no forecast is available yet */
export const NORMAL = { tmax: 8, tmin: 2 };

/** hourly forecast at an instant (Prague local hour), if available */
export function weatherAt(cache: { hourly?: { time: string[]; temp: number[]; code: number[] } } | null, ms: number) {
  const h = cache?.hourly;
  if (!h) return null;
  const local = new Date(ms + 3600_000).toISOString().slice(0, 13) + ':00'; // CET (+01:00) during the trip
  const i = h.time.indexOf(local);
  if (i < 0) return null;
  return { temp: h.temp[i], code: h.code[i] };
}
