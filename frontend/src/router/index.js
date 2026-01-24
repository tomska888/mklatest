import { createRouter, createWebHistory } from 'vue-router';

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

function isExpired(payload) {
    if (!payload?.exp) return false;
    return Date.now() >= payload.exp * 1000;
}

function getAuth() {
    const token = localStorage.getItem('token');
    if (!token) return { token: null, user: null };

    const user = parseJwt(token);

    // If token is malformed or expired, drop it so the UI doesn't get stuck in a bad state.
    if (!user || isExpired(user)) {
        localStorage.removeItem('token');
        return { token: null, user: null };
    }

    return { token, user };
}

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: () => import('../pages/Home.vue') },
        { path: '/cars', name: 'cars', component: () => import('../pages/Cars.vue') },
        { path: '/cars/:id', name: 'car-details', component: () => import('../pages/CarDetails.vue') },
        { path: '/about', name: 'about', component: () => import('../pages/About.vue') },
        { path: '/contact', name: 'contact', component: () => import('../pages/Contact.vue') },
        { path: '/login', name: 'login', component: () => import('../pages/Login.vue'), meta: { guestOnly: true } },
        { path: '/register', name: 'register', component: () => import('../pages/Register.vue'), meta: { guestOnly: true } },
        { path: '/profile', name: 'profile', component: () => import('../pages/Profile.vue'), meta: { requiresAuth: true } },
        { path: '/admin', name: 'admin', component: () => import('../pages/AdminPanelFigma.vue'), meta: { requiresAuth: true, roles: ['owner', 'admin', 'employee'] } }
    ],
    scrollBehavior() { return { top: 0 }; }
});

router.beforeEach((to, from, next) => {
    const { token, user } = getAuth();
    if (to.meta?.guestOnly && token) return next('/');
    if (to.meta?.requiresAuth && !token) return next({ name: 'login', query: { redirect: to.fullPath } });

    // If a route has role restrictions, require a valid decoded user.
    if (to.meta?.roles) {
        if (!user) return next({ name: 'login', query: { redirect: to.fullPath } });
        if (!to.meta.roles.includes(user.role)) return next('/');
    }

    next();
});

export default router;
