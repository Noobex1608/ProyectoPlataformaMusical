<template>
  <div class="polls-view">
    <div class="polls-header">
      <h2>Encuestas de la Comunidad</h2>
      <button @click="showCreateModal = true" class="create-button">
        <i class="fas fa-plus"></i> Nueva Encuesta
      </button>
    </div>

    <div class="polls-grid" v-if="polls.length">
      <div 
        v-for="poll in polls" 
        :key="poll.id"
        class="poll-card"
      >
        <div class="poll-info">
          <h3>{{ poll.title }}</h3>
          <p>{{ poll.description }}</p>
          <div class="poll-meta">
            <span>
              <i class="fas fa-user"></i> {{ poll.creator_id }}
            </span>
            <span>
              <i class="fas fa-calendar"></i> {{ formatDate(poll.end_date) }}
            </span>
          </div>
        </div>

        <div class="poll-options">
          <div 
            v-for="option in poll.options" 
            :key="option.id"
            class="poll-option"
          >
            <div class="option-header">
              <span class="option-text">{{ option.text }}</span>
              <span class="vote-count">{{ getVoteCount(option.id) }} votos</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress"
                :style="{ width: calculatePercentage(option.id, poll.id) + '%' }"
              ></div>
            </div>
          </div>

          <button 
            v-if="!hasVoted(poll.id)"
            @click="showVoteModal(poll)"
            class="vote-button"
          >
            Votar
          </button>
          <p v-else class="voted-message">
            Ya has votado en esta encuesta
          </p>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No hay encuestas activas</p>
      <button @click="showCreateModal = true">Crear Primera Encuesta</button>
    </div>

    <!-- Modal de Creación -->
    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #header>
        <h3>Nueva Encuesta</h3>
      </template>

      <template #default>
        <form @submit.prevent="createPoll" class="poll-form">
          <div class="form-group">
            <label for="title">Título</label>
            <input 
              id="title"
              v-model="newPoll.title"
              type="text"
              required
              placeholder="Título de la encuesta"
            >
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea
              id="description"
              v-model="newPoll.description"
              placeholder="Describe la encuesta..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="end_date">Fecha de Cierre</label>
            <input 
              id="end_date"
              v-model="newPoll.end_date"
              type="datetime-local"
              required
            >
          </div>

          <div class="form-group">
            <label>Opciones</label>
            <div class="options-list">
              <div 
                v-for="(option, index) in newPoll.options" 
                :key="index"
                class="option-input"
              >
                <input 
                  v-model="option.text"
                  type="text"
                  :placeholder="'Opción ' + (index + 1)"
                  required
                >
                <button 
                  type="button"
                  @click="removeOption(index)"
                  class="remove-option"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <button 
              type="button"
              @click="addOption"
              class="add-option"
            >
              <i class="fas fa-plus"></i> Añadir Opción
            </button>
          </div>
        </form>
      </template>

      <template #footer>
        <button @click="createPoll" class="primary" :disabled="isCreating">
          {{ isCreating ? 'Creando...' : 'Crear Encuesta' }}
        </button>
        <button @click="showCreateModal = false">Cancelar</button>
      </template>
    </Modal>

    <!-- Modal de Votación -->
    <Modal v-if="selectedPoll" @close="selectedPoll = null">
      <template #header>
        <h3>{{ selectedPoll.title }}</h3>
      </template>

      <template #default>
        <div class="vote-form">
          <p>{{ selectedPoll.description }}</p>
          <div class="vote-options">
            <div 
              v-for="option in selectedPoll.options" 
              :key="option.id"
              class="vote-option"
            >
              <input 
                type="radio"
                :id="option.id"
                :value="option.id"
                v-model="selectedOption"
                name="poll-option"
              >
              <label :for="option.id">{{ option.text }}</label>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <button 
          @click="submitVote" 
          class="primary"
          :disabled="!selectedOption"
        >
          Votar
        </button>
        <button @click="selectedPoll = null">Cancelar</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCommunityStore } from '@/stores/community.store';
