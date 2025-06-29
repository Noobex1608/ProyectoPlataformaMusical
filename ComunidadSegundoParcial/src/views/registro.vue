<template>
  <HeaderComponent />
  <div class="register-container">
    <h2>Registro</h2>
    <div class="form-group">
      <label for="email"><strong>Correo electrónico</strong></label>
      <input type="email" v-model="email" placeholder="Ingrese su correo" required />
    </div>
    <div class="form-group">
      <label for="password"><strong>Contraseña</strong></label>
      <input type="password" v-model="password" placeholder="Ingrese su contraseña" required />
    </div>
    <button @click="handleRegister">Registrar</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "../composables/useAuth";
import HeaderComponent from "../components/headerComponent.vue";

const email = ref("");
const password = ref("");

const { register } = useAuth();

function handleRegister() {
  if (!email.value || !password.value) {
    alert("Por favor complete todos los campos");
    return;
  }
  register(email.value, password.value);
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  background: #f9f9f9;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}
input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}
button {
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #218838;
}
h2 {
  text-align: center;
  color: #333;
}
.register-container button {
  width: 100%;
  padding: 0.75rem;
  background-color: #348e91;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.register-container button:hover {
  background-color: #2a6f72;
}
.register-container input {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
} 
.register-container label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
