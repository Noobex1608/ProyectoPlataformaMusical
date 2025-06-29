<template>
  <HeaderComponent />
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
import HeaderComponent from "../components/headerComponent.vue";

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
    setUser(data.user); 
    router.push("/dashboard"); 
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
}
</style>
