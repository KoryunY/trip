// Currency conversion with live rates (open.er-api.com, free) and offline fallback.
import { useEffect, useState } from 'react';

// CZK per 1 unit (Nov 2026 research values)
export const FALLBACK: Record<string, number> = { CZK: 1, EUR: 24.3, CHF: 26.4, USD: 21.0, AMD: 0.0606, GBP: 28.0 };
const LS = 'pc.rates.v1';
let rates: { at: number; czkPer: Record<string, number> } | null = (() => {
  try {
    return JSON.parse(localStorage.getItem(LS) || 'null');
  } catch {
    return null;
  }
})();

export function czkPer(cur: string): number {
  return rates?.czkPer[cur] ?? FALLBACK[cur] ?? 1;
}
export function toCZK(amount: number, cur: string) {
  return amount * czkPer(cur);
}
export function fromCZK(czk: number, cur: string) {
  return czk / czkPer(cur);
}

export function useRates() {
  const [, setV] = useState(0);
  useEffect(() => {
    if (rates && Date.now() - rates.at < 12 * 3600_000) return;
    fetch('https://open.er-api.com/v6/latest/CZK')
      .then((r) => r.json())
      .then((j) => {
        if (j?.result !== 'success') return;
        const czkPer: Record<string, number> = { CZK: 1 };
        for (const c of Object.keys(FALLBACK)) if (j.rates[c]) czkPer[c] = 1 / j.rates[c];
        rates = { at: Date.now(), czkPer };
        localStorage.setItem(LS, JSON.stringify(rates));
        setV((v) => v + 1);
      })
      .catch(() => {});
  }, []);
  return { at: rates?.at ?? null, czkPer };
}

export const CURRENCIES = ['CZK', 'EUR', 'CHF', 'AMD', 'USD'];

export function fmtMoney(n: number, cur: string) {
  const digits = cur === 'CZK' || cur === 'AMD' ? 0 : 2;
  return `${n.toLocaleString('en', { maximumFractionDigits: digits, minimumFractionDigits: digits === 2 && Math.abs(n) < 100 ? 2 : 0 })} ${cur}`;
}
