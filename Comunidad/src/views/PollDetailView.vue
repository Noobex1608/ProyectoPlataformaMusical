<template>
  <div class="poll-detail-view">
    <div v-if="poll" class="poll-container">
      <!-- Encabezado de la Encuesta -->
      <div class="poll-header">
        <div class="poll-info">
          <h1>{{ poll.title }}</h1>
          <p class="description">{{ poll.description }}</p>
          <div class="meta-info">
            <span class="creator">
              <i class="fas fa-user"></i>
              Creado por {{ creatorProfile?.username || poll.creator_id }}
            </span>
            <span class="date">
              <i class="fas fa-calendar"></i>
              {{ formatDate(poll.created_at) }}
            </span>
            <span class="status" :class="{ 'active': !isPollClosed, 'closed': isPollClosed }">
              <i class="fas" :class="isPollClosed ? 'fa-lock' : 'fa-clock'"></i>
              {{ isPollClosed ? 'Encuesta Cerrada' : 'Encuesta Activa' }}
            </span>
          </div>
          <div class="poll-tags">
            <!-- Si hay tags, muéstralos aquí -->
          </div>
        </div>
        <!-- Acciones -->
        <div class="actions" v-if="canModifyPoll">
          <button @click="showEditModal = true" class="edit-btn">
            <i class="fas fa-edit"></i>
            Editar Encuesta
          </button>
        </div>
      </div>

      <!-- Opciones de Votación -->
      <div class="voting-section">
        <h2>Opciones</h2>
        <div class="options-list">
          <div v-for="option in poll.options" :key="option.id" class="option-item">
            <div class="option-content">
              <div class="option-info">
                <h3>{{ option.text }}</h3>
                <p class="votes-count">{{ option.votes_count }} votos</p>
              </div>
              
              <div class="progress-bar">
                <div class="progress" :style="{ width: calculatePercentage(option.votes_count) + '%' }">
                  {{ calculatePercentage(option.votes_count) }}%
                </div>
              </div>
            </div>

            <button v-if="!isPollClosed && !hasVoted" @click="vote(option.id)" class="vote-btn" :disabled="isVoting">
              <i class="fas fa-check"></i>
              Votar
            </button>
          </div>
        </div>

        <p class="total-votes">
          Total de votos: {{ totalVotes }}
        </p>
      </div>

      <!-- Comentarios -->
      <div class="comments-section">
        <h2>Comentarios</h2>
        <div class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <img :src="comment.user.avatar_url || '/default-avatar.jpg'" :alt="comment.user.name" class="comment-avatar">
            <div class="comment-content">
              <div class="comment-header">
                <strong>{{ comment.user.name }}</strong>
                <span>{{ formatCommentDate(comment.created_at) }}</span>
              </div>
              <p>{{ comment.content }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="addComment" class="comment-form">
          <textarea v-model="newComment" placeholder="Escribe un comentario..." rows="3"></textarea>
          <button type="submit" :disabled="!newComment.trim()">
            Comentar
          </button>
        </form>
      </div>
    </div>

    <!-- Modal de Edición -->
    <Modal v-if="showEditModal" @close="showEditModal = false">
      <template #header>
        <h3>Editar Encuesta</h3>
      </template>

      <template #default>
        <form @submit.prevent="updatePoll" class="edit-form">
          <div class="form-group">
            <label for="edit-title">Título</label>
            <input 
              id="edit-title"
              v-model="editForm.title"
              type="text"
              required
            >
          </div>

          <div class="form-group">
            <label for="edit-description">Descripción</label>
            <textarea
              id="edit-description"
              v-model="editForm.description"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Opciones</label>
            <div class="options-edit-list">
              <div 
                v-for="(option, index) in editForm.options" 
                :key="index"
                class="option-edit-item"
              >
                <input 
                  v-model="option.text"
                  type="text"
                  :placeholder="'Opción ' + (index + 1)"
                  required
                >
                <button 
                  v-if="editForm.options.length > 2"
                  @click="removeOption(index)"
                  type="button"
                  class="remove-option"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <button 
              type="button"
              @click="addOption"
              class="add-option-btn"
            >
              <i class="fas fa-plus"></i>
              Añadir Opción
            </button>
          </div>
        </form>
      </template>

      <template #footer>
        <button @click="updatePoll" class="primary" :disabled="isUpdating">
          {{ isUpdating ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
        <button @click="showEditModal = false">Cancelar</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import type { Poll, UserProfile, User, Comment } from '@/types/community.types';
import Modal from '@/components/shared/Modal.vue';

const route = useRoute();
const authStore = useAuthStore();

const poll = ref<Poll | null>(null);
const comments = ref<Comment[]>([]);
const showEditModal = ref(false);
const isUpdating = ref(false);
const isVoting = ref(false);
const newComment = ref('');
const creatorProfile = ref<UserProfile | null>(null);
const userProfiles = ref<Record<string, UserProfile>>({});

const editForm = ref({
  title: '',
  description: '',
  options: [] as { id: string; text: string }[]
});

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (userProfiles.value[userId]) return userProfiles.value[userId];
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    userProfiles.value[userId] = data as UserProfile;
    return data as UserProfile;
  } catch {
    return null;
  }
}

const canModifyPoll = computed(() => {
  if (!poll.value || !authStore.user) return false;
  return poll.value.creator_id === authStore.user.id;
});

const isPollClosed = computed(() => {
  if (!poll.value) return true;
  return new Date(poll.value.end_date) < new Date();
});

const totalVotes = computed(() => {
  if (!poll.value) return 0;
  return poll.value.options.reduce((sum, option) => sum + option.votes_count, 0);
});

const hasVoted = ref(false);

const loadPoll = async () => {
  const pollId = route.params.id as string;
  // Cargar encuesta y opciones
  const { data: pollData, error: pollError } = await supabase
    .from('polls')
    .select('*, options:poll_options(*)')
    .eq('id', pollId)
    .single();
  if (pollError || !pollData) return;
  poll.value = {
    id: pollData.id,
    title: pollData.title,
    description: pollData.description,
    creator_id: pollData.creator_id,
    end_date: pollData.end_date,
    created_at: pollData.created_at,
    options: (pollData.options || []).map((o: any) => ({
      id: o.id,
      poll_id: o.poll_id,
      text: o.text,
      votes_count: o.votes_count
    }))
  };
  creatorProfile.value = await getUserProfile(poll.value.creator_id);
  // Verificar si el usuario ya votó
  hasVoted.value = false;
  if (authStore.user) {
    const { data: vote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', authStore.user.id)
      .single();
    hasVoted.value = !!vote;
  }
  // Cargar comentarios
  const { data: commentRows } = await supabase
    .from('poll_comments')
    .select('*')
    .eq('poll_id', pollId)
    .order('created_at', { ascending: false });
  comments.value = [];
  if (commentRows) {
    for (const c of commentRows) {
      let user: User = { id: c.user_id, name: 'Usuario', avatar_url: '' };
      const profile = await getUserProfile(c.user_id);
      if (profile) {
        user = { id: profile.user_id, name: profile.username, avatar_url: profile.avatar_url };
      }
      comments.value.push({
        id: c.id,
        user,
        content: c.content,
        created_at: c.created_at
      });
    }
  }
  // Inicializar formulario de edición
  editForm.value = {
    title: poll.value.title,
    description: poll.value.description,
    options: poll.value.options.map(o => ({ id: o.id, text: o.text }))
  };
};

const vote = async (optionId: string) => {
  if (!poll.value || isVoting.value || !authStore.user) return;
  try {
    isVoting.value = true;
    await supabase.from('poll_votes').insert({
      poll_id: poll.value.id,
      option_id: optionId,
      user_id: authStore.user.id,
      created_at: new Date().toISOString()
    });
    await loadPoll();
  } catch (error) {
    console.error('Error voting:', error);
  } finally {
    isVoting.value = false;
  }
};

const updatePoll = async () => {
  if (!poll.value) return;
  try {
    isUpdating.value = true;
    await supabase.from('polls').update({
      title: editForm.value.title,
      description: editForm.value.description
    }).eq('id', poll.value.id);
    // Opciones: solo actualiza el texto
    for (const opt of editForm.value.options) {
      await supabase.from('poll_options').update({ text: opt.text }).eq('id', opt.id);
    }
    await loadPoll();
    showEditModal.value = false;
  } catch (error) {
    console.error('Error updating poll:', error);
  } finally {
    isUpdating.value = false;
  }
};

const addOption = () => {
  editForm.value.options.push({ id: '', text: '' });
};

const removeOption = (index: number) => {
  editForm.value.options.splice(index, 1);
};

const addComment = async () => {
  if (!poll.value || !authStore.user || !newComment.value.trim()) return;
  try {
    const { data: c, error } = await supabase.from('poll_comments').insert({
      poll_id: poll.value.id,
      user_id: authStore.user.id,
      content: newComment.value,
      created_at: new Date().toISOString()
    }).select('*').single();
    if (!error && c) {
      let user: User = { id: c.user_id, name: 'Usuario', avatar_url: '' };
      const profile = await getUserProfile(c.user_id);
      if (profile) {
        user = { id: profile.user_id, name: profile.username, avatar_url: profile.avatar_url };
      }
      comments.value.unshift({
        id: c.id,
        user,
        content: c.content,
        created_at: c.created_at
      });
      newComment.value = '';
    }
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

function calculatePercentage(votes: number) {
  if (totalVotes.value === 0) return 0;
  return Math.round((votes / totalVotes.value) * 100);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCommentDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(loadPoll);
</script>

<style scoped>
.poll-detail-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.poll-container {
  margin-bottom: 40px;
}

.poll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.poll-info {
  flex: 1;
}

.poll-info h1 {
  font-size: 28px;
  margin: 0 0 10px 0;
}

.poll-info .description {
  font-size: 16px;
  color: #666;
  margin: 0 0 10px 0;
}

.meta-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #999;
}

.meta-info .creator,
.meta-info .date {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-info i {
  font-size: 16px;
  color: #007bff;
}

.actions {
  display: flex;
  gap: 10px;
}

.edit-btn,
.status-btn {
  padding: 10px 15px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.edit-btn {
  background: #007bff;
  color: #fff;
}

.edit-btn:hover {
  background: #0056b3;
}

.status-btn {
  background: #28a745;
  color: #fff;
}

.status-btn.close-btn {
  background: #dc3545;
}

.status-btn.reopen-btn {
  background: #007bff;
}

.status-btn:hover {
  opacity: 0.9;
}

.voting-section {
  margin-bottom: 30px;
}

.voting-section h2 {
  font-size: 22px;
  margin: 0 0 15px 0;
}

.options-list {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eaeaea;
}

.option-item:last-child {
  border-bottom: none;
}

.option-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-info {
  flex: 1;
}

.option-info h3 {
  font-size: 18px;
  margin: 0 0 5px 0;
}

.votes_count {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 5px 0;
}

.progress {
  height: 100%;
  background: #007bff;
  transition: width 0.3s;
}

.vote-btn {
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: #fff;
  transition: background 0.3s;
}

.vote-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.comments-section {
  margin-top: 30px;
}

.comments-section h2 {
  font-size: 22px;
  margin: 0 0 15px 0;
}

.comments-list {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #eaeaea;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.comment-header strong {
  font-size: 16px;
  color: #333;
}

.comment-header span {
  font-size: 12px;
  color: #999;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.comment-form textarea {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: none;
}

.comment-form button {
  align-self: flex-end;
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: #fff;
  transition: background 0.3s;
}

.comment-form button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.modal {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 18px;
  margin: 0;
}

.modal-close {
  cursor: pointer;
  font-size: 18px;
  color: #999;
}

.modal-close:hover {
  color: #333;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.primary {
  padding: 10px 15px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: #fff;
  transition: background 0.3s;
}

.primary:hover {
  background: #0056b3;
}
</style>