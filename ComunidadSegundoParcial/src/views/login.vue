<template>
  <div class="login-container" >
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
    <p>¿No tienes cuenta? <router-link to="/registro">Regístrate aquí</router-link></p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "../composables/useAuth";
import {supabase} from "../supabase";

const email = ref("");
const password = ref("");
const error = ref("");

const { router, setUser, validateEmail } = useAuth();

const handleLogin = async () => {
  error.value = "";

  if (!validateEmail(email.value)) {
    error.value = "Correo inválido.";
    return;
  }

  const { data, error: loginError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (loginError) {
    error.value = loginError.message;
    return;
  }

  if (data.user) {
    setUser(data.user); // Guardar usuario en Pinia
    router.push("/perfil"); // Redirigir a otra ruta
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
}

.form-group {
  margin-bottom: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>
