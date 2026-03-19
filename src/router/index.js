import { createRouter, createWebHistory } from 'vue-router';
import AboutPage from '../components/About.vue';
import LandingPage from '../components/LandingPage.vue';
import AppPage from '../components/AppPage.vue';
import LoginPage from '../components/LoginPage.vue';
import { supabase } from '../lib/supabase.js';

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
    meta: { requiresAuth: true },
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Jika user sudah login dan mencoba ke halaman login atau landing, redirect ke analisa
  if ((to.name === 'Login' || to.name === 'Landing') && session) {
    return next({ name: 'App' });
  }

  // Jika halaman butuh auth tetapi user belum login, redirect ke login
  if (to.meta.requiresAuth && !session) {
    return next({ name: 'Login' });
  }

  next();
});

export default router;
