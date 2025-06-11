<template>
  <div class="fan-club-view">
    <header class="club-header">
      <h2 class="club-title">Clubes de Fans</h2>
      <button @click="showCreateModal = true" class="create-button">
        <i class="fas fa-plus"></i> Crear Club
      </button>
    </header>

    <main>
      <section v-if="clubs.length" class="clubs-grid">
        <article 
          v-for="club in clubs" 
          :key="club.id"
          class="club-card"
          @click="selectClub(club)"
        >
          <img 
            :src="club.banner_url || '/default-club.jpg'" 
            :alt="club.name"
            class="club-banner"
          >
          <div class="club-info">
            <h3>{{ club.name }}</h3>
            <p>{{ club.description }}</p>
            <div class="club-meta">
              <span>
                <i class="fas fa-users"></i> {{ clubMembers.length }} miembros
              </span>
              <span>
                <i class="fas fa-star"></i> {{ club.artist_name }}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section v-else class="empty-state">
        <p>No hay clubes de fans creados</p>
        <button @click="showCreateModal = true" class="primary-button">Crear Primer Club</button>
      </section>
    </main>

    <!-- Modal de Creación -->
    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #header>
        <h3>Crear Club de Fans</h3>
      </template>

      <template #default>
        <form @submit.prevent="createClub" class="club-form">
          <div class="form-group">
            <label for="name">Nombre del Club</label>
            <input 
              id="name"
              v-model="newClub.name"
              type="text"
              required
              placeholder="Nombre del club"
            >
          </div>

          <div class="form-group">
            <label for="artist">Artista</label>
            <select 
              id="artist"
              v-model="newClub.artist_id"
              required
            >
              <option value="">Selecciona un artista</option>
              <option 
                v-for="artist in artists" 
                :key="artist.id" 
                :value="artist.id"
              >
                {{ artist.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea
              id="description"
              v-model="newClub.description"
              placeholder="Describe el club..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="rules">Reglas del Club</label>
            <textarea
              id="rules"
              v-model="newClub.rules"
              placeholder="Establece las reglas del club..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="banner">Banner del Club</label>
            <input 
              id="banner"
              type="file"
              accept="image/*"
              @change="handleBannerUpload"
            >
          </div>
        </form>
      </template>

      <template #footer>
        <button @click="createClub" class="primary" :disabled="isCreating">
          {{ isCreating ? 'Creando...' : 'Crear Club' }}
        </button>
        <button @click="showCreateModal = false" class="secondary">Cancelar</button>
      </template>
    </Modal>

    <!-- Vista Detallada del Club -->
    <Modal v-if="selectedClub" @close="selectedClub = null" class="club-detail-modal">
      <template #header>
        <div class="club-detail-header">
          <img 
            :src="selectedClub.banner_url || '/default-club.jpg'"
            :alt="selectedClub.name"
            class="club-detail-banner"
          >
          <div class="club-detail-info">
            <h3>{{ selectedClub.name }}</h3>
            <p>{{ selectedClub.description }}</p>
            <div class="club-stats">
              <span>
                <i class="fas fa-users"></i> {{ clubMembers.length }} miembros
              </span>
              <span>
                <i class="fas fa-calendar"></i> Creado el {{ formatDate(selectedClub.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <template #default>
        <div class="club-detail-content">
          <div class="club-actions" v-if="!isMember">
            <button @click="joinClub" class="join-button">
              <i class="fas fa-plus"></i> Unirse al Club
            </button>
          </div>

          <div class="club-sections">
            <nav class="section-tabs">
              <button 
                v-for="tab in ['Actividad', 'Miembros', 'Reglas']" 
                :key="tab"
                :class="{ active: currentTab === tab }"
                @click="currentTab = tab"
              >
                {{ tab }}
              </button>
            </nav>

            <div class="section-content">
              <!-- Actividad -->
              <div v-if="currentTab === 'Actividad'" class="activity-feed">
                <div class="create-post" v-if="isMember">
                  <textarea
                    v-model="newPost"
                    placeholder="Comparte algo con el club..."
                    rows="3"
                  ></textarea>
                  <button @click="createPost" :disabled="!newPost.trim()">
                    Publicar
                  </button>
                </div>

                <div 
                  v-for="post in clubPosts" 
                  :key="post.id"
                  class="club-post"
                >
                  <div class="post-header">
                    <img 
                      :src="post.author?.avatar_url"
                      :alt="post.author?.username"
                      class="user-avatar"
                    >
                    <div class="post-info">
                      <strong>{{ post.author?.username }}</strong>
                      <span>{{ formatDate(post.created_at) }}</span>
                    </div>
                  </div>
                  <p class="post-content">{{ post.content }}</p>
                </div>
              </div>

              <!-- Miembros -->
              <div v-if="currentTab === 'Miembros'" class="members-list">
                <div 
                  v-for="member in clubMembers" 
                  :key="member.user_id"
                  class="member-item"
                >
                  <img 
                    :src="member.avatar_url || '/default-avatar.jpg'"
                    :alt="member.username || 'Usuario'"
                    class="user-avatar"
                  >
                  <div class="member-info">
                    <strong>{{ member.username || 'Usuario' }}</strong>
                    <span>{{ member.role }}</span>
                  </div>
                </div>
              </div>

              <!-- Reglas -->
              <div v-if="currentTab === 'Reglas'" class="club-rules">
                <div class="rules-content">
                  {{ selectedClub.rules }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCommunityStore } from '@/stores/community.store';
import { useAuthStore } from '@/stores/auth.store';
import { useFanClubStore } from '@/stores/fanClub';
import type { FanClub, ClubMember, ClubPost, Artist, UserProfile } from '@/types/community.types';
import Modal from '@/components/shared/Modal.vue';

const communityStore = useCommunityStore();
const authStore = useAuthStore();
const fanClubStore = useFanClubStore();

// Estado
const showCreateModal = ref(false);
const isCreating = ref(false);
const selectedClub = ref<FanClub | null>(null);
const currentTab = ref('Actividad');
const newPost = ref('');
const artists = ref<Artist[]>([]);
const clubMembers = ref<(ClubMember & UserProfile)[]>([]);
const clubPosts = ref<ClubPost[]>([]);

const newClub = ref({
  name: '',
  artist_id: '',
  description: '',
  rules: '',
  banner_url: ''
});

// Computed
const clubs = computed(() => communityStore.fanClubs);
const isMember = computed(() => {
  if (!selectedClub.value || !authStore.user) return false;
  return clubMembers.value.some((member: ClubMember & UserProfile) => member.user_id === authStore.user?.id);
});

// Métodos
const createClub = async () => {
  if (!authStore.user) return;

  try {
    isCreating.value = true;

    // Validar campos obligatorios
    if (!newClub.value.name || !newClub.value.artist_id) {
      throw new Error('El nombre del club y el ID del artista son obligatorios.');
    }

    await communityStore.createFanClub({
      ...newClub.value
    });

    showCreateModal.value = false;
    newClub.value = {
      name: '',
      artist_id: '',
      description: '',
      rules: '',
      banner_url: ''
    };
  } catch (error) {
    console.error('Error creating club:', error);
  } finally {
    isCreating.value = false;
  }
};

const handleBannerUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // Implementar lógica de subida de imagen
  }
};

const selectClub = async (club: FanClub) => {
  selectedClub.value = club;
  await loadClubData(club.id);
};

const loadClubData = async (clubId: string) => {
  try {
    const [members, posts] = await Promise.all([
      fanClubStore.getClubMembers(clubId),
      fanClubStore.getClubPosts(clubId)
    ]);
    clubMembers.value = members;
    clubPosts.value = posts;
  } catch (error) {
    console.error('Error loading club data:', error);
  }
};

const joinClub = async () => {
  if (!authStore.user || !selectedClub.value) return;
  try {
    await fanClubStore.joinClub(selectedClub.value.id);
    await loadClubData(selectedClub.value.id);
  } catch (error) {
    console.error('Error joining club:', error);
  }
};

const createPost = async () => {
  if (!authStore.user || !selectedClub.value || !newPost.value.trim()) return;
  try {
    // Aquí deberías tener un método en fanClubStore para crear un post
    // await fanClubStore.createClubPost({ ... });
    newPost.value = '';
    await loadClubData(selectedClub.value.id);
  } catch (error) {
    console.error('Error creating post:', error);
  }
};

// Utilidades
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Inicialización
onMounted(async () => {
  await communityStore.fetchFanClubs();
});
</script>

<style scoped>
.fan-club-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.club-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.club-title {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
}

.create-button {
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

.clubs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.club-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.club-card:hover {
  transform: translateY(-4px);
}

.club-banner {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.club-info {
  padding: 1.5rem;
}

.club-info h3 {
  margin: 0;
  font-size: 1.25rem;
}

.club-info p {
  margin: 0.5rem 0;
  color: #666;
}

.club-meta {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  color: #888;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
}

.primary-button {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
}

.primary-button:hover {
  background: #17a74a;
}

.secondary {
  background: #f5f5f5;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
}

.secondary:hover {
  background: #e0e0e0;
}

.club-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.club-detail-modal {
  max-width: 900px;
}

.club-detail-header {
  position: relative;
}

.club-detail-banner {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.club-detail-info {
  padding: 1.5rem;
}

.club-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  color: #666;
}

.club-actions {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.join-button {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
}

.section-tabs {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.section-tabs button {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #666;
}

.section-tabs button.active {
  color: #1db954;
  border-bottom: 2px solid #1db954;
}

.section-content {
  padding: 1.5rem;
}

.create-post {
  margin-bottom: 2rem;
}

.create-post textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.club-post {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.post-info {
  display: flex;
  flex-direction: column;
}

.post-info span {
  font-size: 0.9rem;
  color: #666;
}

.members-list {
  display: grid;
  gap: 1rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-info span {
  font-size: 0.9rem;
  color: #666;
}

.club-rules {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .fan-club-view {
    padding: 1rem;
  }

  .club-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .section-tabs {
    overflow-x: auto;
    white-space: nowrap;
    padding: 0.5rem;
  }

  .club-detail-info {
    padding: 1rem;
  }
}
</style>