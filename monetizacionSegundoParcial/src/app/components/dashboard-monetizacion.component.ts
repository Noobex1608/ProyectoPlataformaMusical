import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, combineLatest, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ContenidoExclusivoService } from '../services/contenido-exclusivo.service';
import { ContextService, MonetizacionContext } from '../services/context.service';
import { CustomCurrencyPipe } from '../pipes/currency.pipe';

interface DashboardStats {
  ingresosTotal: number;
  ingresosMes: number;
  suscriptoresActivos: number;
  contenidoExclusivo: number;
  visualizacionesTotales: number;
  crecimientoMensual: number;
  topContenido: any[];
  ingresosPorTipo: { [tipo: string]: number };
}

@Component({
  selector: 'app-dashboard-monetizacion',
  standalone: true,
  imports: [CommonModule, CustomCurrencyPipe],
  template: `
    <div class="dashboard-container">
      <!-- Header del Dashboard -->
      <div class="dashboard-header">
        <div class="welcome-message">
          <h1>📊 Dashboard de Monetización</h1>
          <p *ngIf="context && context.userName">Bienvenido, <strong>{{ context.userName }}</strong></p>
          <p class="subtitle">Panel principal para gestionar todos tus ingresos y herramientas de monetización</p>
        </div>
        <div class="quick-actions">
          <button class="quick-btn primary" (click)="crearContenido()">
            <span class="icon">📝</span>
            Crear Contenido
          </button>
          <button class="quick-btn" (click)="verReportes()">
            <span class="icon">📈</span>
            Ver Reportes
          </button>
        </div>
      </div>

      <!-- Métricas Principales -->
      <div class="metrics-grid">
        <div class="metric-card primary">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <h3>Ingresos Totales</h3>
            <div class="metric-value">{{ stats.ingresosTotal | currency }}</div>
            <div class="metric-change positive" *ngIf="stats.crecimientoMensual > 0">
              ↗️ +{{ stats.crecimientoMensual | number:'1.1-1' }}% este mes
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">👥</div>
          <div class="metric-content">
            <h3>Suscriptores Activos</h3>
            <div class="metric-value">{{ stats.suscriptoresActivos | number }}</div>
            <div class="metric-subtitle">Usuarios premium</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">🔒</div>
          <div class="metric-content">
            <h3>Contenido Exclusivo</h3>
            <div class="metric-value">{{ stats.contenidoExclusivo | number }}</div>
            <div class="metric-subtitle">Piezas publicadas</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">👁️</div>
          <div class="metric-content">
            <h3>Visualizaciones</h3>
            <div class="metric-value">{{ stats.visualizacionesTotales | number }}</div>
            <div class="metric-subtitle">Total del mes</div>
          </div>
        </div>
      </div>

      <!-- Gráficos y Analytics -->
      <div class="analytics-section">
        <div class="chart-container">
          <div class="chart-header">
            <h3>📈 Ingresos por Tipo</h3>
            <div class="chart-filters">
              <button class="filter-btn active">Mes</button>
              <button class="filter-btn">Año</button>
            </div>
          </div>
          <div class="chart-content">
            <div class="income-breakdown">
              <div class="income-item" *ngFor="let item of getIncomeBreakdown()">
                <div class="income-label">
                  <span class="income-icon">{{ item.icon }}</span>
                  <span class="income-type">{{ item.tipo }}</span>
                </div>
                <div class="income-amount">{{ item.monto | currency }}</div>
                <div class="income-bar">
                  <div class="income-fill" [style.width.%]="item.porcentaje"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="activity-container">
          <div class="activity-header">
            <h3>🚀 Actividad Reciente</h3>
          </div>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let actividad of actividadesRecientes">
              <div class="activity-icon">{{ actividad.icon }}</div>
              <div class="activity-content">
                <div class="activity-title">{{ actividad.titulo }}</div>
                <div class="activity-time">{{ actividad.tiempo }}</div>
              </div>
              <div class="activity-amount" *ngIf="actividad.monto">
                +{{ actividad.monto | currency }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido Top Performer -->
      <div class="top-content-section">
        <div class="section-header">
          <h3>🏆 Contenido Más Popular</h3>
          <button class="see-all-btn">Ver Todo</button>
        </div>
        <div class="content-grid">
          <div class="content-card" *ngFor="let contenido of stats.topContenido">
            <div class="content-thumbnail">
              <span class="content-type-icon">{{ getContentIcon(contenido.tipo) }}</span>
            </div>
            <div class="content-info">
              <h4>{{ contenido.titulo }}</h4>
              <p class="content-type">{{ contenido.tipo }}</p>
              <div class="content-stats">
                <span class="stat">👁️ {{ contenido.visualizaciones }}</span>
                <span class="stat">💰 {{ contenido.ingresos | currency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones Rápidas -->
      <div class="quick-actions-section">
        <h3>⚡ Acciones Rápidas</h3>
        <div class="actions-grid">
          <button class="action-card" (click)="navegarASeccion('contenido-exclusivo')">
            <div class="action-icon">🔒</div>
            <div class="action-content">
              <h4>Gestionar Contenido</h4>
              <p>Administra tu contenido exclusivo</p>
            </div>
          </button>
          
          <button class="action-card" (click)="navegarASeccion('gestion-fanaticos')">
            <div class="action-icon">👥</div>
            <div class="action-content">
              <h4>Gestión de Fanáticos</h4>
              <p>Administra suscriptores y membresías</p>
            </div>
          </button>
          
          <button class="action-card" (click)="navegarASeccion('reportes')">
            <div class="action-icon">📈</div>
            <div class="action-content">
              <h4>Reportes Detallados</h4>
              <p>Analytics y métricas avanzadas</p>
            </div>
          </button>
          
          <button class="action-card" (click)="navegarASeccion('configuracion')">
            <div class="action-icon">⚙️</div>
            <div class="action-content">
              <h4>Configuración</h4>
              <p>Precios y métodos de pago</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e9ecef;
    }

    .welcome-message h1 {
      color: #348e91;
      margin: 0 0 0.5rem 0;
      font-size: 2.2rem;
      font-weight: 700;
    }

    .welcome-message p {
      margin: 0 0 0.5rem 0;
      color: #666;
    }

    .subtitle {
      color: #888 !important;
      font-size: 0.95rem !important;
    }

    .quick-actions {
      display: flex;
      gap: 1rem;
    }

    .quick-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: 2px solid #348e91;
      background: transparent;
      color: #348e91;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .quick-btn.primary {
      background: #348e91;
      color: white;
    }

    .quick-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(52, 142, 145, 0.3);
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      border: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: transform 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .metric-card.primary {
      background: linear-gradient(135deg, #348e91, #2a7174);
      color: white;
    }

    .metric-icon {
      font-size: 2.5rem;
      opacity: 0.9;
    }

    .metric-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .metric-change {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .metric-change.positive {
      color: #27ae60;
    }

    .metric-card.primary .metric-change.positive {
      color: rgba(255, 255, 255, 0.9);
    }

    .metric-subtitle {
      font-size: 0.85rem;
      opacity: 0.7;
    }

    /* Analytics Section */
    .analytics-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .chart-container, .activity-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .chart-header, .activity-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-header h3, .activity-header h3 {
      margin: 0;
      color: #348e91;
      font-size: 1.1rem;
    }

    .chart-filters {
      display: flex;
      gap: 0.5rem;
    }

    .filter-btn {
      padding: 0.4rem 0.8rem;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .filter-btn.active {
      background: #348e91;
      color: white;
      border-color: #348e91;
    }

    .chart-content {
      padding: 1.5rem;
    }

    .income-breakdown {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .income-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .income-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 150px;
    }

    .income-icon {
      font-size: 1.2rem;
    }

    .income-type {
      font-weight: 500;
      color: #333;
    }

    .income-amount {
      font-weight: 600;
      color: #348e91;
      min-width: 80px;
    }

    .income-bar {
      flex: 1;
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .income-fill {
      height: 100%;
      background: linear-gradient(90deg, #348e91, #2a7174);
      transition: width 0.6s ease;
    }

    /* Activity List */
    .activity-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .activity-item:last-child {
      border-bottom: none;
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
      font-weight: 500;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .activity-time {
      font-size: 0.85rem;
      color: #666;
    }

    .activity-amount {
      font-weight: 600;
      color: #27ae60;
    }

    /* Top Content Section */
    .top-content-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .section-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header h3 {
      margin: 0;
      color: #348e91;
    }

    .see-all-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #348e91;
      background: transparent;
      color: #348e91;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      padding: 1.5rem;
    }

    .content-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .content-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .content-thumbnail {
      width: 50px;
      height: 50px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .content-type-icon {
      font-size: 1.5rem;
    }

    .content-info {
      flex: 1;
    }

    .content-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
      color: #333;
    }

    .content-type {
      margin: 0 0 0.5rem 0;
      font-size: 0.8rem;
      color: #666;
    }

    .content-stats {
      display: flex;
      gap: 1rem;
    }

    .stat {
      font-size: 0.8rem;
      color: #348e91;
      font-weight: 500;
    }

    /* Quick Actions Section */
    .quick-actions-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      padding: 2rem;
    }

    .quick-actions-section h3 {
      margin: 0 0 1.5rem 0;
      color: #348e91;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border: 2px solid #e9ecef;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
    }

    .action-card:hover {
      border-color: #348e91;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(52, 142, 145, 0.15);
    }

    .action-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #348e91, #2a7174);
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .action-content h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1rem;
    }

    .action-content p {
      margin: 0;
      color: #666;
      font-size: 0.85rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
      }

      .analytics-section {
        grid-template-columns: 1fr;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardMonetizacionComponent implements OnInit, OnDestroy {
  @Input() context: MonetizacionContext | null = null;
  
  stats: DashboardStats = {
    ingresosTotal: 1234.56,
    ingresosMes: 567.89,
    suscriptoresActivos: 45,
    contenidoExclusivo: 12,
    visualizacionesTotales: 1892,
    crecimientoMensual: 23.5,
    topContenido: [],
    ingresosPorTipo: {}
  };

  actividadesRecientes = [
    { icon: '💰', titulo: 'Nueva suscripción premium', tiempo: 'Hace 2 horas', monto: 9.99 },
    { icon: '🎵', titulo: 'Canción marcada como exclusiva', tiempo: 'Hace 4 horas' },
    { icon: '👥', titulo: 'Nuevo fanático se unió', tiempo: 'Hace 6 horas' },
    { icon: '📈', titulo: 'Meta de ingresos alcanzada', tiempo: 'Ayer', monto: 100.00 }
  ];

  private subscription = new Subscription();

  constructor(
    private contenidoService: ContenidoExclusivoService,
    private contextService: ContextService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadDashboardData(): void {
    if (!this.context || !this.context.artistaId) return;

    this.subscription.add(
      this.contenidoService.obtenerEstadisticasContenido(this.context.artistaId)
        .pipe(
          catchError(error => {
            console.error('Error cargando estadísticas:', error);
            return of({
              totalContenido: 0,
              contenidoActivo: 0,
              contenidoPorTipo: {},
              visualizacionesTotales: 0,
              promedioVisualizaciones: 0
            });
          })
        )
        .subscribe(estadisticas => {
          this.stats.contenidoExclusivo = estadisticas.contenidoActivo;
          this.stats.visualizacionesTotales = estadisticas.visualizacionesTotales;
          this.stats.ingresosPorTipo = this.calcularIngresosPorTipo(estadisticas.contenidoPorTipo);
          this.generateTopContent();
        })
    );
  }

  private calcularIngresosPorTipo(contenidoPorTipo: { [tipo: string]: number }): { [tipo: string]: number } {
    const ingresosPorTipo: { [tipo: string]: number } = {};
    
    Object.keys(contenidoPorTipo).forEach(tipo => {
      // Simulación de ingresos basada en el tipo de contenido
      const multiplier = tipo === 'cancion' ? 15 : tipo === 'album' ? 45 : 8;
      ingresosPorTipo[tipo] = contenidoPorTipo[tipo] * multiplier;
    });

    return ingresosPorTipo;
  }

  private generateTopContent(): void {
    this.stats.topContenido = [
      { titulo: 'Mi Mejor Canción', tipo: 'Canción', visualizaciones: 1234, ingresos: 89.50 },
      { titulo: 'Álbum Premium', tipo: 'Álbum', visualizaciones: 892, ingresos: 156.70 },
      { titulo: 'Track Exclusivo', tipo: 'Canción', visualizaciones: 567, ingresos: 34.20 }
    ];
  }

  getIncomeBreakdown() {
    const total = Object.values(this.stats.ingresosPorTipo).reduce((a, b) => a + b, 0);
    
    return Object.entries(this.stats.ingresosPorTipo).map(([tipo, monto]) => ({
      tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      monto,
      porcentaje: total > 0 ? (monto / total) * 100 : 0,
      icon: tipo === 'cancion' ? '🎵' : tipo === 'album' ? '💿' : '📱'
    }));
  }

  getContentIcon(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'cancion': return '🎵';
      case 'album': return '💿';
      case 'video': return '🎬';
      default: return '📱';
    }
  }

  crearContenido(): void {
    this.navegarASeccion('contenido-exclusivo');
  }

  verReportes(): void {
    this.navegarASeccion('reportes');
  }

  navegarASeccion(seccion: string): void {
    this.contextService.updateSection(seccion);
  }
}
