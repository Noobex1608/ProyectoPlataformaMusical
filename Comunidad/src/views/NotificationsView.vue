<template>
  <div class="notifications-view">
    <div class="notifications-header">
      <h2>Notificaciones</h2>
      <div class="header-actions">
        <button 
          v-if="hasUnreadNotifications"
          @click="markAllAsRead" 
          class="mark-all-button"
        >
          <i class="fas fa-check-double"></i> Marcar todo como leído
        </button>
      </div>
    </div>

    <div class="notifications-list" v-if="notifications.length">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.is_read }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-icon">
          <i :class="getNotificationIcon(notification.type)"></i>
        </div>
        <div class="notification-content">
          <p>{{ notification.content }}</p>
          <span class="notification-time">{{ formatDate(notification.created_at) }}</span>
        </div>
        <button 
          v-if="!notification.is_read"
          @click.stop="markAsRead(notification.id)"
          class="mark-read-button"
        >
          <i class="fas fa-check"></i>
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="fas fa-bell-slash"></i>
      <p>No tienes notificaciones</p>
    </div>

    <div class="footer-actions">
      <button @click="$router.push({ name: 'Community' })" class="external-nav-button">
        Ir a Comunidad
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCommunityStore } from '@/stores/community.store';
import { useAuthStore } from '@/stores/auth.store';
import type { Notification } from '@/types/community.types';

const router = useRouter();
const communityStore = useCommunityStore();
const authStore = useAuthStore();

// Computed
const notifications = computed(() => communityStore.notifications);
const hasUnreadNotifications = computed(() => communityStore.hasUnreadNotifications);

// Métodos
const getNotificationIcon = (type: Notification['type']): string => {
  const icons = {
    mention: 'fas fa-at',
    like: 'fas fa-heart',
    comment: 'fas fa-comment',
    follow: 'fas fa-user-plus',
    event: 'fas fa-calendar',
    poll: 'fas fa-poll'
  };
  return icons[type] || 'fas fa-bell';
};

const handleNotificationClick = (notification: Notification) => {
  if (!notification.is_read) {
    markAsRead(notification.id);
  }

  // Navegar según el tipo de notificación
  if (notification.reference_id && notification.reference_type) {
    switch (notification.reference_type) {
      case 'poll':
        router.push(`/polls/${notification.reference_id}`);
        break;
      case 'club':
        router.push(`/clubs/${notification.reference_id}`);
        break;
      case 'forum':
        router.push(`/forum/post/${notification.reference_id}`);
        break;
      case 'playlist':
        router.push(`/playlists/${notification.reference_id}`);
        break;
    }
  }
};

const markAsRead = async (notificationId: string) => {
  try {
    await communityStore.markNotificationAsRead(notificationId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const markAllAsRead = async () => {
  try {
    const unreadNotifications = notifications.value.filter(n => !n.is_read);
    await Promise.all(
      unreadNotifications.map(n => communityStore.markNotificationAsRead(n.id))
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

const formatDate = (date: string) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInHours = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `hace ${minutes} minutos`;
    }
    return `hace ${Math.floor(diffInHours)} horas`;
  }

  return notificationDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Inicialización
onMounted(async () => {
  if (authStore.user) {
    await communityStore.fetchNotifications();
  }
});
</script>

<style scoped>
.notifications-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.notifications-header h2 {
  font-size: 2.5rem;
  font-weight: bold;
}

.header-actions .mark-all-button {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mark-all-button:hover {
  background: #1db954;
  color: white;
}

.notifications-list {
  display: grid;
  gap: 1.5rem;
}

.notification-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-item:hover {
  transform: translateY(-2px);
}

.notification-item.unread {
  border-left: 4px solid #1db954;
}

.notification-icon {
  font-size: 2rem;
  color: #888;
}

.notification-content p {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.notification-content .notification-time {
  font-size: 0.9rem;
  color: #666;
}

.mark-read-button {
  background: none;
  border: none;
  color: #1db954;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  color: #666;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.footer-actions {
  margin-top: 2rem;
  text-align: center;
}

.external-nav-button {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
}
</style>