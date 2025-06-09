<template>
  <div class="fan-club-card">
    <img :src="club.image" :alt="`Imagen de ${club.name}`">
    <div class="club-info">
      <h3>{{ club.name }}</h3>
      <p>{{ club.member_count }} miembros</p>
      <button @click="handleJoin" :disabled="isMember">
        {{ isMember ? 'Miembro' : 'Unirse' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  club: {
    id: string;
    name: string;
    image: string;
    member_count: number;
  };
  isMember: boolean;
}>();

const emit = defineEmits(['join']);

const handleJoin = () => {
  emit('join');
};

</script>

<style scoped>
.fan-club-card {
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  overflow: hidden;
  max-width: 280px;
}
</style>