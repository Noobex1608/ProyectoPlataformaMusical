<template>
  <div class="forum-view">
    <div class="forum-header">
      <div class="artist-info" v-if="currentArtist">
        <img 
          :src="currentArtist.image_url || '/default-artist.jpg'"
          :alt="currentArtist.name"
          class="artist-avatar"
        >
        <div>
          <h2>{{ currentArtist.name }}</h2>
          <p>Foro de Discusión</p>
        </div>
      </div>
      <button @click="showCreateModal = true" class="create-post-button">
        <i class="fas fa-plus"></i> Nueva Publicación
      </button>
    </div>

    <div class="forum-content">
      <div class="posts-list" v-if="posts.length">
        <div 
          v-for="post in posts" 
          :key="post.id"
          class="post-card"
          @click="selectPost(post)"
        >
          <div class="post-header">
            <div class="user-info">
              <img 
                :src="getUserAvatar(post.user_id)"
                :alt="getUserName(post.user_id)"
                class="user-avatar"
              >
              <span>{{ getUserName(post.user_id) }}</span>
            </div>
            <span class="post-date">{{ formatDate(post.created_at) }}</span>
          </div>
          <h3>{{ post.title }}</h3>
          <p class="post-preview">{{ truncateContent(post.content) }}</p>
          <div class="post-meta">
            <span>
              <i class="fas fa-comment"></i> {{ getCommentCount(post.id) }}
            </span>
            <span>
              <i class="fas fa-heart"></i> {{ getLikeCount(post.id) }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>No hay publicaciones en este foro</p>
        <button @click="showCreateModal = true">
          Crear Primera Publicación
        </button>
      </div>
    </div>

    <!-- Modal de Creación -->
    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #header>
        <h3>Nueva Publicación</h3>
      </template>

      <template #default>
        <form @submit.prevent="createPost" class="post-form">
          <div class="form-group">
            <label for="title">Título</label>
            <input 
              id="title"
              v-model="newPost.title"
              type="text"
              required
              placeholder="Título de la publicación"
            >
          </div>

          <div class="form-group">
            <label for="content">Contenido</label>
            <textarea
              id="content"
              v-model="newPost.content"
              required
              placeholder="Escribe tu publicación..."
              rows="6"
            ></textarea>
          </div>
        </form>
      </template>

      <template #footer>
        <button @click="createPost" class="primary" :disabled="isCreating">
          {{ isCreating ? 'Publicando...' : 'Publicar' }}
        </button>
        <button @click="showCreateModal = false">Cancelar</button>
      </template>
    </Modal>

    <!-- Modal de Detalle de Post -->
    <Modal 
      v-if="selectedPost" 
      @close="selectedPost = null"
      class="post-detail-modal"
    >
      <template #header>
        <div class="post-detail-header">
          <h3>{{ selectedPost.title }}</h3>
          <div class="post-author">
            <img 
              :src="getUserAvatar(selectedPost.user_id)"
              :alt="getUserName(selectedPost.user_id)"
              class="user-avatar"
            >
            <span>{{ getUserName(selectedPost.user_id) }}</span>
            <span class="post-date">{{ formatDate(selectedPost.created_at) }}</span>
          </div>
        </div>
      </template>

      <template #default>
        <div class="post-detail-content">
          <div class="post-content">
            {{ selectedPost.content }}
          </div>

          <div class="post-actions">
            <button @click="likePost" :class="{ active: isLiked }">
              <i class="fas fa-heart"></i> Me gusta
            </button>
            <button @click="sharePost">
              <i class="fas fa-share"></i> Compartir
            </button>
          </div>

          <div class="comments-section">
            <h4>Comentarios</h4>
            
            <div class="comments-list">
              <div 
                v-for="comment in comments" 
                :key="comment.id"
                class="comment"
              >
                <div class="comment-header">
                  <img 
                    :src="getUserAvatar(comment.user_id)"
                    :alt="getUserName(comment.user_id)"
                    class="user-avatar-small"
                  >
                  <div class="comment-info">
                    <strong>{{ getUserName(comment.user_id) }}</strong>
                    <span class="comment-date">
                      {{ formatDate(comment.created_at) }}
                    </span>
                  </div>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
              </div>
            </div>

            <div class="add-comment">
              <textarea
                v-model="newComment"
                placeholder="Escribe un comentario..."
                rows="3"
              ></textarea>
              <button @click="addComment" :disabled="!newComment.trim()">
                Comentar
              </button>
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
import type { ForumPost, ForumComment, Artist } from '@/types/community.types';
import Modal from '@/components/shared/Modal.vue';

const communityStore = useCommunityStore();
const authStore = useAuthStore();

// Estado
const showCreateModal = ref(false);
const isCreating = ref(false);
const selectedPost = ref<ForumPost | null>(null);
const comments = ref<ForumComment[]>([]);
const newComment = ref('');
const currentArtist = ref<Artist | null>(null);

const newPost = ref({
  title: '',
  content: ''
});

// Computed
const posts = computed(() => communityStore.artistForums);
const isLiked = computed(() => false); // Implementar lógica de likes

// Métodos
const createPost = async () => {
  if (!authStore.user || !currentArtist.value) return;

  try {
    isCreating.value = true;
    await communityStore.createForumPost({
      title: newPost.value.title,
      content: newPost.value.content,
      artist_id: currentArtist.value.id,
      user_id: authStore.user.id,
      created_at: new Date().toISOString()
    });
    
    showCreateModal.value = false;
    newPost.value = { title: '', content: '' };
  } catch (error) {
    console.error('Error creating post:', error);
  } finally {
    isCreating.value = false;
  }
};

const selectPost = async (post: ForumPost) => {
  selectedPost.value = post;
  // Cargar comentarios
  // await loadComments(post.id);
};

const addComment = async () => {
  if (!authStore.user || !selectedPost.value || !newComment.value.trim()) return;

  try {
    // Implementar lógica para agregar comentario
    newComment.value = '';
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

const likePost = async () => {
  if (!authStore.user || !selectedPost.value) return;
  // Implementar lógica de likes
};

const sharePost = () => {
  if (!selectedPost.value) return;
  // Implementar lógica de compartir
};

// Utilidades
const getUserAvatar = (userId: string) => {
  // Implementar lógica para obtener avatar
  return '/default-avatar.jpg';
};

const getUserName = (userId: string) => {
  // Implementar lógica para obtener nombre
  return 'Usuario';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const truncateContent = (content: string, length = 150) => {
  if (content.length <= length) return content;
  return content.substring(0, length) + '...';
};

const getCommentCount = (postId: string) => {
  // Implementar lógica para contar comentarios
  return 0;
};

const getLikeCount = (postId: string) => {
  // Implementar lógica para contar likes
  return 0;
};

// Inicialización
onMounted(async () => {
  // Cargar datos del artista actual y sus posts
  if (currentArtist.value) {
    await communityStore.fetchArtistForums(currentArtist.value.id);
  }
});
</script>

<style scoped>
.forum-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.artist-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.artist-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.create-post-button {
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

.posts-list {
  display: grid;
  gap: 1.5rem;
}

.post-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.post-date {
  color: #666;
  font-size: 0.9rem;
}

.post-preview {
  color: #666;
  margin: 1rem 0;
}

.post-meta {
  display: flex;
  gap: 1rem;
  color: #888;
  font-size: 0.9rem;
}

.post-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.post-detail-modal {
  max-width: 800px;
}

.post-detail-header {
  padding: 1rem;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.post-content {
  padding: 1.5rem;
  line-height: 1.6;
}

.post-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.post-actions button {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.post-actions button.active {
  color: #e74c3c;
  border-color: #e74c3c;
}

.comments-section {
  padding: 1.5rem;
}

.comments-list {
  margin: 1rem 0;
}

.comment {
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.comment-info {
  display: flex;
  flex-direction: column;
}

.comment-date {
  font-size: 0.8rem;
  color: #666;
}

.comment-content {
  margin: 0;
  padding-left: 2.5rem;
  color: #333;
}

.add-comment {
  margin-top: 1.5rem;
}

.add-comment textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.add-comment button {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
}

.add-comment button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .forum-view {
    padding: 1rem;
  }

  .forum-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .artist-info {
    flex-direction: column;
  }

  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style> 