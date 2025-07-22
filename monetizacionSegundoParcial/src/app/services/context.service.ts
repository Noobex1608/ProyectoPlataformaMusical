import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { supabase, syncSessionFromMain } from '../supabase.service';

export interface MonetizacionContext {
  userType: 'artista' | 'comunidad' | null;
  section: string;
  artistaId?: string;
  userId?: string;
  userName?: string;
  originApp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private contextSubject = new BehaviorSubject<MonetizacionContext>({
    userType: null,
    section: 'dashboard'
  });

  public context$ = this.contextSubject.asObservable();
  private isInitialized = false;

  constructor() {
    // Exponer el servicio globalmente para single-spa
    this.exposeToSpa();
    
    // Configurar listener para mensajes del padre
    this.setupParentMessageListener();
    
    this.initializeContext().catch(error => {
      console.error('❌ Error al inicializar contexto:', error);
    });
  }

  /**
   * Configura un listener para mensajes del microfrontend padre
   */
  private setupParentMessageListener(): void {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'MONETIZACION_SECTION_CHANGE') {
        console.log('📨 Mensaje recibido del padre - cambio de sección:', event.data.section);
        this.updateContext({ section: event.data.section });
      }
    });
  }

  /**
   * Verifica si hay una sección específica en la URL
   */
  private hasSectionFromUrl(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return !!urlParams.get('section');
  }

  /**
   * Detecta la sección actual basándose en el contexto de navegación
   */
  private detectSectionFromContext(): string {
    // 1. Verificar parámetros URL primero
    const urlParams = new URLSearchParams(window.location.search);
    const sectionFromUrl = urlParams.get('section');
    if (sectionFromUrl) {
      console.log('🎯 Sección detectada desde URL:', sectionFromUrl);
      return sectionFromUrl;
    }

    // 2. Verificar mensaje del microfrontend padre
    const parentMessage = (window as any).monetizacionContext?.section;
    if (parentMessage) {
      console.log('🎯 Sección detectada desde mensaje del padre:', parentMessage);
      return parentMessage;
    }

    // 3. Verificar contexto de navegación del single-spa
    const storedContext = this.getStoredContext();
    if (storedContext?.section) {
      console.log('🎯 Sección detectada desde contexto almacenado:', storedContext.section);
      return storedContext.section;
    }

    // 4. Detectar basándose en la página actual o referrer
    const currentPath = window.location.pathname;
    const referrer = document.referrer;
    
    // Mapeo de rutas o contextos a secciones
    if (referrer.includes('gestion-fanaticos') || currentPath.includes('fanaticos')) {
      console.log('🎯 Sección detectada desde referrer/path: gestion-fanaticos');
      return 'gestion-fanaticos';
    }
    if (referrer.includes('contenido-exclusivo') || currentPath.includes('contenido')) {
      console.log('🎯 Sección detectada desde referrer/path: contenido-exclusivo');
      return 'contenido-exclusivo';
    }
    if (referrer.includes('reportes') || currentPath.includes('reportes')) {
      console.log('🎯 Sección detectada desde referrer/path: reportes');
      return 'reportes';
    }
    if (referrer.includes('configuracion') || currentPath.includes('config')) {
      console.log('🎯 Sección detectada desde referrer/path: configuracion');
      return 'configuracion';
    }

    // 5. Default a dashboard si no se puede detectar
    console.log('🎯 No se pudo detectar sección específica, usando dashboard por defecto');
    return 'dashboard';
  }

  public async initializeContext(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Contexto ya inicializado');
      return;
    }
    
    console.log('🔍 Inicializando contexto de monetización (single-spa + iframe)...');
    console.log('🌐 URL actual completa:', window.location.href);
    console.log('🔗 Query string actual:', window.location.search);
    
    // PRIORIDAD 1: Contexto desde localStorage (single-spa)
    const storedContext = this.getStoredContext();
    let userType: 'artista' | 'comunidad' | null = null;
    let section: string = this.detectSectionFromContext();
    let artistaIdFromSpa: string | undefined;
    let userId: string | undefined;

    if (storedContext) {
      console.log('📦 Contexto encontrado en localStorage (single-spa):', storedContext);
      userType = storedContext.userType;
      // Solo usar la sección almacenada si no se detectó una más específica
      if (!this.hasSectionFromUrl() && storedContext.section) {
        section = storedContext.section;
      }
      artistaIdFromSpa = storedContext.artistaId;
      userId = storedContext.userId;
    }
    
    // PRIORIDAD 2: Leer parámetros URL (fallback)
    const urlParams = new URLSearchParams(window.location.search);
    const userTypeFromUrl = urlParams.get('userType') as 'artista' | 'comunidad' | null;
    const sectionFromUrl = urlParams.get('section');
    const artistaIdFromUrl = urlParams.get('artistaId');
    const userIdFromUrl = urlParams.get('userId');

    console.log('🎯 Parámetros extraídos de URL:', { 
      userTypeFromUrl, 
      sectionFromUrl, 
      artistaIdFromUrl, 
      userIdFromUrl 
    });
    
    // 🔍 DEBUG ESPECÍFICO PARA USUARIOS DE COMUNIDAD
    if (userTypeFromUrl === 'comunidad') {
      console.log('🎵 DETECTADO userType=comunidad en URL!');
      console.log('🔍 userIdFromUrl:', userIdFromUrl);
      console.log('🔍 Debería NO tener artistaIdFromUrl:', artistaIdFromUrl);
    }
    
    // ⚡ PRIORIDAD: URL params SIEMPRE sobrescriben stored context
    if (userTypeFromUrl) {
      console.log('🔄 URL userType sobrescribe stored context:', userTypeFromUrl);
      userType = userTypeFromUrl;
    }
    if (userIdFromUrl) {
      console.log('🔄 URL userId sobrescribe stored context:', userIdFromUrl);
      userId = userIdFromUrl;
    }
    if (sectionFromUrl) {
      console.log('🔄 URL section sobrescribe detectada:', sectionFromUrl);
      section = sectionFromUrl;
    }
    
    // Usar parámetros URL como fallback si no hay contexto stored
    if (!storedContext) {
      userType = userType || userTypeFromUrl;
      // La sección ya fue detectada dinámicamente, solo usar URL si está presente
      if (sectionFromUrl) {
        section = sectionFromUrl;
      }
      userId = userId || userIdFromUrl || undefined;
    }
    
    // Mostrar todos los parámetros disponibles
    console.log('📋 Todos los parámetros URL disponibles:', Object.fromEntries(urlParams.entries()));

    // DETERMINAR ID final con prioridades (URL tiene prioridad sobre localStorage)
    let finalArtistaId: string | undefined;
    let finalUserId: string | undefined;
    
    if (userType === 'artista' || (!userType && !userTypeFromUrl)) {
      // LÓGICA PARA USUARIOS ARTISTA
      // PRIORIDAD 1: artistaId desde parámetros URL (más actualizado)
      if (artistaIdFromUrl && this.isValidUUID(artistaIdFromUrl)) {
        finalArtistaId = artistaIdFromUrl;
        console.log('✅ Usando artistaId desde URL (prioridad alta):', finalArtistaId);
        
        // Si URL tiene un ID diferente al stored, actualizar localStorage
        if (artistaIdFromSpa && artistaIdFromSpa !== artistaIdFromUrl) {
          console.log('🔄 ID en URL difiere del localStorage. Actualizando localStorage...');
          console.log('📦 ID anterior (localStorage):', artistaIdFromSpa);
          console.log('🔗 ID nuevo (URL):', artistaIdFromUrl);
        }
      } 
      // PRIORIDAD 2: artistaId desde contexto single-spa (fallback)
      else if (artistaIdFromSpa && this.isValidUUID(artistaIdFromSpa)) {
        finalArtistaId = artistaIdFromSpa;
        console.log('✅ Usando artistaId desde contexto single-spa:', finalArtistaId);
      } 
      // PRIORIDAD 3: Intentar obtener desde sesión
      else {
        const sessionArtistId = await this.getArtistaIdFromSession();
        if (sessionArtistId && this.isValidUUID(sessionArtistId)) {
          finalArtistaId = sessionArtistId;
          console.log('✅ Usando artistaId desde sesión:', finalArtistaId);
        } else {
          // PRIORIDAD 4: UUID temporal para desarrollo
          finalArtistaId = '550e8400-e29b-41d4-a716-446655440000';
          console.log('🧪 Usando UUID temporal de desarrollo:', finalArtistaId);
        }
      }
    } else if (userType === 'comunidad' || userTypeFromUrl === 'comunidad') {
      // LÓGICA PARA USUARIOS DE COMUNIDAD
      console.log('🎵 Detectado usuario de COMUNIDAD, usando lógica específica');
      
      // PRIORIDAD 1: userId desde parámetros URL
      if (userIdFromUrl) {
        finalUserId = userIdFromUrl;
        console.log('✅ Usando userId desde URL para usuario comunidad:', finalUserId);
      }
      // PRIORIDAD 2: userId desde contexto stored
      else if (storedContext && storedContext.userId) {
        finalUserId = storedContext.userId;
        console.log('✅ Usando userId desde contexto stored para usuario comunidad:', finalUserId);
      }
      else {
        console.log('⚠️ No se encontró userId para usuario de comunidad');
      }
      
      // Para usuarios de comunidad, NO usar artistaId
      finalArtistaId = undefined;
      console.log('🚫 Usuario de comunidad: artistaId establecido como undefined');
    }

    const context: MonetizacionContext = {
      userType: userType || userTypeFromUrl || 'artista', // Priorizar userType de URL para comunidad
      section: section, // Ya fue detectado dinámicamente
      artistaId: finalArtistaId, // Solo para artistas
      userId: finalUserId || userId, // Usar finalUserId calculado para comunidad
      userName: undefined,
      originApp: 'monetizacion'
    };

    console.log('✅ Contexto inicializado con prioridad URL:', context);
    
    // Validar que el contexto sea coherente
    if (context.userType === 'comunidad') {
      console.log('✅ Contexto de COMUNIDAD creado correctamente');
      console.log('👤 userId:', context.userId);
      console.log('🚫 artistaId debe ser undefined:', context.artistaId);
    } else if (context.userType === 'artista') {
      console.log('✅ Contexto de ARTISTA creado correctamente');  
      console.log('🎭 artistaId:', context.artistaId);
      console.log('👤 userId:', context.userId);
    }
    
    // Si el artistaId final difiere del que estaba en localStorage, actualizar
    if (storedContext?.artistaId && finalArtistaId && storedContext.artistaId !== finalArtistaId) {
      console.log('🔄 Detectado cambio de artistaId. Actualizando localStorage...');
      console.log('📦 ID anterior:', storedContext.artistaId);
      console.log('🆕 ID nuevo:', finalArtistaId);
    }
    
    this.contextSubject.next(context);
    this.saveContext(context);
    this.isInitialized = true;
  }

  /**
   * Valida si un string es un UUID válido
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Obtiene el UUID del artista desde la sesión sincronizada
   */
  private async getArtistaIdFromSession(): Promise<string | null> {
    try {
      console.log('🔐 Intentando sincronizar sesión desde microfrontend principal...');
      
      // Sincronizar desde el microfrontend principal para evitar NavigatorLock
      const mainSession = await syncSessionFromMain();
      
      if (mainSession) {
        // Extraer user ID de diferentes estructuras posibles
        let userId: string | null = null;
        
        if (mainSession.session?.user?.id) {
          userId = mainSession.session.user.id;
        } else if (mainSession.user?.id) {
          userId = mainSession.user.id;
        } else if (mainSession.access_token) {
          // Si tenemos access_token, intentar decodificar el JWT para obtener el user ID
          try {
            const payload = JSON.parse(atob(mainSession.access_token.split('.')[1]));
            userId = payload.sub || payload.user_id;
          } catch (jwtError) {
            console.warn('⚠️ Error decodificando JWT:', jwtError);
          }
        }
        
        if (userId) {
          console.log('✅ User ID extraído de sesión:', userId);
          
          // Buscar el artista asociado al usuario
          try {
            const { data: artista, error } = await supabase
              .from('artistas')
              .select('id')
              .eq('user_id', userId)
              .single();
            
            if (error) {
              console.warn('⚠️ Error buscando artista por user_id:', error);
              // Si no encontramos por user_id, intentar por id directo
              const { data: artistaDirecto, error: errorDirecto } = await supabase
                .from('artistas')
                .select('id')
                .eq('id', userId)
                .single();
              
              if (errorDirecto) {
                console.warn('⚠️ Error buscando artista por id directo:', errorDirecto);
                console.log('🔄 Usando user_id como fallback:', userId);
                return userId;
              } else if (artistaDirecto) {
                console.log('🎵 Artista encontrado por ID directo:', artistaDirecto.id);
                return artistaDirecto.id;
              }
            } else if (artista) {
              console.log('🎵 Artista encontrado por user_id:', artista.id);
              return artista.id;
            }
          } catch (dbError) {
            console.error('❌ Error consultando base de datos:', dbError);
            console.log('🔄 Usando user_id como fallback:', userId);
            return userId;
          }
        }
      }
      
      console.log('⚠️ No se pudo obtener sesión o user ID');
      return null;
      
    } catch (error) {
      console.error('❌ Error obteniendo UUID del artista:', error);
      return null;
    }
  }

  private saveContext(context: MonetizacionContext): void {
    try {
      localStorage.setItem('monetizacion_context', JSON.stringify(context));
      console.log('💾 Contexto guardado en localStorage');
    } catch (error) {
      console.warn('⚠️ Error al guardar contexto:', error);
    }
  }

  getCurrentContext(): MonetizacionContext {
    return this.contextSubject.value;
  }

  /**
   * Actualiza la sección dinámicamente (para uso desde el microfrontend padre)
   */
  public updateSectionDynamic(newSection: string): void {
    console.log('🔄 Actualizando sección dinámicamente:', newSection);
    this.updateContext({ section: newSection });
    
    // Notificar al padre si es necesario
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'MONETIZACION_SECTION_UPDATED',
        section: newSection
      }, '*');
    }
  }

  updateContext(updates: Partial<MonetizacionContext>): void {
    const currentContext = this.contextSubject.value;
    const newContext = { ...currentContext, ...updates };
    this.contextSubject.next(newContext);
    this.saveContext(newContext);
  }

  isArtista(): boolean {
    return this.contextSubject.value.userType === 'artista';
  }

  isComunidad(): boolean {
    return this.contextSubject.value.userType === 'comunidad';
  }

  clearContext(): void {
    localStorage.removeItem('monetizacion_context');
    this.contextSubject.next({
      userType: null,
      section: 'dashboard'
    });
  }

  async forceReinitialize(): Promise<void> {
    console.log('🔄 Forzando re-inicialización del contexto...');
    this.isInitialized = false;
    localStorage.removeItem('monetizacion_context');
    await this.initializeContext();
  }

  // Métodos adicionales requeridos por los componentes
  updateSection(section: string): void {
    console.log('🔄 Actualizando sección:', section);
    this.updateContext({ section });
  }

  getSectionTitle(section: string): string {
    const titles: { [key: string]: string } = {
      // Secciones de Artistas
      'dashboard': 'Panel de Control',
      'contenido-exclusivo': 'Contenido Exclusivo',
      'fanaticos': 'Gestión de Fanáticos',
      'reportes': 'Reportes e Ingresos',
      'configuracion': 'Configuración de Monetización',
      
      // Secciones de Fanáticos/Comunidad
      'fan-dashboard': '👋 Dashboard Fanático',
      'enviar-propinas': '💰 Enviar Propinas',
      'gestionar-suscripciones': '📋 Mis Suscripciones',
      'contenido-exclusivo-fan': '🔒 Mi Contenido Exclusivo',
      'explorar-artistas': '🔍 Explorar Artistas'
    };
    return titles[section] || section;
  }

  async diagnosticarAutenticacion(): Promise<void> {
    console.log('🔍 Diagnóstico de autenticación iniciado...');
    
    try {
      const mainSession = await syncSessionFromMain();
      console.log('📊 Estado de sesión principal:', {
        hasSession: !!mainSession?.session,
        userId: mainSession?.session?.user?.id,
        timestamp: new Date().toISOString()
      });

      // Verificar localStorage
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      );
      console.log('🔑 Claves de autenticación en localStorage:', authKeys);

      authKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          console.log(`📝 ${key}:`, value ? JSON.parse(value) : value);
        } catch (e) {
          console.log(`📝 ${key}:`, localStorage.getItem(key));
        }
      });

    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
    }
  }

  async refrescarSesion(): Promise<void> {
    console.log('🔄 Refrescando sesión...');
    
    try {
      // Intentar sincronizar desde el microfrontend principal
      const mainSession = await syncSessionFromMain();
      
      if (mainSession?.session?.user) {
        console.log('✅ Sesión refrescada exitosamente');
        // Re-inicializar contexto con nueva sesión
        await this.forceReinitialize();
      } else {
        console.log('⚠️ No se pudo refrescar la sesión');
      }
    } catch (error) {
      console.error('❌ Error al refrescar sesión:', error);
    }
  }

  /**
   * Método de utilidad para probar con diferentes artista IDs
   */
  public testWithArtistaId(artistaId: string): void {
    console.log('🧪 MODO PRUEBA: Usando artista ID:', artistaId);
    
    // Actualizar el contexto directamente para pruebas
    const currentContext = this.getCurrentContext();
    this.updateContext({
      userType: 'artista',
      section: this.detectSectionFromContext(),
      artistaId: artistaId
    });
    
    console.log('✅ Contexto actualizado para pruebas:', this.getCurrentContext());
  }

  /**
   * Método para crear una URL de prueba con parámetros
   */
  public static createTestUrl(artistaId: string, userType: 'artista' | 'comunidad' = 'artista', section: string = 'dashboard'): string {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      userType,
      section,
      artistaId
    });
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Método para navegar a una URL de prueba
   */
  public navigateToTestUrl(artistaId: string): void {
    const testUrl = ContextService.createTestUrl(artistaId);
    console.log('🔗 Navegando a URL de prueba:', testUrl);
    window.location.href = testUrl;
  }

  /**
   * Obtiene el contexto almacenado desde localStorage (single-spa)
   */
  private getStoredContext(): MonetizacionContext | null {
    try {
      // Buscar contexto desde single-spa
      const storedContext = localStorage.getItem('monetizacion_context');
      if (storedContext) {
        const parsed = JSON.parse(storedContext);
        console.log('📦 Contexto desde single-spa localStorage:', parsed);
        return parsed;
      }

      // También revisar si hay parámetros de iframe guardados
      const iframeParams = localStorage.getItem('monetizacion_iframe_params');
      if (iframeParams) {
        console.log('🔗 Parámetros de iframe encontrados:', iframeParams);
        // Parsear los parámetros de iframe para extraer contexto
        const params = new URLSearchParams(iframeParams);
        const userType = params.get('userType') as 'artista' | 'comunidad' | null;
        const artistaId = params.get('artistaId');
        const section = params.get('section');
        const userId = params.get('userId');

        if (userType || artistaId) {
          return {
            userType,
            section: section || this.detectSectionFromContext(),
            artistaId: artistaId || undefined,
            userId: userId || undefined,
            originApp: 'monetizacion'
          };
        }
      }

      return null;
    } catch (error) {
      console.warn('⚠️ Error leyendo contexto almacenado:', error);
      return null;
    }
  }

  /**
   * Método para recibir contexto desde el root de single-spa
   * Este método puede ser llamado desde window.monetizacionApp
   */
  public setContextFromSpa(context: Partial<MonetizacionContext>): void {
    console.log('🔄 Recibiendo contexto desde single-spa:', context);
    
    const currentContext = this.getCurrentContext();
    const newContext = { ...currentContext, ...context };
    
    this.contextSubject.next(newContext);
    this.saveContext(newContext);
    
    console.log('✅ Contexto actualizado desde single-spa:', newContext);
  }

  /**
   * Exponer la instancia del servicio globalmente para single-spa
   */
  public exposeToSpa(): void {
    // Hacer el servicio accesible desde window para single-spa
    (window as any).monetizacionContextService = {
      setContext: (context: Partial<MonetizacionContext>) => this.setContextFromSpa(context),
      getContext: () => this.getCurrentContext(),
      updateContext: (updates: Partial<MonetizacionContext>) => this.updateContext(updates),
      forceReinitialize: () => this.forceReinitialize()
    };
    
    console.log('🌐 Servicio de contexto expuesto globalmente para single-spa');
  }
}
