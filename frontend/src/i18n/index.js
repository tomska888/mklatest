import { createI18n } from 'vue-i18n';

import en from './locales/en.json';
import de from './locales/de.json';
import lt from './locales/lt.json';
import pl from './locales/pl.json';
import ru from './locales/ru.json';

const SUPPORTED = ['en', 'de', 'lt', 'pl', 'ru'];

function detectInitialLocale() {
    const saved = localStorage.getItem('locale');
    if (saved && SUPPORTED.includes(saved)) return saved;

    // browser language, normalize like "en-US" -> "en"
    const browser = (navigator.language || 'en').toLowerCase().split('-')[0];
    if (SUPPORTED.includes(browser)) return browser;

    return 'en';
}

export const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: detectInitialLocale(),
    fallbackLocale: 'en',
    messages: { en, de, lt, pl, ru }
});

export function setLocale(locale) {
    if (!SUPPORTED.includes(locale)) return;
    i18n.global.locale.value = locale;
    localStorage.setItem('locale', locale);
}

export { SUPPORTED as SUPPORTED_LOCALES };
