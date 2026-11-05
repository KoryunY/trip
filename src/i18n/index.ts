// Tiny i18n: English is the source language; Russian via dictionary lookup.
import { getSettings, useSettings } from '../lib/store';
import { RU } from './ru';

export type Lang = 'en' | 'ru';

export const getLang = (): Lang => (getSettings().lang === 'ru' ? 'ru' : 'en');
export const useLang = (): Lang => (useSettings().lang === 'ru' ? 'ru' : 'en');
export const locale = () => (getLang() === 'ru' ? 'ru-RU' : 'en-GB');

/** translate a UI string; keeps leading/trailing whitespace; {var} interpolation */
export function t(s: string, vars?: Record<string, string | number>): string {
  let out = s;
  if (getLang() === 'ru') {
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
    const hit = RU[m[2]];
    if (hit !== undefined) out = m[1] + hit + m[3];
  }
  if (vars) out = out.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined ? `{${k}}` : String(vars[k])));
  return out;
}

/** plural word: en [one, other], ru [one, few, many] */
export function plural(n: number, en: [string, string], ru: [string, string, string]): string {
  if (getLang() !== 'ru') return n === 1 ? en[0] : en[1];
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return ru[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return ru[1];
  return ru[2];
}
