import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { ContextService, MonetizacionContext } from '../../services/context.service';
import { PropinaService } from '../../services/propina.service';
import { ArtistaService } from '../../services/artista.service';
import { Propina } from '../../models/propina.model';
import { Artista } from '../../models/artista.model';

// Interfaz extendida para mostrar propinas con información del artista
interface PropinaConArtista extends Propina {
  artista: Artista;
}

@Component({
  selector: 'app-enviar-propinas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="enviar-propinas" *ngIf="context">
      <!-- Header -->
      <div class="header">
        <h1>💰 Enviar Propinas</h1>
        <p class="subtitle">Apoya a tus artistas favoritos con propinas personalizadas</p>
      </div>

      <!-- Stats Overview -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">💝</div>
            <div class="stat-content">
              <h3>{{ estadisticas.propinasEnviadas }}</h3>
              <p>Propinas enviadas</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <h3>\${{ estadisticas.totalGastado }}</h3>
              <p>Total gastado</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ estadisticas.artistasApoyados }}</h3>
              <p>Artistas apoyados</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Tips Section -->
      <div class="quick-tips-section">
        <h2>⚡ Propinas Rápidas</h2>
        <p class="section-subtitle">Envía propinas instantáneas a tus artistas favoritos</p>
        
        <!-- Loading indicator -->
        <div *ngIf="cargandoArtistas" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando artistas...</p>
        </div>
        
        <div class="artists-quick-grid" *ngIf="!cargandoArtistas && artistasFavoritos.length > 0">
          <div class="artist-quick-card" *ngFor="let artista of artistasFavoritos">
            <img [src]="artista.imagen || 'https://via.placeholder.com/50x50/667eea/ffffff?text=' + artista.nombre.charAt(0)" [alt]="artista.nombre" class="artist-avatar">
            <div class="artist-info">
              <h4>{{ artista.nombre }}</h4>
              <p>{{ artista.genero || 'Género musical' }}</p>
            </div>
            <div class="quick-tip-amounts">
              <button 
                class="quick-amount-btn" 
                *ngFor="let monto of montosRapidos"
                (click)="enviarPropinaRapida(artista, monto)"
                [disabled]="enviando"
              >
                \${{ monto }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- No artists message -->
        <div *ngIf="!cargandoArtistas && artistasFavoritos.length === 0" class="empty-state">
          <p>No hay artistas disponibles en este momento</p>
        </div>
      </div>

      <!-- Custom Tip Section -->
      <div class="custom-tip-section">
        <h2>🎨 Propina Personalizada</h2>
        
        <div class="tip-form-container">
          <div class="tip-form">
            <!-- Artist Selection -->
            <div class="form-group">
              <label>🎵 Seleccionar Artista</label>
              <select [(ngModel)]="propinaForm.artistaSeleccionado" class="form-select">
                <option value="">Elige un artista...</option>
                <option *ngFor="let artista of todosLosArtistas" [value]="artista.id">
                  {{ artista.nombre }}
                </option>
              </select>
            </div>

            <!-- Artist Preview -->
            <div class="artist-preview" *ngIf="artistaSeleccionado">
              <img [src]="artistaSeleccionado.imagen || 'https://via.placeholder.com/60x60/667eea/ffffff?text=' + artistaSeleccionado.nombre.charAt(0)" [alt]="artistaSeleccionado.nombre">
              <div class="artist-preview-info">
                <h3>{{ artistaSeleccionado.nombre }}</h3>
                <p>{{ artistaSeleccionado.genero || 'Género musical' }}</p>
                <div class="artist-stats">
                  <span>👥 Seguidores</span>
                  <span>⭐ Artista verificado</span>
                </div>
              </div>
            </div>

            <!-- Amount Selection -->
            <div class="form-group">
              <label>💰 Monto de la Propina</label>
              <div class="amount-options">
                <button 
                  class="amount-btn" 
                  *ngFor="let monto of montosPredefnidos"
                  [class.selected]="propinaForm.monto === monto"
                  (click)="seleccionarMonto(monto)"
                  type="button"
                >
                  \${{ monto }}
                </button>
                <div class="custom-amount">
                  <input 
                    type="number" 
                    [(ngModel)]="propinaForm.montoCustom"
                    (input)="onMontoCustomChange()"
                    placeholder="Otro monto"
                    min="1"
                    max="500"
                    class="amount-input"
                  >
                </div>
              </div>
            </div>

            <!-- Song Dedication -->
            <div class="form-group">
              <label>🎵 Dedicar Canción (Opcional)</label>
              <select [(ngModel)]="propinaForm.cancionDedicada" class="form-select">
                <option value="">Sin dedicatoria...</option>
                <option *ngFor="let cancion of cancionesArtista" [value]="cancion.id">
                  {{ cancion.nombre }}
                </option>
              </select>
            </div>

            <!-- Personal Message -->
            <div class="form-group">
              <label>💌 Mensaje Personal (Opcional)</label>
              <textarea 
                [(ngModel)]="propinaForm.mensaje"
                placeholder="Escribe un mensaje para el artista..."
                maxlength="280"
                rows="4"
                class="message-textarea"
              ></textarea>
              <small class="char-count">{{ propinaForm.mensaje.length }}/280 caracteres</small>
            </div>

            <!-- Privacy Options -->
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="propinaForm.mostrarEnFeed"
                >
                📢 Mostrar esta propina en el feed público
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="propinaForm.anonimo"
                >
                🕶️ Enviar de forma anónima
              </label>
            </div>

            <!-- Payment Method -->
            <div class="form-group">
              <label>💳 Método de Pago</label>
              <div class="payment-methods">
                <div 
                  class="payment-method"
                  *ngFor="let metodo of metodosPago"
                  [class.selected]="propinaForm.metodoPago === metodo.id"
                  (click)="seleccionarMetodoPago(metodo.id)"
                >
                  <div class="payment-icon">{{ metodo.icono }}</div>
                  <div class="payment-info">
                    <span class="payment-name">{{ metodo.nombre }}</span>
                    <small class="payment-detail">{{ metodo.detalle }}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tip Summary -->
            <div class="tip-summary" *ngIf="propinaForm.monto > 0">
              <h3>📋 Resumen de la Propina</h3>
              <div class="summary-details">
                <div class="summary-row">
                  <span>Monto:</span>
                  <span class="amount">\${{ propinaForm.monto }}</span>
                </div>
                <div class="summary-row">
                  <span>Comisión de procesamiento:</span>
                  <span>\${{ calcularComision() }}</span>
                </div>
                <div class="summary-row total">
                  <span>Total a pagar:</span>
                  <span class="total-amount">\${{ calcularTotal() }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button 
                class="btn-cancel" 
                (click)="limpiarFormulario()"
                type="button"
              >
                🗑️ Limpiar
              </button>
              <button 
                class="btn-send" 
                (click)="enviarPropina()"
                [disabled]="!formularioValido() || enviando"
              >
                {{ enviando ? '⏳ Enviando...' : '💝 Enviar Propina' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Tips -->
      <div class="recent-tips-section">
        <h2>📜 Propinas Recientes</h2>
        
        <div class="tips-list" *ngIf="propinasRecientes.length > 0; else noRecentTips">
          <div class="tip-item" *ngFor="let propina of propinasRecientes">
            <div class="tip-date">
              <div class="date-day">{{ formatearDia(propina.fecha) }}</div>
              <div class="date-month">{{ formatearMes(propina.fecha) }}</div>
            </div>
            <img [src]="propina.artista.imagen" [alt]="propina.artista.nombre" class="tip-artist-avatar">
            <div class="tip-info">
              <h4>{{ propina.artista.nombre }}</h4>
              <p class="tip-message" *ngIf="propina.mensaje">{{ propina.mensaje }}</p>
              <p class="tip-song" *ngIf="propina.cancion_dedicada">🎵 Canción dedicada</p>
              <div class="tip-meta">
                <span class="tip-visibility">{{ propina.publico_en_feed ? '📢 Pública' : '🔒 Privada' }}</span>
                <span class="tip-status" [class]="propina.estado">{{ obtenerEstadoTexto(propina.estado) }}</span>
              </div>
            </div>
            <div class="tip-amount">
              <span class="amount">\${{ propina.monto }}</span>
            </div>
            <div class="tip-actions">
              <button class="btn-small" (click)="repetirPropina(propina)">
                🔄 Repetir
              </button>
            </div>
          </div>
        </div>

        <ng-template #noRecentTips>
          <div class="empty-state">
            <div class="empty-icon">💰</div>
            <h3>No has enviado propinas aún</h3>
            <p>¡Comienza apoyando a tus artistas favoritos!</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .enviar-propinas {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 3rem;
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
      margin: 0 0 0.25rem 0;
    }

    .quick-tips-section, .custom-tip-section, .recent-tips-section {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .section-subtitle {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .artists-quick-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .artist-quick-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .artist-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }

    .artist-info {
      flex: 1;
    }

    .artist-info h4 {
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .artist-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .quick-tip-amounts {
      display: flex;
      gap: 0.5rem;
    }

    .quick-amount-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .quick-amount-btn:hover {
      background: #5a67d8;
      transform: translateY(-1px);
    }

    .tip-form {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    .form-select, .amount-input, .message-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
    }

    .artist-preview {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .artist-preview img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
    }

    .artist-preview-info h3 {
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .artist-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #666;
    }

    .amount-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr) 2fr;
      gap: 0.5rem;
    }

    .amount-btn {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .amount-btn:hover, .amount-btn.selected {
      border-color: #667eea;
      background: #667eea;
      color: white;
    }

    .custom-amount {
      display: flex;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-weight: normal;
      cursor: pointer;
    }

    .payment-methods {
      display: grid;
      gap: 0.75rem;
    }

    .payment-method {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .payment-method:hover, .payment-method.selected {
      border-color: #667eea;
      background: #f0f4ff;
    }

    .payment-icon {
      font-size: 1.5rem;
    }

    .payment-name {
      display: block;
      font-weight: 600;
      color: #333;
    }

    .payment-detail {
      color: #666;
    }

    .tip-summary {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }

    .tip-summary h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .summary-row.total {
      border-top: 1px solid #e0e0e0;
      padding-top: 0.75rem;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .total-amount {
      color: #667eea;
      font-size: 1.2rem;
    }

    .form-actions {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-cancel, .btn-send {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
    }

    .btn-send {
      background: #667eea;
      color: white;
    }

    .btn-send:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .tips-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .tip-item {
      display: grid;
      grid-template-columns: 60px 50px 1fr auto auto;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      align-items: center;
    }

    .tip-date {
      text-align: center;
      color: #666;
    }

    .date-day {
      font-size: 1.2rem;
      font-weight: 700;
      color: #333;
    }

    .date-month {
      font-size: 0.8rem;
      text-transform: uppercase;
    }

    .tip-artist-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .tip-info h4 {
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .tip-message, .tip-song {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: #666;
    }

    .tip-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
    }

    .tip-amount .amount {
      font-size: 1.2rem;
      font-weight: 700;
      color: #667eea;
    }

    .btn-small {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .char-count {
      display: block;
      text-align: right;
      color: #888;
      margin-top: 0.25rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
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

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #666;
      background: #f8f9fa;
      border-radius: 12px;
      margin: 1rem 0;
    }
  `]
})
export class EnviarPropinasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  context: MonetizacionContext | null = null;
  enviando = false;

  // Estados
  estadisticas = {
    propinasEnviadas: 0,
    totalGastado: 0,
    artistasApoyados: 0
  };

  // Datos
  artistasFavoritos: Artista[] = [];
  todosLosArtistas: Artista[] = [];
  propinasRecientes: PropinaConArtista[] = [];
  cancionesArtista: any[] = [];
  cargandoArtistas = true;
  cargandoPropinasRecientes = true;

  // Formulario
  propinaForm = {
    artistaSeleccionado: '',
    monto: 0,
    montoCustom: null as number | null,
    cancionDedicada: '',
    mensaje: '',
    mostrarEnFeed: true,
    anonimo: false,
    metodoPago: 'tarjeta'
  };

  // Configuración
  montosRapidos = [1, 3, 5];
  montosPredefnidos = [5, 10, 20, 50];
  metodosPago = [
    { id: 'tarjeta', icono: '💳', nombre: 'Tarjeta de Crédito', detalle: '**** 1234' },
    { id: 'paypal', icono: '🅿️', nombre: 'PayPal', detalle: 'usuario@email.com' },
    { id: 'apple', icono: '🍎', nombre: 'Apple Pay', detalle: 'Touch/Face ID' }
  ];

  constructor(
    private contextService: ContextService,
    private propinaService: PropinaService,
    private artistaService: ArtistaService
  ) {}

  ngOnInit() {
    this.contextService.context$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (context: MonetizacionContext | null) => {
        this.context = context;
        if (context?.userType === 'comunidad') {
          this.cargarDatos();
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

  get artistaSeleccionado() {
    return this.todosLosArtistas.find(a => a.id === this.propinaForm.artistaSeleccionado);
  }

  private cargarDatos() {
    if (!this.context?.userId) {
      console.warn('⚠️ No hay usuario logueado');
      return;
    }

    // Cargar estadísticas reales
    this.cargarEstadisticas();
    
    // Cargar todos los artistas
    this.cargarArtistas();
    
    // Cargar propinas recientes del usuario
    this.cargarPropinasRecientes();
  }

  private cargarEstadisticas() {
    if (!this.context?.userId) return;

    this.propinaService.obtenerPropinasPorFan(this.context.userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (propinas: Propina[]) => {
        const artistasUnicos = new Set(propinas.map(p => p.artista_id));
        
        this.estadisticas = {
          propinasEnviadas: propinas.length,
          totalGastado: propinas.reduce((total, p) => total + p.cantidad, 0),
          artistasApoyados: artistasUnicos.size
        };
      },
      error: (error) => {
        console.error('❌ Error cargando estadísticas:', error);
        this.estadisticas = {
          propinasEnviadas: 0,
          totalGastado: 0,
          artistasApoyados: 0
        };
      }
    });
  }

  private cargarArtistas() {
    this.cargandoArtistas = true;
    
    this.artistaService.obtenerArtistasParaExplorar(this.context?.userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (artistas) => {
        console.log('✅ Artistas cargados:', artistas);
        // Convertir ArtistaExplorar a Artista para compatibilidad con el template
        this.todosLosArtistas = artistas.map(artista => ({
          id: artista.id,
          user_id: 0, // No disponible en ArtistaExplorar
          nombre: artista.nombre,
          imagen: artista.imagen,
          genero: artista.genero,
          pais: '', // No disponible en ArtistaExplorar  
          descripcion: artista.descripcion,
          created_at: '',
          updated_at: ''
        } as Artista));
        this.artistasFavoritos = this.todosLosArtistas.slice(0, 4); // Primeros 4 como favoritos por ahora
        this.cargandoArtistas = false;
      },
      error: (error: any) => {
        console.error('❌ Error cargando artistas:', error);
        this.cargandoArtistas = false;
        // Datos de fallback
        this.todosLosArtistas = [];
        this.artistasFavoritos = [];
      }
    });
  }

  private cargarPropinasRecientes() {
    if (!this.context?.userId) return;

    this.cargandoPropinasRecientes = true;

    this.propinaService.obtenerPropinasPorFan(this.context.userId).pipe(
      takeUntil(this.destroy$),
      switchMap((propinas: Propina[]) => {
        // Si no hay propinas, retornar array vacío
        if (propinas.length === 0) {
          return of([]);
        }

        // Tomar las últimas 5 propinas
        const propinasRecientes = propinas.slice(0, 5);
        
        // Obtener los IDs únicos de artistas
        const artistaIds = [...new Set(propinasRecientes.map(p => p.artista_id))];
        
        // Cargar información de todos los artistas
        return forkJoin(
          artistaIds.map(id => this.artistaService.obtenerArtistaPorId(id))
        ).pipe(
          map((artistas: Artista[]) => {
            // Crear un mapa de artistas por ID
            const artistaMap = new Map<string, Artista>();
            artistas.forEach(artista => {
              artistaMap.set(artista.id, artista);
            });

            // Combinar propinas con artistas
            return propinasRecientes.map(propina => ({
              ...propina,
              artista: artistaMap.get(propina.artista_id)!
            })) as PropinaConArtista[];
          })
        );
      })
    ).subscribe({
      next: (propinasConArtista: PropinaConArtista[]) => {
        console.log('✅ Propinas recientes cargadas:', propinasConArtista);
        this.propinasRecientes = propinasConArtista;
        this.cargandoPropinasRecientes = false;
      },
      error: (error) => {
        console.error('❌ Error cargando propinas recientes:', error);
        this.cargandoPropinasRecientes = false;
        this.propinasRecientes = [];
      }
    });
  }

  enviarPropinaRapida(artista: Artista, monto: number) {
    if (!this.context?.userId || !this.context?.userName) {
      console.warn('⚠️ No hay usuario logueado');
      alert('Debes estar logueado para enviar propinas');
      return;
    }

    console.log('⚡ Enviando propina rápida:', artista.nombre, monto);
    
    const nuevaPropina: Omit<Propina, 'id' | 'fecha' | 'estado' | 'comision' | 'monto_neto' | 'created_at'> = {
      fan_id: this.context.userId,
      nombre_fan: this.context.userName,
      artista_id: artista.id,
      cantidad: monto,
      monto: monto,
      mensaje: `Propina rápida de $${monto}`,
      metodo_pago: 'tarjeta',
      publico_en_feed: true
    };

    this.propinaService.enviarPropina(nuevaPropina).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (propina) => {
        console.log('✅ Propina enviada exitosamente:', propina);
        alert(`¡Propina de $${monto} enviada a ${artista.nombre}!`);
        // Recargar estadísticas y propinas recientes
        this.cargarEstadisticas();
        this.cargarPropinasRecientes();
      },
      error: (error: any) => {
        console.error('❌ Error enviando propina:', error);
        alert('Error al enviar la propina. Inténtalo de nuevo.');
      }
    });
  }

  seleccionarMonto(monto: number) {
    this.propinaForm.monto = monto;
    this.propinaForm.montoCustom = null;
  }

  onMontoCustomChange() {
    if (this.propinaForm.montoCustom && this.propinaForm.montoCustom > 0) {
      this.propinaForm.monto = this.propinaForm.montoCustom;
    }
  }

  seleccionarMetodoPago(metodoId: string) {
    this.propinaForm.metodoPago = metodoId;
  }

  calcularComision(): number {
    return Math.round((this.propinaForm.monto * 0.029 + 0.30) * 100) / 100;
  }

  calcularTotal(): number {
    return Math.round((this.propinaForm.monto + this.calcularComision()) * 100) / 100;
  }

  formularioValido(): boolean {
    return !!(
      this.propinaForm.artistaSeleccionado &&
      this.propinaForm.monto > 0 &&
      this.propinaForm.metodoPago
    );
  }

  enviarPropina() {
    if (!this.formularioValido()) return;

    if (!this.context?.userId || !this.context?.userName) {
      console.warn('⚠️ No hay usuario logueado');
      alert('Debes estar logueado para enviar propinas');
      return;
    }

    this.enviando = true;
    console.log('💝 Enviando propina personalizada:', this.propinaForm);

    const nuevaPropina: Omit<Propina, 'id' | 'fecha' | 'estado' | 'comision' | 'monto_neto' | 'created_at'> = {
      fan_id: this.context.userId,
      nombre_fan: this.context.userName,
      artista_id: this.propinaForm.artistaSeleccionado,
      cantidad: this.propinaForm.monto,
      monto: this.propinaForm.monto,
      mensaje: this.propinaForm.mensaje || `Propina de $${this.propinaForm.monto}`,
      cancion_dedicada: this.propinaForm.cancionDedicada ? parseInt(this.propinaForm.cancionDedicada) : undefined,
      metodo_pago: this.propinaForm.metodoPago,
      publico_en_feed: this.propinaForm.mostrarEnFeed
    };

    this.propinaService.enviarPropina(nuevaPropina).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (propina) => {
        console.log('✅ Propina enviada exitosamente:', propina);
        this.enviando = false;
        
        const artistaNombre = this.artistaSeleccionado?.nombre || 'el artista';
        alert(`¡Propina de $${this.propinaForm.monto} enviada exitosamente a ${artistaNombre}!`);
        
        // Recargar datos
        this.cargarEstadisticas();
        this.cargarPropinasRecientes();
        this.limpiarFormulario();
      },
      error: (error: any) => {
        console.error('❌ Error enviando propina:', error);
        this.enviando = false;
        alert('Error al enviar la propina. Por favor, inténtalo de nuevo.');
      }
    });
  }

  limpiarFormulario() {
    this.propinaForm = {
      artistaSeleccionado: '',
      monto: 0,
      montoCustom: null,
      cancionDedicada: '',
      mensaje: '',
      mostrarEnFeed: true,
      anonimo: false,
      metodoPago: 'tarjeta'
    };
    this.cancionesArtista = [];
  }

  repetirPropina(propina: PropinaConArtista) {
    this.propinaForm.artistaSeleccionado = propina.artista.id;
    this.propinaForm.monto = propina.monto;
    this.propinaForm.mensaje = propina.mensaje || '';
    console.log('🔄 Repetir propina:', propina.id);
  }

  obtenerEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'procesada': return 'Procesada';
      case 'rechazada': return 'Rechazada';
      default: return estado;
    }
  }

  formatearDia(fecha: Date | string): string {
    const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return dateObj.getDate().toString().padStart(2, '0');
  }

  formatearMes(fecha: Date | string): string {
    const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return meses[dateObj.getMonth()];
  }
}
