<template>
  <div class="artist-forum">
    <h3>Foro: {{ artistName }}</h3>
    <div class="threads">
      <div v-for="thread in threads" :key="thread.id" class="thread">
        <h4>{{ thread.title }}</h4>
        <p>{{ thread.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  artistName: string;
  threads: Array<{
    id: string;
    title: string;
    content: string;
  }>;
}>();
</script>