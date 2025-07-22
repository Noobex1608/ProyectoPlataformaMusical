import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistaIntegrationService, DashboardIngresos, ContenidoExclusivoArtista } from '../../services/artista-integration.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-artista-monetizacion-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="artista-dashboard">
            <h2>🎵 Panel de Monetización - Artista</h2>
            
            <!-- Dashboard de Ingresos -->
            <div class="dashboard-section">
                <h3>💰 Dashboard de Ingresos</h3>
                <div *ngIf="dashboardIngresos$ | async as dashboard" class="ingresos-grid">
                    <div class="stat-card">
                        <div class="stat-value">\${{ dashboard.totalIngresos | number:'1.2-2' }}</div>
                        <div class="stat-label">Ingresos Totales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{{ dashboard.totalSuscriptores }}</div>
                        <div class="stat-label">Suscriptores Activos</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">\${{ dashboard.propinaPromedio | number:'1.2-2' }}</div>
                        <div class="stat-label">Propina Promedio</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">+{{ dashboard.crecimientoMensual }}%</div>
                        <div class="stat-label">Crecimiento Mensual</div>
                    </div>
                </div>

                <!-- Gráfico de ingresos -->
                <div class="chart-container">
                    <h4>Ingresos Últimos 30 Días</h4>
                    <div class="simple-chart">
                        <div *ngFor="let ingreso of (dashboardIngresos$ | async)?.ingresosUltimos30Dias" 
                             class="chart-bar" 
                             [style.height.px]="ingreso.monto * 2">
                            <span class="chart-label">{{ ingreso.fecha | date:'MM/dd' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Top Fans -->
                <div class="top-fans">
                    <h4>🌟 Top Fans por Propinas</h4>
                    <div *ngFor="let fan of (dashboardIngresos$ | async)?.topFans" class="fan-item">
                        <span class="fan-name">{{ fan.nombre }}</span>
                        <span class="fan-total">\${{ fan.totalPropinas }}</span>
                    </div>
                </div>
            </div>

            <!-- Gestión de Contenido Exclusivo -->
            <div class="dashboard-section">
                <h3>🔒 Gestión de Contenido Exclusivo</h3>
                
                <!-- Formulario para marcar contenido como exclusivo -->
                <div class="content-form">
                    <h4>Marcar Nuevo Contenido como Exclusivo</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>ID del Contenido:</label>
                            <input type="text" [(ngModel)]="nuevoContenido.contenido_id" 
                                   placeholder="ID de la canción/álbum">
                        </div>
                        <div class="form-group">
                            <label>Tipo de Contenido:</label>
                            <select [(ngModel)]="nuevoContenido.tipo_contenido">
                                <option value="cancion">Canción</option>
                                <option value="album">Álbum</option>
                                <option value="letra">Letra Exclusiva</option>
                                <option value="video">Video</option>
                                <option value="foto">Foto Exclusiva</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Nivel de Acceso Requerido:</label>
                            <select [(ngModel)]="nuevoContenido.nivel_acceso_requerido">
                                <option value="1">Nivel 1 - Básico</option>
                                <option value="2">Nivel 2 - Premium</option>
                                <option value="3">Nivel 3 - VIP</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Precio Individual (opcional):</label>
                            <input type="number" [(ngModel)]="nuevoContenido.precio_individual" 
                                   placeholder="Precio en USD">
                        </div>
                        <div class="form-group full-width">
                            <label>Descripción:</label>
                            <textarea [(ngModel)]="nuevoContenido.descripcion" 
                                      placeholder="Describe el contenido exclusivo"></textarea>
                        </div>
                    </div>
                    <button (click)="marcarContenidoExclusivo()" class="btn-primary">
                        🔒 Marcar como Exclusivo
                    </button>
                </div>

                <!-- Lista de contenido exclusivo existente -->
                <div class="content-list">
                    <h4>Contenido Exclusivo Actual</h4>
                    <div *ngFor="let contenido of contenidoExclusivo$ | async" class="content-item">
                        <div class="content-info">
                            <strong>{{ contenido.tipo_contenido | titlecase }}</strong> - {{ contenido.contenido_id }}
                            <p>{{ contenido.descripcion }}</p>
                            <span class="access-level">Nivel {{ contenido.nivel_acceso_requerido }}</span>
                            <span *ngIf="contenido.precio_individual" class="price">
                                \${{ contenido.precio_individual }}
                            </span>
                        </div>
                        <div class="content-actions">
                            <select (change)="cambiarNivelAcceso(contenido.id!, $event)" 
                                    [value]="contenido.nivel_acceso_requerido">
                                <option value="1">Nivel 1</option>
                                <option value="2">Nivel 2</option>
                                <option value="3">Nivel 3</option>
                            </select>
                            <button (click)="desactivarContenido(contenido.id!)" class="btn-danger">
                                Desactivar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Crear Nuevos Tipos de Membresía -->
            <div class="dashboard-section">
                <h3>💎 Crear Nuevos Tipos de Membresía</h3>
                <div class="membership-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Nombre de la Membresía:</label>
                            <input type="text" [(ngModel)]="nuevaMembresia.nombre" 
                                   placeholder="Ej: VIP Exclusivo">
                        </div>
                        <div class="form-group">
                            <label>Precio Mensual:</label>
                            <input type="number" [(ngModel)]="nuevaMembresia.precio" 
                                   placeholder="Precio en USD">
                        </div>
                        <div class="form-group">
                            <label>Nivel de Acceso:</label>
                            <select [(ngModel)]="nuevaMembresia.nivelRequerido">
                                <option value="1">Nivel 1 - Básico</option>
                                <option value="2">Nivel 2 - Premium</option>
                                <option value="3">Nivel 3 - VIP</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label>Descripción de Beneficios:</label>
                            <textarea [(ngModel)]="nuevaMembresia.descripcion" 
                                      placeholder="Describe los beneficios de esta membresía"></textarea>
                        </div>
                    </div>
                    <button (click)="crearTipoMembresia()" class="btn-success">
                        ✨ Crear Membresía
                    </button>
                </div>
            </div>

            <!-- Estadísticas de Engagement -->
            <div class="dashboard-section">
                <h3>📊 Estadísticas de Engagement</h3>
                <div *ngIf="estadisticasEngagement$ | async as stats" class="engagement-stats">
                    <div class="stat-card">
                        <div class="stat-value">{{ stats.totalInteracciones }}</div>
                        <div class="stat-label">Total Interacciones</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{{ stats.propinasRecientes }}</div>
                        <div class="stat-label">Propinas (7 días)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{{ stats.suscripcionesActivas }}</div>
                        <div class="stat-label">Suscripciones Activas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{{ stats.conversionRate | number:'1.1-1' }}%</div>
                        <div class="stat-label">Tasa de Conversión</div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .artista-dashboard {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
            font-family: 'Arial', sans-serif;
        }

        .dashboard-section {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .ingresos-grid, .engagement-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }

        .stat-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 8px;
        }

        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }

        .form-group.full-width {
            grid-column: 1 / -1;
        }

        .form-group label {
            margin-bottom: 5px;
            font-weight: 600;
            color: #333;
        }

        .form-group input, .form-group select, .form-group textarea {
            padding: 10px;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-size: 14px;
        }

        .form-group textarea {
            min-height: 80px;
            resize: vertical;
        }

        .btn-primary, .btn-success, .btn-danger {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
        }

        .btn-danger {
            background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
            color: white;
        }

        .content-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            margin-bottom: 12px;
        }

        .content-info {
            flex: 1;
        }

        .access-level {
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            margin-right: 8px;
        }

        .price {
            background: #e8f5e8;
            color: #2e7d32;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
        }

        .content-actions {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .simple-chart {
            display: flex;
            align-items: flex-end;
            gap: 4px;
            height: 200px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .chart-bar {
            background: linear-gradient(to top, #667eea, #764ba2);
            min-height: 20px;
            width: 20px;
            border-radius: 2px 2px 0 0;
            position: relative;
        }

        .chart-label {
            position: absolute;
            bottom: -20px;
            font-size: 0.7em;
            transform: rotate(-45deg);
            white-space: nowrap;
        }

        .top-fans {
            margin-top: 24px;
        }

        .fan-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            border-bottom: 1px solid #e1e5e9;
        }

        .fan-name {
            font-weight: 500;
        }

        .fan-total {
            color: #2e7d32;
            font-weight: 600;
        }

        h2 {
            color: #333;
            margin-bottom: 24px;
            text-align: center;
        }

        h3 {
            color: #555;
            border-bottom: 2px solid #667eea;
            padding-bottom: 8px;
            margin-bottom: 20px;
        }

        h4 {
            color: #666;
            margin-bottom: 16px;
        }
    `]
})
export class ArtistaMonetizacionDashboardComponent implements OnInit {
    @Input() artistaId: string = '';

    dashboardIngresos$!: Observable<DashboardIngresos>;
    contenidoExclusivo$!: Observable<ContenidoExclusivoArtista[]>;
    estadisticasEngagement$!: Observable<any>;

    nuevoContenido: Partial<ContenidoExclusivoArtista> = {
        artista_id: '',
        contenido_id: '',
        tipo_contenido: 'cancion',
        nivel_acceso_requerido: 1,
        descripcion: '',
        activo: true
    };

    nuevaMembresia = {
        nombre: '',
        precio: 0,
        nivelRequerido: 1,
        descripcion: ''
    };

    constructor(private artistaService: ArtistaIntegrationService) {}

    ngOnInit(): void {
        if (this.artistaId) {
            this.cargarDatos();
        }
    }

    private cargarDatos(): void {
        this.nuevoContenido.artista_id = this.artistaId;
        
        this.dashboardIngresos$ = this.artistaService.obtenerDashboardIngresos(this.artistaId);
        this.contenidoExclusivo$ = this.artistaService.obtenerContenidoExclusivoArtista(this.artistaId);
        this.estadisticasEngagement$ = this.artistaService.obtenerEstadisticasEngagement(this.artistaId);
    }

    marcarContenidoExclusivo(): void {
        if (this.nuevoContenido.contenido_id && this.nuevoContenido.descripcion) {
            this.artistaService.marcarContenidoExclusivo(this.nuevoContenido as any).subscribe({
                next: () => {
                    alert('Contenido marcado como exclusivo exitosamente');
                    this.contenidoExclusivo$ = this.artistaService.obtenerContenidoExclusivoArtista(this.artistaId);
                    this.resetFormularioContenido();
                },
                error: (error) => {
                    console.error('Error al marcar contenido:', error);
                    alert('Error al marcar el contenido como exclusivo');
                }
            });
        }
    }

    cambiarNivelAcceso(contenidoId: number, event: any): void {
        const nuevoNivel = parseInt(event.target.value);
        this.artistaService.actualizarNivelAcceso(contenidoId, nuevoNivel).subscribe({
            next: () => {
                alert('Nivel de acceso actualizado');
            },
            error: (error) => {
                console.error('Error al actualizar nivel:', error);
                alert('Error al actualizar el nivel de acceso');
            }
        });
    }

    desactivarContenido(contenidoId: number): void {
        // Implementar desactivación
        console.log('Desactivando contenido:', contenidoId);
    }

    crearTipoMembresia(): void {
        if (this.nuevaMembresia.nombre && this.nuevaMembresia.precio > 0) {
            this.artistaService.crearTipoContenidoPremium(this.artistaId, this.nuevaMembresia).subscribe({
                next: () => {
                    alert('Nuevo tipo de membresía creado exitosamente');
                    this.resetFormularioMembresia();
                },
                error: (error) => {
                    console.error('Error al crear membresía:', error);
                    alert('Error al crear el tipo de membresía');
                }
            });
        }
    }

    private resetFormularioContenido(): void {
        this.nuevoContenido = {
            artista_id: this.artistaId,
            contenido_id: '',
            tipo_contenido: 'cancion',
            nivel_acceso_requerido: 1,
            descripcion: '',
            activo: true
        };
    }

    private resetFormularioMembresia(): void {
        this.nuevaMembresia = {
            nombre: '',
            precio: 0,
            nivelRequerido: 1,
            descripcion: ''
        };
    }
}
