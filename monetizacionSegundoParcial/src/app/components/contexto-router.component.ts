import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ContextService, MonetizacionContext } from '../services/context.service';
import { DashboardMonetizacionComponent } from './dashboard-monetizacion.component';
import { GestionContenidoExclusivoComponent } from './gestion-contenido-exclusivo.component';
import { GestionFanaticosComponent } from './gestion-fanaticos.component';
import { ReportesIngresosComponent } from './reportes-ingresos.component';
import { ConfiguracionMonetizacionComponent } from './configuracion-monetizacion/configuracion-monetizacion.component';
import { FanDashboardComponent } from './fan/fan-dashboard.component';
import { EnviarPropinasComponent } from './fan/enviar-propinas.component';
import { GestionarSuscripcionesComponent } from './fan/gestionar-suscripciones.component';
import { ContenidoExclusivoFanComponent } from './fan/contenido-exclusivo-fan.component';
import { ExplorarArtistasComponent } from './fan/explorar-artistas.component';

@Component({
  selector: 'app-contexto-router',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardMonetizacionComponent, 
    GestionContenidoExclusivoComponent, 
    GestionFanaticosComponent, 
    ReportesIngresosComponent, 
    ConfiguracionMonetizacionComponent,
    FanDashboardComponent,
    EnviarPropinasComponent,
    GestionarSuscripcionesComponent,
    ContenidoExclusivoFanComponent,
    ExplorarArtistasComponent
  ],
  template: `
    <div class="contexto-container">
      <!-- Header con información del contexto -->
      <div class="context-header" *ngIf="context.userType">
        <div class="context-info">
          <div class="user-info">
            <span class="user-type" [ngClass]="'type-' + context.userType">
              {{ context.userType === 'artista' ? '🎤 Artista' : '👥 Fanático' }}
            </span>
            <span class="user-name" *ngIf="context.userName">{{ context.userName }}</span>
          </div>
          <div class="section-info">
            <h1>{{ getSectionTitle() }}</h1>
            <p *ngIf="context.originApp">Desde {{ context.originApp }}</p>
          </div>
        </div>
        <button class="back-btn" (click)="goBack()">
          ← Volver
        </button>
      </div>

      <!-- Contenido dinámico según la sección -->
      <div class="section-content">
        <!-- Dashboard Principal -->
        <div *ngIf="context.section === 'dashboard'" class="section dashboard">
          <app-dashboard-monetizacion [context]="context"></app-dashboard-monetizacion>
        </div>

        <!-- Contenido Exclusivo -->
        <div *ngIf="context.section === 'contenido-exclusivo'" class="section contenido-exclusivo">
          <app-gestion-contenido-exclusivo [context]="context"></app-gestion-contenido-exclusivo>
        </div>

        <!-- Gestión de Fanáticos -->
        <div *ngIf="context.section === 'gestion-fanaticos'" class="section gestion-fanaticos">
          <app-gestion-fanaticos [context]="context"></app-gestion-fanaticos>
        </div>

        <!-- Reportes de Ingresos -->
        <div *ngIf="context.section === 'reportes'" class="section reportes">
          <app-reportes-ingresos [context]="context"></app-reportes-ingresos>
        </div>

        <!-- Configuración -->
        <div *ngIf="context.section === 'configuracion'" class="section configuracion">
          <app-configuracion-monetizacion></app-configuracion-monetizacion>
        </div>

        <!-- === SECCIONES DE FANÁTICOS/COMUNIDAD === -->
        
        <!-- Fan Dashboard -->
        <div *ngIf="context.section === 'fan-dashboard'" class="section fan-dashboard">
          <app-fan-dashboard></app-fan-dashboard>
        </div>

        <!-- Enviar Propinas -->
        <div *ngIf="context.section === 'enviar-propinas'" class="section enviar-propinas">
          <app-enviar-propinas></app-enviar-propinas>
        </div>

        <!-- Gestionar Suscripciones -->
        <div *ngIf="context.section === 'gestionar-suscripciones'" class="section gestionar-suscripciones">
          <app-gestionar-suscripciones></app-gestionar-suscripciones>
        </div>

        <!-- Contenido Exclusivo para Fans -->
        <div *ngIf="context.section === 'contenido-exclusivo-fan'" class="section contenido-exclusivo-fan">
          <app-contenido-exclusivo-fan></app-contenido-exclusivo-fan>
        </div>

        <!-- Explorar Artistas -->
        <div *ngIf="context.section === 'explorar-artistas'" class="section explorar-artistas">
          <app-explorar-artistas></app-explorar-artistas>
        </div>

        <!-- Sección por defecto si no hay contexto específico -->
        <div *ngIf="!context.userType" class="section default">
          <h2>💰 Centro de Monetización</h2>
          <p>Bienvenido al sistema de monetización. Por favor, accede desde uno de los microfrontends principales.</p>
          
          <div class="access-links">
            <a href="http://localhost:4173" class="access-btn artista">
              🎤 Acceder como Artista
            </a>
            <a href="http://localhost:4174" class="access-btn comunidad">
              👥 Acceder como Fanático
            </a>
          </div>
        </div>
      </div>

      <!-- Debug info (solo en desarrollo) -->
      <div class="debug-info" *ngIf="showDebug">
        <h4>🔧 Debug - Contexto Actual:</h4>
        <pre>{{ context | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .contexto-container {
      background: #f8f9fa;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      /* CRITICAL: Prevent this container from creating its own scroll */
      overflow: visible;
      height: auto;
    }

    .context-header {
      background: white;
      padding: 1rem 2rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .context-info {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .user-type {
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .type-artista {
      background: #667eea;
      color: white;
    }

    .type-comunidad {
      background: #48bb78;
      color: white;
    }

    .user-name {
      font-size: 0.875rem;
      color: #4a5568;
    }

    .section-info h1 {
      margin: 0;
      color: #2d3748;
      font-size: 1.5rem;
    }

    .section-info p {
      margin: 0;
      color: #4a5568;
      font-size: 0.875rem;
    }

    .back-btn {
      background: #edf2f7;
      border: 1px solid #e2e8f0;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: #e2e8f0;
    }

    .section-content {
      padding: 0;
      max-width: 100%;
      margin: 0;
    }

    .section {
      /* Remover padding por defecto para que el dashboard maneje su propio spacing */
    }

    .section.dashboard {
      padding: 0;
    }

    .access-links {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .section h2 {
      margin-top: 0;
      color: #2d3748;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }

    .stat-card {
      background: #f7fafc;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }

    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      color: #4a5568;
      font-size: 0.875rem;
    }

    .amount {
      font-size: 2rem;
      font-weight: bold;
      color: #348e91;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .action-btn {
      background: #348e91;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: #2d7275;
    }

    .action-btn.primary {
      background: #667eea;
    }

    .content-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }

    .content-type {
      font-size: 1.5rem;
    }

    .content-details h4 {
      margin: 0 0 0.25rem 0;
      color: #2d3748;
    }

    .content-details p {
      margin: 0;
      color: #4a5568;
      font-size: 0.875rem;
    }

    .edit-btn {
      background: #edf2f7;
      border: 1px solid #e2e8f0;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin-left: auto;
    }

    .access-links {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .access-btn {
      display: inline-block;
      padding: 1rem 2rem;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      text-align: center;
      transition: transform 0.2s;
    }

    .access-btn:hover {
      transform: translateY(-2px);
    }

    .access-btn.artista {
      background: #667eea;
      color: white;
    }

    .access-btn.comunidad {
      background: #48bb78;
      color: white;
    }

    .debug-info {
      background: #1a202c;
      color: #e2e8f0;
      padding: 1rem;
      margin: 2rem;
      border-radius: 8px;
      font-family: monospace;
    }

    .debug-info pre {
      margin: 0;
      white-space: pre-wrap;
    }

    @media (max-width: 768px) {
      .context-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .context-info {
        flex-direction: column;
        gap: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ContextoRouterComponent implements OnInit, OnDestroy {
  context: MonetizacionContext = { userType: null, section: 'dashboard' };
  showDebug = false; // Cambiar a true para ver debug info
  private subscription: Subscription = new Subscription();

  constructor(private contextService: ContextService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.contextService.context$.subscribe(context => {
        this.context = context;
        console.log('🔄 Contexto actualizado en router:', context);
      })
    );

    // Mostrar debug en desarrollo
    this.showDebug = !environment.production;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getSectionTitle(): string {
    return this.contextService.getSectionTitle(this.context.section);
  }

  goBack(): void {
    if (this.context.originApp === 'ArtistaSegundoParcial') {
      window.location.href = 'http://localhost:4173';
    } else if (this.context.originApp === 'ComunidadSegundoParcial') {
      window.location.href = 'http://localhost:4174';
    } else {
      // Fallback
      window.history.back();
    }
  }
}

// Para manejar environment en desarrollo
const environment = {
  production: false
};
