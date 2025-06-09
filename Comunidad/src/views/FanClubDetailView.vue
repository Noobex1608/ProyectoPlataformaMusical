<template>
  <div class="fan-club-detail">
    <!-- Encabezado del Club -->
    <div class="club-header relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-6">
      <img :src="club.banner_url" 
           :alt="club.name"
           class="w-full h-full object-cover">
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
        <h1 class="text-3xl font-bold text-white mb-2">{{ club.name }}</h1>
        <p class="text-white/90">{{ members.length }} miembros</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Información del Club -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">Sobre el Club</h2>
          <p class="text-gray-600">{{ club.description }}</p>
          
          <div class="mt-6">
            <h3 class="font-semibold mb-2">Reglas del Club</h3>
            <div class="text-gray-600 whitespace-pre-line">{{ club.rules }}</div>
          </div>
        </div>

        <!-- Publicaciones -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold">Publicaciones</h2>
            <button v-if="isMember"
                    @click="openNewPostModal"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Nueva Publicación
            </button>
          </div>

          <div class="space-y-6">
            <div v-for="post in posts" 
                 :key="post.id" 
                 class="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
              <div class="flex items-start space-x-4">
                <img :src="post.author?.avatar_url || '/default-avatar.jpg'" 
                     :alt="post.author?.username || 'Usuario'"
                     class="w-10 h-10 rounded-full">
                <div class="flex-1">
                  <div class="flex justify-between">
                    <h3 class="font-semibold">{{ post.author?.username || 'Usuario' }}</h3>
                    <span class="text-sm text-gray-500">
                      {{ formatDate(post.created_at) }}
                    </span>
                  </div>
                  <p class="mt-2 text-gray-600">{{ post.content }}</p>
                  
                  <div class="flex items-center space-x-4 mt-4">
                    <button @click="toggleLike(post)"
                            class="flex items-center space-x-1 text-gray-500 hover:text-primary-600">
                      <span class="material-icons text-sm">
                        {{ post.isLiked ? 'favorite' : 'favorite_border' }}
                      </span>
                      <span>{{ post.likes_count }}</span>
                    </button>
                    <button @click="openComments(post)"
                            class="flex items-center space-x-1 text-gray-500 hover:text-primary-600">
                      <span class="material-icons text-sm">chat_bubble_outline</span>
                      <span>{{ post.comments_count }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <!-- Botón de Unirse -->
        <div v-if="!isMember" class="bg-white rounded-lg shadow p-6 mb-6">
          <button @click="joinClub"
                  class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Unirme al Club
          </button>
        </div>

        <!-- Miembros -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Miembros</h2>
          <div class="space-y-4">
            <div v-for="member in members" 
                 :key="member.user_id" 
                 class="flex items-center space-x-3">
              <img :src="member.avatar_url || '/default-avatar.jpg'" 
                   :alt="member.username || 'Usuario'"
                   class="w-8 h-8 rounded-full">
              <div>
                <p class="font-medium">{{ member.username || 'Usuario' }}</p>
                <p class="text-sm text-gray-500">{{ member.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useFanClubStore } from '@/stores/fanClub';
import type { FanClub, ClubMember, ClubPost, UserProfile } from '@/types/community.types';

const route = useRoute();
const fanClubStore = useFanClubStore();

const club = ref<FanClub>({
  id: '',
  name: '',
  description: '',
  banner_url: '',
  artist_id: '',
  artist_name: '',
  rules: '',
  created_at: ''
});

const posts = ref<ClubPost[]>([]);
const members = ref<(ClubMember & UserProfile)[]>([]);
const isMember = ref(false);

onMounted(async () => {
  const clubId = route.params.id as string;
  await loadClubData(clubId);
  await loadPosts(clubId);
  await loadMembers(clubId);
  checkMembership(clubId);
});

async function loadClubData(clubId: string) {
  club.value = await fanClubStore.getClubById(clubId);
}

async function loadPosts(clubId: string) {
  posts.value = await fanClubStore.getClubPosts(clubId);
}

async function loadMembers(clubId: string) {
  members.value = await fanClubStore.getClubMembers(clubId);
}

async function checkMembership(clubId: string) {
  isMember.value = await fanClubStore.checkMembership(clubId);
}

async function joinClub() {
  await fanClubStore.joinClub(club.value.id);
  isMember.value = true;
  await loadMembers(club.value.id); 
}

function openNewPostModal() {
  // Se Implementara lógica para abrir modal de nueva publicación
}

async function toggleLike(post: ClubPost) {
  await fanClubStore.togglePostLike(post.id);
  // Se Actualizara el estado local del post
}

function openComments(post: ClubPost) {
  // Se Implementara lógica para abrir modal de comentarios
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
</script>

<style scoped>
</style>