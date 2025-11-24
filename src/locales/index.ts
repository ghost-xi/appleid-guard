import { Language } from '../common/types';
import { zh_cn } from './zh_cn';
import { en_us } from './en_us';

export const locales = {
  zh_cn,
  en_us,
  vi_vn: en_us, // Use English as fallback for Vietnamese
};

export function getLocale(lang: Language) {
  return locales[lang] || locales.zh_cn;
}
