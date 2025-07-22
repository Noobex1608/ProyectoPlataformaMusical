import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContextService, MonetizacionContext } from '../../services/context.service';
import { SuscripcionService } from '../../services/suscripcion.service';
import { Suscripcion, SuscripcionConDetalles } from '../../models/suscripcion.model';
import { ImageUtils } from '../../utils/image.utils';

@Component({
  selector: 'app-gestionar-suscripciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gestionar-suscripciones" *ngIf="context">
      <!-- Header -->
      <div class="header">
        <h1>📋 Mis Suscripciones</h1>
        <p class="subtitle">Gestiona tus membresías y suscripciones activas</p>
      </div>

      <!-- Resumen -->
      <div class="resumen-section">
        <div class="resumen-card">
          <div class="resumen-item">
            <div class="resumen-icon">💳</div>
            <div class="resumen-content">
              <h3>{{ suscripcionesActivas.length }}</h3>
              <p>Suscripciones Activas</p>
            </div>
          </div>
          
          <div class="resumen-item">
            <div class="resumen-icon">💰</div>
            <div class="resumen-content">
              <h3>\${{ calcularGastoMensual() }}</h3>
              <p>Gasto Mensual</p>
            </div>
          </div>
          
          <div class="resumen-item">
            <div class="resumen-icon">📅</div>
            <div class="resumen-content">
              <h3>{{ proximasRenovaciones }}</h3>
              <p>Próximas Renovaciones</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab" 
          [class.active]="tabActivo === 'activas'"
          (click)="cambiarTab('activas')"
        >
          Activas ({{ suscripcionesActivas.length }})
        </button>
        <button 
          class="tab" 
          [class.active]="tabActivo === 'inactivas'"
          (click)="cambiarTab('inactivas')"
        >
          Inactivas ({{ suscripcionesInactivas.length }})
        </button>
        <button 
          class="tab" 
          [class.active]="tabActivo === 'historial'"
          (click)="cambiarTab('historial')"
        >
          Historial
        </button>
      </div>

      <!-- Suscripciones Activas -->
      <div class="tab-content" *ngIf="tabActivo === 'activas'">
        <!-- Indicador de carga -->
        <div *ngIf="cargandoSuscripciones" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando suscripciones...</p>
        </div>

        <!-- Mensaje de error -->
        <div *ngIf="errorCarga && !cargandoSuscripciones" class="error-container">
          <p>❌ Error cargando las suscripciones</p>
          <button class="btn-primary" (click)="cargarSuscripciones()">Reintentar</button>
        </div>

        <!-- Contenido normal -->
        <div *ngIf="!cargandoSuscripciones && !errorCarga">
          <div class="suscripciones-grid" *ngIf="suscripcionesActivas.length > 0; else noActivas">
            <div class="suscripcion-card activa" *ngFor="let suscripcion of suscripcionesActivas">
            <!-- Header de la suscripción -->
            <div class="suscripcion-header">
              <img [src]="suscripcion.artista.imagen_perfil || 'https://via.placeholder.com/60x60/667eea/ffffff?text=' + suscripcion.artista.nombre.charAt(0)" [alt]="suscripcion.artista.nombre" class="artista-avatar">
              <div class="suscripcion-info">
                <h3>{{ suscripcion.artista.nombre }}</h3>
                <p class="plan-nombre">{{ suscripcion.plan.nombre }}</p>
                <span class="estado-badge activa">✅ Activa</span>
              </div>
              <div class="precio-info">
                <span class="precio">\${{ suscripcion.plan.precio }}</span>
                <span class="periodo">/mes</span>
              </div>
            </div>

            <!-- Detalles de la suscripción -->
            <div class="suscripcion-detalles">
              <div class="detalle-item">
                <span class="detalle-label">Fecha de inicio:</span>
                <span class="detalle-valor">{{ formatearFecha(suscripcion.fechaInicio) }}</span>
              </div>
              <div class="detalle-item">
                <span class="detalle-label">Próxima renovación:</span>
                <span class="detalle-valor">{{ formatearFecha(suscripcion.fechaFin) }}</span>
              </div>
              <div class="detalle-item">
                <span class="detalle-label">Auto-renovación:</span>
                <span class="detalle-valor">
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      [checked]="suscripcion.renovacionAutomatica"
                      (change)="toggleAutoRenovacion(suscripcion)"
                    >
                    <span class="slider"></span>
                  </label>
                </span>
              </div>
            </div>

            <!-- Beneficios -->
            <div class="beneficios">
              <h4>Beneficios incluidos:</h4>
              <ul class="beneficios-lista">
                <li *ngFor="let beneficio of suscripcion.plan.beneficios">
                  <span class="beneficio-icon">✓</span>
                  {{ beneficio }}
                </li>
              </ul>
            </div>

            <!-- Acciones -->
            <div class="suscripcion-acciones">
              <button class="btn-primary" (click)="verContenido(suscripcion)">
                📱 Ver Contenido
              </button>
              <button class="btn-secondary" (click)="cambiarPlan(suscripcion)">
                🔄 Cambiar Plan
              </button>
              <button class="btn-danger" (click)="cancelarSuscripcion(suscripcion)">
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>

        <ng-template #noActivas>
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No tienes suscripciones activas</h3>
            <p>Explora artistas y encuentra el contenido que te guste</p>
            <button class="btn-primary" (click)="explorarArtistas()">
              🎵 Explorar Artistas
            </button>
          </div>
        </ng-template>
        </div> <!-- Cierre del div de contenido normal -->
      </div>

      <!-- Suscripciones Inactivas -->
      <div class="tab-content" *ngIf="tabActivo === 'inactivas'">
        <div class="suscripciones-grid" *ngIf="suscripcionesInactivas.length > 0; else noInactivas">
          <div class="suscripcion-card inactiva" *ngFor="let suscripcion of suscripcionesInactivas">
            <div class="suscripcion-header">
              <img [src]="suscripcion.artista.imagen_perfil || 'https://via.placeholder.com/60x60/667eea/ffffff?text=' + suscripcion.artista.nombre.charAt(0)" [alt]="suscripcion.artista.nombre" class="artista-avatar">
              <div class="suscripcion-info">
                <h3>{{ suscripcion.artista.nombre }}</h3>
                <p class="plan-nombre">{{ suscripcion.plan.nombre }}</p>
                <span class="estado-badge inactiva">⏸️ {{ suscripcion.activa ? 'Activa' : 'Inactiva' }}</span>
              </div>
              <div class="precio-info">
                <span class="precio">\${{ suscripcion.plan.precio }}</span>
                <span class="periodo">/mes</span>
              </div>
            </div>

            <div class="suscripcion-detalles">
              <div class="detalle-item">
                <span class="detalle-label">Fecha de cancelación:</span>
                <span class="detalle-valor">{{ formatearFecha(suscripcion.fechaCancelacion) }}</span>
              </div>
              <div class="detalle-item">
                <span class="detalle-label">Motivo:</span>
                <span class="detalle-valor">{{ suscripcion.motivoCancelacion || 'No especificado' }}</span>
              </div>
            </div>

            <div class="suscripcion-acciones">
              <button class="btn-primary" (click)="reactivarSuscripcion(suscripcion)">
                🔄 Reactivar
              </button>
              <button class="btn-secondary" (click)="verHistorialCompleto(suscripcion)">
                📊 Ver Historial
              </button>
            </div>
          </div>
        </div>

        <ng-template #noInactivas>
          <div class="empty-state">
            <div class="empty-icon">✅</div>
            <h3>¡Todas tus suscripciones están activas!</h3>
            <p>No tienes suscripciones canceladas o pausadas</p>
          </div>
        </ng-template>
      </div>

      <!-- Historial -->
      <div class="tab-content" *ngIf="tabActivo === 'historial'">
        <div class="historial-filtros">
          <select class="filtro-select">
            <option value="todos">Todos los artistas</option>
            <option value="ultimo-mes">Último mes</option>
            <option value="ultimo-año">Último año</option>
          </select>
        </div>

        <div class="historial-lista">
          <div class="historial-item" *ngFor="let item of historialPagos">
            <div class="historial-fecha">
              <div class="fecha-dia">{{ formatearDia(item.fecha) }}</div>
              <div class="fecha-mes">{{ formatearMes(item.fecha) }}</div>
            </div>
            <div class="historial-info">
              <h4>{{ item.descripcion }}</h4>
              <p>{{ item.artista }} - {{ item.plan }}</p>
              <span class="historial-metodo">{{ item.metodoPago }}</span>
            </div>
            <div class="historial-monto">
              <span class="monto">\${{ item.monto }}</span>
              <span class="estado" [class]="item.estado">{{ item.estadoTexto }}</span>
            </div>
            <div class="historial-acciones">
              <button class="btn-link" (click)="descargarFactura(item)">
                📄 Factura
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gestionar-suscripciones {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .resumen-section {
      margin-bottom: 2rem;
    }

    .resumen-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      border-radius: 16px;
      color: white;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .resumen-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-align: center;
    }

    .resumen-icon {
      font-size: 2.5rem;
    }

    .resumen-content h3 {
      font-size: 2rem;
      margin: 0 0 0.25rem 0;
    }

    .resumen-content p {
      margin: 0;
      opacity: 0.9;
    }

    .tabs {
      display: flex;
      background: white;
      border-radius: 12px;
      padding: 0.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .tab {
      flex: 1;
      padding: 1rem 2rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: #666;
      transition: all 0.3s ease;
    }

    .tab.active {
      background: #667eea;
      color: white;
    }

    .suscripciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .suscripcion-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border-left: 4px solid #667eea;
    }

    .suscripcion-card.inactiva {
      border-left-color: #6c757d;
      opacity: 0.8;
    }

    .suscripcion-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .artista-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
    }

    .suscripcion-info {
      flex: 1;
    }

    .suscripcion-info h3 {
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .plan-nombre {
      color: #666;
      margin: 0 0 0.5rem 0;
    }

    .estado-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .estado-badge.activa {
      background: #d4edda;
      color: #155724;
    }

    .estado-badge.inactiva {
      background: #f8d7da;
      color: #721c24;
    }

    .precio-info {
      text-align: right;
    }

    .precio {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
    }

    .periodo {
      color: #666;
    }

    .suscripcion-detalles {
      display: grid;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .detalle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detalle-label {
      color: #666;
      font-weight: 500;
    }

    .detalle-valor {
      font-weight: 600;
      color: #333;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #667eea;
    }

    input:checked + .slider:before {
      transform: translateX(26px);
    }

    .beneficios {
      margin-bottom: 1.5rem;
    }

    .beneficios h4 {
      margin: 0 0 0.75rem 0;
      color: #333;
    }

    .beneficios-lista {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .beneficios-lista li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .beneficio-icon {
      color: #28a745;
      font-weight: bold;
    }

    .suscripcion-acciones {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 0.75rem;
    }

    .btn-primary, .btn-secondary, .btn-danger, .btn-link {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-link {
      background: transparent;
      color: #667eea;
      text-decoration: underline;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .historial-filtros {
      margin-bottom: 2rem;
    }

    .filtro-select {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
    }

    .historial-lista {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .historial-item {
      display: grid;
      grid-template-columns: 80px 1fr auto auto;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid #f0f0f0;
      align-items: center;
    }

    .historial-item:last-child {
      border-bottom: none;
    }

    .historial-fecha {
      text-align: center;
      color: #666;
    }

    .fecha-dia {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
    }

    .fecha-mes {
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .historial-info h4 {
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .historial-info p {
      margin: 0 0 0.25rem 0;
      color: #666;
    }

    .historial-metodo {
      font-size: 0.9rem;
      color: #888;
    }

    .historial-monto {
      text-align: right;
    }

    .monto {
      display: block;
      font-size: 1.2rem;
      font-weight: 700;
      color: #333;
    }

    .estado {
      font-size: 0.9rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
    }

    .estado.exitoso {
      background: #d4edda;
      color: #155724;
    }

    .estado.pendiente {
      background: #fff3cd;
      color: #856404;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    }

    .error-container p {
      color: #dc3545;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
  `]
})
export class GestionarSuscripcionesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  context: MonetizacionContext | null = null;
  
  tabActivo = 'activas';
  proximasRenovaciones = 2;

  suscripciones: SuscripcionConDetalles[] = [];
  historialPagos: any[] = [];
  cargandoSuscripciones = true;
  errorCarga = false;

  constructor(
    private contextService: ContextService,
    private suscripcionService: SuscripcionService
  ) {}

  ngOnInit() {
    this.contextService.context$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (context: MonetizacionContext | null) => {
        this.context = context;
        if (context?.userType === 'comunidad') {
          this.cargarSuscripciones();
          this.cargarHistorial();
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

  get suscripcionesActivas() {
    return this.suscripciones.filter(s => s.activa);
  }

  get suscripcionesInactivas() {
    return this.suscripciones.filter(s => !s.activa);
  }

  calcularGastoMensual(): number {
    return this.suscripcionesActivas.reduce((total, s) => total + s.plan.precio, 0);
  }

  cambiarTab(tab: string) {
    this.tabActivo = tab;
  }

  cargarSuscripciones() {
    if (!this.context?.userId) {
      console.warn('⚠️ No hay usuario logueado');
      this.cargandoSuscripciones = false;
      return;
    }

    this.cargandoSuscripciones = true;
    this.errorCarga = false;

    this.suscripcionService.obtenerSuscripcionesUsuario(this.context.userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (suscripciones: SuscripcionConDetalles[]) => {
        console.log('✅ Suscripciones cargadas:', suscripciones);
        this.suscripciones = suscripciones;
        this.cargandoSuscripciones = false;
      },
      error: (error: any) => {
        console.error('❌ Error cargando suscripciones:', error);
        this.errorCarga = true;
        this.cargandoSuscripciones = false;
        // Datos de fallback para desarrollo
        this.cargarDatosFallback();
      }
    });
  }

  cargarDatosFallback() {
    // Datos de respaldo cuando falla la conexión con Supabase
    this.suscripciones = [];
  }

  private cargarHistorial() {
    this.historialPagos = [
      {
        fecha: new Date('2025-01-15'),
        descripcion: 'Renovación de suscripción',
        artista: 'Luna Nocturna',
        plan: 'Plan Premium',
        monto: 9.99,
        metodoPago: 'Tarjeta **** 1234',
        estado: 'exitoso',
        estadoTexto: 'Exitoso'
      },
      {
        fecha: new Date('2025-01-01'),
        descripcion: 'Renovación de suscripción',
        artista: 'Beats Underground',
        plan: 'Fan Club',
        monto: 7.99,
        metodoPago: 'PayPal',
        estado: 'exitoso',
        estadoTexto: 'Exitoso'
      }
    ];
  }

  toggleAutoRenovacion(suscripcion: SuscripcionConDetalles) {
    if (!this.context?.userId) {
      console.warn('⚠️ No hay usuario logueado');
      return;
    }

    const nuevoEstado = !suscripcion.renovacionAutomatica;
    console.log('🔄 Toggle auto-renovación:', suscripcion.id, nuevoEstado);

    this.suscripcionService.toggleRenovacionAutomatica(suscripcion.id, nuevoEstado).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (resultado) => {
        console.log('✅ Auto-renovación actualizada:', resultado);
        suscripcion.renovacionAutomatica = nuevoEstado;
      },
      error: (error) => {
        console.error('❌ Error actualizando auto-renovación:', error);
      }
    });
  }

  verContenido(suscripcion: SuscripcionConDetalles) {
    console.log('📱 Ver contenido de:', suscripcion.artista.nombre);
  }

  cambiarPlan(suscripcion: SuscripcionConDetalles) {
    console.log('🔄 Cambiar plan de:', suscripcion.artista.nombre);
  }

  cancelarSuscripcion(suscripcion: SuscripcionConDetalles) {
    if (!this.context?.userId) {
      console.warn('⚠️ No hay usuario logueado');
      return;
    }

    if (confirm('¿Estás seguro de que quieres cancelar esta suscripción?')) {
      console.log('❌ Cancelando suscripción:', suscripcion.id);
      
      this.suscripcionService.cancelarSuscripcion(suscripcion.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (resultado) => {
          console.log('✅ Suscripción cancelada:', resultado);
          // Recargar suscripciones
          this.cargarSuscripciones();
        },
        error: (error) => {
          console.error('❌ Error cancelando suscripción:', error);
        }
      });
    }
  }

  reactivarSuscripcion(suscripcion: SuscripcionConDetalles) {
    console.log('🔄 Reactivar suscripción:', suscripcion.id);
    // TODO: Implementar reactivación si es necesario
  }

  verHistorialCompleto(suscripcion: SuscripcionConDetalles) {
    console.log('📊 Ver historial de:', suscripcion.artista.nombre);
  }

  explorarArtistas() {
    console.log('🎵 Redirigir a explorar artistas');
  }

  descargarFactura(item: any) {
    console.log('📄 Descargar factura:', item.fecha);
  }

  formatearFecha(fecha: Date | undefined): string {
    if (!fecha) return 'N/A';
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearDia(fecha: Date | undefined): string {
    if (!fecha) return '00';
    return fecha.getDate().toString().padStart(2, '0');
  }

  formatearMes(fecha: Date | undefined): string {
    if (!fecha) return 'N/A';
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return meses[fecha.getMonth()];
  }
}
