<template>
  <div class="forum-view">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Foros de Artistas</h2>
      <button @click="openNewForumModal"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Nuevo Tema
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <input type="text"
                 v-model="searchQuery"
                 placeholder="Buscar en los foros..."
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
        </div>
        <select v-model="selectedArtist"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          <option value="">Todos los artistas</option>
          <option v-for="artist in artists" 
                  :key="artist.id" 
                  :value="artist.id">
            {{ artist.name }}
          </option>
        </select>
        <select v-model="sortBy"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          <option value="recent">Más recientes</option>
          <option value="popular">Más populares</option>
          <option value="comments">Más comentados</option>
        </select>
      </div>
    </div>

    <!-- Lista de Temas -->
    <div class="space-y-4">
      <div v-for="forum in filteredForums" 
           :key="forum.id" 
           class="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
        <router-link :to="{ name: 'forum-detail', params: { id: forum.id }}"
                     class="block p-6">
          <div class="flex items-start space-x-4">
            <img :src="getArtistAvatar(forum)" 
                 :alt="getArtistName(forum)"
                 class="w-12 h-12 rounded-full">
            <div class="flex-1">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg font-semibold mb-1">{{ forum.title }}</h3>
                  <p class="text-sm text-gray-500">
                    Por {{ forum.author_id }}
                  </p>
                </div>
                <span class="text-sm text-gray-500">
                  {{ formatDate(forum.created_at) }}
                </span>
              </div>
              <p class="mt-2 text-gray-600 line-clamp-2">{{ forum.content }}</p>
              
              <div class="flex items-center space-x-6 mt-4">
                <div class="flex items-center space-x-2 text-gray-500">
                  <span class="material-icons text-sm">favorite</span>
                  <span>{{ forum.likes_count }}</span>
                </div>
                <div class="flex items-center space-x-2 text-gray-500">
                  <span class="material-icons text-sm">chat_bubble</span>
                  <span>{{ forum.comments_count }}</span>
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="mt-6 flex justify-center">
      <nav class="flex items-center space-x-2">
        <button @click="prevPage"
                :disabled="currentPage === 1"
                class="p-2 rounded-lg border border-gray-300 disabled:opacity-50">
          <span class="material-icons">chevron_left</span>
        </button>
        <span class="px-4 py-2">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <button @click="nextPage"
                :disabled="currentPage === totalPages"
                class="p-2 rounded-lg border border-gray-300 disabled:opacity-50">
          <span class="material-icons">chevron_right</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCommunityStore } from '@/stores/community.store';
import type { Artist, ForumPost } from '@/types/community.types';

const communityStore = useCommunityStore();

const forums = ref<ForumPost[]>([]);
const artists = ref<Artist[]>([]);
const searchQuery = ref('');
const selectedArtist = ref('');
const sortBy = ref('recent');
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 10;

// Utilidades para obtener datos de artista
function getArtistName(forum: ForumPost): string {
  const artist = artists.value.find(a => a.id === (forum as any).artist_id);
  return artist ? artist.name : 'Artista';
}
function getArtistAvatar(forum: ForumPost): string {
  const artist = artists.value.find(a => a.id === (forum as any).artist_id);
  return artist?.image_url || '/default-artist.jpg';
}

// Filtrado y ordenamiento
const filteredForums = computed(() => {
  let result = [...forums.value];

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(forum => 
      forum.title.toLowerCase().includes(query) ||
      forum.content.toLowerCase().includes(query)
    );
  }

  // Filtrar por artista
  if (selectedArtist.value) {
    result = result.filter(forum => (forum as any).artist_id === selectedArtist.value);
  }

  // Ordenar
  switch (sortBy.value) {
    case 'popular':
      result.sort((a, b) => b.likes_count - a.likes_count);
      break;
    case 'comments':
      result.sort((a, b) => b.comments_count - a.comments_count);
      break;
    default: // recent
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return result;
});

onMounted(async () => {
  await loadForums();
  await loadArtists();
});

async function loadForums() {
  // Usa communityStore para cargar los foros
  await communityStore.fetchArtistForums(selectedArtist.value || '');
  forums.value = communityStore.artistForums;
  // Paginación simple
  totalPages.value = Math.max(1, Math.ceil(forums.value.length / itemsPerPage));
}

async function loadArtists() {
  // Aquí deberías cargar los artistas desde tu backend o store
  // Por ejemplo, si tienes un método communityStore.fetchArtists:
  // await communityStore.fetchArtists();
  // artists.value = communityStore.artists;
  // Por ahora, dejar vacío o simulado
  artists.value = [];
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function openNewForumModal() {
  // Implementar lógica para abrir modal de nuevo tema
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

watch([currentPage, selectedArtist, sortBy], loadForums);
</script>

<style scoped>
/* Las clases se definen ahora en style.css usando @layer components */
</style>