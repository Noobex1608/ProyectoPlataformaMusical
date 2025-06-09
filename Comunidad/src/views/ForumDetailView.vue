<template>
  <div class="forum-detail">
    <!-- Encabezado -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex items-start space-x-4">
        <!-- Si tienes datos de artista, muéstralos aquí, si no, elimina esta imagen -->
        <div class="flex-1">
          <h1 class="text-2xl font-bold mb-2">{{ forum.title }}</h1>
          <div class="flex items-center space-x-2 text-gray-500 mb-4">
            <span>{{ forum.author_id }}</span>
            <span>•</span>
            <span>{{ formatDate(forum.created_at) }}</span>
          </div>
          <p class="text-gray-600">{{ forum.content }}</p>
          <div class="flex items-center space-x-6 mt-6">
            <span class="flex items-center space-x-2 text-gray-500">
              <span class="material-icons">
                favorite_border
              </span>
              <span>{{ forum.likes_count }}</span>
            </span>
            <div class="flex items-center space-x-2 text-gray-500">
              <span class="material-icons">chat_bubble</span>
              <span>{{ forum.comments_count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de Comentarios -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-6">Comentarios</h2>
      <div class="mb-8">
        <div class="flex items-start space-x-4">
          <!-- No hay currentUser.avatar_url, solo muestra un placeholder -->
          <div class="flex-1">
            <textarea v-model="newComment"
                      rows="3"
                      placeholder="Escribe un comentario..."
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
            <button @click="submitComment"
                    :disabled="!newComment.trim()"
                    class="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              Comentar
            </button>
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <div v-for="comment in comments" 
             :key="comment.id"
             class="flex items-start space-x-4">
          <div class="flex-1">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-semibold">{{ comment.user_id }}</h3>
                  <span class="text-sm text-gray-500">
                    {{ formatDate(comment.created_at) }}
                  </span>
                </div>
              </div>
              <p class="text-gray-600">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ForumPost, ForumComment } from '@/types/community.types';

const forum = ref<ForumPost>({
  id: '',
  title: '',
  content: '',
  author_id: '',
  created_at: '',
  updated_at: '',
  likes_count: 0,
  comments_count: 0
});

const comments = ref<ForumComment[]>([]);
const newComment = ref('');

onMounted(async () => {
  // Aquí deberías cargar los datos del foro y comentarios usando tu store real
  // forum.value = await ...
  // comments.value = await ...
});

async function submitComment() {
  if (!newComment.value.trim()) return;
  // Implementa la lógica para crear comentario
  newComment.value = '';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
/* Las clases se definen ahora en style.css usando @layer components */
</style>