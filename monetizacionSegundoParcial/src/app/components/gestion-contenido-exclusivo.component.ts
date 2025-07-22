import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ContenidoExclusivoService } from '../services/contenido-exclusivo.service';
import { ContextService, MonetizacionContext } from '../services/context.service';
import { ContenidoExclusivoExtendido } from '../models/contenido-exclusivo.model';
import { CustomCurrencyPipe } from '../pipes/currency.pipe';
import { FileUploadComponent } from './file-upload.component';

interface ContenidoStats {
  total: number;
  activos: number;
  porTipo: { [tipo: string]: number };
  visualizacionesTotales: number;
  ingresosPotenciales: number;
}

@Component({
  selector: 'app-gestion-contenido-exclusivo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CustomCurrencyPipe, FileUploadComponent],
  template: `
    <div class="contenido-container">
      <!-- Header con estadísticas -->
      <div class="contenido-header">
        <div class="header-info">
          <h1>🔒 Gestión de Contenido Exclusivo</h1>
          <p>Administra todo tu contenido premium para suscriptores</p>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-number">{{ stats.activos }}</div>
            <div class="stat-label">Contenido Activo</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.visualizacionesTotales | number }}</div>
            <div class="stat-label">Visualizaciones</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.ingresosPotenciales | currency }}</div>
            <div class="stat-label">Ingresos Potenciales</div>
          </div>
        </div>
      </div>

      <!-- Barra de herramientas -->
      <div class="toolbar">
        <div class="filters">
          <select class="filter-select" [(ngModel)]="filtroTipo" (change)="aplicarFiltros()">
            <option value="">Todos los tipos</option>
            <option value="foto">📸 Fotos</option>
            <option value="avance_cancion">🎵 Avances de Canciones</option>
            <option value="letra_proceso">📝 Letras en Proceso</option>
            <option value="video_detras_escenas">🎬 Videos Detrás de Escenas</option>
          </select>
          <select class="filter-select" [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
            <option value="">Todos los estados</option>
            <option value="activo">✅ Activo</option>
            <option value="inactivo">❌ Inactivo</option>
          </select>
          <input 
            type="text" 
            class="search-input" 
            placeholder="🔍 Buscar contenido..."
            [(ngModel)]="busqueda"
            (input)="aplicarFiltros()"
          >
        </div>
        <button class="btn-primary" (click)="mostrarFormulario = true">
          <span class="icon">➕</span>
          Crear Contenido
        </button>
        
        <!-- BOTÓN DE DIAGNÓSTICO TEMPORAL -->
        <button class="btn-secondary" (click)="ejecutarDiagnostico()" title="Diagnosticar problemas de autenticación">
          <span class="icon">🔍</span>
          Diagnosticar Auth
        </button>
        
        <!-- BOTÓN PARA REFRESCAR SESIÓN -->
        <button class="btn-secondary" (click)="refrescarSesion()" title="Refrescar sesión de Supabase">
          <span class="icon">🔄</span>
          Refrescar Sesión
        </button>
      </div>

      <!-- Formulario de creación/edición -->
      <div class="form-overlay" *ngIf="mostrarFormulario" (click)="cerrarFormulario()">
        <div class="form-container" (click)="$event.stopPropagation()">
          <div class="form-header">
            <h3>{{ contenidoEditando ? '✏️ Editar' : '➕ Crear' }} Contenido Exclusivo</h3>
            <button class="close-btn" (click)="cerrarFormulario()">✕</button>
          </div>
          
          <form [formGroup]="contenidoForm" (ngSubmit)="guardarContenido()">
            <div class="form-grid">
              <div class="form-group">
                <label>📂 Tipo de Contenido</label>
                <select formControlName="tipoContenido" class="form-control">
                  <option value="">Selecciona un tipo</option>
                  <option value="foto">📸 Foto Exclusiva</option>
                  <option value="cancion">🎵 Canción</option>
                  <option value="album">💿 Álbum</option>
                  <option value="letra">📝 Letra</option>
                  <option value="video">🎬 Video</option>
                </select>
              </div>

              <div class="form-group">
                <label>🏷️ Título</label>
                <input type="text" formControlName="titulo" class="form-control" placeholder="Título del contenido">
              </div>

              <div class="form-group full-width">
                <label>📝 Descripción</label>
                <textarea formControlName="descripcion" class="form-control" rows="3" placeholder="Descripción detallada..."></textarea>
              </div>

              <div class="form-group full-width">
                <label>📁 Archivo Principal</label>
                <app-file-upload
                  [label]="'Subir archivo de contenido'"
                  [tipoContenido]="contenidoForm.get('tipoContenido')?.value || 'foto'"
                  [artistaId]="context?.artistaId || ''"
                  tipo="contenido"
                  (onFileUploaded)="onArchivoUploadCompleto($event)"
                  (onFileRemoved)="onArchivoRemovido()"
                  (onUploadError)="onUploadError($event)">
                </app-file-upload>
              </div>

              <div class="form-group full-width">
                <label>🖼️ Imagen de Portada (Opcional)</label>
                <app-file-upload
                  [label]="'Subir imagen de portada'"
                  tipoContenido="foto"
                  [artistaId]="context?.artistaId || ''"
                  tipo="portada"
                  (onFileUploaded)="onPortadaUploadCompleto($event)"
                  (onFileRemoved)="onPortadaRemovido()"
                  (onUploadError)="onUploadError($event)">
                </app-file-upload>
              </div>

              <div class="form-group">
                <label>👑 Nivel de Membresía Requerido</label>
                <select formControlName="nivelMembresiaRequerido" class="form-control">
                  <option value="1">🥉 Básico (Nivel 1)</option>
                  <option value="2">🥈 Premium (Nivel 2)</option>
                  <option value="3">🥇 VIP (Nivel 3)</option>
                </select>
              </div>

              <div class="form-group">
                <label>💰 Precio Individual (Opcional)</label>
                <input type="number" formControlName="precioIndividual" class="form-control" 
                       placeholder="0.00" step="0.01" min="0">
                <small class="form-text">Dejar vacío si solo disponible por membresía</small>
              </div>

              <div class="form-group">
                <label>🏷️ Tags (separados por coma)</label>
                <input type="text" formControlName="tags" class="form-control" placeholder="pop, exclusivo, detrás de cámaras">
              </div>

              <div class="form-group">
                <label>📅 Fecha de Expiración (Opcional)</label>
                <input type="datetime-local" formControlName="fechaExpiracion" class="form-control">
              </div>

              <div class="form-group">
                <label>🎵 Canción Relacionada (Opcional)</label>
                <select formControlName="cancionRelacionada" class="form-control">
                  <option value="">Sin relación</option>
                  <option value="1">Mi Primera Canción</option>
                  <option value="2">Balada del Corazón</option>
                  <option value="3">Rock en Español</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="cerrarFormulario()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="!contenidoForm.valid">
                {{ contenidoEditando ? 'Actualizar' : 'Crear' }} Contenido
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Lista de contenido -->
      <div class="contenido-grid">
        <div class="contenido-card" *ngFor="let contenido of contenidosFiltrados">
          <div class="card-header">
            <div class="content-type-badge" [class]="'type-' + contenido.tipo_contenido">
              {{ getTipoIcon(contenido.tipo_contenido) }} {{ getTipoLabel(contenido.tipo_contenido) }}
            </div>
            <div class="card-actions">
              <button class="action-btn" (click)="editarContenido(contenido)" title="Editar">✏️</button>
              <button class="action-btn" (click)="toggleEstado(contenido)" [title]="contenido.activo ? 'Desactivar' : 'Activar'">
                {{ contenido.activo ? '🔴' : '🟢' }}
              </button>
              <button class="action-btn danger" (click)="eliminarContenido(contenido)" title="Eliminar">🗑️</button>
            </div>
          </div>

          <div class="card-content">
            <div class="content-preview" *ngIf="contenido.imagen_portada">
              <img [src]="contenido.imagen_portada" [alt]="contenido.titulo" class="preview-image">
            </div>
            <div class="content-preview placeholder" *ngIf="!contenido.imagen_portada">
              <span class="placeholder-icon">{{ getTipoIcon(contenido.tipo_contenido) }}</span>
            </div>

            <div class="content-info">
              <h3 class="content-title">{{ contenido.titulo }}</h3>
              <p class="content-description">{{ contenido.descripcion }}</p>
              
              <div class="content-meta">
                <div class="meta-row">
                  <span class="meta-label">👑 Nivel:</span>
                  <span class="nivel-badge" [class]="'nivel-' + contenido.nivel_acceso_requerido">
                    {{ getNivelLabel(contenido.nivel_acceso_requerido) }}
                  </span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">📅 Publicado:</span>
                  <span>{{ contenido.fechaPublicacion | date:'short' }}</span>
                </div>
                <div class="meta-row" *ngIf="contenido.fechaExpiracion">
                  <span class="meta-label">⏰ Expira:</span>
                  <span>{{ contenido.fechaExpiracion | date:'short' }}</span>
                </div>
              </div>

              <div class="content-stats">
                <div class="stat-item">
                  <span class="stat-icon">👁️</span>
                  <span class="stat-value">{{ contenido.visualizaciones | number }}</span>
                  <span class="stat-text">vistas</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">💰</span>
                  <span class="stat-value">{{ calcularIngresosPotenciales(contenido) | currency }}</span>
                  <span class="stat-text">potenciales</span>
                </div>
              </div>

              <div class="content-tags" *ngIf="contenido.tags && contenido.tags.length > 0">
                <span class="tag" *ngFor="let tag of contenido.tags">🏷️ {{ tag }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div class="empty-state" *ngIf="contenidosFiltrados.length === 0">
          <div class="empty-icon">📭</div>
          <h3>No hay contenido exclusivo</h3>
          <p>{{ contenidos.length === 0 ? 'Comienza creando tu primer contenido exclusivo' : 'No se encontró contenido con los filtros aplicados' }}</p>
          <button class="btn-primary" (click)="mostrarFormulario = true" *ngIf="contenidos.length === 0">
            <span class="icon">➕</span>
            Crear Primer Contenido
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contenido-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Header */
    .contenido-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e9ecef;
    }

    .header-info h1 {
      color: #348e91;
      margin: 0 0 0.5rem 0;
      font-size: 2.2rem;
      font-weight: 700;
    }

    .header-info p {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
    }

    .header-stats {
      display: flex;
      gap: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      text-align: center;
      min-width: 120px;
    }

    .stat-number {
      font-size: 1.8rem;
      font-weight: 700;
      color: #348e91;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }

    .filters {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .filter-select, .search-input {
      padding: 0.75rem 1rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.3s ease;
    }

    .filter-select:focus, .search-input:focus {
      border-color: #348e91;
    }

    .search-input {
      min-width: 250px;
    }

    .btn-primary {
      background: #348e91;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      background: #2a7174;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: transparent;
      color: #666;
      border: 2px solid #e9ecef;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      border-color: #348e91;
      color: #348e91;
    }

    /* Formulario Modal */
    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .form-container {
      background: white;
      border-radius: 12px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem;
      border-bottom: 1px solid #e9ecef;
    }

    .form-header h3 {
      margin: 0;
      color: #348e91;
      font-size: 1.4rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: #f8f9fa;
      color: #333;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      padding: 2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .form-control {
      padding: 0.75rem 1rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      border-color: #348e91;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 2rem;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    /* Grid de contenido */
    .contenido-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 2rem;
    }

    .contenido-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .contenido-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .content-type-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      color: white;
    }

    .type-foto { background: #e74c3c; }
    .type-avance_cancion { background: #3498db; }
    .type-letra_proceso { background: #f39c12; }
    .type-video_detras_escenas { background: #9b59b6; }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: rgba(52, 142, 145, 0.1);
    }

    .action-btn.danger:hover {
      background: rgba(231, 76, 60, 0.1);
    }

    .card-content {
      padding: 1.5rem;
    }

    .content-preview {
      width: 100%;
      height: 150px;
      margin-bottom: 1rem;
      border-radius: 8px;
      overflow: hidden;
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .content-preview.placeholder {
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed #e9ecef;
    }

    .placeholder-icon {
      font-size: 3rem;
      color: #ccc;
    }

    .content-title {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .content-description {
      margin: 0 0 1rem 0;
      color: #666;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .content-meta {
      margin-bottom: 1rem;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .meta-label {
      font-weight: 500;
      color: #333;
    }

    .nivel-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      color: white;
    }

    .nivel-1 { background: #cd7f32; }
    .nivel-2 { background: #c0c0c0; }
    .nivel-3 { background: #ffd700; }
    .nivel-4 { background: #b9f2ff; color: #333; }

    .content-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .stat-icon {
      font-size: 1.2rem;
    }

    .stat-value {
      font-weight: 600;
      color: #348e91;
    }

    .stat-text {
      font-size: 0.8rem;
      color: #666;
    }

    .content-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      background: #e9ecef;
      color: #666;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    /* Estado vacío */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 2rem 0;
      color: #666;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .contenido-container {
        padding: 1rem;
      }

      .contenido-header {
        flex-direction: column;
        gap: 1rem;
      }

      .header-stats {
        width: 100%;
        justify-content: space-around;
      }

      .toolbar {
        flex-direction: column;
        gap: 1rem;
      }

      .filters {
        width: 100%;
        flex-wrap: wrap;
      }

      .search-input {
        min-width: 200px;
      }

      .contenido-grid {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GestionContenidoExclusivoComponent implements OnInit, OnDestroy {
  @Input() context: MonetizacionContext | null = null;

  contenidos: ContenidoExclusivoExtendido[] = [];
  contenidosFiltrados: ContenidoExclusivoExtendido[] = [];
  stats: ContenidoStats = {
    total: 0,
    activos: 0,
    porTipo: {},
    visualizacionesTotales: 0,
    ingresosPotenciales: 0
  };

  mostrarFormulario = false;
  contenidoEditando: ContenidoExclusivoExtendido | null = null;
  contenidoForm: FormGroup;

  // URLs de archivos subidos
  archivoUrl: string = '';
  imagenPortadaUrl: string = '';
  archivoPaths: { contenido?: string; portada?: string } = {};

  // Filtros
  filtroTipo = '';
  filtroEstado = '';
  busqueda = '';

  private subscription = new Subscription();

  constructor(
    private contenidoService: ContenidoExclusivoService,
    private contextService: ContextService,
    private fb: FormBuilder
  ) {
    this.contenidoForm = this.fb.group({
      tipoContenido: ['', Validators.required],
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      nivelMembresiaRequerido: [1, Validators.required],
      precioIndividual: [null],
      tags: [''],
      fechaExpiracion: [''],
      cancionRelacionada: ['']
    });
  }

  ngOnInit(): void {
    this.cargarContenido();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private cargarContenido(): void {
    console.log('🔍 GestionContenidoComponent: Intentando cargar contenido...');
    console.log('📋 Contexto actual:', this.context);
    
    if (!this.context?.artistaId) {
      console.warn('⚠️ No se puede cargar contenido: artistaId no disponible');
      console.log('💡 Posibles soluciones:');
      console.log('1. Verificar que la URL tenga el parámetro artistaId');
      console.log('2. Verificar que el contexto se esté inicializando correctamente');
      return;
    }

    console.log('✅ ArtistaId encontrado:', this.context.artistaId);

    this.subscription.add(
      this.contenidoService.obtenerContenidoPorArtista(this.context.artistaId)
        .pipe(
          catchError(error => {
            console.error('❌ Error cargando contenido en componente:', error);
            return of([]);
          })
        )
        .subscribe(contenidos => {
          console.log('📦 Contenidos recibidos en componente:', contenidos);
          console.log('🔍 Verificando imagen_portada en contenidos:', contenidos.map(c => ({ id: c.id, imagen_portada: c.imagen_portada })));
          this.contenidos = contenidos;
          this.aplicarFiltros();
          this.calcularEstadisticas();
        })
    );
  }

  aplicarFiltros(): void {
    let filtrados = [...this.contenidos];

    if (this.filtroTipo) {
      filtrados = filtrados.filter(c => c.tipo_contenido === this.filtroTipo);
    }

    if (this.filtroEstado === 'activo') {
      filtrados = filtrados.filter(c => c.activo);
    } else if (this.filtroEstado === 'inactivo') {
      filtrados = filtrados.filter(c => !c.activo);
    }

    if (this.busqueda) {
      const termino = this.busqueda.toLowerCase();
      filtrados = filtrados.filter(c => 
        c.descripcion.toLowerCase().includes(termino)
      );
    }

    this.contenidosFiltrados = filtrados;
  }

  private calcularEstadisticas(): void {
    this.stats.total = this.contenidos.length;
    this.stats.activos = this.contenidos.filter(c => c.activo).length;
    this.stats.visualizacionesTotales = 0; // No disponible en modelo base
    this.stats.ingresosPotenciales = this.contenidos.reduce((sum, c) => sum + this.calcularIngresosPotenciales(c), 0);

    this.stats.porTipo = this.contenidos.reduce((acc, c) => {
      acc[c.tipo_contenido] = (acc[c.tipo_contenido] || 0) + 1;
      return acc;
    }, {} as { [tipo: string]: number });
  }

  calcularIngresosPotenciales(contenido: ContenidoExclusivoExtendido): number {
    const basePrice = contenido.nivel_acceso_requerido * 5;
    const priceMultiplier = contenido.precio_individual || 0;
    return basePrice + priceMultiplier;
  }

  getTipoIcon(tipo: string): string {
    const icons = {
      'foto': '📸',
      'avance_cancion': '🎵',
      'letra_proceso': '📝',
      'video_detras_escenas': '🎬'
    };
    return icons[tipo as keyof typeof icons] || '📄';
  }

  getTipoLabel(tipo: string): string {
    const labels = {
      'foto': 'Foto',
      'avance_cancion': 'Avance',
      'letra_proceso': 'Letra',
      'video_detras_escenas': 'Video'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  }

  getNivelLabel(nivel: number): string {
    const labels = {
      1: '🥉 Bronce',
      2: '🥈 Plata', 
      3: '🥇 Oro',
      4: '💎 Diamante'
    };
    return labels[nivel as keyof typeof labels] || `Nivel ${nivel}`;
  }

  editarContenido(contenido: ContenidoExclusivoExtendido): void {
    this.contenidoEditando = contenido;
    this.contenidoForm.patchValue({
      tipoContenido: contenido.tipo_contenido,
      titulo: contenido.titulo || contenido.descripcion,
      descripcion: contenido.descripcion,
      archivoUrl: contenido.archivoUrl || '',
      imagenPortada: contenido.imagen_portada || '',
      nivelMembresiaRequerido: contenido.nivel_acceso_requerido,
      precioIndividual: contenido.precio_individual || null,
      tags: contenido.tags?.join(', ') || '',
      fechaExpiracion: contenido.fechaExpiracion ? new Date(contenido.fechaExpiracion).toISOString().slice(0, 16) : ''
    });
    this.mostrarFormulario = true;
  }

  guardarContenido(): void {
    if (!this.contenidoForm.valid || !this.context?.artistaId) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar que se haya subido al menos el archivo principal
    if (!this.archivoUrl) {
      alert('Por favor sube el archivo principal antes de continuar');
      return;
    }

    const formData = this.contenidoForm.value;
    
    // Mapear los datos del formulario al modelo ContenidoExclusivo
    const contenidoData = {
      artista_id: this.context.artistaId,
      contenido_id: `contenido_${Date.now()}`, // Generar ID único
      tipo_contenido: formData.tipoContenido,
      descripcion: formData.descripcion || '',
      nivel_acceso_requerido: parseInt(formData.nivelMembresiaRequerido) || 1,
      precio_individual: formData.precioIndividual ? parseFloat(formData.precioIndividual) : undefined,
      imagen_portada: this.imagenPortadaUrl || undefined, // ✅ AGREGADO: Campo imagen_portada
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Si estamos usando el modelo extendido en el futuro, podríamos agregar:
    const contenidoExtendido = {
      ...contenidoData,
      titulo: formData.titulo,
      archivoUrl: this.archivoUrl,
      imagenPortada: this.imagenPortadaUrl || undefined,
      tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
      fechaExpiracion: formData.fechaExpiracion ? new Date(formData.fechaExpiracion) : undefined,
      cancionRelacionada: formData.cancionRelacionada ? parseInt(formData.cancionRelacionada) : undefined,
      visualizaciones: 0
    };

    console.log('📝 Enviando datos a Supabase:', {
      contenidoBasico: contenidoData,
      archivos: {
        principal: this.archivoUrl,
        portada: this.imagenPortadaUrl,
        paths: this.archivoPaths
      }
    });

    const operacion = this.contenidoEditando
      ? this.contenidoService.actualizarContenido(this.contenidoEditando.id, contenidoData)
      : this.contenidoService.crearContenido(contenidoData);

    this.subscription.add(
      operacion.subscribe({
        next: (resultado) => {
          console.log('✅ Contenido guardado exitosamente:', resultado);
          this.cargarContenido();
          this.cerrarFormulario();
          // Mostrar mensaje de éxito más detallado
          const mensaje = this.contenidoEditando 
            ? '¡Contenido actualizado exitosamente!' 
            : '¡Contenido creado exitosamente!';
          alert(mensaje);
        },
        error: (error) => {
          console.error('❌ Error guardando contenido:', error);
          alert(`Error al guardar el contenido: ${error.message || 'Error desconocido'}`);
        }
      })
    );
  }

  toggleEstado(contenido: ContenidoExclusivoExtendido): void {
    const nuevoEstado = !contenido.activo;
    this.subscription.add(
      this.contenidoService.actualizarContenido(contenido.id, { activo: nuevoEstado }).subscribe({
        next: () => {
          contenido.activo = nuevoEstado;
          this.calcularEstadisticas();
          this.aplicarFiltros();
        },
        error: (error) => {
          console.error('Error actualizando estado:', error);
        }
      })
    );
  }

  eliminarContenido(contenido: ContenidoExclusivoExtendido): void {
    if (confirm(`¿Estás seguro de que quieres eliminar este contenido?`)) {
      this.subscription.add(
        this.contenidoService.desactivarContenido(contenido.id).subscribe({
          next: () => {
            this.cargarContenido();
          },
          error: (error) => {
            console.error('Error eliminando contenido:', error);
          }
        })
      );
    }
  }

  // ===============================================
  // MÉTODOS PARA MANEJO DE ARCHIVOS
  // ===============================================

  onArchivoUploadCompleto(result: { url: string; path: string }): void {
    console.log('📁 Archivo principal subido:', result);
    this.archivoUrl = result.url;
    this.archivoPaths.contenido = result.path;
  }

  onPortadaUploadCompleto(result: { url: string; path: string }): void {
    console.log('🖼️ Imagen de portada subida:', result);
    this.imagenPortadaUrl = result.url;
    this.archivoPaths.portada = result.path;
  }

  onArchivoRemovido(): void {
    console.log('🗑️ Archivo principal removido');
    this.archivoUrl = '';
    this.archivoPaths.contenido = undefined;
  }

  onPortadaRemovido(): void {
    console.log('🗑️ Imagen de portada removida');
    this.imagenPortadaUrl = '';
    this.archivoPaths.portada = undefined;
  }

  onUploadError(error: string): void {
    console.error('❌ Error en upload:', error);
    alert(`Error al subir archivo: ${error}`);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.contenidoEditando = null;
    this.contenidoForm.reset();
    this.contenidoForm.patchValue({ nivelMembresiaRequerido: 1 });
    
    // Limpiar URLs de archivos
    this.archivoUrl = '';
    this.imagenPortadaUrl = '';
    this.archivoPaths = {};
  }

  navegarADashboard(): void {
    this.contextService.updateSection('dashboard');
  }

  /**
   * MÉTODO TEMPORAL PARA DIAGNÓSTICO
   * Ejecuta el diagnóstico de autenticación
   */
  async ejecutarDiagnostico(): Promise<void> {
    console.log('🚀 Ejecutando diagnóstico desde componente...');
    await this.contextService.diagnosticarAutenticacion();
    alert('Diagnóstico completado. Revisa la consola para ver los resultados.');
  }

  /**
   * MÉTODO TEMPORAL PARA DESARROLLO
   * Refresca la sesión de Supabase
   */
  async refrescarSesion(): Promise<void> {
    console.log('🔄 Refrescando sesión desde componente...');
    await this.contextService.refrescarSesion();
    
    // Recargar el contexto
    if (this.context?.artistaId && this.context.artistaId !== 'artista-123') {
      this.cargarContenido();
      alert('Sesión refrescada exitosamente.');
    } else {
      alert('Sesión refrescada, pero aún no se encontró UUID válido.');
    }
  }
}
