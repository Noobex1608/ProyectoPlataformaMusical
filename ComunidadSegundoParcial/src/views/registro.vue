<template>
  <HeaderComponent />
  <div class="register-container">
    <div class="user-type-header" v-if="selectedUserType">
      <div class="user-type-indicator">
        <span class="user-type-icon">{{ getUserTypeIcon(selectedUserType) }}</span>
        <div>
          <h3>Registro de {{ getUserTypeTitle(selectedUserType) }}</h3>
          <p>Crea tu cuenta para acceder a la plataforma</p>
        </div>
      </div>
    </div>
    
    <h2>Crear cuenta</h2>

    <!-- Selección de tipo de usuario si no viene de la URL -->
    <div v-if="!selectedUserType" class="user-type-selection">
      <h3>¿Cómo te quieres registrar?</h3>
      <div class="type-buttons">
        <button 
          type="button"
          @click="selectUserType('fan')" 
          class="type-btn community-btn"
        >
          <span class="btn-icon">👥</span>
          <div>
            <strong>Usuario de Comunidad</strong>
            <p>Explora y disfruta de la música</p>
          </div>
        </button>
        
        <button 
          type="button"
          @click="selectUserType('artist')" 
          class="type-btn artist-btn"
        >
          <span class="btn-icon">🎤</span>
          <div>
            <strong>Artista</strong>
            <p>Comparte tu música con el mundo</p>
          </div>
        </button>
      </div>
    </div>
    
    <!-- Formulario de registro (solo se muestra cuando hay tipo seleccionado) -->
    <form v-if="selectedUserType" @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="name"><strong>Nombre completo</strong></label>
        <input 
          type="text" 
          v-model="name" 
          placeholder="Ingrese su nombre completo" 
          required 
        />
      </div>
      
      <div class="form-group">
        <label for="email"><strong>Correo electrónico</strong></label>
        <input 
          type="email" 
          v-model="email" 
          placeholder="Ingrese su correo" 
          required 
        />
      </div>
      
      <div class="form-group">
        <label for="password"><strong>Contraseña</strong></label>
        <input 
          type="password" 
          v-model="password" 
          placeholder="Ingrese su contraseña (mínimo 6 caracteres)" 
          required 
        />
      </div>
      
      <div class="form-group">
        <label for="age"><strong>Edad (opcional)</strong></label>
        <input 
          type="number" 
          v-model="age" 
          placeholder="Ingrese su edad" 
          min="13" 
          max="120"
        />
      </div>
      
      <div class="form-group">
        <label for="description"><strong>Descripción (opcional)</strong></label>
        <textarea 
          v-model="description" 
          placeholder="Cuéntanos un poco sobre ti..."
          rows="3"
        ></textarea>
      </div>
      
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Registrando...' : 'Registrar' }}
      </button>
    </form>
    
    <p v-if="selectedUserType">¿Ya tienes cuenta? 
      <router-link :to="`/login?userType=${selectedUserType}`">
        Inicia sesión aquí
      </router-link>
    </p>
    
    <p v-else>¿Ya tienes cuenta? 
      <router-link to="/">
        Volver al inicio
      </router-link>
    </p>
    
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";
import HeaderComponent from "../components/headerComponent.vue";

const route = useRoute();
const name = ref("");
const email = ref("");
const password = ref("");
const age = ref<number | null>(null);
const description = ref("");
const error = ref("");
const success = ref("");
const isLoading = ref(false);
const selectedUserType = ref("");

const { registerUser, validateEmail, router } = useAuth();

onMounted(() => {
  // Obtener el tipo de usuario de la URL y mapear a valores de BD
  const userTypeFromURL = (route.query.userType as string) || localStorage.getItem('selectedUserType') || '';
  
  // Mapear valores del frontend a valores de la base de datos
  if (userTypeFromURL === 'artista') {
    selectedUserType.value = 'artist';
  } else if (userTypeFromURL === 'comunidad') {
    selectedUserType.value = 'fan';
  } else {
    selectedUserType.value = userTypeFromURL; // En caso de que ya venga correcto
  }
  
  console.log(`🔄 Tipo de usuario mapeado: ${userTypeFromURL} -> ${selectedUserType.value}`);
});

const selectUserType = (type: string) => {
  // Mapear valores del frontend a valores de la base de datos
  let dbType = type;
  if (type === 'artista') {
    dbType = 'artist';
  } else if (type === 'comunidad') {
    dbType = 'fan';
  }
  
  selectedUserType.value = dbType;
  localStorage.setItem('selectedUserType', dbType);
  console.log(`📝 Tipo de usuario seleccionado para registro: ${type} -> ${dbType}`);
};

const getUserTypeIcon = (type: string) => {
  switch (type) {
    case 'artist': return '🎤';
    case 'fan': return '👥';
    default: return '🎵';
  }
};

const getUserTypeTitle = (type: string) => {
  switch (type) {
    case 'artist': return 'Artista';
    case 'fan': return 'Usuario de Comunidad';
    default: return 'Usuario';
  }
};

async function handleRegister() {
  error.value = "";
  success.value = "";
  
  // Validaciones
  if (!name.value || !email.value || !password.value) {
    error.value = "Por favor complete todos los campos obligatorios";
    return;
  }
  
  if (!validateEmail(email.value)) {
    error.value = "Por favor ingrese un correo electrónico válido";
    return;
  }
  
  if (password.value.length < 6) {
    error.value = "La contraseña debe tener al menos 6 caracteres";
    return;
  }
  
  if (age.value && (age.value < 13 || age.value > 120)) {
    error.value = "La edad debe estar entre 13 y 120 años";
    return;
  }
  
  isLoading.value = true;
  
  try {
    const userData = {
      name: name.value,
      email: email.value,
      password: password.value,
      type: selectedUserType.value,
      age: age.value || undefined,
      description: description.value || undefined
    };
    
    await registerUser(userData);
    success.value = "Registro exitoso! Redirigiendo...";
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
      router.push(`/login?userType=${selectedUserType.value}`);
    }, 2000);
    
  } catch (err: any) {
    error.value = err.message || "Error al registrar usuario";
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.register-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.user-type-header {
  background: linear-gradient(135deg, #348e91, #4ecdc4);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.user-type-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-type-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.user-type-indicator h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.user-type-indicator p {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #348e91;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

button {
  width: 100%;
  padding: 0.875rem;
  background-color: #348e91;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #2c7a7d;
}

button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

p {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

p a {
  color: #348e91;
  text-decoration: none;
  font-weight: 500;
}

p a:hover {
  text-decoration: underline;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
}

.success {
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
}

/* Estilos para selección de tipo de usuario */
.user-type-selection {
  margin-bottom: 2rem;
  text-align: center;
}

.user-type-selection h3 {
  color: #348e91;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.type-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  min-height: 100px;
}

.type-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.community-btn:hover {
  border-color: #348e91;
  background: linear-gradient(135deg, #348e91, #4ecdc4);
  color: white;
}

.artist-btn:hover {
  border-color: #6c5ce7;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
}

.btn-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.type-btn div {
  flex: 1;
}

.type-btn strong {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.type-btn p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Responsive design */
@media (max-width: 768px) {
  .register-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .user-type-header {
    padding: 1rem;
  }
  
  .user-type-icon {
    font-size: 2rem;
  }
  
  .type-buttons {
    grid-template-columns: 1fr;
  }
  
  .type-btn {
    padding: 1rem;
    min-height: auto;
  }
  
  .btn-icon {
    font-size: 1.5rem;
  }
}
</style>
