<template>
    <header-component />
  <div class="clubes-container">
    <!-- Header con búsqueda -->
    <div class="header-section">
      <h2 class="titulo-principal">🏟️ Clubes de Fans</h2>
      <p class="subtitulo">Descubre y únete a comunidades de fans de tus artistas favoritos</p>
      
      <!-- Barra de búsqueda -->
      <div class="search-section">
        <div class="search-input-container">
          <input 
            v-model="searchTerm" 
            @input="buscarClubes(searchTerm)"
            type="text" 
            placeholder="Buscar clubes por nombre o descripción..."
            class="search-input"
          />
          <button @click="buscarClubes(searchTerm)" class="search-button">
            🔍
          </button>
        </div>
        <button @click="obtenerClubes()" class="refresh-button">
          ↻ Actualizar
        </button>
      </div>
    </div>

    <!-- Botón para crear nuevo club -->
    <div class="actions-section">
      <button @click="mostrarFormulario = !mostrarFormulario" class="btn-primary">
        {{ mostrarFormulario ? 'Cancelar' : 'Crear Nuevo Club' }}
      </button>
    </div>

    <!-- Formulario para crear club -->
    <div v-if="mostrarFormulario" class="form-section">
      <div class="form-card">
        <h3>🆕 Crear Nuevo Club de Fans</h3>
        <form @submit.prevent="handleCrearClub">
          <div class="form-group">
            <label for="nombre">Nombre del Club:</label>
            <input 
              id="nombre"
              v-model="nuevoClub.name" 
              type="text" 
              required 
              placeholder="Ej: Fans de Rock Mexicano"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="descripcion">Descripción:</label>
            <textarea 
              id="descripcion"
              v-model="nuevoClub.description" 
              placeholder="Describe tu club de fans..."
              rows="4"
              class="form-input"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="artista">Seleccionar Artista:</label>
            <div class="artist-selector">
              <input 
                id="artista-search"
                v-model="busquedaArtista" 
                @input="handleBusquedaArtista"
                @focus="mostrarSugerencias = true"
                type="text" 
                required 
                placeholder="Buscar artista por nombre..."
                class="form-input"
                autocomplete="off"
              />
              
              <!-- Lista de sugerencias -->
              <div 
                v-if="mostrarSugerencias && sugerenciasArtistas.length > 0" 
                class="suggestions-dropdown"
              >
                <div 
                  v-for="artista in sugerenciasArtistas" 
                  :key="artista.id"
                  @click="seleccionarArtista(artista)"
                  class="suggestion-item"
                >
                  <div class="suggestion-content">
                    <img 
                      v-if="artista.imagen" 
                      :src="artista.imagen" 
                      :alt="artista.nombre"
                      class="artist-avatar"
                    />
                    <div class="artist-info">
                      <span class="artist-name">{{ artista.nombre }}</span>
                      <span v-if="artista.descripcion" class="artist-description">
                        {{ artista.descripcion }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Artista seleccionado -->
              <div v-if="artistaSeleccionado" class="selected-artist">
                <div class="selected-content">
                  <img 
                    v-if="artistaSeleccionado.imagen" 
                    :src="artistaSeleccionado.imagen" 
                    :alt="artistaSeleccionado.nombre"
                    class="selected-avatar"
                  />
                  <div class="selected-info">
                    <span class="selected-name">{{ artistaSeleccionado.nombre }}</span>
                    <small class="selected-id">ID: {{ artistaSeleccionado.id }}</small>
                  </div>
                  <button 
                    type="button" 
                    @click="limpiarSeleccion"
                    class="clear-selection"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <small class="form-help">
              Busca y selecciona el artista para el cual será este club
            </small>
          </div>
          
          <div class="form-actions">
            <button type="submit" :disabled="loading" class="btn-primary">
              {{ loading ? '⏳ Creando...' : '✨ Crear Club' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading && !mostrarFormulario" class="loading-section">
      <div class="loading-spinner">⏳</div>
      <p>Cargando clubes de fans...</p>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-section">
      <div class="error-card">
        <h3>❌ Error</h3>
        <p>{{ error }}</p>
        <button @click="obtenerClubes()" class="btn-secondary">
          🔄 Reintentar
        </button>
      </div>
    </div>

    <!-- Resultados -->
    <div v-if="!loading" class="results-section">
      <div class="results-header">
        <h3>📊 Resultados</h3>
        <span class="results-count">{{ totalClubes }} club(es) encontrado(s)</span>
      </div>

      <!-- Lista de clubes -->
      <div v-if="clubesFiltrados.length > 0" class="clubes-grid">
        <div 
          v-for="club in clubesFiltrados" 
          :key="club.id" 
          class="club-card"
        >
          <div class="club-header">
            <h4 class="club-name">{{ club.name }}</h4>
            <span class="club-id">#{{ club.id }}</span>
          </div>
          
          <div v-if="club.description" class="club-description">
            <p>{{ club.description }}</p>
          </div>
          
          <div class="club-info">
            <div class="info-item">
              <span class="info-label">Artista ID:</span>
              <span class="info-value">{{ club.artista_id || 'No especificado' }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Creado:</span>
              <span class="info-value">{{ formatearFecha(club.created_at) }}</span>
            </div>
            
            <div v-if="club.updated_at !== club.created_at" class="info-item">
              <span class="info-label">Actualizado:</span>
              <span class="info-value">{{ formatearFecha(club.updated_at) }}</span>
            </div>
          </div>
          
          <div class="club-actions">
            <button @click="entrarAlClub(club)" class="btn-primary">
              Entrar al Club
            </button>
            <button @click="editarClub(club)" class="btn-edit">
              Editar
            </button>
            <button @click="eliminarClubConfirm(club)" class="btn-delete">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="empty-state">
        <div class="empty-card">
          <h3>🏟️ No hay clubes disponibles</h3>
          <p v-if="searchTerm">No se encontraron clubes que coincidan con "{{ searchTerm }}"</p>
          <p v-else>Aún no hay clubes de fans registrados.</p>
          <button @click="mostrarFormulario = true" class="btn-primary">
            ➕ Crear el Primer Club
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="clubAEliminar" class="modal-overlay" @click="cancelarEliminacion">
      <div class="modal-content" @click.stop>
        <h3>⚠️ Confirmar Eliminación</h3>
        <p>¿Estás seguro de que deseas eliminar el club "{{ clubAEliminar.name }}"?</p>
        <p><strong>Esta acción no se puede deshacer.</strong></p>
        <div class="modal-actions">
          <button @click="cancelarEliminacion" class="btn-secondary">
            ❌ Cancelar
          </button>
          <button @click="confirmarEliminacion" :disabled="loading" class="btn-delete">
            {{ loading ? '⏳ Eliminando...' : '🗑️ Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClubFans, type ClubFan, type CreateClubFan } from '../composables/useClubFans';
import headerComponent from '../components/headerComponent.vue';

// Router
const router = useRouter();

// Composable
const { 
  loading, 
  error, 
  searchTerm, 
  clubesFiltrados, 
  totalClubes,
  obtenerClubes,
  buscarClubes,
  crearClub,
  eliminarClub,
  formatearFecha,
  buscarArtistasPorNombre
} = useClubFans();

// Estado local
const mostrarFormulario = ref(false);
const clubAEliminar = ref<ClubFan | null>(null);

// Estados para el selector de artistas
const busquedaArtista = ref('');
const mostrarSugerencias = ref(false);
const sugerenciasArtistas = ref<any[]>([]);
const artistaSeleccionado = ref<any | null>(null);

// Formulario
const nuevoClub = ref<CreateClubFan>({
  name: '',
  description: '',
  artista_id: ''
});

// Funciones para el selector de artistas
const handleBusquedaArtista = async (event: any) => {
  const nombre = event.target?.value || busquedaArtista.value;
  
  if (!nombre.trim()) {
    sugerenciasArtistas.value = [];
    mostrarSugerencias.value = false;
    return;
  }
  
  try {
    const resultados = await buscarArtistasPorNombre(nombre);
    sugerenciasArtistas.value = resultados;
    mostrarSugerencias.value = true;
  } catch (error) {
    console.error('Error buscando artistas:', error);
    sugerenciasArtistas.value = [];
  }
};

const seleccionarArtista = (artista: any) => {
  artistaSeleccionado.value = artista;
  nuevoClub.value.artista_id = artista.id;
  busquedaArtista.value = artista.nombre;
  mostrarSugerencias.value = false;
  sugerenciasArtistas.value = [];
};

const limpiarSeleccion = () => {
  artistaSeleccionado.value = null;
  nuevoClub.value.artista_id = '';
  busquedaArtista.value = '';
  mostrarSugerencias.value = false;
  sugerenciasArtistas.value = [];
};

// Método para crear club
const handleCrearClub = async () => {
  if (!nuevoClub.value.name.trim()) {
    alert('Por favor, ingresa el nombre del club');
    return;
  }
  
  if (!artistaSeleccionado.value || !nuevoClub.value.artista_id.trim()) {
    alert('Por favor, selecciona un artista');
    return;
  }

  const club = await crearClub(nuevoClub.value);
  
  if (club) {
    // Limpiar formulario y cerrar
    nuevoClub.value = {
      name: '',
      description: '',
      artista_id: ''
    };
    limpiarSeleccion();
    mostrarFormulario.value = false;
  }
};

// Método para entrar al club
const entrarAlClub = (club: ClubFan) => {
  console.log('Entrando al club:', club.name);
  // Navegar a la vista detallada del club
  router.push(`/club/${club.id}`);
};

// Método para editar club (placeholder)
const editarClub = (club: ClubFan) => {
  console.log('Editar club:', club);
  // TODO: Implementar modal de edición
  alert(`Función de edición para "${club.name}" estará disponible pronto.`);
};

// Métodos para eliminación
const eliminarClubConfirm = (club: ClubFan) => {
  clubAEliminar.value = club;
};

const cancelarEliminacion = () => {
  clubAEliminar.value = null;
};

const confirmarEliminacion = async () => {
  if (!clubAEliminar.value) return;
  
  const success = await eliminarClub(clubAEliminar.value.id);
  
  if (success) {
    clubAEliminar.value = null;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  obtenerClubes();
  
  // Event listener para cerrar sugerencias al hacer clic fuera
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const selector = target.closest('.artist-selector');
    
    if (!selector) {
      mostrarSugerencias.value = false;
    }
  });
});
</script>

<style scoped>
.clubes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header */
.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.titulo-principal {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitulo {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* Búsqueda */
.search-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.search-input-container {
  display: flex;
  border: 2px solid #3498db;
  border-radius: 25px;
  overflow: hidden;
  background: white;
}

.search-input {
  padding: 0.75rem 1.5rem;
  border: none;
  outline: none;
  font-size: 1rem;
  min-width: 300px;
}

.search-button {
  padding: 0.75rem 1rem;
  border: none;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

.search-button:hover {
  background: #2980b9;
}

.refresh-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #95a5a6;
  background: white;
  color: #2c3e50;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
}

.refresh-button:hover {
  background: #ecf0f1;
}

/* Acciones */
.actions-section {
  text-align: center;
  margin-bottom: 2rem;
}

.btn-primary {
  background: #27ae60;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background: #229954;
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-edit {
  background: #f39c12;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-edit:hover {
  background: #e67e22;
}

.btn-delete {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-delete:hover {
  background: #c0392b;
}

.btn-delete:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* Formulario */
.form-section {
  margin-bottom: 2rem;
}

.form-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.form-card h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.form-help {
  color: #7f8c8d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-actions {
  text-align: center;
  margin-top: 2rem;
}

/* Estados de carga y error */
.loading-section {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-section {
  text-align: center;
  padding: 2rem;
}

.error-card {
  background: #fadbd8;
  padding: 2rem;
  border-radius: 10px;
  border-left: 4px solid #e74c3c;
  max-width: 500px;
  margin: 0 auto;
}

.error-card h3 {
  color: #c0392b;
  margin-bottom: 1rem;
}

.error-card p {
  color: #922b21;
  margin-bottom: 1.5rem;
}

/* Resultados */
.results-section {
  margin-top: 2rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ecf0f1;
}

.results-header h3 {
  color: #2c3e50;
  margin: 0;
}

.results-count {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Grid de clubes */
.clubes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.club-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.club-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.club-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.club-name {
  color: #2c3e50;
  font-size: 1.25rem;
  margin: 0;
  flex: 1;
}

.club-id {
  color: #7f8c8d;
  font-size: 0.8rem;
  background: #ecf0f1;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
}

.club-description {
  margin-bottom: 1rem;
}

.club-description p {
  color: #555;
  line-height: 1.4;
  margin: 0;
}

.club-info {
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.info-value {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 500;
}

.club-actions {
  display: flex;
  gap: 0.5rem;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-card {
  background: #f8f9fa;
  padding: 3rem;
  border-radius: 15px;
  max-width: 500px;
  margin: 0 auto;
}

.empty-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.empty-card p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.modal-content p {
  color: #555;
  margin-bottom: 1rem;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

/* Estilos para el selector de artistas */
.artist-selector {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

.suggestion-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.artist-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
}

.artist-info {
  display: flex;
  flex-direction: column;
}

.artist-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.artist-description {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 2px;
}

.selected-artist {
  margin-top: 8px;
  padding: 12px;
  background: #e8f5e8;
  border: 1px solid #27ae60;
  border-radius: 8px;
}

.selected-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #27ae60;
}

.selected-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.selected-name {
  font-weight: 600;
  color: #27ae60;
  font-size: 0.95rem;
}

.selected-id {
  color: #6c757d;
  font-size: 0.75rem;
  margin-top: 2px;
}

.clear-selection {
  background: #e74c3c;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.clear-selection:hover {
  background: #c0392b;
}

/* Responsive */
@media (max-width: 768px) {
  .clubes-container {
    padding: 1rem;
  }
  
  .titulo-principal {
    font-size: 2rem;
  }
  
  .search-input {
    min-width: 250px;
  }
  
  .clubes-grid {
    grid-template-columns: 1fr;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>