import { defineStore } from 'pinia';

const THEME_KEY = 'theme';

function prefersDark() {
    try {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (_) {
        return false;
    }
}

export const useThemeStore = defineStore('theme', {
    state: () => ({
        mode: 'dark',
        initialized: false,
    }),
    actions: {
        apply(mode) {
            this.mode = mode;
            const root = document.documentElement;
            root.setAttribute('data-theme', mode);
            document.body.classList.toggle('dark', mode === 'dark');
            try {
                localStorage.setItem(THEME_KEY, mode);
            } catch (_) { }
        },
        init() {
            if (this.initialized) return;
            let saved = null;
            try {
                saved = localStorage.getItem(THEME_KEY);
            } catch (_) { }
            // Default to system preference if nothing saved
            const mode = saved || (prefersDark() ? 'dark' : 'light');
            this.apply(mode);
            this.initialized = true;
        },
        toggle() {
            this.apply(this.mode === 'dark' ? 'light' : 'dark');
        },
        set(mode) {
            this.apply(mode === 'dark' ? 'dark' : 'light');
        }
    }
});
