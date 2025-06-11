import { createRouter, createWebHistory } from 'vue-router';
import RegisterView from '@/views/RegisterView.vue';

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/views/CommunityView.vue')
  },
  {
    path: '/community/radio',
    name: 'radio',
    component: () => import('@/views/RadioView.vue')
  },
  {
    path: '/community/clubs',
    name: 'clubs',
    component: () => import('@/views/FanClubView.vue')
  },
  {
    path: '/community/forums',
    name: 'forums',
    component: () => import('@/views/ForumView.vue')
  },
  {
    path: '/community/playlists',
    name: 'playlists',
    component: () => import('@/views/PlaylistView.vue')
  },
  {
    path: '/community/events',
    name: 'events',
    component: () => import('@/views/EventsView.vue')
  },
  {
    path: '/community/polls',
    name: 'polls',
    component: () => import('@/views/PollsView.vue')
  },
  {
    path: '/community/notifications',
    name: 'notifications',
    component: () => import('@/views/NotificationsView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;