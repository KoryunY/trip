import { GUIDES, type Guide } from '../data/guides';
import { getLang } from './index';
import { GUIDES_RU } from './guides.ru';

/** guides in the current language (falls back to English per guide) */
export function guides(): Guide[] {
  if (getLang() !== 'ru') return GUIDES;
  return GUIDES.map((g) => GUIDES_RU.find((r) => r.id === g.id) ?? g);
}
