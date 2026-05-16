import { createRouter, createWebHistory } from 'vue-router';
import AboutPage from '../components/About.vue';
import LandingPage from '../components/LandingPage.vue';
import AppPage from '../components/AppPage.vue';
import HistoryPage from '../components/HistoryPage.vue';
import LoginPage from '../components/LoginPage.vue';
import PracticePage from '../components/PracticePage.vue';
import PracticeListPage from '../components/PracticeListPage.vue';
import HiwarPage from '../components/HiwarPage.vue';
import HiwarRoleplayPage from '../components/HiwarRoleplayPage.vue';
import TransactionLogsPage from '../components/TransactionLogsPage.vue';
import ChatPage from '../components/ChatPage.vue';
import HomePage from '../components/HomePage.vue';
import { supabase } from '../lib/supabase.js';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/transaksi',
    name: 'TransactionLogs',
    component: TransactionLogsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/analisa',
    name: 'App',
    component: AppPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/latihan',
    name: 'PracticeList',
    component: PracticeListPage,
  },
  {
    path: '/latihan/:id',
    name: 'Practice',
    component: PracticePage,
  },
  {
    path: '/hiwar',
    name: 'Hiwar',
    component: HiwarPage,
  },
  {
    path: '/hiwar/:id',
    name: 'HiwarRoleplay',
    component: HiwarRoleplayPage,
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
  {
    path: '/chat',
    name: 'Chat',
    component: ChatPage,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Jika user sudah login dan mencoba ke halaman login atau landing, redirect ke home
  if ((to.name === 'Login' || to.name === 'Landing') && session) {
    return next({ name: 'Home' });
  }

  // Jika halaman butuh auth tetapi user belum login, redirect ke login
  if (to.meta.requiresAuth && !session) {
    return next({ name: 'Login' });
  }

  next();
});

export default router;
