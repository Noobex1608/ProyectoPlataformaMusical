import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

// Configuración usando Angular environments
const supabaseUrl = environment.supabase.url;
const supabaseAnonKey = environment.supabase.anonKey;

console.log("🔧 Supabase config:", {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  production: environment.production,
  timestamp: new Date().toISOString()
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ SUPABASE: Missing URL or key!");
  throw new Error("Supabase configuration is missing");
}

// Configuración optimizada para microfrontends - evitar conflictos de lock
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // Desactivar para evitar conflictos
    persistSession: false,   // No persistir en este microfrontend
    detectSessionInUrl: false,
    flowType: 'implicit',
    // Usar una clave única para este microfrontend
    storageKey: 'supabase.auth.token.monetizacion'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Función para sincronizar sesión desde el microfrontend principal
export const syncSessionFromMain = async () => {
  try {
    console.log("🔍 Buscando sesión de Supabase en localStorage...");
    
    // Buscar todas las claves relacionadas con Supabase
    const supabaseKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') && key.includes('auth')
    );
    
    console.log("🔑 Claves de Supabase encontradas:", supabaseKeys);
    
    // Intentar con diferentes patrones de claves
    const possibleKeys = [
      'supabase.auth.token',
      'sb-eyewdvpiokrfqspbjdbf-auth-token',
      'supabase-auth-token',
      ...supabaseKeys
    ];
    
    for (const key of possibleKeys) {
      const authData = localStorage.getItem(key);
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          console.log(`🔄 Intentando con clave "${key}":`, parsed);
          
          // Verificar si tiene la estructura de sesión de Supabase
          if (parsed && (parsed.session || parsed.access_token || parsed.user)) {
            console.log("✅ Sesión válida encontrada con clave:", key);
            return parsed;
          }
        } catch (parseError) {
          console.log(`⚠️ Error parsing clave "${key}":`, parseError);
          continue;
        }
      }
    }
    
    console.log("❌ No se encontró sesión válida en localStorage");
    return null;
  } catch (error) {
    console.warn("⚠️ No se pudo sincronizar sesión:", error);
    return null;
  }
};

// Definir las tablas del módulo de monetización
export const MonetizacionTables = {
  MEMBRESIAS: 'membresias',
  PROPINAS: 'propinas', 
  RECOMPENSAS: 'recompensas',
  TRANSACCIONES: 'transacciones',
  SUSCRIPCIONES_USUARIO: 'suscripciones_usuario',
  ACCESO_CONTENIDO: 'acceso_contenido',
  CONFIGURACION_ARTISTA: 'configuracion_artista',
  NOTIFICACIONES_MONETIZACION: 'notificaciones_monetizacion',
  // Tablas base del sistema
  USUARIOS: 'usuarios',
  ARTISTAS: 'artistas'
} as const;
