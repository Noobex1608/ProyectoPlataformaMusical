<template>
  <HeaderComponent />
  <div class="login-container" >
    <div class="user-type-header" v-if="selectedUserType">
      <div class="user-type-indicator">
        <span class="user-type-icon">{{ getUserTypeIcon(selectedUserType) }}</span>
        <div>
          <h3>{{ getUserTypeTitle(selectedUserType) }}</h3>
          <p>Ingresa tus credenciales para acceder</p>
        </div>
      </div>
    </div>
    
    <h2>Iniciar sesión</h2>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Correo electrónico</label>
        <br />
        <input type="email" v-model="email" required />
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <br />
        <input type="password" v-model="password" required />
      </div>

      <button type="submit">Entrar</button>
    </form>
    <p>¿No tienes cuenta? 
      <router-link :to="`/registro?userType=${selectedUserType}`">
        Regístrate aquí
      </router-link>
    </p>
    
    <p class="forgot-password">
      ¿Olvidaste tu contraseña? 
      <button @click="sendPasswordReset" class="link-button">
        Restablecer contraseña
      </button>
    </p>
    
    <p v-if="resetMessage" class="success-message">{{ resetMessage }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <div v-if="showWrongTypeMessage" class="wrong-type-message">
      <p>{{ wrongTypeMessage }}</p>
      <button @click="goToCorrectLogin" class="redirect-btn">
        Ir al login correcto
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";
import {supabase} from "../supabase";
import HeaderComponent from "../components/headerComponent.vue";

const route = useRoute();
const email = ref("");
const password = ref("");
const error = ref("");
const selectedUserType = ref("");
const showWrongTypeMessage = ref(false);
const wrongTypeMessage = ref("");
const correctUserType = ref("");
const resetMessage = ref("");

const { router, setUser, validateEmail, verifyUserType, resetPassword } = useAuth();

onMounted(() => {
  // Obtener el tipo de usuario de la URL o localStorage
  selectedUserType.value = (route.query.userType as string) || localStorage.getItem('selectedUserType') || '';
});

const getUserTypeIcon = (type: string) => {
  switch (type) {
    case 'artist': return '🎤';
    case 'fan': return '👥';
    default: return '🎵';
  }
};

const getUserTypeTitle = (type: string) => {
  switch (type) {
    case 'artist': return 'Panel de Artista';
    case 'fan': return 'Comunidad Musical';
    default: return 'RawBeats';
  }
};

const navigateToUserType = (type: string) => {
  switch (type) {
    case 'artist':
      console.log('🎤 Navegando a ArtistaSegundoParcial...');
      if (typeof window.navigateToArtistaV2 === 'function') {
        window.navigateToArtistaV2();
      } else {
        window.location.href = 'http://localhost:5178';
      }
      break;
    
    case 'fan':
      console.log('👥 Navegando al Dashboard de Comunidad...');
      router.push('/dashboard');
      break;
    
    default:
      router.push('/dashboard');
  }
};

const goToCorrectLogin = () => {
  router.push(`/login?userType=${correctUserType.value}`);
};

const sendPasswordReset = async () => {
  if (!email.value) {
    error.value = "Ingresa tu email para restablecer la contraseña";
    return;
  }

  if (!validateEmail(email.value)) {
    error.value = "Ingresa un email válido";
    return;
  }

  try {
    console.log(`📧 Enviando reset de contraseña a: ${email.value}`);
    await resetPassword(email.value);
    resetMessage.value = `✅ Se ha enviado un email a ${email.value} para restablecer tu contraseña. 
    
📬 Revisa tu bandeja de entrada (y spam) y sigue las instrucciones.
⏱️ El enlace expira en 1 hora.`;
    error.value = "";
  } catch (err: any) {
    console.error('❌ Error en reset:', err);
    error.value = "Error al enviar email de reset: " + err.message;
    resetMessage.value = "";
  }
};

const handleLogin = async () => {
  error.value = "";
  showWrongTypeMessage.value = false;

  if (!validateEmail(email.value)) {
    error.value = "Correo inválido.";
    return;
  }

  if (!selectedUserType.value) {
    error.value = "Tipo de usuario no especificado.";
    return;
  }

  try {
    console.log(`🔍 Verificando usuario: ${email.value}, tipo esperado: ${selectedUserType.value}`);
    
    // 0. Verificar si ya hay una sesión activa para este usuario
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session && sessionData.session.user.email === email.value.trim()) {
      console.log(`✅ Usuario ya tiene sesión activa, usando sesión existente`);
      
      // Verificar que el tipo de usuario coincida
      await verifyUserType(email.value, selectedUserType.value);
      
      setUser(sessionData.session.user);
      navigateToUserType(selectedUserType.value);
      return;
    }
    
    // 1. Verificar que el usuario existe y es del tipo correcto
    await verifyUserType(email.value, selectedUserType.value);
    
    console.log(`✅ Usuario verificado, intentando login...`);
    
    // 2. Si hay una sesión activa pero para otro usuario, cerrarla primero
    if (sessionData.session) {
      console.log(`🔄 Cerrando sesión activa de otro usuario...`);
      await supabase.auth.signOut();
    }
    
    // 3. Hacer login en Supabase Auth
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    });

    if (loginError) {
      console.error('❌ Error de login:', loginError.message);
      
      if (loginError.message.includes('Invalid login credentials')) {
        error.value = `Email o contraseña incorrectos. 
        
🔧 Soluciones:
• Usa "Restablecer contraseña" para crear una nueva contraseña
• Verifica que estés usando la contraseña correcta
• Tu cuenta existe pero las credenciales no coinciden`;
      } else if (loginError.message.includes('Email not confirmed')) {
        error.value = "Tu email no ha sido confirmado. Revisa tu bandeja de entrada.";
      } else {
        error.value = "Error al iniciar sesión: " + loginError.message;
      }
      return;
    }

    if (data.user) {
      setUser(data.user); 
      console.log(`✅ Login exitoso para: ${selectedUserType.value}`);
      navigateToUserType(selectedUserType.value);
    }
    
  } catch (err: any) {
    console.error('❌ Error en login:', err);
    if (err.message.startsWith('WRONG_USER_TYPE:')) {
      // Extraer el tipo de usuario real
      const actualUserType = err.message.split(':')[1];
      correctUserType.value = actualUserType; // Usar el tipo tal como viene de la BD
      
      const userTypeNames = {
        'artist': 'Artista',
        'fan': 'Usuario de Comunidad'
      };
      
      wrongTypeMessage.value = `Esta cuenta pertenece a un ${userTypeNames[actualUserType as keyof typeof userTypeNames] || actualUserType}.`;
      showWrongTypeMessage.value = true;
      
    } else {
      error.value = err.message || "Error al iniciar sesión";
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.user-type-header {
  background: linear-gradient(135deg, #348e91, #4ecdc4);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.user-type-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-type-icon {
  font-size: 2rem;
  line-height: 1;
}

.user-type-indicator h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.user-type-indicator p {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.login-container input{
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-group {
  margin-bottom: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
}
.login-container button {
  width: 100%;
  padding: 0.75rem;
  background-color: #348e91;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-container button:hover {
  background-color: #2c7a7d;
}

.wrong-type-message {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  text-align: center;
}

.redirect-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #348e91;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  width: auto;
}

.redirect-btn:hover {
  background-color: #2c7a7d;
}

.link-button {
  background: none;
  border: none;
  color: #348e91;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  width: auto;
}

.link-button:hover {
  color: #2c7a7d;
}

.forgot-password {
  margin-top: 15px;
  font-size: 14px;
  color: #888;
}

.success-message {
  color: #28a745;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
}
</style>
