<template>
  <div class="notification-bell">
    <router-link 
      :to="{ name: 'notifications' }"
      custom
      v-slot="{ navigate }"
    >
      <button 
        class="bell-button"
        @click="navigate"
        :class="{ 'has-notifications': hasUnreadNotifications }"
      >
        <i class="fas fa-bell"></i>
        <span v-if="unreadCount" class="notification-badge">
          {{ formatCount(unreadCount) }}
        </span>
      </button>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCommunityStore } from '@/stores/community.store';

const communityStore = useCommunityStore();

const unreadCount = computed(() => communityStore.unreadCount);
const hasUnreadNotifications = computed(() => communityStore.hasUnreadNotifications);

const formatCount = (count: number): string => {
  return count > 99 ? '99+' : count.toString();
};
</script>

<style scoped>
.notification-bell {
  position: relative;
  display: inline-block;
}

.bell-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  position: relative;
  font-size: 1.25rem;
  color: #666;
  transition: color 0.2s;
}

.bell-button:hover {
  color: #1db954;
}

.bell-button.has-notifications {
  color: #1db954;
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #e74c3c;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(25%, -25%);
}

@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }
  30%, 50%, 70% {
    transform: translate3d(-2px, 0, 0);
  }
  40%, 60% {
    transform: translate3d(2px, 0, 0);
  }
}
</style> 