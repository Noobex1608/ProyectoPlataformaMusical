import { useRouter } from "vue-router";
import { supabase } from "../supabase";
import { useUsuarioStore } from "../store/usuario";

interface UserData {
  name: string;
  email: string;
  password: string;
  type: string;
  age?: number;
  description?: string;
}

export function useAuth() {
  const router = useRouter();
  const userStore = useUsuarioStore();

  // Validar correo
  function validateEmail(email: string) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  // Guardar usuario en store
  function setUser(user: any) {
    userStore.setUsuario(user);
  }

  // Logout
  async function logout() {
    await supabase.auth.signOut();
    userStore.clearUsuario();
    router.push('/');
  }

  // Registro básico (mantener para compatibilidad)
  async function register(email: string, password: string) {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Error al registrar:", error.message);
      throw new Error(error.message);
    }

    if (data.user) {
      setUser(data.user);
      router.push("/dashboard");
    }
  }

  // Registro completo con datos de usuario
  async function registerUser(userData: UserData) {
    console.log('🔄 Registrando usuario:', userData.email, 'como tipo:', userData.type);
    
    // 1. Crear usuario en Auth de Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: undefined // Deshabilitar confirmación de email temporalmente
      }
    });

    if (authError) {
      console.error("❌ Error en autenticación:", authError.message);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("No se pudo crear el usuario");
    }

    console.log('✅ Usuario creado en Auth:', authData.user.id);
    console.log('📧 Email confirmado:', authData.user.email_confirmed_at ? 'Sí' : 'No');

    // 2. Insertar datos adicionales en la tabla usuarios
    console.log('💾 Guardando datos en tabla usuarios...');
    const { data: userData_inserted, error: dbError } = await supabase
      .from('usuarios')
      .insert([
        {
          name: userData.name,
          email: userData.email,
          type: userData.type,
          age: userData.age,
          description: userData.description,
          auth_id: authData.user.id, // Guardar el UUID de Auth en un campo separado
          password: 'stored_in_auth' // Indicar que la contraseña está en Auth
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error("❌ Error al guardar datos de usuario:", dbError.message);
      throw new Error("Error al guardar los datos del usuario: " + dbError.message);
    }

    console.log('✅ Datos guardados en tabla usuarios:', userData_inserted.id);

    // 3. Si es artista, crear entrada en tabla artistas
    if (userData.type === 'artist') {
      const { error: artistError } = await supabase
        .from('artistas')
        .insert([
          {
            user_id: userData_inserted.id, // Usar el ID numérico de la tabla usuarios
            nombre: userData.name,
            descripcion: userData.description || '',
          }
        ]);

      if (artistError) {
        console.error("Error al crear perfil de artista:", artistError.message);
        // No lanzamos error aquí, el usuario se creó exitosamente
      }
    }

    // 4. Guardar usuario en el store
    setUser(authData.user);
    
    return authData.user;
  }

  // Verificar tipo de usuario en login
  async function verifyUserType(email: string, expectedType: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('type, name')
      .eq('email', email)
      .single();

    if (error || !data) {
      throw new Error("Usuario no encontrado");
    }

    // Mapear los tipos de la UI a los tipos de la DB
    const typeMapping: { [key: string]: string } = {
      'artista': 'artist',
      'comunidad': 'fan',
      'artist': 'artist',  // Por si viene ya mapeado
      'fan': 'fan'        // Por si viene ya mapeado
    };

    const expectedDbType = typeMapping[expectedType];
    
    if (!expectedDbType) {
      throw new Error(`Tipo de usuario inválido: ${expectedType}`);
    }

    if (data.type !== expectedDbType) {
      throw new Error(`WRONG_USER_TYPE:${data.type}`);
    }

    return data;
  }

  // Reset de contraseña
  async function resetPassword(email: string) {
    console.log(`🔄 Iniciando reset de contraseña para: ${email}`);
    console.log(`🌐 Redirect URL será: ${window.location.origin}/reset-password`);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('❌ Error en reset de contraseña:', error);
      throw new Error(error.message);
    }

    console.log('✅ Email de reset enviado exitosamente');
    return data;
  }

  // Función de debugging para verificar estado del usuario
  async function debugUserState(email: string) {
    console.log(`🔍 Debugeando estado del usuario: ${email}`);
    
    try {
      // 1. Verificar en tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      console.log('📊 Datos en tabla usuarios:', userData);
      if (userError) console.log('❌ Error en tabla usuarios:', userError.message);

      // 2. Intentar obtener usuario actual de Auth
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log('👤 Usuario actual en Auth:', authData.user);
      if (authError) console.log('❌ Error en Auth:', authError.message);

      // 3. Verificar sesión actual
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Sesión actual:', sessionData.session);
      if (sessionError) console.log('❌ Error en sesión:', sessionError.message);

    } catch (err) {
      console.error('❌ Error en debugging:', err);
    }
  }

  // Función para regenerar usuario con contraseña conocida
  async function regenerateUserPassword(email: string, newPassword: string) {
    console.log(`🔄 Regenerando contraseña para: ${email}`);
    
    try {
      // Nota: Esta función requiere permisos de admin
      // Para uso normal, usar resetPassword() en su lugar
      console.log('⚠️ Esta función requiere permisos de admin. Usa resetPassword() en su lugar.');
      throw new Error('Función no disponible sin permisos de admin. Usa reset por email.');
    } catch (err) {
      console.error('❌ Error regenerando contraseña (usa reset por email):', err);
      throw err;
    }
  }

  return {
    supabase,
    router,
    setUser,
    validateEmail,
    logout,
    register,
    registerUser,
    verifyUserType,
    resetPassword,
    debugUserState,
    regenerateUserPassword
  };
}
