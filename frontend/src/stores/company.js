import { defineStore } from 'pinia';
import { CompanyAPI } from '../api.js';

export const useCompanyStore = defineStore('company', {
    state: () => ({
        info: { name: '', address: '', phone: '', email: '', lat: null, lng: null, about: '' },
        loaded: false,
    }),
    actions: {
        async load() {
            if (this.loaded) return;
            try {
                const data = await CompanyAPI.get();
                this.info = Object.assign({}, this.info, data || {});
            } catch (_) {
                // keep defaults if request fails
            } finally {
                this.loaded = true;
            }
        },
        set(data) {
            this.info = Object.assign({}, this.info, data || {});
        }
    },
});
