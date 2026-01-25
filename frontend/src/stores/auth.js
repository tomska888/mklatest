import { defineStore } from 'pinia';

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (_) {
        return null;
    }
}

export const useAuthStore = defineStore('auth', {
    state: () => {
        const token = localStorage.getItem('token');
        return {
            token: token || null,
            user: token ? parseJwt(token) : null,
        };
    },
    getters: {
        isAuthenticated: (state) => !!state.token && !!state.user,
    },
    actions: {
        setToken(token) {
            this.token = token;
            if (token) {
                localStorage.setItem('token', token);
                this.user = parseJwt(token);
            } else {
                localStorage.removeItem('token');
                this.user = null;
            }
        },
        logout() {
            this.setToken(null);
        },
    },
});
