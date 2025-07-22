import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContextService, MonetizacionContext } from '../../services/context.service';
import { FanDashboardService } from '../../services/fan-dashboard.service';
import { EstadisticasFan, ActividadReciente, ArtistaRecomendado } from '../../models/dashboard-fan.model';
import { ImageUtils } from '../../utils/image.utils';

@Component({
  selector: 'app-fan-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fan-dashboard" *ngIf="context && !cargandoDatos">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>👋 ¡Hola {{ context.userName }}!</h1>
        <p class="subtitle">Tu centro de apoyo a artistas</p>
      </div>

      <!-- Stats Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎵</div>
          <div class="stat-content">
            <h3>{{ estadisticas.artistasSiguiendo }}</h3>
            <p>Artistas siguiendo</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💳</div>
          <div class="stat-content">
            <h3>{{ estadisticas.membresiaActivas }}</h3>
            <p>Membresías activas</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>\${{ estadisticas.gastoMensual.toFixed(2) }}</h3>
            <p>Gasto este mes</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎁</div>
          <div class="stat-content">
            <h3>{{ estadisticas.propinasEnviadas }}</h3>
            <p>Propinas enviadas</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div class="actions-grid">
          <button class="action-btn primary" (click)="navegarA('explorar-artistas')">
            🔍 Explorar Artistas
          </button>
          <button class="action-btn secondary" (click)="navegarA('enviar-propina')">
            💝 Enviar Propina
          </button>
          <button class="action-btn tertiary" (click)="navegarA('mis-suscripciones')">
            📋 Mis Suscripciones
          </button>
          <button class="action-btn quaternary" (click)="navegarA('contenido-exclusivo')">
            🔒 Mi Contenido
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2>Actividad Reciente</h2>
        <div class="activity-list" *ngIf="actividadReciente.length > 0; else noActivity">
          <div class="activity-item" *ngFor="let actividad of actividadReciente">
            <div class="activity-icon">{{ actividad.icono }}</div>
            <div class="activity-content">
              <p class="activity-title">{{ actividad.titulo }}</p>
              <p class="activity-detail">{{ actividad.detalle }}</p>
              <span class="activity-time">{{ actividad.tiempo }}</span>
            </div>
          </div>
        </div>
        <ng-template #noActivity>
          <div class="no-activity">
            <p>No hay actividad reciente</p>
            <button class="btn-primary" (click)="navegarA('explorar-artistas')">
              ¡Comienza a apoyar artistas!
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Recommended Artists -->
      <div class="recommendations" *ngIf="artistasRecomendados.length > 0">
        <h2>Artistas Recomendados</h2>
        <div class="artists-grid">
          <div class="artist-card" *ngFor="let artista of artistasRecomendados">
            <img [src]="artista.imagen" 
                 [alt]="artista.nombre" 
                 class="artist-image"
                 (error)="onImageError($event, artista)">
            <div class="artist-info">
              <h3>{{ artista.nombre }}</h3>
              <p>{{ artista.genero }}</p>
              <div class="artist-stats">
                <span>💰 Desde \${{ artista.precioMinimo }}</span>
                <span>👥 {{ artista.seguidores }} fans</span>
              </div>
              <button class="btn-follow" (click)="seguirArtista(artista.id)">
                Seguir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-state" *ngIf="cargandoDatos">
      <div class="spinner"></div>
      <p>Cargando tu dashboard...</p>
    </div>

    <!-- Error State -->
    <div class="error-state" *ngIf="errorCarga && !cargandoDatos">
      <div class="error-icon">⚠️</div>
      <p>Error cargando dashboard. Mostrando datos básicos...</p>
      <button class="btn-retry" *ngIf="context?.userId" (click)="reintentarCarga()">
        Reintentar
      </button>
    </div>

    <!-- Context Loading State -->
    <div class="loading-state" *ngIf="!context && !cargandoDatos">
      <div class="spinner"></div>
      <p>Cargando contexto...</p>
    </div>
  `,
  styles: [`
    .fan-dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #666;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1.5rem;
      border-radius: 12px;
      color: white;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-content h3 {
      font-size: 1.8rem;
      margin: 0 0 0.5rem 0;
    }

    .stat-content p {
      margin: 0;
      opacity: 0.9;
    }

    .quick-actions, .recent-activity, .recommendations {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-btn.primary {
      background: #667eea;
      color: white;
    }

    .action-btn.secondary {
      background: #764ba2;
      color: white;
    }

    .action-btn.tertiary {
      background: #f093fb;
      color: white;
    }

    .action-btn.quaternary {
      background: #4facfe;
      color: white;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .activity-icon {
      font-size: 1.5rem;
      width: 40px;
      text-align: center;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }

    .activity-detail {
      color: #666;
      margin: 0 0 0.25rem 0;
    }

    .activity-time {
      font-size: 0.9rem;
      color: #888;
    }

    .artists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .artist-card {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
    }

    .artist-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 1rem;
    }

    .artist-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .artist-stats {
      display: flex;
      justify-content: space-between;
      margin: 0.5rem 0;
      font-size: 0.9rem;
      color: #666;
    }

    .btn-follow {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      padding: 2rem;
      text-align: center;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .btn-retry {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 1rem;
      font-weight: 600;
    }

    .btn-retry:hover {
      background: #5a6fd8;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .no-activity {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 1rem;
    }
  `]
})
export class FanDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  context: MonetizacionContext | null = null;

  // Estados del dashboard - ahora usando tipos específicos
  estadisticas: EstadisticasFan = {
    artistasSiguiendo: 0,
    membresiaActivas: 0,
    gastoMensual: 0,
    propinasEnviadas: 0
  };

  actividadReciente: ActividadReciente[] = [];
  artistasRecomendados: ArtistaRecomendado[] = [];

  // Estados de carga
  cargandoDatos = false;
  errorCarga = false;

  constructor(
    private contextService: ContextService,
    private fanDashboardService: FanDashboardService
  ) {}

  ngOnInit() {
    // Suscribirse al contexto
    this.contextService.context$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (context: MonetizacionContext | null) => {
        this.context = context;
        console.log('✅ Contexto cargado en FanDashboard:', context);
        if (context?.userType === 'comunidad' && context?.userId) {
          this.cargarDashboardData(context.userId);
        }
      },
      error: (error: any) => {
        console.error('❌ Error obteniendo contexto:', error);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarDashboardData(usuarioId: string) {
    this.cargandoDatos = true;
    this.errorCarga = false;

    this.fanDashboardService.cargarDashboardCompleto(usuarioId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.estadisticas = data.estadisticas;
        this.actividadReciente = data.actividadReciente;
        this.artistasRecomendados = data.artistasRecomendados;
        this.cargandoDatos = false;
        console.log('✅ Dashboard data cargada:', data);
      },
      error: (error) => {
        console.error('❌ Error cargando dashboard:', error);
        this.errorCarga = true;
        this.cargandoDatos = false;
        this.cargarDatosFallback();
      }
    });
  }

  private cargarDatosFallback() {
    // Datos de fallback para desarrollo/testing
    this.estadisticas = {
      artistasSiguiendo: 12,
      membresiaActivas: 3,
      gastoMensual: 89.99,
      propinasEnviadas: 24
    };

    this.actividadReciente = [
      {
        tipo: 'suscripcion',
        icono: '💳',
        titulo: 'Suscripción renovada',
        detalle: 'Plan Premium de Artista Ejemplo',
        tiempo: 'Hace 2 horas'
      },
      {
        tipo: 'propina',
        icono: '💰',
        titulo: 'Propina enviada',
        detalle: '$5.00 a Música Indie',
        tiempo: 'Hace 1 día'
      },
      {
        tipo: 'contenido',
        icono: '🎵',
        titulo: 'Nuevo contenido desbloqueado',
        detalle: 'Canción exclusiva de Rock Star',
        tiempo: 'Hace 2 días'
      }
    ];

    this.artistasRecomendados = [
      {
        id: '1',
        nombre: 'Luna Nocturna',
        genero: 'Indie Pop',
        imagen: ImageUtils.getImageUrl(undefined, 'Luna Nocturna'),
        precioMinimo: 4.99,
        seguidores: '2.3K'
      },
      {
        id: '2',
        nombre: 'Beats Underground',
        genero: 'Hip Hop',
        imagen: ImageUtils.getImageUrl(undefined, 'Beats Underground'),
        precioMinimo: 7.99,
        seguidores: '5.1K'
      }
    ];
  }

  navegarA(seccion: string) {
    // Navegación dentro del microfrontend
    console.log('🚀 Navegando a:', seccion);
    // Implementar routing interno aquí
  }

  reintentarCarga() {
    if (this.context?.userId) {
      this.cargarDashboardData(this.context.userId);
    }
  }

  seguirArtista(artistaId: string) {
    if (!this.context?.userId) {
      console.error('❌ No hay userId en el contexto');
      return;
    }

    console.log('👤 Siguiendo artista:', artistaId);
    this.fanDashboardService.seguirArtista(this.context.userId, artistaId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        console.log('✅ Artista seguido correctamente');
        // Recargar estadísticas y recomendaciones
        if (this.context?.userId) {
          this.cargarDashboardData(this.context.userId);
        }
      },
      error: (error) => {
        console.error('❌ Error siguiendo artista:', error);
      }
    });
  }

  onImageError(event: any, artista: ArtistaRecomendado) {
    console.log('🖼️ Error cargando imagen para:', artista.nombre);
    console.log('🖼️ URL que falló:', event.target.src);
    
    // Si ya intentamos con avatar y falla, usar una imagen SVG local
    if (event.target.src.includes('ui-avatars.com')) {
      console.log('🖼️ Avatar service también falló, usando SVG local');
      event.target.src = ImageUtils.getLocalAvatarSvg(artista.nombre);
    } else {
      // Primer intento, usar avatar como fallback
      const avatarUrl = ImageUtils.getAvatarUrl(artista.nombre);
      console.log('🖼️ Intentando avatar URL:', avatarUrl);
      event.target.src = avatarUrl;
    }
  }
}
