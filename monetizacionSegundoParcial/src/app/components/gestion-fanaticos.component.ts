import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GestionFanaticosService, Fanatico, EstadisticasFanaticos, NotificacionFan } from '../services/gestion-fanaticos.service';
import { ContextService, MonetizacionContext } from '../services/context.service';

@Component({
  selector: 'app-gestion-fanaticos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="gestion-container">
      <!-- Header -->
      <div class="header">
        <h1>🌟 Gestión de Fanáticos</h1>
        <p>Conecta con tu comunidad y genera más ingresos</p>
      </div>

      <!-- Estadísticas principales -->
      <div class="estadisticas" *ngIf="estadisticas">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-valor">{{ estadisticas.totalFanaticos }}</div>
            <div class="stat-label">Total Fanáticos</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-info">
            <div class="stat-valor">{{ estadisticas.fanaticosActivos }}</div>
            <div class="stat-label">Activos</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-valor">$ {{ estadisticas.propinasTotales | number:'1.2-2' }}</div>
            <div class="stat-label">Ingresos Totales</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <div class="stat-valor">$ {{ estadisticas.nivelPromedio | number:'1.2-2' }}</div>
            <div class="stat-label">Promedio por Fan</div>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="acciones">
        <h3>🚀 Acciones Rápidas</h3>
        <div class="acciones-grid">
          <button class="accion-btn" (click)="mostrarNotificaciones = true">
            📧 Enviar Notificación
          </button>
          <button class="accion-btn" (click)="exportarFanaticos()">
            📊 Exportar Lista
          </button>
          <button class="accion-btn" (click)="analizarComportamiento()">
            🔍 Analizar Comportamiento
          </button>
          <button class="accion-btn" (click)="crearPromociones()">
            🎯 Crear Promoción
          </button>
        </div>
      </div>

      <!-- Lista de fanáticos -->
      <div class="fanaticos-lista">
        <div class="lista-header">
          <h3>👥 Lista de Fanáticos</h3>
          <div class="filtros-rapidos">
            <select [(ngModel)]="filtroNivel" (change)="filtrarFanaticos()">
              <option value="todos">Todos los niveles</option>
              <option value="vip">VIP</option>
              <option value="superfan">Super Fan</option>
              <option value="regular">Regular</option>
              <option value="casual">Casual</option>
            </select>
          </div>
        </div>

        <div class="loading" *ngIf="cargandoFanaticos">
          <div class="spinner"></div>
          <p>Cargando fanáticos...</p>
        </div>

        <div class="fanaticos-grid" *ngIf="fanaticosFiltrados.length > 0 && !cargandoFanaticos">
          <div class="fanatico-card" *ngFor="let fanatico of fanaticosFiltrados">
            <div class="fanatico-header">
              <div class="fanatico-avatar">
                {{ fanatico.nombre.charAt(0).toUpperCase() }}
              </div>
              <div class="fanatico-info">
                <div class="fanatico-nombre">{{ fanatico.nombre }}</div>
                <div class="fanatico-email">{{ fanatico.email }}</div>
              </div>
              <div class="fanatico-nivel" [class]="'nivel-' + fanatico.nivel">
                {{ obtenerNivelTexto(fanatico.nivel) }}
              </div>
            </div>

            <div class="fanatico-stats">
              <div class="stat-mini">
                <span class="stat-mini-label">Propinas:</span>
                <span class="stat-mini-valor">$ {{ fanatico.totalPropinas | number:'1.2-2' }}</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-label">Suscripción:</span>
                <span class="stat-mini-valor">{{ fanatico.tipoSuscripcion || 'N/A' }}</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-label">Accesos:</span>
                <span class="stat-mini-valor">{{ fanatico.accesosExclusivos }}</span>
              </div>
            </div>

            <div class="fanatico-acciones">
              <button class="btn-mini" (click)="enviarMensajePersonal(fanatico)">
                💌 Mensaje
              </button>
              <button class="btn-mini" (click)="verDetalleFanatico(fanatico)">
                👁️ Ver Más
              </button>
            </div>
          </div>
        </div>

        <div class="empty" *ngIf="fanaticosFiltrados.length === 0 && !cargandoFanaticos">
          <div class="empty-icon">👥</div>
          <h3>No hay fanáticos</h3>
          <p>Comparte tu música para conseguir tus primeros fanáticos.</p>
        </div>
      </div>

      <!-- Modal de notificaciones -->
      <div class="modal" *ngIf="mostrarNotificaciones" (click)="cerrarModal($event)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>📧 Enviar Notificación</h3>
            <button class="close-btn" (click)="mostrarNotificaciones = false">×</button>
          </div>
          
          <form [formGroup]="notificacionForm" (ngSubmit)="enviarNotificacion()">
            <div class="form-group">
              <label>Destinatarios:</label>
              <select formControlName="destinatarios">
                <option value="todos">Todos los fanáticos</option>
                <option value="vip">Solo VIP</option>
                <option value="superfan">Solo Super Fans</option>
                <option value="activos">Solo activos</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tipo de notificación:</label>
              <select formControlName="tipo">
                <option value="agradecimiento">Agradecimiento</option>
                <option value="promocion">Promoción especial</option>
                <option value="actualizacion">Actualización</option>
              </select>
            </div>

            <div class="form-group">
              <label>Título:</label>
              <input type="text" formControlName="titulo" placeholder="Escribe un título atractivo">
            </div>

            <div class="form-group">
              <label>Mensaje:</label>
              <textarea formControlName="mensaje" rows="4" placeholder="Escribe tu mensaje aquí..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="mostrarNotificaciones = false">
                Cancelar
              </button>
              <button type="submit" class="btn-send" [disabled]="!notificacionForm.valid || enviandoNotificacion">
                {{ enviandoNotificacion ? 'Enviando...' : '📤 Enviar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gestion-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .header h1 {
      color: #348e91;
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
    }
    .header p {
      color: #666;
      margin: 0;
    }

    .estadisticas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .stat-icon {
      font-size: 2rem;
    }
    .stat-valor {
      font-size: 1.5rem;
      font-weight: 700;
      color: #348e91;
      margin-bottom: 0.25rem;
    }
    .stat-label {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .acciones {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .acciones h3 {
      margin: 0 0 1.5rem 0;
      color: #348e91;
    }
    .acciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .accion-btn {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      padding: 1rem;
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      font-weight: 600;
      transition: all 0.3s;
    }
    .accion-btn:hover {
      background: #348e91;
      color: white;
      border-color: #348e91;
    }

    .fanaticos-lista {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .lista-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .lista-header h3 {
      margin: 0;
      color: #348e91;
    }
    .filtros-rapidos select {
      padding: 0.5rem;
      border: 2px solid #e9ecef;
      border-radius: 6px;
    }

    .loading {
      text-align: center;
      padding: 2rem;
    }
    .spinner {
      width: 30px;
      height: 30px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #348e91;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .fanaticos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    .fanatico-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    }
    .fanatico-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .fanatico-avatar {
      width: 50px;
      height: 50px;
      background: #348e91;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
    }
    .fanatico-nombre {
      font-weight: 600;
      color: #333;
    }
    .fanatico-email {
      font-size: 0.9rem;
      color: #666;
    }
    .fanatico-nivel {
      margin-left: auto;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .nivel-vip {
      background: #ffd700;
      color: #b8860b;
    }
    .nivel-superfan {
      background: #ff6b6b;
      color: white;
    }
    .nivel-regular {
      background: #4ecdc4;
      color: white;
    }
    .nivel-casual {
      background: #95a5a6;
      color: white;
    }

    .fanatico-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .stat-mini {
      text-align: center;
    }
    .stat-mini-label {
      display: block;
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 0.25rem;
    }
    .stat-mini-valor {
      font-weight: 600;
      color: #348e91;
    }

    .fanatico-acciones {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .btn-mini {
      background: #348e91;
      color: white;
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.3s;
    }
    .btn-mini:hover {
      background: #2a7174;
    }

    .empty {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
    }
    .modal-header h3 {
      margin: 0;
      color: #348e91;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }

    .form-group {
      margin-bottom: 1.5rem;
      padding: 0 1.5rem;
    }
    .form-group:first-of-type {
      padding-top: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      font-size: 1rem;
    }
    .form-group textarea {
      resize: vertical;
      min-height: 100px;
    }

    .modal-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e9ecef;
    }
    .btn-cancel {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-send {
      background: #348e91;
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-send:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .gestion-container {
        padding: 0.5rem;
      }
      .estadisticas {
        grid-template-columns: repeat(2, 1fr);
      }
      .acciones-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .fanaticos-grid {
        grid-template-columns: 1fr;
      }
      .lista-header {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class GestionFanaticosComponent implements OnInit, OnDestroy {
  @Input() context?: MonetizacionContext;

  // Estado del componente
  cargandoFanaticos = false;
  enviandoNotificacion = false;
  mostrarNotificaciones = false;
  
  // Datos
  estadisticas: EstadisticasFanaticos | null = null;
  
  fanaticos: Fanatico[] = [];
  fanaticosFiltrados: Fanatico[] = [];
  
  // Filtros
  filtroNivel = 'todos';
  
  // Formularios
  notificacionForm: FormGroup;
  
  // Subscripciones
  private subscriptions: Subscription[] = [];

  constructor(
    private gestionFanaticosService: GestionFanaticosService,
    private contextService: ContextService,
    private fb: FormBuilder
  ) {
    this.notificacionForm = this.fb.group({
      destinatarios: ['todos', Validators.required],
      tipo: ['agradecimiento', Validators.required],
      titulo: ['', Validators.required],
      mensaje: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarDatos(): void {
    this.cargarEstadisticas();
    this.cargarFanaticos();
  }

  cargarEstadisticas(): void {
    const subscription = this.gestionFanaticosService.obtenerEstadisticas().subscribe({
      next: (estadisticas) => {
        this.estadisticas = estadisticas;
        console.log('📊 Estadísticas cargadas:', estadisticas);
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        // Fallback a datos simulados en caso de error
        this.estadisticas = this.obtenerEstadisticasFallback();
      }
    });

    this.subscriptions.push(subscription);
  }

  private obtenerEstadisticasFallback(): EstadisticasFanaticos {
    return {
      totalFanaticos: 1250,
      fanaticosActivos: 890,
      propinasTotales: 15420.50,
      nuevosEsteMes: 45,
      nivelPromedio: 3.2
    };
  }

  cargarFanaticos(): void {
    this.cargandoFanaticos = true;

    const subscription = this.gestionFanaticosService.obtenerFanaticos().subscribe({
      next: (fanaticos) => {
        console.log('👥 Fanáticos cargados:', fanaticos);
        this.fanaticos = fanaticos;
        this.fanaticosFiltrados = fanaticos;
        this.cargandoFanaticos = false;
      },
      error: (error) => {
        console.error('Error cargando fanáticos:', error);
        this.cargandoFanaticos = false;
        // Fallback a datos simulados
        this.fanaticos = this.obtenerFanaticosFallback();
        this.fanaticosFiltrados = this.fanaticos;
      }
    });

    this.subscriptions.push(subscription);
  }

  private obtenerFanaticosFallback(): Fanatico[] {
    return [
      {
        id: '1',
        nombre: 'María González',
        email: 'maria@email.com',
        nivel: 'vip',
        totalPropinas: 120.50,
        ultimaInteraccion: new Date('2024-01-20'),
        tipoSuscripcion: 'premium',
        mesesSuscrito: 4,
        accesosExclusivos: 25
      },
      {
        id: '2',
        nombre: 'Carlos Rodríguez',
        email: 'carlos@email.com',
        nivel: 'superfan',
        totalPropinas: 85.00,
        ultimaInteraccion: new Date('2024-01-19'),
        tipoSuscripcion: 'basica',
        mesesSuscrito: 3,
        accesosExclusivos: 18
      },
      {
        id: '3',
        nombre: 'Ana López',
        email: 'ana@email.com',
        nivel: 'regular',
        totalPropinas: 45.00,
        ultimaInteraccion: new Date('2024-01-18'),
        tipoSuscripcion: 'basica',
        mesesSuscrito: 2,
        accesosExclusivos: 12
      }
    ];
  }

  filtrarFanaticos(): void {
    if (this.filtroNivel === 'todos') {
      this.fanaticosFiltrados = [...this.fanaticos];
    } else {
      const subscription = this.gestionFanaticosService.obtenerFanaticosPorNivel(this.filtroNivel).subscribe({
        next: (fanaticosFiltrados) => {
          this.fanaticosFiltrados = fanaticosFiltrados;
        },
        error: (error) => {
          console.error('Error filtrando fanáticos:', error);
          // Fallback al filtrado local
          this.fanaticosFiltrados = this.fanaticos.filter(f => f.nivel === this.filtroNivel);
        }
      });
      this.subscriptions.push(subscription);
    }
  }

  obtenerNivelTexto(nivel: string): string {
    const niveles: Record<string, string> = {
      'vip': 'VIP',
      'superfan': 'Super Fan',
      'regular': 'Regular',
      'casual': 'Casual'
    };
    return niveles[nivel] || nivel;
  }

  enviarMensajePersonal(fanatico: Fanatico): void {
    // Implementar envío de mensaje personal
    console.log('Enviando mensaje a:', fanatico.nombre);
  }

  verDetalleFanatico(fanatico: Fanatico): void {
    // Implementar vista detallada del fanático
    console.log('Ver detalle de:', fanatico.nombre);
  }

  exportarFanaticos(): void {
    // Implementar exportación
    console.log('Exportando lista de fanáticos...');
  }

  analizarComportamiento(): void {
    // Implementar análisis de comportamiento
    console.log('Analizando comportamiento de fanáticos...');
  }

  crearPromociones(): void {
    // Implementar creación de promociones
    console.log('Creando promociones...');
  }

  enviarNotificacion(): void {
    if (!this.notificacionForm.valid) return;

    this.enviandoNotificacion = true;
    const formData = this.notificacionForm.value;

    // Enviar notificación a cada fanático seleccionado
    let destinatarios: string[] = [];
    if (formData.destinatarios === 'todos') {
      destinatarios = this.fanaticos.map(f => f.id);
    } else {
      destinatarios = [formData.destinatarios];
    }

    // Enviar notificación individual a cada destinatario
    const notificacionPromises = destinatarios.map(usuarioId => {
      const notificacion: NotificacionFan = {
        usuario_id: usuarioId,
        artista_id: 'artista-1', // ID hardcodeado por ahora
        mensaje: formData.mensaje,
        tipo: formData.tipo,
        fecha_envio: new Date()
      };
      return this.gestionFanaticosService.enviarNotificacion(notificacion);
    });

    // Ejecutar todas las notificaciones
    Promise.all(notificacionPromises.map(obs => obs.toPromise())).then(
      (responses) => {
        console.log('✅ Notificaciones enviadas exitosamente:', responses);
        this.enviandoNotificacion = false;
        this.mostrarNotificaciones = false;
        this.notificacionForm.reset({
          destinatarios: 'todos',
          tipo: 'agradecimiento',
          titulo: '',
          mensaje: ''
        });
      },
      (error) => {
        console.error('❌ Error enviando notificaciones:', error);
        this.enviandoNotificacion = false;
        // El modal permanece abierto para que el usuario pueda intentar de nuevo
      }
    );
  }

  cerrarModal(event: Event): void {
    if (event.target === event.currentTarget) {
      this.mostrarNotificaciones = false;
    }
  }
}
