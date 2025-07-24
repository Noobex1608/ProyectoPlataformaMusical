// monetizacionSegundoParcial/src/app/services/simple-state-integration.service.ts
/**
 * Integración simplificada con el StateManager para Angular
 * Versión JavaScript compatible
 */

import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

// Obtener StateManager del shell
const getStateManager = () => {
  if (typeof window !== 'undefined' && (window as any).shellServices?.stateManager) {
    return (window as any).shellServices.stateManager;
  }
  throw new Error('StateManager no disponible - ¿está corriendo en el shell?');
};

@Injectable({
  providedIn: 'root'
})
export class SimpleStateIntegrationService {
  private destroy$ = new Subject<void>();
  private stateManager: any;
  
  // Observables para el estado
  public auth$ = new BehaviorSubject<any>({ user: null, isAuthenticated: false });
  public ui$ = new BehaviorSubject<any>({ theme: 'light', language: 'es', notifications: [] });
  public business$ = new BehaviorSubject<any>({ 
    selectedArtist: null, 
    monetizationContext: null 
  });

  constructor(private zone: NgZone) {
    this.initializeStateManager();
  }

  private initializeStateManager(): void {
    try {
      this.stateManager = getStateManager();
      this.subscribeToChanges();
      this.initializeState();
    } catch (error) {
      console.warn('StateManager no disponible, usando fallback:', error);
    }
  }

  private subscribeToChanges(): void {
    if (!this.stateManager) return;

    // Suscribirse a cambios de auth
    this.stateManager.subscribe('auth', (auth: any) => {
      this.zone.run(() => {
        this.auth$.next(auth);
      });
    });

    // Suscribirse a cambios de UI
    this.stateManager.subscribe('ui', (ui: any) => {
      this.zone.run(() => {
        this.ui$.next(ui);
      });
    });

    // Suscribirse a cambios de business
    this.stateManager.subscribe('business', (business: any) => {
      this.zone.run(() => {
        this.business$.next(business);
      });
    });
  }

  private initializeState(): void {
    if (!this.stateManager) return;

    const currentState = this.stateManager.getState();
    this.auth$.next(currentState.auth);
    this.ui$.next(currentState.ui);
    this.business$.next(currentState.business);
  }

  // Métodos públicos
  public getCurrentState(): any {
    return this.stateManager?.getState() || {};
  }

  public setState(key: string, value: any): void {
    if (this.stateManager) {
      this.stateManager.setState(key, value);
    }
  }

  public login(user: any, token: string, refreshToken?: string): void {
    if (this.stateManager) {
      this.stateManager.login(user, token, refreshToken);
    }
  }

  public logout(): void {
    if (this.stateManager) {
      this.stateManager.logout();
    }
  }

  public setTheme(theme: string): void {
    if (this.stateManager) {
      this.stateManager.setTheme(theme);
    }
  }

  public setLanguage(language: string): void {
    if (this.stateManager) {
      this.stateManager.setLanguage(language);
    }
  }

  public addNotification(notification: any): void {
    if (this.stateManager) {
      this.stateManager.addNotification(notification);
    }
  }

  public setMonetizationContext(context: any): void {
    this.setState('business', { 
      ...this.business$.value, 
      monetizationContext: context 
    });
  }

  public getMonetizationContext(): any {
    return this.business$.value.monetizationContext;
  }

  public setSelectedArtist(artist: any): void {
    this.setState('business', { 
      ...this.business$.value, 
      selectedArtist: artist 
    });
  }

  public getSelectedArtist(): any {
    return this.business$.value.selectedArtist;
  }

  public isAuthenticated(): boolean {
    return this.auth$.value.isAuthenticated;
  }

  public getCurrentUser(): any {
    return this.auth$.value.user;
  }

  // Debug
  public debugState(): void {
    console.log('🎭 Estado Angular:', {
      auth: this.auth$.value,
      ui: this.ui$.value,
      business: this.business$.value,
      globalState: this.getCurrentState()
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.auth$.complete();
    this.ui$.complete();
    this.business$.complete();
  }
}