import { useAuthStore } from '@/stores/auth.store';
import type { Poll } from '@/types/community.types';
import Modal from '@/components/shared/Modal.vue';

const communityStore = useCommunityStore();
const authStore = useAuthStore();

// Estado
const showCreateModal = ref(false);
const isCreating = ref(false);
const selectedPoll = ref<Poll | null>(null);
const selectedOption = ref<string>('');

const newPoll = ref({
  title: '',
  description: '',
  end_date: '',
  options: [{ text: '' }, { text: '' }] // Mínimo 2 opciones
});

// Computed
const polls = computed(() => communityStore.activePolls);

// Métodos
const createPoll = async () => {
  if (!authStore.user) return;

  try {
    isCreating.value = true;
    const pollData = {
      title: newPoll.value.title,
      description: newPoll.value.description,
      end_date: newPoll.value.end_date,
      creator_id: authStore.user.id,
      created_at: new Date().toISOString(),
      options: newPoll.value.options.map((option, index) => ({
        id: `option-${index}`,
        poll_id: '',
        text: option.text,
        votes_count: 0,
      })),
    };

    await communityStore.createPoll(pollData);

    showCreateModal.value = false;
    newPoll.value = {
      title: '',
      description: '',
      end_date: '',
      options: [{ text: '' }, { text: '' }],
    };
  } catch (error) {
    console.error('Error creating poll:', error);
  } finally {
    isCreating.value = false;
  }
};

const addOption = () => {
  newPoll.value.options.push({ text: '' });
};

const removeOption = (index: number) => {
  if (newPoll.value.options.length > 2) {
    newPoll.value.options.splice(index, 1);
  }
};

const showVoteModal = (poll: Poll) => {
  selectedPoll.value = poll;
  selectedOption.value = '';
};

const submitVote = async () => {
  if (!authStore.user || !selectedPoll.value || !selectedOption.value) return;

  try {
    await communityStore.votePoll({
      poll_id: selectedPoll.value.id,
      option_id: selectedOption.value,
      user_id: authStore.user.id,
    });

    selectedPoll.value = null;
  } catch (error) {
    console.error('Error submitting vote:', error);
  }
};

const hasVoted = async (pollId: string): Promise<boolean> => {
  if (!authStore.user) return false;
  return await communityStore.hasUserVoted(pollId, authStore.user.id);
};

const getVoteCount = async (optionId: string): Promise<number> => {
  return await communityStore.getOptionVotes(optionId);
};

const calculatePercentage = async (optionId: string, pollId: string): Promise<number> => {
  const optionVotes = await getVoteCount(optionId);
  const totalVotes = await communityStore.getTotalPollVotes(pollId);
  return totalVotes === 0 ? 0 : (optionVotes / totalVotes) * 100;
};

// Utilidades
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Inicialización
onMounted(async () => {
  await communityStore.fetchActivePolls();
});
</script>

<style scoped>
.polls-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.polls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

.polls-grid {
  display: grid;
  gap: 1.5rem;
}

.poll-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.poll-info {
  margin-bottom: 1.5rem;
}

.poll-info h3 {
  margin: 0;
  font-size: 1.25rem;
}

.poll-info p {
  margin: 0.5rem 0;
  color: #666;
}

.poll-meta {
  display: flex;
  gap: 1rem;
  color: #888;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.poll-options {
  display: grid;
  gap: 1rem;
}

.poll-option {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
}

.option-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.vote-count {
  font-size: 0.9rem;
  color: #666;
}

.progress-bar {
  background: #eee;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  background: #1db954;
  height: 100%;
  transition: width 0.3s ease;
}

.vote-button {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
}

.voted-message {
  text-align: center;
  color: #666;
  margin-top: 1rem;
}

.poll-form {
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
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.options-list {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.option-input {
  display: flex;
  gap: 0.5rem;
}

.remove-option {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 0.5rem;
}

.add-option {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.vote-form {
  padding: 1rem;
}

.vote-options {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.vote-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vote-option input[type="radio"] {
  margin: 0;
}

@media (max-width: 768px) {
  .polls-view {
    padding: 1rem;
  }

  .polls-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .poll-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>