// === SISTEMA DE AUTENTICACIÓN CENTRALIZADO ===
export class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.listeners = new Set();
    
    // Cargar estado de autenticación desde localStorage
    this.loadAuthState();
  }

  // Cargar estado persistente
  loadAuthState() {
    try {
      const savedUser = localStorage.getItem('plataforma_user');
      const savedAuth = localStorage.getItem('plataforma_authenticated');
      
      if (savedUser && savedAuth === 'true') {
        this.user = JSON.parse(savedUser);
        this.isAuthenticated = true;
        console.log('🔐 Estado de autenticación restaurado:', this.user);
      }
    } catch (error) {
      console.error('❌ Error cargando estado de autenticación:', error);
      this.logout(); // Limpiar estado corrupto
    }
  }

  // Guardar estado persistente
  saveAuthState() {
    if (this.isAuthenticated && this.user) {
      localStorage.setItem('plataforma_user', JSON.stringify(this.user));
      localStorage.setItem('plataforma_authenticated', 'true');
    } else {
      localStorage.removeItem('plataforma_user');
      localStorage.removeItem('plataforma_authenticated');
    }
  }

  // Login de usuario
  async login(userData) {
    console.log('🔐 Iniciando sesión:', userData);
    
    try {
      // Validar datos mínimos requeridos
      if (!userData.id || !userData.email) {
        throw new Error('Datos de usuario incompletos');
      }

      this.user = {
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.email,
        type: userData.type || 'fan',
        image_url: userData.image_url || null,
        created_at: userData.created_at || new Date().toISOString()
      };
      
      this.isAuthenticated = true;
      this.saveAuthState();
      this.notifyListeners();
      
      console.log('✅ Sesión iniciada exitosamente:', this.user);
      return this.user;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }

  // Logout de usuario
  logout() {
    console.log('🔐 Cerrando sesión...');
    
    this.user = null;
    this.isAuthenticated = false;
    this.saveAuthState();
    this.notifyListeners();
    
    // Limpiar también sessionStorage por si acaso
    sessionStorage.clear();
    
    console.log('✅ Sesión cerrada exitosamente');
  }

  // Obtener usuario actual
  getUser() {
    return this.user;
  }

  // Verificar si está autenticado
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  // Actualizar datos del usuario
  updateUser(userData) {
    if (!this.isAuthenticated) return false;
    
    this.user = { ...this.user, ...userData };
    this.saveAuthState();
    this.notifyListeners();
    
    console.log('🔄 Usuario actualizado:', this.user);
    return true;
  }

  // Suscribirse a cambios de autenticación
  subscribe(callback) {
    this.listeners.add(callback);
    
    // Llamar inmediatamente con el estado actual
    callback({
      user: this.user,
      isAuthenticated: this.isAuthenticated
    });
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notificar a todos los listeners
  notifyListeners() {
    const authState = {
      user: this.user,
      isAuthenticated: this.isAuthenticated
    };

    this.listeners.forEach(callback => {
      try {
        callback(authState);
      } catch (error) {
        console.error('❌ Error en listener de autenticación:', error);
      }
    });

    // También disparar evento global para compatibilidad
    window.dispatchEvent(new CustomEvent('authStateChange', { 
      detail: authState 
    }));
  }

  // Verificar si el token/sesión sigue válida
  async validateSession() {
    if (!this.isAuthenticated) return false;
    
    try {
      // Aquí podrías validar con Supabase si es necesario
      // Por ahora, validar que los datos mínimos existan
      if (!this.user || !this.user.id || !this.user.email) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error validando sesión:', error);
      this.logout();
      return false;
    }
  }
}

// === SINGLETON PARA EXPORTAR ===
const authService = new AuthService();
export default authService;
