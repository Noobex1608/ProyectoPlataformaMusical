// monetizacionSegundoParcial/src/app/services/new-state-integration.service.ts
/**
 * Nueva integración con el StateManager mejorado para Angular
 * Servicio que reemplaza o complementa el sistema de integración existente
 */

import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, map, distinctUntilChanged } from 'rxjs/operators';

// Tipos básicos para el estado global
interface GlobalState {
  auth: {
    user: any;
    isAuthenticated: boolean;
    token: string | null;
    refreshToken: string | null;
    lastLoginTime: number | null;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'es' | 'en';
    primaryColor: string;
    sidebarCollapsed: boolean;
    notifications: any[];
  };
  navigation: {
    currentRoute: string;
    activeModule: string;
    breadcrumbs: any[];
    lastVisitedRoutes: string[];
  };
  business: {
    selectedArtist: any;
    selectedClub: any;
    monetizationContext: any;
    sharedContent: any[];
  };
  system: {
    onlineStatus: boolean;
    lastSyncTime: number | null;
    pendingActions: any[];
    errorQueue: any[];
  };
}

// Obtener StateManager del shell
const getStateManager = () => {
  if (typeof window !== 'undefined' && (window as any).shellServices?.stateManager) {
    return (window as any).shellServices.stateManager;
  }
  throw new Error('StateManager no disponible - ¿está corriendo en el shell?');
};

