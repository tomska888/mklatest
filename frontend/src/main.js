import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index.js';

import { i18n } from './i18n/index.js';

// Global styles and vendor CSS
import 'swiper/swiper-bundle.css';
import './styles/main.scss';
import { useThemeStore } from './stores/theme.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

// Initialize theme before mount to avoid FOUC
const theme = useThemeStore(pinia);
theme.init();

app.mount('#app');
