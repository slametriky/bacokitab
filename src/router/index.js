import { createRouter, createWebHistory } from 'vue-router';
import AboutPage from '../components/About.vue';
import LandingPage from '../components/LandingPage.vue';
import AppPage from '../components/AppPage.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
  },
  {
    path: '/analisa',
    name: 'App',
    component: AppPage,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
