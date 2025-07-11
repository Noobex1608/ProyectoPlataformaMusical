<template>
  <headerComponent></headerComponent>
  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-avatar">
        <div class="avatar-circle">
          <span class="avatar-text">{{ getInitials(usuario?.name) }}</span>
        </div>
      </div>
      <h1 class="profile-title">Mi Perfil</h1>
    </div>

    <div class="profile-content" v-if="usuario && !loading">
      <div class="profile-card">
        <div class="card-section">
          <h3 class="section-title">📋 Información Personal</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Nombre:</label>
              <span>{{ usuario.name || "No definido" }}</span>
            </div>
            <div class="info-item">
              <label>Correo:</label>
              <span>{{ usuario.email || "No definido" }}</span>
            </div>
            <div class="info-item">
              <label>Descripción:</label>
              <span>{{ usuario.description || "No definido" }}</span>
            </div>
            <div class="info-item">
              <label>Fecha de registro:</label>
              <span>{{ formatDate(usuario.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="card-section">
          <h3 class="section-title">⚙️ Acciones</h3>
          <div class="actions-grid">
            <button @click="cambiarDescripcion" class="action-btn primary">
              <span class="btn-icon">✏️</span>
              Cambiar descripción
            </button>
            <button @click="logout" class="action-btn secondary">
              <span class="btn-icon">🚪</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando perfil...</p>
    </div>

    <div v-else class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>No hay usuario autenticado</h3>
      <p>Para ver tu perfil necesitas iniciar sesión</p>
      <router-link to="/" class="login-link">Ir a iniciar sesión</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUsuarioStore } from "../store/usuario";
import { useRouter } from "vue-router";
import headerComponent from "../components/headerComponent.vue";
import { supabase } from '../supabase';

const usuarioStore = useUsuarioStore();
const router = useRouter();
const loading = ref(true);
const usuario = ref<any>(null);

// Función para cargar información del usuario
const cargarUsuario = async () => {
  try {
    loading.value = true;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Error obteniendo usuario autenticado:', authError);
      return;
    }

    const { data: usuarioData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (userError) {
      console.error('Error obteniendo datos del usuario:', userError);
      return;
    }

    usuario.value = usuarioData;
    
    // También actualizar el store si es necesario
    if (!usuarioStore.usuario || usuarioStore.usuario.id !== usuarioData.id) {
      usuarioStore.setUsuario(usuarioData);
    }
  } catch (error) {
    console.error('Error cargando usuario:', error);
  } finally {
    loading.value = false;
  }
};

// Funciones auxiliares
const getInitials = (name: string | null): string => {
  if (!name) return 'U';
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'No disponible';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para cambiar descripción
const cambiarDescripcion = async () => {
  const nuevaDescripcion = prompt("Ingrese la nueva descripción:");
  if (nuevaDescripcion && usuario.value) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ description: nuevaDescripcion })
        .eq('id', usuario.value.id);

      if (error) {
        console.error('Error actualizando descripción:', error);
        alert('Error al actualizar la descripción');
        return;
      }

      // Actualizar datos locales
      usuario.value.description = nuevaDescripcion;
      usuarioStore.updateUsuario({ description: nuevaDescripcion });
      
      alert('Descripción actualizada correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la descripción');
    }
  }
};

// Función para cerrar sesión
const logout = async () => {
  try {
    await supabase.auth.signOut();
    usuarioStore.clearUsuario();
    router.push("/");
  } catch (error) {
    console.error('Error cerrando sesión:', error);
  }
};

// Lifecycle
onMounted(() => {
  cargarUsuario();
});
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #348e91 0%, #2c7a7d 50%, #f0f8ff 100%);
  padding: 2rem 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-avatar {
  margin-bottom: 1rem;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #348e91, #2c7a7d);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 20px rgba(52, 142, 145, 0.3);
  border: 4px solid white;
}

.avatar-text {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.profile-title {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.card-section {
  padding: 2rem;
  border-bottom: 1px solid rgba(52, 142, 145, 0.1);
}

.card-section:last-child {
  border-bottom: none;
}

.section-title {
  color: #348e91;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(52, 142, 145, 0.05);
  border-radius: 10px;
  border-left: 4px solid #348e91;
}

.info-item label {
  font-weight: bold;
  color: #348e91;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  color: #333;
  font-size: 1.1rem;
  word-break: break-word;
}

.actions-grid {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

@media (min-width: 768px) {
  .actions-grid {
    flex-direction: row;
    justify-content: center;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  min-width: 200px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #348e91, #2c7a7d);
  color: white;
  box-shadow: 0 4px 15px rgba(52, 142, 145, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 142, 145, 0.4);
}

.action-btn.secondary {
  background: transparent;
  color: #348e91;
  border: 2px solid #348e91;
}

.action-btn.secondary:hover {
  background: #348e91;
  color: white;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Estados de carga y error */
.loading-container, .error-container {
  text-align: center;
  padding: 3rem;
  max-width: 500px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(52, 142, 145, 0.3);
  border-top: 4px solid #348e91;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-container h3 {
  color: #348e91;
  margin-bottom: 1rem;
}

.error-container p {
  color: #666;
  margin-bottom: 1.5rem;
}

.login-link {
  display: inline-block;
  background: linear-gradient(135deg, #348e91, #2c7a7d);
  color: white;
  padding: 1rem 2rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 142, 145, 0.4);
}

/* Responsividad */
@media (max-width: 768px) {
  .profile-container {
    padding: 1rem 0.5rem;
  }
  
  .profile-title {
    font-size: 2rem;
  }
  
  .avatar-circle {
    width: 80px;
    height: 80px;
  }
  
  .avatar-text {
    font-size: 1.5rem;
  }
  
  .card-section {
    padding: 1.5rem;
  }
  
  .action-btn {
    min-width: auto;
    width: 100%;
  }
}
</style>
