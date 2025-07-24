// src/state/integrations/angular-simple.ts
/**
 * Versión simplificada de integración con Angular sin decoradores complejos
 */

import { Injectable, InjectionToken } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { GlobalState } from '../index';

// Token simple para inyección
export const STATE_MANAGER_TOKEN = new InjectionToken<any>('StateManager');

@Injectable({
  providedIn: 'root'
})
export class SimpleGlobalStateService {
  private stateSubject$: BehaviorSubject<GlobalState>;
  
  // Observables por cada slice del estado
  public auth$: Observable<GlobalState['auth']>;
  public ui$: Observable<GlobalState['ui']>;
  public navigation$: Observable<GlobalState['navigation']>;
  public business$: Observable<GlobalState['business']>;
  public system$: Observable<GlobalState['system']>;

  constructor() {
    // Obtener StateManager del window global
    const stateManager = this.getStateManager();
    this.stateSubject$ = new BehaviorSubject<GlobalState>(stateManager.getState());
    
    // Inicializar observables
    this.auth$ = this.stateSubject$.pipe(
      map(state => state.auth),
      distinctUntilChanged()
    );
    
    this.ui$ = this.stateSubject$.pipe(
      map(state => state.ui),
      distinctUntilChanged()
    );
    
    this.navigation$ = this.stateSubject$.pipe(
      map(state => state.navigation),
      distinctUntilChanged()
    );
    
    this.business$ = this.stateSubject$.pipe(
      map(state => state.business),
      distinctUntilChanged()
    );
    
    this.system$ = this.stateSubject$.pipe(
      map(state => state.system),
      distinctUntilChanged()
    );

    this.initializeSubscriptions(stateManager);
  }

  private getStateManager(): any {
    if (typeof window !== 'undefined' && (window as any).shellServices?.stateManager) {
      return (window as any).shellServices.stateManager;
    }
    throw new Error('StateManager no disponible - ¿está corriendo en el shell?');
  }

  private initializeSubscriptions(stateManager: any): void {
    // Suscribirse a cambios globales del estado
    stateManager.subscribe('*', (newState: GlobalState) => {
      this.stateSubject$.next(newState);
    });
  }

  /**
   * Obtiene el estado completo actual
   */
  getCurrentState(): GlobalState {
    const stateManager = this.getStateManager();
    return stateManager.getState();
  }

  /**
   * Obtiene una slice específica del estado
   */
  getStateSlice<K extends keyof GlobalState>(key: K): GlobalState[K] {
    const stateManager = this.getStateManager();
    return stateManager.getState(key);
  }

  /**
   * Observable para el estado completo
   */
  getState$(): Observable<GlobalState> {
    return this.stateSubject$.asObservable();
  }

  /**
   * Observable para una slice específica
   */
  getStateSlice$<K extends keyof GlobalState>(key: K): Observable<GlobalState[K]> {
    return this.stateSubject$.pipe(
      map(state => state[key]),
      distinctUntilChanged()
    );
  }

  /**
   * Actualiza el estado
   */
  setState<K extends keyof GlobalState>(
    key: K, 
    value: Partial<GlobalState[K]>
  ): void {
    const stateManager = this.getStateManager();
    stateManager.setState(key, value);
  }

  /**
   * Actualización en lote
   */
  setBatch(updates: any): void {
    const stateManager = this.getStateManager();
    stateManager.setBatch(updates);
  }

  /**
   * Métodos de autenticación
   */
  login(user: any, token: string, refreshToken?: string): void {
    const stateManager = this.getStateManager();
    stateManager.login(user, token, refreshToken);
  }

  logout(): void {
    const stateManager = this.getStateManager();
    stateManager.logout();
  }

  /**
   * Métodos de UI
   */
  setTheme(theme: GlobalState['ui']['theme']): void {
    const stateManager = this.getStateManager();
    stateManager.setTheme(theme);
  }

  setLanguage(language: GlobalState['ui']['language']): void {
    const stateManager = this.getStateManager();
    stateManager.setLanguage(language);
  }

  addNotification(notification: any): void {
    const stateManager = this.getStateManager();
    stateManager.addNotification(notification);
  }

  markNotificationRead(id: string): void {
    const stateManager = this.getStateManager();
    stateManager.markNotificationRead(id);
  }

  clearNotifications(): void {
    const stateManager = this.getStateManager();
    stateManager.clearNotifications();
  }

  /**
   * Métodos de navegación
   */
  navigateTo(route: string, module: string): void {
    const stateManager = this.getStateManager();
    stateManager.navigateTo(route, module);
  }

  /**
   * Observables específicos para casos comunes
   */
  get isAuthenticated$(): Observable<boolean> {
    return this.auth$.pipe(
      map(auth => auth.isAuthenticated),
      distinctUntilChanged()
    );
  }

  get currentUser$(): Observable<any> {
    return this.auth$.pipe(
      map(auth => auth.user),
      distinctUntilChanged()
    );
  }

  get currentTheme$(): Observable<string> {
    return this.ui$.pipe(
      map(ui => ui.theme),
      distinctUntilChanged()
    );
  }

  get currentLanguage$(): Observable<string> {
    return this.ui$.pipe(
      map(ui => ui.language),
      distinctUntilChanged()
    );
  }

  get notifications$(): Observable<GlobalState['ui']['notifications']> {
    return this.ui$.pipe(
      map(ui => ui.notifications),
      distinctUntilChanged()
    );
  }

  get unreadNotificationCount$(): Observable<number> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.read).length),
      distinctUntilChanged()
    );
  }

  get currentRoute$(): Observable<string> {
    return this.navigation$.pipe(
      map(nav => nav.currentRoute),
      distinctUntilChanged()
    );
  }

  get isOnline$(): Observable<boolean> {
    return this.system$.pipe(
      map(system => system.onlineStatus),
      distinctUntilChanged()
    );
  }
}

/**
 * Service auxiliar para debugging
 */
@Injectable({
  providedIn: 'root'
})
export class StateDebugService {
  constructor(private globalState: SimpleGlobalStateService) {}

  logCurrentState(): void {
    console.log('🔍 Current Angular State:', this.globalState.getCurrentState());
  }

  subscribeToAllChanges(): void {
    if (process.env['NODE_ENV'] === 'development') {
      this.globalState.getState$().subscribe(state => {
        console.log('🔍 Angular Global State Updated:', state);
      });
    }
  }

  getStateManager(): any {
    return (window as any).shellServices?.stateManager;
  }
}
