<template>
  <div class="register-view">
    <h2>Regístrate</h2>
    <form @submit.prevent="registerUser" class="register-form">
      <div class="form-group">
        <label for="email">Correo Electrónico</label>
        <input id="email" v-model="user.email" type="email" required placeholder="Ingresa tu correo">
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input id="password" v-model="user.password" type="password" required placeholder="Ingresa tu contraseña">
      </div>

      <div class="form-group">
        <label for="confirm-password">Confirmar Contraseña</label>
        <input id="confirm-password" v-model="user.confirmPassword" type="password" required placeholder="Confirma tu contraseña">
      </div>

      <button type="submit" class="primary">Registrarse</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const user = ref({
  email: '',
  password: '',
  confirmPassword: ''
});

const registerUser = async () => {
  if (user.value.password !== user.value.confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }

  try {
    await authStore.register(user.value.email, user.value.password);
    router.push('/community');
  } catch (error) {
    console.error('Error al registrar usuario:', error);
  }
};
</script>

<style>
.register-view {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.register-view h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.register-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button.primary {
  background-color: #1db954;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.25s;
}

button.primary:hover {
  background-color: #14833b;
}
</style>