// Crear servicios de Angular básicos
const createBasicAngularService = () => {
  abstract class StateAwareComponent {
    protected destroy$ = new Subject<void>();

    constructor(protected globalState: any) {}

    protected subscribeWithCleanup<T>(
      observable: Observable<T>,
      callback: (value: T) => void
    ): void {
      observable
        .pipe(takeUntil(this.destroy$))
        .subscribe(callback);
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }

  return { StateAwareComponent };
};

const stateManager = getStateManager();
const angularServices = createBasicAngularService();

@Injectable({
  providedIn: 'root'
})
export class NewStateIntegrationService extends angularServices.StateAwareComponent {
  
  constructor(private zone: NgZone) {
    super(null as any); // Pasamos null porque usaremos nuestro propio StateManager
  }

  // Propiedades reactivas específicas para monetización
  public monetizationContext$ = new BehaviorSubject<any>(null);
  public selectedArtist$ = new BehaviorSubject<any>(null);
  public earnings$ = new BehaviorSubject<any>({ total: 0, thisMonth: 0 });

  // Inicializar las suscripciones
  public init(): void {
    this.subscribeToBusinessState();
    this.subscribeToAuthState();
    this.initializeMonetizationData();
  }

  private subscribeToBusinessState(): void {
    stateManager.subscribe('business', (business: GlobalState['business']) => {
      this.zone.run(() => {
        if (business.monetizationContext !== this.monetizationContext$.value) {
          this.monetizationContext$.next(business.monetizationContext);
        }
        
        if (business.selectedArtist !== this.selectedArtist$.value) {
          this.selectedArtist$.next(business.selectedArtist);
        }
      });
    });
  }

  private subscribeToAuthState(): void {
    stateManager.subscribe('auth', (auth: GlobalState['auth']) => {
      this.zone.run(() => {
        if (auth.user && auth.user.type === 'artist') {
          this.setSelectedArtist(auth.user);
        }
      });
    });
  }

  private initializeMonetizationData(): void {
    // Inicializar con datos del localStorage legacy si existen
    const legacyContext = localStorage.getItem('monetizacion_context');
    if (legacyContext) {
      try {
        const context = JSON.parse(legacyContext);
        this.setMonetizationContext(context);
      } catch (error) {
        console.warn('Error parseando contexto legacy:', error);
      }
    }
  }

  // Métodos públicos para componentes
  public setMonetizationContext(context: any): void {
    stateManager.setState('business', { monetizationContext: context });
    this.monetizationContext$.next(context);
  }

  public getMonetizationContext(): any {
    return this.monetizationContext$.value;
  }

  public setSelectedArtist(artist: any): void {
    stateManager.setState('business', { selectedArtist: artist });
    this.selectedArtist$.next(artist);
  }

  public getSelectedArtist(): any {
    return this.selectedArtist$.value;
  }

  public updateEarnings(earnings: any): void {
    this.earnings$.next(earnings);
    
    // También actualizar notificaciones si hay cambios significativos
    if (earnings.newPayment) {
      this.notifyNewPayment(earnings.newPayment);
    }
  }

  public getCurrentUser(): any {
    return stateManager.getState('auth').user;
  }

  public isAuthenticated(): boolean {
    return stateManager.getState('auth').isAuthenticated;
  }

  public addNotification(notification: any): void {
    stateManager.addNotification(notification);
  }

  // Métodos específicos para monetización
  public notifyNewPayment(payment: any): void {
    this.addNotification({
      type: 'success',
      title: 'Nuevo pago recibido',
      message: `Has recibido $${payment.amount} de ${payment.source}`,
      actions: [{
        label: 'Ver detalles',
        action: () => this.navigateToEarnings()
      }]
    });
  }

  public notifySubscriptionCreated(subscription: any): void {
    this.addNotification({
      type: 'success',
      title: 'Nueva suscripción',
      message: `${subscription.subscriber} se ha suscrito a tu contenido`
    });
  }

  public notifyPremiumContentAccess(content: any): void {
    this.addNotification({
      type: 'info',
      title: 'Acceso a contenido premium',
      message: `Alguien ha accedido a tu contenido: ${content.title}`
    });
  }

  public notifyError(error: any, context: string = 'Monetización'): void {
    this.addNotification({
      type: 'error',
      title: `Error en ${context}`,
      message: error.message || 'Ha ocurrido un error inesperado'
    });
  }

  // Navegación
  private navigateToEarnings(): void {
    if ((window as any).shellServices?.navigate) {
      (window as any).shellServices.navigate('/monetizacion/ingresos');
    }
  }

  // Métodos para integración con APIs existentes
  public exposeToMonetizacionAPI(): void {
    // Extender la API global de monetización
    if ((window as any).monetizacionAPI) {
      const api = (window as any).monetizacionAPI;
      
      // Agregar métodos mejorados
      api.state = {
        getContext: () => this.getMonetizationContext(),
        setContext: (context: any) => this.setMonetizationContext(context),
        getSelectedArtist: () => this.getSelectedArtist(),
        setSelectedArtist: (artist: any) => this.setSelectedArtist(artist),
        subscribe: (callback: any) => stateManager.subscribe('business', callback),
        addNotification: (notification: any) => this.addNotification(notification)
      };
    }
  }

  // Método para debug
  public debugState(): void {
    console.log('🎭 Estado actual (Monetización):', {
      monetizationContext: this.getMonetizationContext(),
      selectedArtist: this.getSelectedArtist(),
      earnings: this.earnings$.value,
      globalState: stateManager.getState()
    });
  }

  // Método para migrar datos legacy
  public migrateLegacyData(): void {
    // Migrar contexto de monetización
    const legacyKeys = [
      'monetizacion_context',
      'monetizacion_iframe_params',
      'selected_artist_data'
    ];

    legacyKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          
          switch (key) {
            case 'monetizacion_context':
              this.setMonetizationContext(parsed);
              break;
            case 'selected_artist_data':
              this.setSelectedArtist(parsed);
              break;
          }
          
          // Limpiar datos legacy después de migrar
          localStorage.removeItem(key);
          
        } catch (error) {
          console.warn(`Error migrando ${key}:`, error);
        }
      }
    });
  }

  // Cleanup
  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.monetizationContext$.complete();
    this.selectedArtist$.complete();
    this.earnings$.complete();
  }
}

// Servicio auxiliar para inyección de dependencias
@Injectable({
  providedIn: 'root'
})
export class MonetizationStateProvider {
  
  constructor(private stateIntegration: NewStateIntegrationService) {
    this.stateIntegration.init();
    this.stateIntegration.exposeToMonetizacionAPI();
    this.stateIntegration.migrateLegacyData();
  }

  getStateService(): NewStateIntegrationService {
    return this.stateIntegration;
  }
}

// Token de inyección para el StateManager
export const STATE_MANAGER_TOKEN = Symbol('StateManager');

// Provider factory
export function stateManagerFactory() {
  return getStateManager();
}

// Configuración del módulo
export const STATE_PROVIDERS = [
  NewStateIntegrationService,
  MonetizationStateProvider,
  {
    provide: STATE_MANAGER_TOKEN,
    useFactory: stateManagerFactory
  }
];
