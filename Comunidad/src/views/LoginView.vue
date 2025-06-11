<template>
  <div class="login-view">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email">Correo Electrónico</label>
        <input id="email" v-model="email" type="email" required placeholder="Ingresa tu correo">
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" required placeholder="Ingresa tu contraseña">
      </div>

      <button type="submit" class="primary">Iniciar Sesión</button>
    </form>

    <div class="register-option">
      <p>¿No tienes una cuenta?</p>
      <button @click="redirectToRegister" class="register-button">Regístrate aquí</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');

const login = async () => {
  try {
    await authStore.signInWithEmail(email.value, password.value);
    router.push('/community');
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    alert('Error al iniciar sesión');
  }
};

const redirectToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-view {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-view h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

input[type="password"] {
  background-color: #f0f0f0; /* Color gris claro */
  border: 1px solid #ccc; /* Borde más claro */
}

button.primary {
  width: 100%;
  padding: 0.75rem;
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button.primary:hover {
  background-color: #17a74a;
}

.register-option {
  text-align: center;
  margin-top: 1rem;
}

.register-button {
  background-color: #1db954;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.25s;
}

.register-button:hover {
  background-color: #14833b;
}
</style>
