

import { useRouter } from "vue-router";
import {supabase} from "../supabase";  // tu instancia supabase configurada
import { useUsuarioStore } from "../store/usuario"; 


export function useAuth() {
  const router = useRouter();
  const userStore = useUsuarioStore();

  // Validar correo (puedes usar regex simple)
  function validateEmail(email: string) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  // Guardar usuario en store
  function setUser(user: any) {
    userStore.setUsuario(user);
  }

  //agregar más funciones aquí (logout, signup, etc.)
  async function logout(){
    await supabase.auth.signOut();
    userStore.clearUsuario();
    router.push('/'); 
  }
  async function register(email: string, password: string) {
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Error al registrar:", error.message);
    alert("Error al registrar: " + error.message);
    return;
  }

  // Guardar usuario si se creó correctamente
  if (data.user) {
    setUser(data.user);
    router.push("/perfil"); // o cualquier ruta que desees redirigir
  }
}

  return {
    supabase,       
    router,
    setUser,
    validateEmail,
    logout,
    register 
  };
}
