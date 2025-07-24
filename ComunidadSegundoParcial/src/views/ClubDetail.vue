<template>
  <headerComponent />
  <div class="club-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p>Cargando información del club...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-section">
      <div class="error-card">
        <div class="error-icon">⚠️</div>
        <h3>Error al cargar el club</h3>
        <p>{{ error }}</p>
        <button @click="cargarDatosClub" class="btn-secondary">
          🔄 Reintentar
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="club" class="club-detail-content">
      <!-- Header del Club -->
      <div class="club-header">
        <div class="header-navigation">
          <button @click="$router.back()" class="back-button">
            ← Volver a Clubes
          </button>
        </div>
        
        <div class="club-hero">
          <div class="club-info-main">
            <h1 class="club-title">🏟️ {{ club.name }}</h1>
            <div class="club-metadata">
              <span class="club-id">#{{ club.id }}</span>
              <span class="club-created">Creado {{ formatearFechaRelativa(club.created_at) }}</span>
            </div>
            <div v-if="club.description" class="club-description">
              <p>{{ club.description }}</p>
            </div>
          </div>

          <!-- Información del Artista -->
          <div v-if="artista" class="artist-info">
            <div class="artist-card">
              <div class="artist-avatar-container">
                <img 
                  v-if="artista.imagen"
                  :src="artista.imagen" 
                  :alt="artista.nombre"
                  class="artist-avatar"
                />
                <div v-else class="artist-avatar-placeholder">
                  🎤
                </div>
              </div>
              <div class="artist-details">
                <h2 class="artist-name">{{ artista.nombre }}</h2>
                <p v-if="artista.descripcion" class="artist-description">
                  {{ artista.descripcion }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas del Club -->
        <div class="club-stats">
          <div class="stat-item">
            <div class="stat-icon">👥</div>
            <span class="stat-number">{{ miembrosCount }}</span>
            <span class="stat-label">Miembros</span>
          </div>
          <div class="stat-item">
            <div class="stat-icon">💬</div>
            <span class="stat-number">{{ mensajesCount }}</span>
            <span class="stat-label">Mensajes</span>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🎪</div>
            <span class="stat-number">{{ eventosCount }}</span>
            <span class="stat-label">Eventos</span>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🟢</div>
            <span class="stat-number">{{ onlineMembersCount }}</span>
            <span class="stat-label">En línea</span>
          </div>
        </div>
      </div>

      <!-- Contenido Principal: Tabs -->
      <div class="content-tabs">
        <div class="tab-headers">
          <button 
            @click="activeTab = 'chat'"
            :class="['tab-button', { active: activeTab === 'chat' }]"
          >
            <span class="tab-icon">💬</span>
            <span class="tab-text">Chat</span>
            <span v-if="mensajes.length > 0" class="tab-badge">{{ mensajes.length }}</span>
          </button>
          <button 
            @click="activeTab = 'eventos'"
            :class="['tab-button', { active: activeTab === 'eventos' }]"
          >
            <span class="tab-icon">🎪</span>
            <span class="tab-text">Eventos</span>
            <span v-if="eventos.length > 0" class="tab-badge">{{ eventos.length }}</span>
          </button>
          <button 
            @click="activeTab = 'miembros'"
            :class="['tab-button', { active: activeTab === 'miembros' }]"
          >
            <span class="tab-icon">👥</span>
            <span class="tab-text">Miembros</span>
            <span v-if="miembros.length > 0" class="tab-badge">{{ miembros.length }}</span>
          </button>
        </div>

        <!-- Tab Content: Chat -->
        <div v-if="activeTab === 'chat'" class="tab-content">
          <div class="chat-section">
            <div class="chat-header">
              <div class="chat-title">
                <h3>💬 Conversación del Club</h3>
                <div class="chat-status">
                  <span class="online-indicator">🟢</span>
                  <span>{{ onlineMembersCount }} miembros conectados</span>
                </div>
              </div>
            </div>

            <!-- Messages Container -->
            <div class="messages-container" ref="messagesContainer">
              <div 
                v-for="mensaje in mensajes" 
                :key="mensaje.id"
                :class="['message-bubble', { 'own-message': mensaje.usuario_id === currentUserId }]"
              >
                <div class="message-avatar">
                  {{ (mensaje.usuario_nombre || mensaje.usuario?.name || 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-author">{{ mensaje.usuario_nombre || mensaje.usuario?.name || 'Usuario' }}</span>
                    <span class="message-time">{{ formatearHora(mensaje.created_at) }}</span>
                  </div>
                  <div class="message-text">
                    {{ mensaje.contenido }}
                    <span v-if="mensaje.editado" class="edited-indicator" title="Mensaje editado">
                      ✏️ editado
                    </span>
                  </div>
                </div>
              </div>

              <!-- Estado vacío -->
              <div v-if="mensajes.length === 0" class="empty-chat">
                <div class="empty-icon">💭</div>
                <h4>¡Inicia la conversación!</h4>
                <p>Sé el primero en compartir tus pensamientos sobre {{ artista?.nombre }}</p>
              </div>
            </div>

            <!-- Message Input -->
            <div class="message-input-section">
              <form @submit.prevent="enviarMensaje" class="message-form">
                <div class="input-container">
                  <input 
                    v-model="nuevoMensaje" 
                    type="text" 
                    placeholder="Escribe tu mensaje aquí..."
                    class="message-input"
                    :disabled="loadingMessage"
                    maxlength="500"
                  />
                  <button 
                    type="submit" 
                    :disabled="!nuevoMensaje.trim() || loadingMessage"
                    class="send-button"
                  >
                    <span v-if="loadingMessage">⏳</span>
                    <span v-else>📤</span>
                  </button>
                </div>
              </form>
              <small class="message-help">
                Máximo 500 caracteres • Sé respetuoso con otros fans
              </small>
            </div>
          </div>
        </div>

        <!-- Tab Content: Eventos -->
        <div v-if="activeTab === 'eventos'" class="tab-content">
          <div class="eventos-section">
            <div class="eventos-header">
              <div class="section-title">
                <h3>🎪 Eventos de {{ artista?.nombre }}</h3>
                <p>Descubre los próximos conciertos y presentaciones</p>
              </div>
              <div class="eventos-controls">
                <select v-model="filtroEventos" class="filter-select">
                  <option value="todos">Todos los eventos</option>
                  <option value="proximos">Próximos</option>
                  <option value="pasados">Pasados</option>
                </select>
                <button @click="cargarEventos" class="refresh-btn" :disabled="loadingEventos">
                  {{ loadingEventos ? '⏳' : '🔄' }}
                </button>
              </div>
            </div>

            <!-- Loading Eventos -->
            <div v-if="loadingEventos" class="loading-mini">
              <div class="mini-spinner"></div>
              <span>Cargando eventos...</span>
            </div>

            <!-- Lista de Eventos -->
            <div v-else-if="eventosFiltrados.length > 0" class="eventos-grid">
              <div 
                v-for="evento in eventosFiltrados" 
                :key="evento.id"
                class="evento-card"
              >
                <div class="evento-header">
                  <div class="evento-date">
                    <div class="date-day">{{ formatearDia(evento.fecha) }}</div>
                    <div class="date-month">{{ formatearMes(evento.fecha) }}</div>
                  </div>
                  <div class="evento-status" :class="getEventoStatus(evento.fecha)">
                    {{ getEventoStatusText(evento.fecha) }}
                  </div>
                </div>
                
                <div class="evento-content">
                  <h4 class="evento-title">{{ evento.nombre }}</h4>
                  <div class="evento-location">
                    📍 {{ evento.ubicacion }}
                  </div>
                  <div v-if="evento.descripcion" class="evento-description">
                    {{ evento.descripcion }}
                  </div>
                </div>

                <div class="evento-footer">
                  <div class="evento-price" v-if="evento.precio">
                    💰 {{ formatearPrecio(evento.precio) }}
                  </div>
                  <div class="evento-capacity" v-if="evento.capacidad">
                    👥 {{ evento.capacidad }} personas
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State Eventos -->
            <div v-else class="empty-eventos">
              <div class="empty-icon">🎪</div>
              <h4>No hay eventos disponibles</h4>
              <p v-if="filtroEventos === 'proximos'">
                No hay eventos próximos de {{ artista?.nombre }}
              </p>
              <p v-else-if="filtroEventos === 'pasados'">
                No hay eventos pasados registrados
              </p>
              <p v-else>
                {{ artista?.nombre }} no tiene eventos programados
              </p>
            </div>
          </div>
        </div>

        <!-- Tab Content: Miembros -->
        <div v-if="activeTab === 'miembros'" class="tab-content">
          <div class="miembros-section">
            <div class="miembros-header">
              <div class="section-title">
                <h3>👥 Miembros del Club</h3>
                <p>Conoce a otros fans de {{ artista?.nombre }}</p>
              </div>
              <div class="miembros-controls">
                <div class="miembros-stats">
                  <span class="stat-highlight">{{ miembros.length }} miembros</span>
                  <span class="stat-detail">{{ onlineMembersCount }} conectados</span>
                </div>
                <div class="club-actions">
                  <button 
                    v-if="!esMiembro && currentUserId"
                    @click="manejarUnirseAlClub"
                    :disabled="loadingUnirse"
                    class="btn-primary btn-small"
                  >
                    <span v-if="loadingUnirse">⏳</span>
                    <span v-else>Unirse</span>
                  </button>
                  <button 
                    v-else-if="esMiembro && currentUserId"
                    @click="manejarSalirDelClub"
                    :disabled="loadingUnirse"
                    class="btn-secondary btn-small"
                  >
                    <span v-if="loadingUnirse">⏳</span>
                    <span v-else>Salir</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Lista de Miembros -->
            <div v-if="miembros.length > 0" class="miembros-grid">
              <div 
                v-for="miembro in miembros" 
                :key="miembro.id"
                class="miembro-card"
              >
                <div class="miembro-avatar">
                  {{ (miembro.usuario?.name || 'Usuario').charAt(0).toUpperCase() }}
                  <div class="status-indicator" :class="{ online: miembro.online }">
                    <span>{{ miembro.online ? '🟢' : '⚫' }}</span>
                  </div>
                </div>
                <div class="miembro-info">
                  <div class="miembro-details">
                    <span class="miembro-name">{{ miembro.usuario?.name || 'Usuario' }}</span>
                    <span class="miembro-status">
                      {{ miembro.online ? 'En línea' : 'Desconectado' }}
                    </span>
                  </div>
                  <span class="miembro-joined">
                    Miembro desde {{ formatearFechaRelativa(miembro.joined_at) }}
                  </span>
                </div>
                <div class="miembro-actions">
                  <button class="action-btn" title="Enviar mensaje">💬</button>
                  <button class="action-btn" title="Ver perfil">👤</button>
                </div>
              </div>
            </div>

            <!-- Empty State Miembros -->
            <div v-else class="empty-miembros">
              <div class="empty-icon">👥</div>
              <h4>Aún no hay miembros</h4>
              <p>¡Sé el primer miembro de este club!</p>
              <button 
                @click="manejarUnirseAlClub"
                :disabled="loadingUnirse || !currentUserId"
                class="btn-primary"
              >
                <span v-if="loadingUnirse">⏳ Uniéndose...</span>
                <span v-else>Unirse al Club</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUsuarioStore } from '../store/usuario';
import { useClubFans, type ClubFan } from '../composables/useClubFans';
import { useClubChat, type MensajeChat } from '../composables/useClubChat';
import { useEventos, type Evento } from '../composables/useEventos';
import { useClubMiembros, type MiembroClub } from '../composables/useClubMiembros';
import headerComponent from '../components/headerComponent.vue';

// Composables y stores
const route = useRoute();
const usuarioStore = useUsuarioStore();
const { obtenerClubPorId, obtenerArtistaPorId } = useClubFans();
const { obtenerMensajesClub, enviarMensaje: enviarMensajeChat } = useClubChat();
const { obtenerEventosPorArtista } = useEventos();
const { obtenerMiembrosClub, unirseAlClub, salirDelClub } = useClubMiembros();

// Estado principal
const club = ref<ClubFan | null>(null);
const artista = ref<any | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Tabs
const activeTab = ref<'chat' | 'eventos' | 'miembros'>('chat');

// Chat
const mensajes = ref<MensajeChat[]>([]);
const nuevoMensaje = ref('');
const loadingMessage = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

// Eventos
const eventos = ref<Evento[]>([]);
const loadingEventos = ref(false);
const filtroEventos = ref<'todos' | 'proximos' | 'pasados'>('todos');

// Miembros
const miembros = ref<MiembroClub[]>([]);
const loadingMiembros = ref(false);
const esMiembro = ref(false);
const loadingUnirse = ref(false);

// Usuario actual
const currentUserId = computed(() => usuarioStore.usuario?.id);

// Computed properties
const miembrosCount = computed(() => miembros.value.length);
const mensajesCount = computed(() => mensajes.value.length);
const eventosCount = computed(() => eventos.value.length);
const onlineMembersCount = computed(() => 
  miembros.value.filter(m => m.online).length
);

const eventosFiltrados = computed(() => {
  const now = new Date();
  
  switch (filtroEventos.value) {
    case 'proximos':
      return eventos.value.filter(e => new Date(e.fecha) >= now);
    case 'pasados':
      return eventos.value.filter(e => new Date(e.fecha) < now);
    default:
      return eventos.value;
  }
});

// Métodos
const cargarDatosClub = async () => {
  console.log('🔧 Iniciando carga de datos del club...');
  loading.value = true;
  error.value = null;
  
  try {
    const clubId = parseInt(route.params.id as string);
    console.log('🔧 Club ID parseado:', clubId);
    
    if (isNaN(clubId)) {
      throw new Error('ID de club inválido');
    }

    // Obtener datos del club
    console.log('🔧 Obteniendo datos del club...');
    const clubData = await obtenerClubPorId(clubId);
    console.log('🔧 Datos del club obtenidos:', clubData);
    
    if (!clubData) {
      throw new Error('Club no encontrado');
    }
    
    club.value = clubData;
    console.log('🔧 Club asignado al ref:', club.value);

    // Obtener datos del artista si existe
    if (clubData.artista_id) {
      console.log('🔧 Obteniendo datos del artista...');
      const artistaData = await obtenerArtistaPorId(clubData.artista_id);
      console.log('🔧 Datos del artista obtenidos:', artistaData);
      artista.value = artistaData;
    }

    // Cargar datos adicionales
    console.log('🔧 Cargando datos adicionales...');
    await Promise.all([
      cargarMensajes(),
      cargarEventos(),
      cargarMiembros()
    ]);

    console.log('🔧 Carga completada exitosamente');

  } catch (err: any) {
    console.error('❌ Error cargando datos del club:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
    console.log('🔧 Estado final:', { loading: loading.value, error: error.value, club: !!club.value });
  }
};

const cargarMensajes = async () => {
  if (!club.value?.id) return;
  
  try {
    const mensajesData = await obtenerMensajesClub(club.value.id);
    mensajes.value = mensajesData;
  } catch (err) {
    console.error('Error cargando mensajes:', err);
    // Fallback a datos simulados
    mensajes.value = [
      {
        id: 1,
        club_id: club.value.id,
        usuario_id: 1,
        contenido: '¡Hola a todos los fans! 🎵',
        tipo_mensaje: 'texto' as const,
        mensaje_padre_id: null,
        editado: false,
        fecha_edicion: null,
        archivo_adjunto: null,
        metadata: {},
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        usuario_nombre: 'Fan Número 1'
      },
      {
        id: 2,
        club_id: club.value.id,
        usuario_id: 2,
        contenido: '¿Alguien vio el último concierto? ¡Estuvo increíble!',
        tipo_mensaje: 'texto' as const,
        mensaje_padre_id: null,
        editado: false,
        fecha_edicion: null,
        archivo_adjunto: null,
        metadata: {},
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString(),
        usuario_nombre: 'MelomaniacoTotal'
      }
    ];
  }
};

const cargarEventos = async () => {
  if (!artista.value?.id) return;
  
  loadingEventos.value = true;
  
  try {
    const eventosData = await obtenerEventosPorArtista(artista.value.id);
    eventos.value = eventosData;
  } catch (err) {
    console.error('Error cargando eventos:', err);
    // Fallback a datos simulados
    eventos.value = [
      {
        id: '1',
        artista_id: artista.value.id,
        nombre: 'Concierto Acústico',
        fecha: '2025-08-15',
        ubicacion: 'Teatro Principal',
        descripcion: 'Una noche íntima con las mejores canciones',
        precio: 500,
        capacidad: 200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        artista_id: artista.value.id,
        nombre: 'Festival de Verano',
        fecha: '2025-09-20',
        ubicacion: 'Parque Central',
        descripcion: 'Gran festival al aire libre',
        precio: 800,
        capacidad: 1000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  } finally {
    loadingEventos.value = false;
  }
};

const cargarMiembros = async () => {
  if (!club.value?.id) return;
  
  loadingMiembros.value = true;
  
  try {
    const miembrosData = await obtenerMiembrosClub(club.value.id);
    miembros.value = miembrosData;
    
    // Verificar si el usuario actual es miembro
    if (currentUserId.value) {
      esMiembro.value = miembrosData.some(miembro => 
        miembro.user_id === parseInt(currentUserId.value!.toString())
      );
    }
  } catch (err) {
    console.error('Error cargando miembros:', err);
    // Fallback a datos simulados
    miembros.value = [
      {
        id: 1,
        club_id: club.value.id,
        user_id: 1,
        joined_at: '2025-01-15T00:00:00Z',
        role: 'member' as const,
        usuario: {
          id: 1,
          name: 'Fan Número 1'
        },
        online: true
      },
      {
        id: 2,
        club_id: club.value.id,
        user_id: 2,
        joined_at: '2025-02-03T00:00:00Z',
        role: 'member' as const,
        usuario: {
          id: 2,
          name: 'MelomaniacoTotal'
        },
        online: false
      },
      {
        id: 3,
        club_id: club.value.id,
        user_id: 3,
        joined_at: '2025-03-10T00:00:00Z',
        role: 'member' as const,
        usuario: {
          id: 3,
          name: 'MúsicaEsVida'
        },
        online: true
      }
    ];
    
    // Verificar membresía en datos simulados
    if (currentUserId.value) {
      esMiembro.value = miembros.value.some(miembro => 
        miembro.user_id === parseInt(currentUserId.value!.toString())
      );
    }
  } finally {
    loadingMiembros.value = false;
  }
};

const enviarMensaje = async () => {
  if (!nuevoMensaje.value.trim() || !currentUserId.value || !club.value?.id) return;
  
  loadingMessage.value = true;
  
  try {
    const mensaje = await enviarMensajeChat({
      club_id: club.value.id,
      usuario_id: parseInt(currentUserId.value.toString()),
      contenido: nuevoMensaje.value.trim(),
      tipo_mensaje: 'texto'
    });

    if (mensaje) {
      mensajes.value.push(mensaje);
      nuevoMensaje.value = '';

      // Scroll al final
      await nextTick();
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    }
  } catch (err) {
    console.error('Error enviando mensaje:', err);
    // Fallback: agregar mensaje localmente
    const mensajeLocal: MensajeChat = {
      id: Date.now(),
      club_id: club.value.id,
      usuario_id: parseInt(currentUserId.value.toString()),
      contenido: nuevoMensaje.value.trim(),
      tipo_mensaje: 'texto',
      mensaje_padre_id: null,
      editado: false,
      fecha_edicion: null,
      archivo_adjunto: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usuario_nombre: usuarioStore.usuario?.name || 'Usuario'
    };

    mensajes.value.push(mensajeLocal);
    nuevoMensaje.value = '';

    // Scroll al final
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  } finally {
    loadingMessage.value = false;
  }
};

const manejarUnirseAlClub = async () => {
  if (!club.value?.id || !currentUserId.value || esMiembro.value) return;
  
  loadingUnirse.value = true;
  
  try {
    const nuevoMiembro = await unirseAlClub(
      club.value.id,
      parseInt(currentUserId.value.toString())
    );

    if (nuevoMiembro) {
      // Agregar el nuevo miembro a la lista
      miembros.value.push(nuevoMiembro);
      esMiembro.value = true;
      
      console.log('✅ Te has unido al club exitosamente');
      
      // Mostrar mensaje de éxito (opcional)
      // Aquí podrías agregar una notificación toast
    }
  } catch (err: any) {
    console.error('❌ Error uniéndose al club:', err);
    // Aquí podrías mostrar un mensaje de error al usuario
  } finally {
    loadingUnirse.value = false;
  }
};

const manejarSalirDelClub = async () => {
  if (!club.value?.id || !currentUserId.value || !esMiembro.value) return;
  
  loadingUnirse.value = true;
  
  try {
    const exito = await salirDelClub(
      club.value.id,
      parseInt(currentUserId.value.toString())
    );

    if (exito) {
      // Remover el miembro de la lista
      const userId = parseInt(currentUserId.value.toString());
      miembros.value = miembros.value.filter(miembro => miembro.user_id !== userId);
      esMiembro.value = false;
      
      console.log('✅ Has salido del club exitosamente');
    }
  } catch (err: any) {
    console.error('❌ Error saliendo del club:', err);
  } finally {
    loadingUnirse.value = false;
  }
};

const formatearHora = (fechaISO: string): string => {
  return new Date(fechaISO).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatearPrecio = (precio: number | undefined): string => {
  if (!precio) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(precio);
};

const formatearFechaRelativa = (fechaISO: string): string => {
  const fecha = new Date(fechaISO);
  const ahora = new Date();
  const diferencia = ahora.getTime() - fecha.getTime();
  
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const meses = Math.floor(diferencia / (1000 * 60 * 60 * 24 * 30));
  
  if (minutos < 60) return 'hace unos minutos';
  if (horas < 24) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (dias < 30) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  if (meses < 12) return `hace ${meses} mes${meses > 1 ? 'es' : ''}`;
  
  return fecha.toLocaleDateString('es-ES');
};

const formatearDia = (fechaString: string): string => {
  const fecha = new Date(fechaString);
  return fecha.getDate().toString().padStart(2, '0');
};

const formatearMes = (fechaString: string): string => {
  const fecha = new Date(fechaString);
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return meses[fecha.getMonth()];
};

const getEventoStatus = (fechaString: string): string => {
  const fecha = new Date(fechaString);
  const ahora = new Date();
  
  if (fecha > ahora) return 'upcoming';
  return 'past';
};

const getEventoStatusText = (fechaString: string): string => {
  const fecha = new Date(fechaString);
  const ahora = new Date();
  
  if (fecha > ahora) return 'Próximo';
  return 'Pasado';
};

// Lifecycle
onMounted(() => {
  console.log('🔧 ClubDetail montado, ID:', route.params.id);
  console.log('🔧 Estado inicial:', { loading: loading.value, error: error.value });
  cargarDatosClub();

  // Opcional: Suscribirse a mensajes en tiempo real
  // const { suscribirseAMensajes } = useClubChat();
  // const subscription = suscribirseAMensajes(
  //   parseInt(route.params.id as string),
  //   (nuevoMensaje) => {
  //     mensajes.value.push(nuevoMensaje);
  //     // Scroll al final automáticamente
  //     nextTick(() => {
  //       if (messagesContainer.value) {
  //         messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  //       }
  //     });
  //   }
  // );
});

// Watchers para debug
watch(loading, (newVal) => {
  console.log('🔧 Loading cambió:', newVal);
});

watch(club, (newVal) => {
  console.log('🔧 Club cambió:', newVal);
});

watch(error, (newVal) => {
  console.log('🔧 Error cambió:', newVal);
});

onUnmounted(() => {
  console.log('🔧 ClubDetail desmontado');
  // Cleanup si es necesario
});
</script>

<style scoped>
/* === Contenedor Principal === */
.club-detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* === Loading y Error === */
.loading-section, .error-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

/* === Header del Club === */
.club-header {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.back-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background-color 0.3s;
}

.back-button:hover {
  background: #5a6268;
}

.club-title-section {
  text-align: center;
  margin-bottom: 2rem;
}

.club-title {
  color: #348e91;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.club-metadata {
  display: flex;
  justify-content: center;
  gap: 2rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.club-id {
  background: #e9ecef;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-weight: 600;
}

/* === Información del Artista === */
.artist-info {
  margin-bottom: 2rem;
}

.artist-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #348e91 0%, #4facfe 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 15px;
}

.artist-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.artist-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.artist-description {
  opacity: 0.9;
  line-height: 1.5;
}

/* === Descripción del Club === */
.club-description {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  border-left: 4px solid #348e91;
}

/* === Estadísticas === */
.club-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #348e91;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* === Tabs === */
.content-tabs {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.tab-headers {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tab-button {
  flex: 1;
  background: none;
  border: none;
  padding: 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: #6c757d;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-button:hover {
  background: #e9ecef;
  color: #495057;
}

.tab-button.active {
  background: white;
  color: #348e91;
  border-bottom-color: #348e91;
  font-weight: 600;
}

.tab-content {
  padding: 2rem;
}

/* === Chat Section === */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.chat-header h3 {
  color: #348e91;
  margin: 0;
}

.chat-stats {
  color: #6c757d;
  font-size: 0.9rem;
}

.messages-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 15px;
  margin-bottom: 1.5rem;
}

.message {
  background: white;
  padding: 1rem;
  border-radius: 15px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message.own-message {
  background: linear-gradient(135deg, #348e91 0%, #4facfe 100%);
  color: white;
  margin-left: 2rem;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-author {
  font-weight: 600;
  font-size: 0.9rem;
}

.message-time {
  font-size: 0.8rem;
  opacity: 0.7;
}

.message-content {
  line-height: 1.5;
}

.edited-indicator {
  font-size: 0.7rem;
  opacity: 0.6;
  font-style: italic;
  margin-left: 0.5rem;
}

.empty-chat {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.message-input-section {
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
}

.message-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.message-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.message-input:focus {
  border-color: #348e91;
}

.send-button {
  background: #348e91;
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.3s;
}

.send-button:hover:not(:disabled) {
  background: #2c7a7d;
}

.send-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.message-help {
  color: #6c757d;
  font-size: 0.8rem;
  text-align: center;
  display: block;
}

/* === Eventos Section === */
.eventos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.eventos-header h3 {
  color: #348e91;
  margin: 0;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  background: white;
  font-size: 0.9rem;
  outline: none;
}

.loading-mini {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.eventos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.evento-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #348e91;
}

.evento-date {
  color: #348e91;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.evento-title {
  color: #2c3e50;
  margin: 0.5rem 0;
}

.evento-location {
  color: #6c757d;
  margin-bottom: 1rem;
}

.evento-description {
  color: #495057;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.evento-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.evento-price, .evento-capacity {
  background: #e9ecef;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #495057;
}

.empty-eventos {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

/* === Miembros Section === */
.miembros-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
  gap: 1rem;
}

.miembros-header h3 {
  color: #348e91;
  margin: 0;
}

.miembros-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.miembros-stats {
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.club-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 20px;
}

.miembros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.miembro-card {
  background: white;
  padding: 1rem;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.miembro-avatar {
  width: 50px;
  height: 50px;
  background: #348e91;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
}

.miembro-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.miembro-name {
  font-weight: 600;
  color: #2c3e50;
}

.miembro-joined {
  color: #6c757d;
  font-size: 0.8rem;
}

.status-indicator {
  font-size: 1.2rem;
}

.empty-miembros {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.miembro-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: 1px solid #e9ecef;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #348e91;
  border-color: #348e91;
  color: white;
}

/* === Responsive === */
@media (max-width: 768px) {
  .club-detail-container {
    padding: 1rem;
  }

  .club-title {
    font-size: 2rem;
  }

  .club-metadata {
    flex-direction: column;
    gap: 0.5rem;
  }

  .artist-card {
    flex-direction: column;
    text-align: center;
  }

  .tab-headers {
    flex-direction: column;
  }

  .tab-content {
    padding: 1rem;
  }

  .club-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .message {
    margin-left: 0;
  }

  .message.own-message {
    margin-left: 1rem;
  }

  .eventos-grid {
    grid-template-columns: 1fr;
  }

  .miembros-grid {
    grid-template-columns: 1fr;
  }
}

/* === Utilities === */
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
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-secondary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}
</style>
