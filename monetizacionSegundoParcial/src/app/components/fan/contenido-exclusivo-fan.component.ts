import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { ContextService, MonetizacionContext } from '../../services/context.service';
import { ContenidoExclusivoService } from '../../services/contenido-exclusivo.service';
import { ContenidoExclusivo } from '../../models/contenido-exclusivo.model';
import { AccesoContenido, ValidacionAcceso } from '../../models/acceso-contenido.model';
import { ArtistaService } from '../../services/artista.service';
import { Artista } from '../../models/artista.model';

@Component({
  selector: 'app-contenido-exclusivo-fan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contenido-exclusivo" *ngIf="context">
      <!-- Header -->
      <div class="header">
        <h1>⭐ Mi Contenido Exclusivo</h1>
        <p class="subtitle">Disfruta del contenido premium de tus artistas favoritos</p>
      </div>

      <!-- Stats Overview -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎵</div>
            <div class="stat-content">
              <h3>{{ estadisticas.contenidoTotal }}</h3>
              <p>Contenidos disponibles</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <h3>{{ estadisticas.contenidoNuevo }}</h3>
              <p>Nuevos esta semana</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">❤️</div>
            <div class="stat-content">
              <h3>{{ estadisticas.favoritos }}</h3>
              <p>En favoritos</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ estadisticas.artistasSuscritos }}</h3>
              <p>Artistas suscritos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter and Search -->
      <div class="filter-section">
        <div class="filter-controls">
          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="filtros.busqueda"
              (input)="aplicarFiltros()"
              placeholder="🔍 Buscar contenido..."
              class="search-input"
            >
          </div>
          
          <div class="filter-tabs">
            <button 
              class="filter-tab"
              *ngFor="let tab of tabs"
              [class.active]="filtros.tipoActivo === tab.id"
              (click)="cambiarTab(tab.id)"
            >
              {{ tab.icono }} {{ tab.nombre }}
              <span class="tab-count" *ngIf="tab.count > 0">{{ tab.count }}</span>
            </button>
          </div>

          <div class="filter-options">
            <select [(ngModel)]="filtros.artista" (change)="aplicarFiltros()" class="filter-select">
              <option value="">Todos los artistas</option>
              <option *ngFor="let artista of artistasSuscritos" [value]="artista.id">
                {{ artista.nombre }}
              </option>
            </select>

            <select [(ngModel)]="filtros.ordenamiento" (change)="aplicarFiltros()" class="filter-select">
              <option value="reciente">Más reciente</option>
              <option value="popular">Más popular</option>
              <option value="nombre">Por nombre</option>
            </select>

            <div class="view-toggle">
              <button 
                class="view-btn"
                [class.active]="vista === 'grid'"
                (click)="vista = 'grid'"
              >
                📋
              </button>
              <button 
                class="view-btn"
                [class.active]="vista === 'list'"
                (click)="vista = 'list'"
              >
                📄
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-section">
        <div [ngClass]="'content-' + vista" *ngIf="contenidoFiltrado.length > 0; else noContent">
          <div 
            class="content-item" 
            *ngFor="let contenido of contenidoFiltrado; trackBy: trackByContentId"
            [class]="contenido.tipo"
          >
            <!-- Content Thumbnail -->
            <div class="content-thumbnail" (click)="reproducirContenido(contenido)">
              <img [src]="contenido.thumbnail" [alt]="contenido.titulo">
              <div class="thumbnail-overlay">
                <div class="play-button">
                  {{ getPlayIcon(contenido.tipo) }}
                </div>
                <div class="content-duration" *ngIf="contenido.duracion">
                  {{ formatearDuracion(contenido.duracion) }}
                </div>
              </div>
              <div class="content-badge" [class]="contenido.tipo">
                {{ getBadgeText(contenido.tipo) }}
              </div>
            </div>

            <!-- Content Info -->
            <div class="content-info">
              <div class="content-header">
                <h3 class="content-title">{{ contenido.titulo }}</h3>
                <div class="content-actions">
                  <button 
                    class="action-btn favorite"
                    [class.active]="contenido.esFavorito"
                    (click)="toggleFavorito(contenido)"
                    title="Favoritos"
                  >
                    {{ contenido.esFavorito ? '❤️' : '🤍' }}
                  </button>
                  <button class="action-btn" (click)="compartirContenido(contenido)" title="Compartir">
                    📤
                  </button>
                  <button class="action-btn" (click)="descargarContenido(contenido)" title="Descargar">
                    💾
                  </button>
                  <button class="action-btn" (click)="mostrarOpciones(contenido)" title="Más opciones">
                    ⋮
                  </button>
                </div>
              </div>

              <div class="content-artist" *ngIf="contenido.artista">
                <img [src]="contenido.artista.imagen" [alt]="contenido.artista.nombre" class="artist-avatar">
                <span class="artist-name">{{ contenido.artista.nombre }}</span>
                <span class="release-date">• {{ formatearFecha(contenido.fechaPublicacion) }}</span>
              </div>

              <p class="content-description" *ngIf="contenido.descripcion">
                {{ contenido.descripcion }}
              </p>

              <div class="content-meta">
                <div class="meta-stats">
                  <span class="stat">👁️ {{ contenido.visualizaciones }}</span>
                  <span class="stat">❤️ {{ contenido.likes }}</span>
                  <span class="stat" *ngIf="contenido.comentarios">💬 {{ contenido.comentarios }}</span>
                </div>
                <div class="meta-tags" *ngIf="contenido.tags && contenido.tags.length > 0">
                  <span class="tag" *ngFor="let tag of (contenido.tags || []).slice(0, 3)">
                    #{{ tag }}
                  </span>
                </div>
              </div>

              <!-- Progress Bar for Partially Consumed Content -->
              <div class="progress-section" *ngIf="contenido.progreso > 0">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="contenido.progreso"></div>
                </div>
                <small class="progress-text">{{ contenido.progreso }}% completado</small>
              </div>

              <!-- Quick Actions -->
              <div class="quick-actions" *ngIf="vista === 'list'">
                <button class="btn-primary" (click)="reproducirContenido(contenido)">
                  {{ getActionText(contenido.tipo) }}
                </button>
                <button class="btn-secondary" (click)="anadirALista(contenido)">
                  ➕ Lista
                </button>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noContent>
          <div class="empty-state">
            <div class="empty-icon">⭐</div>
            <h3>No se encontró contenido</h3>
            <p *ngIf="filtros.busqueda || filtros.artista">
              Prueba ajustando los filtros de búsqueda
            </p>
            <p *ngIf="!filtros.busqueda && !filtros.artista">
              Suscríbete a artistas para acceder a su contenido exclusivo
            </p>
            <button class="btn-primary" (click)="limpiarFiltros()">
              🔄 Limpiar filtros
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Recently Played -->
      <div class="recently-played-section" *ngIf="contenidoReciente.length > 0">
        <h2>🕒 Reproducido Recientemente</h2>
        <div class="recent-content-scroll">
          <div 
            class="recent-item"
            *ngFor="let contenido of contenidoReciente"
            (click)="reproducirContenido(contenido)"
          >
            <img [src]="contenido.thumbnail" [alt]="contenido.titulo">
            <div class="recent-info">
              <h4>{{ contenido.titulo }}</h4>
              <p *ngIf="contenido.artista">{{ contenido.artista.nombre }}</p>
              <small>{{ formatearFechaRelativa(contenido.ultimaReproduccion) }}</small>
            </div>
            <div class="recent-progress" *ngIf="contenido.progreso > 0">
              <div class="mini-progress">
                <div class="mini-progress-fill" [style.width.%]="contenido.progreso"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Playlists and Collections -->
      <div class="playlists-section">
        <h2>📚 Mis Colecciones</h2>
        <div class="playlists-grid">
          <div class="playlist-item" *ngFor="let playlist of misPlaylists">
            <div class="playlist-cover" (click)="abrirPlaylist(playlist)">
              <div class="playlist-thumbnails">
                <img 
                  *ngFor="let thumb of (playlist.thumbnails || []).slice(0, 4)" 
                  [src]="thumb" 
                  [alt]="playlist.nombre"
                >
              </div>
              <div class="playlist-overlay">
                <div class="play-button">▶️</div>
                <span class="playlist-count">{{ playlist.cantidad }} elementos</span>
              </div>
            </div>
            <div class="playlist-info">
              <h4>{{ playlist.nombre }}</h4>
              <p>{{ playlist.descripcion }}</p>
              <small>Actualizada {{ formatearFechaRelativa(playlist.ultimaActualizacion) }}</small>
            </div>
          </div>

          <!-- Create New Playlist Button -->
          <div class="playlist-item create-playlist" (click)="crearNuevaPlaylist()">
            <div class="create-playlist-icon">➕</div>
            <h4>Crear Nueva Lista</h4>
            <p>Organiza tu contenido favorito</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contenido-exclusivo {
      padding: 2rem;
      max-width: 1400px;
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

    .filter-section {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .filter-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .search-input {
      width: 100%;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 1rem;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-tab {
      background: #f8f9fa;
      border: 2px solid #e0e0e0;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .filter-tab.active {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }

    .tab-count {
      background: rgba(255,255,255,0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .filter-options {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
    }

    .view-toggle {
      display: flex;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .view-btn {
      background: white;
      border: none;
      padding: 0.75rem 1rem;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .view-btn.active {
      background: #667eea;
      color: white;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .content-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .content-item {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .content-item:hover {
      transform: translateY(-4px);
    }

    .content-list .content-item {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 1rem;
      align-items: start;
    }

    .content-thumbnail {
      position: relative;
      cursor: pointer;
      aspect-ratio: 16/9;
      overflow: hidden;
    }

    .content-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumbnail-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .content-thumbnail:hover .thumbnail-overlay {
      opacity: 1;
    }

    .play-button {
      font-size: 3rem;
      color: white;
    }

    .content-duration {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .content-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .content-badge.audio {
      background: #667eea;
      color: white;
    }

    .content-badge.video {
      background: #e74c3c;
      color: white;
    }

    .content-badge.imagen {
      background: #f39c12;
      color: white;
    }

    .content-badge.texto {
      background: #27ae60;
      color: white;
    }

    .content-info {
      padding: 1.5rem;
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .content-title {
      font-size: 1.2rem;
      color: #333;
      margin: 0;
      flex: 1;
    }

    .content-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background 0.3s ease;
    }

    .action-btn:hover {
      background: rgba(0,0,0,0.1);
    }

    .action-btn.favorite.active {
      color: #e74c3c;
    }

    .content-artist {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .artist-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
    }

    .artist-name {
      font-weight: 600;
      color: #333;
    }

    .release-date {
      color: #666;
      font-size: 0.9rem;
    }

    .content-description {
      color: #666;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .content-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .meta-stats {
      display: flex;
      gap: 1rem;
    }

    .stat {
      font-size: 0.9rem;
      color: #666;
    }

    .meta-tags {
      display: flex;
      gap: 0.5rem;
    }

    .tag {
      background: #f0f4ff;
      color: #667eea;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .progress-section {
      margin-bottom: 1rem;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: #667eea;
      transition: width 0.3s ease;
    }

    .progress-text {
      color: #666;
      font-size: 0.8rem;
    }

    .quick-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #333;
      border: 2px solid #e0e0e0;
    }

    .recently-played-section {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .recent-content-scroll {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      padding-bottom: 1rem;
    }

    .recent-item {
      min-width: 200px;
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 12px;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .recent-item:hover {
      transform: scale(1.02);
    }

    .recent-item img {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 0.75rem;
    }

    .recent-info h4 {
      margin: 0 0 0.25rem 0;
      color: #333;
      font-size: 1rem;
    }

    .recent-info p {
      margin: 0 0 0.25rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .recent-info small {
      color: #888;
      font-size: 0.8rem;
    }

    .mini-progress {
      width: 100%;
      height: 2px;
      background: #e0e0e0;
      border-radius: 1px;
      overflow: hidden;
      margin-top: 0.5rem;
    }

    .mini-progress-fill {
      height: 100%;
      background: #667eea;
    }

    .playlists-section {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .playlists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .playlist-item {
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .playlist-item:hover {
      transform: translateY(-4px);
    }

    .playlist-cover {
      position: relative;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .playlist-thumbnails {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      height: 100%;
    }

    .playlist-thumbnails img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .playlist-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .playlist-cover:hover .playlist-overlay {
      opacity: 1;
    }

    .playlist-count {
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .create-playlist {
      border: 2px dashed #ccc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      border-radius: 12px;
      color: #666;
    }

    .create-playlist-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .content-list .content-item {
        grid-template-columns: 1fr;
      }
      
      .filter-options {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class ContenidoExclusivoFanComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  context: MonetizacionContext | null = null;
  vista: 'grid' | 'list' = 'grid';

  // Estados
  estadisticas = {
    contenidoTotal: 0,
    contenidoNuevo: 0,
    favoritos: 0,
    artistasSuscritos: 0
  };

  // Filtros
  filtros = {
    busqueda: '',
    tipoActivo: 'todo',
    artista: '',
    ordenamiento: 'reciente'
  };

  // Nuevas propiedades para integración real
  contenidosDisponibles: ContenidoExclusivo[] = [];
  misAccesos: AccesoContenido[] = [];
  cargandoContenido = false;
  cargandoAcceso = false;
  
  // Mantenemos algunas propiedades existentes para compatibilidad
  todoElContenido: any[] = [];
  contenidoFiltrado: any[] = [];
  contenidoReciente: any[] = [];
  artistasSuscritos: any[] = [];
  misPlaylists: any[] = [];

  // Configuración
  tabs = [
    { id: 'todo', icono: '📦', nombre: 'Todo', count: 0 },
    { id: 'audio', icono: '🎵', nombre: 'Audio', count: 0 },
    { id: 'video', icono: '🎥', nombre: 'Video', count: 0 },
    { id: 'imagen', icono: '📸', nombre: 'Imágenes', count: 0 },
    { id: 'texto', icono: '📝', nombre: 'Texto', count: 0 }
  ];

  constructor(
    private contextService: ContextService,
    private contenidoService: ContenidoExclusivoService,
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

  private cargarDatos() {
    if (!this.context?.userId) {
      console.warn('⚠️ No hay usuario logueado');
      return;
    }

    console.log('🔄 Cargando datos de contenido exclusivo para usuario:', this.context.userId);
    this.cargandoContenido = true;

    // Obtener artistas disponibles para explorar contenido
    this.artistaService.obtenerArtistasParaExplorar(this.context.userId).pipe(
      takeUntil(this.destroy$),
      switchMap(artistas => {
        console.log('✅ Artistas obtenidos:', artistas.length);
        
        // Obtener contenido de todos los artistas
        const contenidoObservables = artistas.map(artista =>
          this.contenidoService.obtenerContenidoPorArtista(artista.id).pipe(
            map(contenidos => ({ artista, contenidos }))
          )
        );

        if (contenidoObservables.length === 0) {
          return forkJoin([]);
        }

        return forkJoin(contenidoObservables);
      })
    ).subscribe({
      next: (resultados: any[]) => {
        console.log('✅ Contenido cargado:', resultados);
        
        // Procesar contenidos y combinar con artistas
        this.contenidosDisponibles = [];
        this.todoElContenido = [];
        
        let totalContenido = 0;
        let contenidoNuevo = 0;
        const artistasConContenido = new Set<string>();

        resultados.forEach(({ artista, contenidos }) => {
          contenidos.forEach((contenido: ContenidoExclusivo) => {
            this.contenidosDisponibles.push(contenido);
            artistasConContenido.add(artista.id);
            totalContenido++;

            // Verificar si es contenido nuevo (últimos 7 días)
            const fechaCreacion = new Date(contenido.created_at);
            const hace7Dias = new Date();
            hace7Dias.setDate(hace7Dias.getDate() - 7);
            
            if (fechaCreacion > hace7Dias) {
              contenidoNuevo++;
            }

            // Convertir a formato compatible con UI existente
            this.todoElContenido.push({
              id: contenido.id,
              tipo: this.mapearTipoContenido(contenido.tipo_contenido),
              titulo: contenido.descripcion,
              descripcion: contenido.descripcion,
              thumbnail: contenido.imagen_portada || `https://via.placeholder.com/300x169/667eea/ffffff?text=${encodeURIComponent(contenido.tipo_contenido.toUpperCase())}`,
              artista: {
                id: artista.id,
                nombre: artista.nombre,
                imagen: artista.imagen || `https://via.placeholder.com/30x30/667eea/ffffff?text=${encodeURIComponent(artista.nombre.charAt(0))}`
              },
              fechaPublicacion: new Date(contenido.created_at),
              nivelAcceso: contenido.nivel_acceso_requerido,
              precioIndividual: contenido.precio_individual,
              contenidoOriginal: contenido,
              visualizaciones: 0, // Por ahora 0, se puede mejorar con estadísticas
              likes: 0,
              comentarios: 0,
              tags: [contenido.tipo_contenido, 'nivel-' + contenido.nivel_acceso_requerido],
              progreso: 0,
              esFavorito: false
            });
          });
        });

        // Actualizar estadísticas
        this.estadisticas = {
          contenidoTotal: totalContenido,
          contenidoNuevo: contenidoNuevo,
          favoritos: 0, // Por implementar
          artistasSuscritos: artistasConContenido.size
        };

        // Crear lista de artistas suscritos
        this.artistasSuscritos = Array.from(artistasConContenido).map(artistaId => {
          const artista = resultados.find(r => r.artista.id === artistaId)?.artista;
          return artista ? {
            id: artista.id,
            nombre: artista.nombre,
            imagen: artista.imagen || `https://via.placeholder.com/30x30/667eea/ffffff?text=${encodeURIComponent(artista.nombre.charAt(0))}`
          } : null;
        }).filter(Boolean);

        // Contenido reciente (últimas 5 piezas)
        this.contenidoReciente = this.todoElContenido
          .sort((a, b) => b.fechaPublicacion.getTime() - a.fechaPublicacion.getTime())
          .slice(0, 5);

        // Playlists simuladas
        this.misPlaylists = [
          {
            id: 'fav-1',
            nombre: 'Mis Favoritos',
            imagen: 'https://via.placeholder.com/60x60/f093fb/ffffff?text=♡',
            contenidos: 0,
            thumbnails: [
              'https://via.placeholder.com/30x30/f093fb/ffffff?text=1',
              'https://via.placeholder.com/30x30/764ba2/ffffff?text=2'
            ]
          },
          {
            id: 'rec-1',
            nombre: 'Escuchado Recientemente',
            imagen: 'https://via.placeholder.com/60x60/4facfe/ffffff?text=♪',
            contenidos: 0,
            thumbnails: [
              'https://via.placeholder.com/30x30/4facfe/ffffff?text=1',
              'https://via.placeholder.com/30x30/667eea/ffffff?text=2'
            ]
          }
        ];

        // Actualizar conteos de tabs
        this.actualizarContadores();
        this.aplicarFiltros();
        this.cargandoContenido = false;

        console.log('✅ Datos cargados exitosamente:', {
          totalContenido,
          contenidoNuevo,
          artistasSuscritos: artistasConContenido.size
        });
      },
      error: (error) => {
        console.error('❌ Error cargando contenido exclusivo:', error);
        this.cargandoContenido = false;
        
        // Mostrar datos simulados en caso de error
        this.cargarDatosSimulados();
      }
    });
  }

  // Método auxiliar para cargar datos simulados en caso de error
  private cargarDatosSimulados() {
    console.log('📋 Cargando datos simulados...');
    
    // Estadísticas simuladas
    this.estadisticas = {
      contenidoTotal: 12,
      contenidoNuevo: 3,
      favoritos: 5,
      artistasSuscritos: 2
    };

    // Simular artistas suscritos
    this.artistasSuscritos = [
      {
        id: '1',
        nombre: 'Luna Nocturna',
        imagen: 'https://via.placeholder.com/30x30/667eea/ffffff?text=LN'
      },
      {
        id: '2',
        nombre: 'Beats Underground',
        imagen: 'https://via.placeholder.com/30x30/764ba2/ffffff?text=BU'
      }
    ];

    // Simular contenido
    this.todoElContenido = [
      {
        id: '1',
        tipo: 'audio',
        titulo: 'Unreleased Track: Midnight Dreams Extended',
        descripcion: 'Versión extendida exclusiva de mi hit más popular con solos adicionales.',
        thumbnail: 'https://via.placeholder.com/300x169/667eea/ffffff?text=Audio',
        duracion: 285,
        artista: {
          id: '1',
          nombre: 'Luna Nocturna',
          imagen: 'https://via.placeholder.com/30x30/667eea/ffffff?text=LN'
        },
        fechaPublicacion: new Date('2025-01-10'),
        visualizaciones: 1205,
        likes: 89,
        comentarios: 23,
        tags: ['exclusive', 'extended', 'unreleased'],
        progreso: 0,
        esFavorito: true
      },
      {
        id: '2',
        tipo: 'video',
        titulo: 'Behind the Scenes: Studio Session',
        descripcion: 'Mira cómo creo mis canciones desde el estudio de grabación.',
        thumbnail: 'https://via.placeholder.com/300x169/e74c3c/ffffff?text=Video',
        duracion: 420,
        artista: {
          id: '1',
          nombre: 'Luna Nocturna',
          imagen: 'https://via.placeholder.com/30x30/667eea/ffffff?text=LN'
        },
        fechaPublicacion: new Date('2025-01-12'),
        visualizaciones: 856,
        likes: 67,
        comentarios: 15,
        tags: ['bts', 'studio', 'process'],
        progreso: 45,
        esFavorito: false
      },
      {
        id: '3',
        tipo: 'imagen',
        titulo: 'Artwork Collection Vol.1',
        descripcion: 'Colección exclusiva de arte digital usado en mis últimos álbumes.',
        thumbnail: 'https://via.placeholder.com/300x169/f39c12/ffffff?text=Art',
        artista: {
          id: '1',
          nombre: 'Luna Nocturna',
          imagen: 'https://via.placeholder.com/30x30/667eea/ffffff?text=LN'
        },
        fechaPublicacion: new Date('2025-01-08'),
        visualizaciones: 445,
        likes: 34,
        tags: ['artwork', 'design', 'collection'],
        progreso: 0,
        esFavorito: false
      }
    ];

    // Simular contenido reciente
    this.contenidoReciente = [
      {
        id: '1',
        titulo: 'Midnight Dreams Extended',
        artista: { nombre: 'Luna Nocturna' },
        thumbnail: 'https://via.placeholder.com/200x113/667eea/ffffff?text=Recent',
        ultimaReproduccion: new Date('2025-01-14'),
        progreso: 78
      }
    ];

    // Simular playlists
    this.misPlaylists = [
      {
        id: '1',
        nombre: 'Mis Favoritas',
        descripcion: 'Las mejores canciones de mis artistas favoritos',
        cantidad: 23,
        thumbnails: [
          'https://via.placeholder.com/125x125/667eea/ffffff?text=1',
          'https://via.placeholder.com/125x125/764ba2/ffffff?text=2',
          'https://via.placeholder.com/125x125/f093fb/ffffff?text=3',
          'https://via.placeholder.com/125x125/4facfe/ffffff?text=4'
        ],
        ultimaActualizacion: new Date('2025-01-13')
      }
    ];

    this.actualizarContadores();
    this.aplicarFiltros();
  }

  // Método auxiliar para mapear tipos de contenido
  private mapearTipoContenido(tipo: 'cancion' | 'album' | 'letra' | 'video' | 'foto'): string {
    const mapeo = {
      'cancion': 'audio',
      'album': 'audio', 
      'letra': 'texto',
      'video': 'video',
      'foto': 'imagen'
    };
    return mapeo[tipo] || 'texto';
  }

  private actualizarContadores() {
    this.tabs.forEach(tab => {
      if (tab.id === 'todo') {
        tab.count = this.todoElContenido.length;
      } else {
        tab.count = this.todoElContenido.filter(c => c.tipo === tab.id).length;
      }
    });
  }

  cambiarTab(tabId: string) {
    this.filtros.tipoActivo = tabId;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let contenidoFiltrado = [...this.todoElContenido];

    // Filtrar por tipo
    if (this.filtros.tipoActivo !== 'todo') {
      contenidoFiltrado = contenidoFiltrado.filter(c => c.tipo === this.filtros.tipoActivo);
    }

    // Filtrar por artista
    if (this.filtros.artista) {
      contenidoFiltrado = contenidoFiltrado.filter(c => c.artista.id === this.filtros.artista);
    }

    // Filtrar por búsqueda
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      contenidoFiltrado = contenidoFiltrado.filter(c =>
        c.titulo.toLowerCase().includes(busqueda) ||
        c.descripcion?.toLowerCase().includes(busqueda) ||
        c.artista.nombre.toLowerCase().includes(busqueda) ||
        c.tags?.some((tag: string) => tag.toLowerCase().includes(busqueda))
      );
    }

    // Ordenar
    switch (this.filtros.ordenamiento) {
      case 'reciente':
        contenidoFiltrado.sort((a, b) => b.fechaPublicacion.getTime() - a.fechaPublicacion.getTime());
        break;
      case 'popular':
        contenidoFiltrado.sort((a, b) => b.visualizaciones - a.visualizaciones);
        break;
      case 'nombre':
        contenidoFiltrado.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
    }

    this.contenidoFiltrado = contenidoFiltrado;
  }

  limpiarFiltros() {
    this.filtros = {
      busqueda: '',
      tipoActivo: 'todo',
      artista: '',
      ordenamiento: 'reciente'
    };
    this.aplicarFiltros();
  }

  trackByContentId(index: number, item: any): string {
    return item.id;
  }

  getPlayIcon(tipo: string): string {
    switch (tipo) {
      case 'audio': return '🎵';
      case 'video': return '▶️';
      case 'imagen': return '👁️';
      case 'texto': return '📖';
      default: return '▶️';
    }
  }

  getBadgeText(tipo: string): string {
    switch (tipo) {
      case 'audio': return 'Audio';
      case 'video': return 'Video';
      case 'imagen': return 'Imagen';
      case 'texto': return 'Texto';
      default: return 'Contenido';
    }
  }

  getActionText(tipo: string): string {
    switch (tipo) {
      case 'audio': return '🎵 Reproducir';
      case 'video': return '▶️ Ver';
      case 'imagen': return '👁️ Ver';
      case 'texto': return '📖 Leer';
      default: return '▶️ Abrir';
    }
  }

  reproducirContenido(contenido: any) {
    if (!this.context?.userId) {
      alert('Debes estar logueado para acceder al contenido');
      return;
    }

    console.log('▶️ Intentando acceder al contenido:', contenido.titulo);
    this.cargandoAcceso = true;

    // Si el contenido tiene datos originales de Supabase, validar acceso
    if (contenido.contenidoOriginal) {
      const contenidoOriginal = contenido.contenidoOriginal as ContenidoExclusivo;
      
      this.contenidoService.validarAccesoContenido(
        this.context.userId,
        contenidoOriginal.id,
        contenidoOriginal.artista_id
      ).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (validacion: ValidacionAcceso) => {
          this.cargandoAcceso = false;
          
          if (validacion.tiene_acceso) {
            console.log('✅ Acceso concedido, reproduciendo contenido');
            // Registrar acceso para estadísticas (solo si tenemos usuario válido)
            if (this.context?.userId) {
              this.contenidoService.registrarAccesoContenido(
                this.context.userId,
                contenidoOriginal.id,
                contenidoOriginal.artista_id
              ).subscribe();
            }
            
            // Aquí se abriría el reproductor correspondiente
            this.abrirReproductor(contenido);
          } else {
            console.log('❌ Acceso denegado:', validacion.razon);
            this.mostrarOpcionesAcceso(contenido, validacion);
          }
        },
        error: (error) => {
          console.error('❌ Error validando acceso:', error);
          this.cargandoAcceso = false;
          alert('Error al validar acceso al contenido');
        }
      });
    } else {
      // Contenido simulado, permitir acceso directo
      console.log('📋 Contenido simulado, acceso directo');
      this.cargandoAcceso = false;
      this.abrirReproductor(contenido);
    }
  }

  private abrirReproductor(contenido: any) {
    console.log('🎵 Abriendo reproductor para:', contenido.titulo);
    
    // Incrementar visualizaciones si es contenido real
    if (contenido.contenidoOriginal) {
      this.contenidoService.incrementarVisualizaciones(contenido.contenidoOriginal.id).subscribe();
    }
    
    // Aquí se implementaría la lógica del reproductor específico según el tipo
    switch (contenido.tipo) {
      case 'audio':
        this.reproducirAudio(contenido);
        break;
      case 'video':
        this.reproducirVideo(contenido);
        break;
      case 'imagen':
        this.mostrarImagen(contenido);
        break;
      default:
        this.mostrarContenido(contenido);
    }
  }

  private mostrarOpcionesAcceso(contenido: any, validacion: ValidacionAcceso) {
    let mensaje = 'No tienes acceso a este contenido. ';
    
    switch (validacion.razon) {
      case 'sin_membresia':
        mensaje += 'Necesitas una membresía activa del artista.';
        break;
      case 'membresia_expirada':
        mensaje += 'Tu membresía ha expirado.';
        break;
      case 'propina_insuficiente':
        mensaje += 'Requiere una propina mínima.';
        break;
      case 'contenido_inactivo':
        mensaje += 'Este contenido ya no está disponible.';
        break;
      default:
        mensaje += 'Contacta con soporte.';
    }

    if (validacion.opciones_acceso?.puede_comprar_individual && validacion.opciones_acceso.precio_individual) {
      mensaje += `\n\n¿Deseas comprarlo por $${validacion.opciones_acceso.precio_individual}?`;
      
      if (confirm(mensaje)) {
        this.comprarAccesoIndividual(contenido, validacion.opciones_acceso.precio_individual);
      }
    } else {
      alert(mensaje);
    }
  }

  private comprarAccesoIndividual(contenido: any, precio: number) {
    if (!this.context?.userId || !contenido.contenidoOriginal) return;

    console.log('💳 Comprando acceso individual:', contenido.titulo, precio);
    this.cargandoAcceso = true;

    this.contenidoService.comprarAccesoIndividual(
      this.context.userId,
      contenido.contenidoOriginal.id,
      contenido.contenidoOriginal.artista_id
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ acceso, transaccion }) => {
        console.log('✅ Compra realizada exitosamente:', { acceso, transaccion });
        this.cargandoAcceso = false;
        alert('¡Compra realizada exitosamente! Ya puedes acceder al contenido.');
        
        // Reproducir el contenido inmediatamente
        this.abrirReproductor(contenido);
      },
      error: (error) => {
        console.error('❌ Error en la compra:', error);
        this.cargandoAcceso = false;
        alert('Error procesando la compra. Intenta nuevamente.');
      }
    });
  }

  private reproducirAudio(contenido: any) {
    console.log('🎵 Reproduciendo audio:', contenido.titulo);
    // Implementar reproductor de audio
  }

  private reproducirVideo(contenido: any) {
    console.log('🎬 Reproduciendo video:', contenido.titulo);
    // Implementar reproductor de video
  }

  private mostrarImagen(contenido: any) {
    console.log('🖼️ Mostrando imagen:', contenido.titulo);
    // Implementar visor de imágenes
  }

  private mostrarContenido(contenido: any) {
    console.log('📄 Mostrando contenido:', contenido.titulo);
    // Implementar visor genérico
  }

  toggleFavorito(contenido: any) {
    contenido.esFavorito = !contenido.esFavorito;
    console.log('❤️ Toggle favorito:', contenido.titulo, contenido.esFavorito);
  }

  compartirContenido(contenido: any) {
    console.log('📤 Compartir:', contenido.titulo);
    // Implementar lógica de compartir
  }

  descargarContenido(contenido: any) {
    if (!this.context?.userId) {
      alert('Debes estar logueado para descargar contenido');
      return;
    }

    console.log('💾 Intentando descargar:', contenido.titulo);

    // Verificar acceso antes de permitir descarga
    if (contenido.contenidoOriginal) {
      const contenidoOriginal = contenido.contenidoOriginal as ContenidoExclusivo;
      
      this.contenidoService.validarAccesoContenido(
        this.context.userId,
        contenidoOriginal.id,
        contenidoOriginal.artista_id
      ).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (validacion: ValidacionAcceso) => {
          if (validacion.tiene_acceso) {
            console.log('✅ Iniciando descarga...');
            this.iniciarDescarga(contenido);
          } else {
            console.log('❌ No tienes acceso para descargar este contenido');
            this.mostrarOpcionesAcceso(contenido, validacion);
          }
        },
        error: (error) => {
          console.error('❌ Error validando acceso para descarga:', error);
          alert('Error al validar acceso para descarga');
        }
      });
    } else {
      // Contenido simulado
      this.iniciarDescarga(contenido);
    }
  }

  private iniciarDescarga(contenido: any) {
    console.log('⬇️ Descargando archivo:', contenido.titulo);
    
    // Aquí se implementaría la lógica real de descarga
    // Por ejemplo, obtener URL del archivo desde Supabase Storage
    
    if (contenido.contenidoOriginal?.imagen_portada) {
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = contenido.contenidoOriginal.imagen_portada;
      link.download = `${contenido.titulo}.${this.obtenerExtensionArchivo(contenido.tipo)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Descarga iniciada');
    } else {
      alert('Archivo no disponible para descarga');
    }
  }

  private obtenerExtensionArchivo(tipo: string): string {
    const extensiones = {
      'audio': 'mp3',
      'video': 'mp4',
      'imagen': 'jpg',
      'texto': 'txt'
    };
    return extensiones[tipo as keyof typeof extensiones] || 'bin';
  }

  mostrarOpciones(contenido: any) {
    console.log('⋮ Más opciones:', contenido.titulo);
    // Mostrar menú contextual
  }

  anadirALista(contenido: any) {
    console.log('➕ Añadir a lista:', contenido.titulo);
    // Mostrar selector de playlist
  }

  abrirPlaylist(playlist: any) {
    console.log('📚 Abrir playlist:', playlist.nombre);
    // Navegar a vista de playlist
  }

  crearNuevaPlaylist() {
    console.log('➕ Crear nueva playlist');
    // Abrir modal de creación
  }

  formatearDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${minutos}:${seg.toString().padStart(2, '0')}`;
  }

  formatearFecha(fecha: Date | undefined): string {
    if (!fecha) return 'Fecha no disponible';
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatearFechaRelativa(fecha: Date | undefined): string {
    if (!fecha) return 'Sin fecha';
    
    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
    
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    return fechaObj.toLocaleDateString();
  }
}
