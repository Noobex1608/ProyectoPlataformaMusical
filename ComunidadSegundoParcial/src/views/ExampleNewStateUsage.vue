<!-- ComunidadSegundoParcial/src/views/ExampleNewStateUsage.vue -->
<template>
  <div class="example-new-state">
    <h2>🎭 Ejemplo de Nuevo Estado Global (Vue)</h2>
    
    <!-- Estado de autenticación -->
    <div class="auth-section">
      <h3>Autenticación</h3>
      <div v-if="isLoggedIn">
        <p>✅ Usuario: {{ user?.name || 'Usuario' }}</p>
        <p v-if="auth.lastLoginTime">🕒 Último login: {{ formatDate(auth.lastLoginTime) }}</p>
        <button @click="logout">Cerrar sesión</button>
      </div>
      <div v-else>
        <p>❌ No autenticado</p>
        <button @click="loginDemo">Login Demo</button>
      </div>
    </div>

    <!-- Estado de UI -->
    <div class="ui-section">
      <h3>Interfaz</h3>
      <p>Tema actual: {{ theme }}</p>
      <p>Idioma: {{ language }}</p>
      <button @click="toggleTheme">
        Cambiar a {{ theme === 'light' ? 'oscuro' : 'claro' }}
      </button>
      <button @click="toggleLanguage">
        Cambiar a {{ language === 'es' ? 'English' : 'Español' }}
      </button>
      
      <div v-if="notifications.length > 0" class="notifications">
        <h4>Notificaciones ({{ notificationCount }} sin leer)</h4>
        <div 
          v-for="notification in notifications.slice(0, 3)" 
          :key="notification.id"
          :class="['notification', notification.type, notification.read ? 'read' : 'unread']"
          @click="markNotificationRead(notification.id)"
        >
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.message }}</p>
          <small>{{ formatDate(notification.timestamp) }}</small>
        </div>
        <button v-if="notifications.length > 0" @click="clearNotifications">
          Limpiar notificaciones
        </button>
      </div>
    </div>

    <!-- Estado específico de comunidad -->
    <div class="community-section">
      <h3>Estado de la Comunidad</h3>
      <div v-if="selectedClub">
        <p>🏛️ Club seleccionado: {{ selectedClub.nombre }}</p>
        <p>👥 Miembros: {{ selectedClub.miembros || 0 }}</p>
        <button @click="createEvent">Crear evento</button>
      </div>
      <div v-else>
        <p>No hay club seleccionado</p>
        <button @click="selectDemoClub">Seleccionar club demo</button>
      </div>
      
      <div v-if="sharedContent.length > 0">
        <h4>Contenido compartido ({{ sharedContent.length }})</h4>
        <ul>
          <li v-for="content in sharedContent" :key="content.id">
            {{ content.title }} - {{ content.type }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Navegación -->
    <div class="navigation-section">
      <h3>Navegación</h3>
      <p>Ruta actual: {{ currentRoute }}</p>
      <p>Módulo activo: {{ activeModule }}</p>
      <p>Rutas visitadas: {{ lastVisitedRoutes.length }}</p>
      <button @click="navigateToClubs">Ir a clubes</button>
    </div>

    <!-- Estado del sistema -->
    <div class="system-section">
      <h3>Sistema</h3>
      <p>Estado: {{ isOnline ? '🟢 Online' : '🔴 Offline' }}</p>
      <p>Última sincronización: {{ formatDate(lastSyncTime) }}</p>
      <p v-if="errorQueue.length > 0">❌ Errores pendientes: {{ errorQueue.length }}</p>
    </div>

    <!-- Debug -->
    <div class="debug-section">
      <h3>Debug</h3>
      <button @click="logState">Log Estado Completo</button>
      <button @click="debugState">Debug Vue State</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  useAuth, 
  useUI, 
  useNavigation, 
  useSystem,
  useComunidadState,
  useComunidadNotifications
} from '../composables/newStateIntegration.js';

// Composables
const auth = useAuth();
const ui = useUI();
const navigation = useNavigation();
const system = useSystem();
const comunidadState = useComunidadState();
const comunidadNotifications = useComunidadNotifications();

// Propiedades computadas
const isLoggedIn = auth.isLoggedIn;
const user = auth.user;
const theme = ui.theme;
const language = ui.language;
const notificationCount = ui.notificationCount;
const currentRoute = navigation.currentRoute;
const activeModule = navigation.activeModule;
const lastVisitedRoutes = navigation.lastVisitedRoutes;
const isOnline = system.isOnline;
const lastSyncTime = system.lastSyncTime;
const errorQueue = system.errorQueue;
const selectedClub = comunidadState.selectedClub;
const sharedContent = comunidadState.sharedContent;

// Propiedades computadas para notificaciones
const notifications = computed(() => ui.notifications.value);

// Métodos
const { 
  login, 
  logout 
} = auth;

const { 
  setTheme, 
  setLanguage, 
  addNotification, 
  markNotificationRead, 
  clearNotifications
} = ui;

const { navigateTo } = navigation;

const { 
  setSelectedClub, 
  addToSharedContent 
} = comunidadState;

const {
  notifyClubJoined,
  notifyEventCreated,
  notifyError
} = comunidadNotifications;

// Métodos específicos
const loginDemo = () => {
  login({ name: 'Usuario Demo', type: 'user' }, 'demo-token');
};

const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
};

const toggleLanguage = () => {
  setLanguage(language.value === 'es' ? 'en' : 'es');
};

const selectDemoClub = () => {
  const demoClub = {
    id: 1,
    nombre: 'Club de Rock Demo',
    miembros: 25,
    description: 'Un club demo para testing'
  };
  
  setSelectedClub(demoClub);
  notifyClubJoined(demoClub.nombre);
};

const createEvent = () => {
  if (!selectedClub.value) return;
  
  const eventName = `Evento en ${selectedClub.value.nombre}`;
  notifyEventCreated(eventName);
  
  // Agregar al contenido compartido
  const eventContent = {
    id: Date.now(),
    title: eventName,
    type: 'event',
    clubId: selectedClub.value.id
  };
  
  addToSharedContent(eventContent);
};

const navigateToClubs = () => {
  navigateTo('/comunidad/clubes', 'ComunidadSegundoParcial');
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

const logState = () => {
  const state = window.shellServices.stateManager.getState();
  console.log('🔍 Estado completo:', state);
};

const debugState = () => {
  console.log('🎭 Estado Vue:', {
    auth: auth,
    ui: ui,
    navigation: navigation,
    system: system,
    comunidad: comunidadState
  });
};
</script>


<style scoped>
.example-new-state {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.auth-section, 
.ui-section, 
.community-section, 
.navigation-section, 
.system-section, 
.debug-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.notifications {
  margin-top: 15px;
}

.notification {
  padding: 10px;
  margin: 5px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.notification.unread {
  font-weight: bold;
  border-left: 4px solid #348e91;
}

.notification.read {
  opacity: 0.7;
}

.notification.success {
  background-color: #d4edda;
  color: #155724;
}

.notification.error {
  background-color: #f8d7da;
  color: #721c24;
}

.notification.info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.notification.warning {
  background-color: #fff3cd;
  color: #856404;
}

button {
  background-color: #348e91;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #2a7175;
}

h3 {
  color: #348e91;
  margin-bottom: 10px;
  font-size: 1.2em;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

p {
  margin: 8px 0;
}

small {
  color: #666;
  font-size: 0.8em;
}
</style>
