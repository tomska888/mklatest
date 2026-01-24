import { defineStore } from 'pinia';
import { ref } from 'vue';
import { setLocale, SUPPORTED_LOCALES } from '../i18n/index.js';

export const useLocaleStore = defineStore('locale', () => {
    const locale = ref(localStorage.getItem('locale') || 'en');

    function set(code) {
        if (!SUPPORTED_LOCALES.includes(code)) return;
        locale.value = code;
        setLocale(code);
    }

    return { locale, set, SUPPORTED_LOCALES };
});
