import { createRouter, createWebHistory } from 'vue-router';
import CommunityView from '@/views/CommunityView.vue';

const routes = [
  {
    path: '/',
    name: 'community',
    component: CommunityView,
    children: [
      {
        path: 'radio',
        name: 'radio',
        component: () => import('@/views/RadioView.vue')
      },
      {
        path: 'clubs',
        name: 'clubs',
        component: () => import('@/views/FanClubView.vue'),
        children: [
          {
            path: ':id',
            name: 'club-detail',
            component: () => import('@/views/FanClubDetailView.vue')
          }
        ]
      },
      {
        path: 'forums',
        name: 'forums',
        component: () => import('@/views/ForumView.vue'),
        children: [
          {
            path: ':id',
            name: 'forum-detail',
            component: () => import('@/views/ForumDetailView.vue')
          }
        ]
      },
      {
        path: 'playlists',
        name: 'playlists',
        component: () => import('@/views/PlaylistView.vue'),
        children: [
          {
            path: ':id',
            name: 'playlist-detail',
            component: () => import('@/views/PlaylistDetailView.vue')
          }
        ]
      },
      {
        path: 'events',
        name: 'events',
        component: () => import('@/views/EventsView.vue'),
        children: [
          {
            path: ':id',
            name: 'event-detail',
            component: () => import('@/views/EventDetailView.vue')
          }
        ]
      },
      {
        path: 'polls',
        name: 'polls',
        component: () => import('@/views/PollsView.vue'),
        children: [
          {
            path: ':id',
            name: 'poll-detail',
            component: () => import('@/views/PollDetailView.vue')
          }
        ]
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('@/views/NotificationsView.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 