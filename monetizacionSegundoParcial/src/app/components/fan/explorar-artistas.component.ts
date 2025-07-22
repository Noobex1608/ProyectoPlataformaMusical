import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContextService, MonetizacionContext } from '../../services/context.service';
import { ArtistaService, ArtistaExplorar } from '../../services/artista.service';
import { ImageUtils } from '../../utils/image.utils';

@Component({
  selector: 'app-explorar-artistas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="explorar-artistas" *ngIf="context">
      <!-- Header -->
      <div class="header">
        <h1>🎵 Explorar Artistas</h1>
        <p class="subtitle">Descubre nuevos artistas y apóyalos con tu suscripción</p>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <label>🎼 Género</label>
          <select [(ngModel)]="filtros.genero" (change)="aplicarFiltros()">
            <option value="">Todos los géneros</option>
            <option value="pop">Pop</option>
            <option value="rock">Rock</option>
            <option value="indie">Indie</option>
            <option value="electronic">Electronic</option>
            <option value="hip-hop">Hip Hop</option>
            <option value="latin">Latin</option>
          </select>
        </div>

        <div class="filter-group">
          <label>💰 Precio</label>
          <select [(ngModel)]="filtros.precio" (change)="aplicarFiltros()">
            <option value="">Cualquier precio</option>
            <option value="0-5">$0 - $5</option>
            <option value="5-10">$5 - $10</option>
            <option value="10-20">$10 - $20</option>
            <option value="20+">$20+</option>
          </select>
        </div>

        <div class="filter-group">
          <label>⭐ Popularidad</label>
          <select [(ngModel)]="filtros.popularidad" (change)="aplicarFiltros()">
            <option value="">Cualquiera</option>
            <option value="trending">Trending</option>
            <option value="popular">Popular</option>
            <option value="new">Nuevos</option>
          </select>
        </div>

        <div class="search-group">
          <input 
            type="text" 
            [(ngModel)]="filtros.busqueda" 
            (input)="aplicarFiltros()"
            placeholder="🔍 Buscar artistas..."
            class="search-input"
          >
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="cargando">
        <div class="spinner"></div>
        <p>Buscando artistas...</p>
      </div>

      <!-- Artists Grid -->
      <div class="artistas-grid" *ngIf="!cargando && artistasFiltrados.length > 0">
        <div class="artist-card" *ngFor="let artista of artistasFiltrados">
          <!-- Artist Image -->
          <div class="artist-image-container">
            <img [src]="obtenerImagenArtista(artista)" [alt]="artista.nombre" class="artist-image">
            <div class="artist-badge" [class]="artista.badge?.tipo">
              {{ artista.badge?.texto }}
            </div>
          </div>

          <!-- Artist Info -->
          <div class="artist-info">
            <h3>{{ artista.nombre }}</h3>
            <p class="artist-genre">{{ artista.genero }}</p>
            <p class="artist-description">{{ artista.descripcion }}</p>

            <!-- Stats -->
            <div class="artist-stats">
              <div class="stat">
                <span class="stat-icon">👥</span>
                <span>{{ artista.seguidores }} fans</span>
              </div>
              <div class="stat">
                <span class="stat-icon">🎵</span>
                <span>{{ artista.canciones }} canciones</span>
              </div>
              <div class="stat">
                <span class="stat-icon">⭐</span>
                <span>{{ artista.rating }}/5</span>
              </div>
            </div>

            <!-- Memberships -->
            <div class="memberships">
              <h4>Planes de Suscripción:</h4>
              <div class="membership-list">
                <div 
                  class="membership-item" 
                  *ngFor="let membresia of artista.membresias"
                  [class.popular]="membresia.popular"
                >
                  <div class="membership-info">
                    <span class="membership-name">{{ membresia.nombre }}</span>
                    <span class="membership-price">\${{ membresia.precio }}/mes</span>
                  </div>
                  <div class="membership-benefits">
                    <small>{{ membresia.beneficios }}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="artist-actions">
              <button 
                class="btn-follow" 
                [class.following]="artista.siguiendo"
                (click)="toggleSeguir(artista)"
              >
                {{ artista.siguiendo ? '✓ Siguiendo' : '👤 Seguir' }}
              </button>
              
              <button 
                class="btn-subscribe" 
                (click)="verPlanes(artista)"
              >
                💳 Ver Planes
              </button>
              
              <button 
                class="btn-tip" 
                (click)="enviarPropina(artista)"
              >
                💰 Propina
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!cargando && artistasFiltrados.length === 0">
        <div class="empty-icon">🔍</div>
        <h3>No se encontraron artistas</h3>
        <p>Intenta ajustar tus filtros de búsqueda</p>
        <button class="btn-reset" (click)="limpiarFiltros()">
          Limpiar filtros
        </button>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="!cargando && artistasFiltrados.length > 0">
        <button 
          class="pagination-btn" 
          [disabled]="paginaActual === 1"
          (click)="cambiarPagina(paginaActual - 1)"
        >
          ← Anterior
        </button>
        
        <span class="pagination-info">
          Página {{ paginaActual }} de {{ totalPaginas }}
        </span>
        
        <button 
          class="pagination-btn" 
          [disabled]="paginaActual === totalPaginas"
          (click)="cambiarPagina(paginaActual + 1)"
        >
          Siguiente →
        </button>
      </div>
    </div>
  `,
  styles: [`
    .explorar-artistas {
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

    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .filter-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    .filter-group select,
    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
    }

    .search-group {
      grid-column: span 2;
    }

    .artistas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .artist-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .artist-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }

    .artist-image-container {
      position: relative;
      text-align: center;
      margin-bottom: 1rem;
    }

    .artist-image {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #f0f0f0;
    }

    .artist-badge {
      position: absolute;
      top: -5px;
      right: 25%;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      color: white;
    }

    .artist-badge.trending {
      background: #ff6b6b;
    }

    .artist-badge.new {
      background: #4ecdc4;
    }

    .artist-badge.popular {
      background: #ffe66d;
      color: #333;
    }

    .artist-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.4rem;
      color: #333;
      text-align: center;
    }

    .artist-genre {
      text-align: center;
      color: #666;
      font-weight: 600;
      margin: 0 0 1rem 0;
    }

    .artist-description {
      color: #666;
      line-height: 1.5;
      margin: 0 0 1rem 0;
    }

    .artist-stats {
      display: flex;
      justify-content: space-around;
      margin: 1rem 0;
      padding: 1rem 0;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #666;
    }

    .memberships {
      margin: 1rem 0;
    }

    .memberships h4 {
      margin: 0 0 0.75rem 0;
      color: #333;
      font-size: 1rem;
    }

    .membership-item {
      background: #f8f9fa;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      border-left: 3px solid #e0e0e0;
    }

    .membership-item.popular {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-left-color: #ffd700;
    }

    .membership-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    .membership-benefits {
      margin-top: 0.5rem;
      opacity: 0.8;
    }

    .artist-actions {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .btn-follow, .btn-subscribe, .btn-tip {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }

    .btn-follow {
      background: #28a745;
      color: white;
    }

    .btn-follow.following {
      background: #6c757d;
    }

    .btn-subscribe {
      background: #667eea;
      color: white;
    }

    .btn-tip {
      background: #ffc107;
      color: #333;
    }

    .btn-follow:hover, .btn-subscribe:hover, .btn-tip:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .loading, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .btn-reset {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 1rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2rem;
      margin-top: 3rem;
      padding: 2rem 0;
    }

    .pagination-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
    }

    .pagination-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .pagination-info {
      font-weight: 600;
      color: #666;
    }
  `]
})
export class ExplorarArtistasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  context: MonetizacionContext | null = null;
  cargando = true;

  // Estados de filtros
  filtros = {
    genero: '',
    precio: '',
    popularidad: '',
    busqueda: ''
  };

  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  artistasPorPagina = 9;

  // Datos
  artistasOriginales: ArtistaExplorar[] = [];
  artistasFiltrados: ArtistaExplorar[] = [];

  constructor(
    private contextService: ContextService,
    private artistaService: ArtistaService
  ) {}

  ngOnInit() {
    this.contextService.context$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (context: MonetizacionContext | null) => {
        this.context = context;
        if (context?.userType === 'comunidad') {
          this.cargarArtistas();
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

  private cargarArtistas() {
    this.cargando = true;
    console.log('🎯 Cargando artistas desde Supabase...');
    
    const fanId = this.context?.userId; // Si tenemos el ID del fan para marcar seguimiento
    
    this.artistaService.obtenerArtistasParaExplorar(fanId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (artistas) => {
        console.log('✅ Artistas cargados:', artistas.length);
        this.artistasOriginales = artistas;
        this.artistasFiltrados = [...this.artistasOriginales];
        this.calcularPaginacion();
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error cargando artistas:', error);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros() {
    console.log('🔍 Aplicando filtros:', this.filtros);
    
    this.artistasFiltrados = this.artistaService.filtrarArtistas(
      this.artistasOriginales,
      this.filtros
    );
    
    this.paginaActual = 1;
    this.calcularPaginacion();
    
    console.log('✅ Filtros aplicados. Resultados:', this.artistasFiltrados.length);
  }

  limpiarFiltros() {
    this.filtros = {
      genero: '',
      precio: '',
      popularidad: '',
      busqueda: ''
    };
    this.aplicarFiltros();
  }

  toggleSeguir(artista: ArtistaExplorar) {
    if (!this.context?.userId) {
      console.warn('⚠️ No hay ID de usuario para seguir artista');
      return;
    }

    console.log('🔄 Toggle seguir artista:', artista.id);
    
    this.artistaService.toggleSeguirArtista(this.context.userId, artista.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (siguiendo) => {
        artista.siguiendo = siguiendo;
        console.log(`✅ ${siguiendo ? 'Siguiendo' : 'Dejó de seguir'} a:`, artista.nombre);
      },
      error: (error) => {
        console.error('❌ Error al cambiar seguimiento:', error);
        // Revertir cambio en caso de error
        artista.siguiendo = !artista.siguiendo;
      }
    });
  }

  verPlanes(artista: ArtistaExplorar) {
    console.log('💳 Ver planes de:', artista.nombre);
    // TODO: Implementar navegación a componente de planes/suscripciones
  }

  enviarPropina(artista: ArtistaExplorar) {
    console.log('💰 Enviar propina a:', artista.nombre);
    // TODO: Implementar modal de propina usando PropinaService
  }

  // Método para obtener imagen del artista con fallback
  obtenerImagenArtista(artista: ArtistaExplorar): string {
    return ImageUtils.getImageUrl(artista.imagen, artista.nombre);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  private calcularPaginacion() {
    this.totalPaginas = Math.ceil(this.artistasFiltrados.length / this.artistasPorPagina);
  }
}
