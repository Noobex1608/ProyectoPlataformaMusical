import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/header.component';
import { MonetizacionComponent } from './features/monetizacion/monetizacion.component';
import { ContextoRouterComponent } from './components/contexto-router.component';
import { ContextService } from './services/context.service';
import { GlobalIntegrationService } from './services/global-integration.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, HeaderComponent, MonetizacionComponent, ContextoRouterComponent],
    template: `
      <div class="app-container">
        <!-- Mostrar router de contexto si hay contexto específico, sino mostrar la app normal -->
        <app-contexto-router *ngIf="hasSpecificContext; else normalApp">
        </app-contexto-router>

        <ng-template #normalApp>
          <app-header 
            [activeSection]="currentSection" 
            (sectionChange)="onSectionChange($event)">
          </app-header>
          <main class="main-content">
            <app-monetizacion [vistaActual]="currentSection"></app-monetizacion>
          </main>
        </ng-template>
      </div>
    `,
    styles: [`
      .app-container {
        display: flex;
        flex-direction: column;
        background-color: #f8f9fa;
      }

      .main-content {
        flex: 1;
        width: 100%;
        padding: 1rem;
        box-sizing: border-box;
      }

      @media (max-width: 768px) {
        .main-content {
          padding: 1rem;
          min-height: calc(100vh - 120px);
        }
      }
    `]
})
export class AppComponent implements OnInit {
  currentSection: 'resumen' | 'membresias' | 'propinas' | 'transacciones' | 'recompensas' | 'puntos' = 'resumen';
  hasSpecificContext: boolean = false;

  constructor(
    private globalIntegrationService: GlobalIntegrationService,
    private contextService: ContextService
  ) {
    // El servicio se auto-inicializa en su propio constructor
    // No necesitamos llamar initializeContext() aquí
  }

  ngOnInit(): void {
    // El servicio se auto-inicializa en el constructor
    console.log('🎵 Monetización microfrontend iniciado con APIs globales');
    
    // Verificar si hay contexto específico (viene de otro microfrontend)
    this.contextService.context$.subscribe(context => {
      console.log('🔍 App Component - Context raw:', context);
      console.log('🔍 App Component - userType:', context?.userType, 'type:', typeof context?.userType);
      console.log('🔍 App Component - section:', context?.section, 'type:', typeof context?.section);
      console.log('🔍 App Component - userType check:', !!(context?.userType));
      console.log('🔍 App Component - section check:', !!(context?.section));
      
      this.hasSpecificContext = !!(context?.userType && context?.section);
      console.log('App Component - Context detected:', context);
      console.log('App Component - Has specific context:', this.hasSpecificContext);
      
      // Debug adicional para verificar valores específicos
      if (context?.userType === 'artista' && context?.section) {
        console.log('✅ Contexto de artista detectado correctamente con sección:', context.section);
      } else if (context?.userType === 'comunidad' && context?.section) {
        console.log('✅ Contexto de comunidad detectado correctamente con sección:', context.section);
      } else {
        console.log('❌ Contexto incompleto - userType:', context?.userType, 'section:', context?.section);
      }
    });
  }

  onSectionChange(section: string) {
    this.currentSection = section as any;
    console.log('Cambiando a seccion: ' + section);
  }
}
