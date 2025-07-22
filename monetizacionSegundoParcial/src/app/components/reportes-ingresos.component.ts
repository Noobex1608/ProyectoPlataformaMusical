import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ReporteIngresosSupabaseService } from '../services/reporte-ingresos-supabase.service';
import { ContextService, MonetizacionContext } from '../services/context.service';
import { CustomCurrencyPipe } from '../pipes/currency.pipe';

// Interfaces simplificadas para el componente
interface EstadisticasSimples {
  ingresos_totales: number;
  ingresos_netos: number;
  promedio_diario: number;
  mejor_dia: {
    fecha: string;
    total: number;
  };
  crecimiento: number;
}

interface DetalleIngreso {
  fecha: string;
  membresias: number;
  propinas: number;
  contenido: number;
  total: number;
  transacciones: number;
}

interface DistribucionSimple {
  membresias: { monto: number; porcentaje: number };
  propinas: { monto: number; porcentaje: number };
  contenido_exclusivo: { monto: number; porcentaje: number };
  otros: { monto: number; porcentaje: number };
}

@Component({
  selector: 'app-reportes-ingresos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CustomCurrencyPipe],
  template: `
    <div class="reportes-container">
      <!-- Header -->
      <div class="header">
        <h1>💰 Reportes de Ingresos</h1>
        <p>Análisis de tus ganancias e ingresos</p>
      </div>

      <!-- Filtros básicos -->
      <div class="filtros">
        <form [formGroup]="filtrosForm" (ngSubmit)="generarReporte()">
          <div class="filtros-grid">
            <select formControlName="periodo" class="filtro-select">
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
            
            <button type="submit" class="btn-generar" [disabled]="cargando">
              {{ cargando ? 'Generando...' : '📊 Generar Reporte' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="cargando">
        <div class="spinner"></div>
        <p>Generando reporte...</p>
      </div>

      <!-- Métricas principales -->
      <div class="metricas" *ngIf="estadisticas && !cargando">
        <div class="metrica-card principal">
          <div class="metrica-icon">💰</div>
          <div class="metrica-info">
            <div class="metrica-valor">{{ estadisticas.ingresos_totales | currency }}</div>
            <div class="metrica-label">Ingresos Totales</div>
          </div>
        </div>

        <div class="metrica-card">
          <div class="metrica-icon">💸</div>
          <div class="metrica-info">
            <div class="metrica-valor">{{ estadisticas.ingresos_netos | currency }}</div>
            <div class="metrica-label">Ingresos Netos</div>
          </div>
        </div>

        <div class="metrica-card">
          <div class="metrica-icon">📊</div>
          <div class="metrica-info">
            <div class="metrica-valor">{{ estadisticas.promedio_diario | currency }}</div>
            <div class="metrica-label">Promedio Diario</div>
          </div>
        </div>

        <div class="metrica-card">
          <div class="metrica-icon">🏆</div>
          <div class="metrica-info">
            <div class="metrica-valor">{{ estadisticas.mejor_dia.total | currency }}</div>
            <div class="metrica-label">Mejor Día</div>
            <div class="metrica-fecha">{{ estadisticas.mejor_dia.fecha | date:'shortDate' }}</div>
          </div>
        </div>
      </div>

      <!-- Distribución de ingresos -->
      <div class="distribucion" *ngIf="distribucion && !cargando">
        <h3>📈 Distribución por Fuente</h3>
        <div class="distribucion-grid">
          <div class="fuente">
            <div class="fuente-header">
              <span class="fuente-icon">👑</span>
              <span class="fuente-nombre">Membresías</span>
            </div>
            <div class="fuente-valor">{{ distribucion.membresias.monto | currency }}</div>
            <div class="fuente-porcentaje">{{ distribucion.membresias.porcentaje }}%</div>
            <div class="fuente-barra">
              <div class="barra-fill" [style.width.%]="distribucion.membresias.porcentaje"></div>
            </div>
          </div>

          <div class="fuente">
            <div class="fuente-header">
              <span class="fuente-icon">💝</span>
              <span class="fuente-nombre">Propinas</span>
            </div>
            <div class="fuente-valor">{{ distribucion.propinas.monto | currency }}</div>
            <div class="fuente-porcentaje">{{ distribucion.propinas.porcentaje }}%</div>
            <div class="fuente-barra">
              <div class="barra-fill" [style.width.%]="distribucion.propinas.porcentaje"></div>
            </div>
          </div>

          <div class="fuente">
            <div class="fuente-header">
              <span class="fuente-icon">🎵</span>
              <span class="fuente-nombre">Contenido</span>
            </div>
            <div class="fuente-valor">{{ distribucion.contenido_exclusivo.monto | currency }}</div>
            <div class="fuente-porcentaje">{{ distribucion.contenido_exclusivo.porcentaje }}%</div>
            <div class="fuente-barra">
              <div class="barra-fill" [style.width.%]="distribucion.contenido_exclusivo.porcentaje"></div>
            </div>
          </div>

          <div class="fuente">
            <div class="fuente-header">
              <span class="fuente-icon">🏆</span>
              <span class="fuente-nombre">Otros</span>
            </div>
            <div class="fuente-valor">{{ distribucion.otros.monto | currency }}</div>
            <div class="fuente-porcentaje">{{ distribucion.otros.porcentaje }}%</div>
            <div class="fuente-barra">
              <div class="barra-fill" [style.width.%]="distribucion.otros.porcentaje"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detalles diarios -->
      <div class="detalles" *ngIf="detalles.length > 0 && !cargando">
        <h3>📋 Últimos Ingresos</h3>
        <div class="tabla-responsive">
          <table class="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Membresías</th>
                <th>Propinas</th>
                <th>Contenido</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let detalle of detalles">
                <td>{{ detalle.fecha | date:'shortDate' }}</td>
                <td>{{ detalle.membresias | currency }}</td>
                <td>{{ detalle.propinas | currency }}</td>
                <td>{{ detalle.contenido | currency }}</td>
                <td class="total">{{ detalle.total | currency }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Estado vacío -->
      <div class="empty" *ngIf="!estadisticas && !cargando">
        <div class="empty-icon">📊</div>
        <h3>No hay datos disponibles</h3>
        <p>Genera tu primer reporte para ver las estadísticas.</p>
      </div>
    </div>
  `,
  styles: [`
    .reportes-container {
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

    .filtros {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .filtros-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1rem;
      align-items: center;
    }
    .filtro-select {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
    }
    .btn-generar {
      background: #348e91;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }
    .btn-generar:hover:not(:disabled) {
      background: #2a7174;
    }
    .btn-generar:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
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

    .metricas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .metrica-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .metrica-card.principal {
      background: linear-gradient(135deg, #348e91, #2a7174);
      color: white;
    }
    .metrica-icon {
      font-size: 2rem;
    }
    .metrica-valor {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .metrica-label {
      font-size: 0.9rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metrica-fecha {
      font-size: 0.8rem;
      opacity: 0.7;
      margin-top: 0.25rem;
    }

    .distribucion {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .distribucion h3 {
      margin: 0 0 1.5rem 0;
      color: #348e91;
    }
    .distribucion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .fuente {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
    }
    .fuente-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .fuente-icon {
      font-size: 1.5rem;
    }
    .fuente-nombre {
      font-weight: 600;
      color: #333;
    }
    .fuente-valor {
      font-size: 1.3rem;
      font-weight: 700;
      color: #348e91;
      margin-bottom: 0.5rem;
    }
    .fuente-porcentaje {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 1rem;
    }
    .fuente-barra {
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
    }
    .barra-fill {
      height: 100%;
      background: linear-gradient(90deg, #348e91, #2a7174);
      transition: width 0.6s ease;
    }

    .detalles {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .detalles h3 {
      margin: 0 0 1.5rem 0;
      color: #348e91;
    }
    .tabla-responsive {
      overflow-x: auto;
    }
    .tabla {
      width: 100%;
      border-collapse: collapse;
    }
    .tabla th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #e9ecef;
    }
    .tabla td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e9ecef;
    }
    .tabla td.total {
      font-weight: 600;
      color: #348e91;
    }
    .tabla tr:hover {
      background: #f8f9fa;
    }

    .empty {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    .empty h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    @media (max-width: 768px) {
      .reportes-container {
        padding: 0.5rem;
      }
      .filtros-grid {
        grid-template-columns: 1fr;
      }
      .metricas {
        grid-template-columns: 1fr;
      }
      .distribucion-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportesIngresosComponent implements OnInit, OnDestroy {
  @Input() context?: MonetizacionContext;

  // Estado del componente
  cargando = false;
  
  // Datos
  estadisticas: EstadisticasSimples | null = null;
  distribucion: DistribucionSimple | null = null;
  detalles: DetalleIngreso[] = [];
  
  // Formulario
  filtrosForm: FormGroup;
  
  // Subscripciones
  private subscriptions: Subscription[] = [];

  constructor(
    private reporteService: ReporteIngresosSupabaseService,
    private contextService: ContextService,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      periodo: ['30']
    });
  }

  ngOnInit(): void {
    this.generarReporte();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  generarReporte(): void {
    if (!this.context?.artistaId) {
      console.error('❌ No hay artistaId disponible para generar reporte');
      return;
    }

    this.cargando = true;
    this.limpiarDatos();

    const artistaId = this.context.artistaId;
    const dias = parseInt(this.filtrosForm.value.periodo);
    
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaFin.getDate() - dias);

    const configuracion = {
      tipo_periodo: 'personalizado' as const,
      fecha_inicio: fechaInicio.toISOString().split('T')[0],
      fecha_fin: fechaFin.toISOString().split('T')[0],
      incluir_comisiones: true,
      agrupar_por: 'dia' as const,
      filtros: {
        fuentes_ingreso: ['membresia', 'propina', 'contenido_exclusivo'],
        monto_minimo: 0
      }
    };

    // Obtener reporte completo
    const reporteSub = this.reporteService.obtenerReporteIngresos(artistaId, configuracion).subscribe({
      next: (reporte: any) => {
        this.estadisticas = this.crearEstadisticasDesdeReporte(reporte);
        this.distribucion = this.crearDistribucionDesdeReporte(reporte);
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error obteniendo reporte:', error);
        this.estadisticas = this.crearEstadisticasVacias();
        this.distribucion = this.crearDistribucionVacia();
        this.detalles = [];
        this.cargando = false;
      }
    });

    // También obtener detalles diarios
    const filtros = {
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0],
      tiposIngreso: ['membresia', 'propina', 'contenido_exclusivo'],
      monedas: ['USD']
    };

    const detallesSub = this.reporteService.obtenerDetallesIngresosDiarios(artistaId, filtros).subscribe({
      next: (detalles: any) => {
        this.detalles = this.mapearDetalles(detalles);
      },
      error: (error: any) => {
        console.error('Error obteniendo detalles:', error);
        this.detalles = [];
      }
    });

    this.subscriptions.push(reporteSub, detallesSub);
  }

  private limpiarDatos(): void {
    this.estadisticas = null;
    this.distribucion = null;
    this.detalles = [];
  }

  private mapearEstadisticas(stats: any): EstadisticasSimples {
    return {
      ingresos_totales: stats?.ingresos_por_fuente?.membresias + stats?.ingresos_por_fuente?.propinas + stats?.ingresos_por_fuente?.contenido_exclusivo || 0,
      ingresos_netos: stats?.ingresos_por_fuente?.membresias + stats?.ingresos_por_fuente?.propinas + stats?.ingresos_por_fuente?.contenido_exclusivo || 0,
      promedio_diario: stats?.promedio_diario || 0,
      mejor_dia: {
        fecha: stats?.mejor_dia?.fecha || new Date().toISOString(),
        total: stats?.mejor_dia?.monto || 0
      },
      crecimiento: stats?.crecimiento_porcentual || 0
    };
  }

  private mapearDistribucion(dist: any): DistribucionSimple {
    const total = (dist?.membresias?.monto || 0) + (dist?.propinas?.monto || 0) + 
                  (dist?.contenido_exclusivo?.monto || 0) + (dist?.otros?.monto || 0);

    if (total === 0) {
      return this.crearDistribucionVacia();
    }

    return {
      membresias: {
        monto: dist?.membresias?.monto || 0,
        porcentaje: Math.round(((dist?.membresias?.monto || 0) / total) * 100)
      },
      propinas: {
        monto: dist?.propinas?.monto || 0,
        porcentaje: Math.round(((dist?.propinas?.monto || 0) / total) * 100)
      },
      contenido_exclusivo: {
        monto: dist?.contenido_exclusivo?.monto || 0,
        porcentaje: Math.round(((dist?.contenido_exclusivo?.monto || 0) / total) * 100)
      },
      otros: {
        monto: dist?.otros?.monto || 0,
        porcentaje: Math.round(((dist?.otros?.monto || 0) / total) * 100)
      }
    };
  }

  private mapearDetalles(detalles: any[]): DetalleIngreso[] {
    if (!Array.isArray(detalles)) return [];

    return detalles.slice(0, 10).map(detalle => ({
      fecha: detalle.fecha || new Date().toISOString(),
      membresias: detalle.ingresos_membresias || 0,
      propinas: detalle.ingresos_propinas || 0,
      contenido: detalle.ingresos_contenido || 0,
      total: detalle.ingresos_totales || detalle.total_dia || 0,
      transacciones: detalle.transacciones_totales || 0
    }));
  }

  private crearEstadisticasVacias(): EstadisticasSimples {
    return {
      ingresos_totales: 0,
      ingresos_netos: 0,
      promedio_diario: 0,
      mejor_dia: {
        fecha: new Date().toISOString(),
        total: 0
      },
      crecimiento: 0
    };
  }

  private crearDistribucionVacia(): DistribucionSimple {
    return {
      membresias: { monto: 0, porcentaje: 0 },
      propinas: { monto: 0, porcentaje: 0 },
      contenido_exclusivo: { monto: 0, porcentaje: 0 },
      otros: { monto: 0, porcentaje: 0 }
    };
  }

  private crearEstadisticasDesdeReporte(reporte: any): EstadisticasSimples {
    return {
      ingresos_totales: reporte.ingresos_totales || 0,
      ingresos_netos: reporte.ingresos_netos || 0,
      promedio_diario: (reporte.ingresos_totales || 0) / 30,
      mejor_dia: {
        fecha: new Date().toISOString().split('T')[0],
        total: reporte.ingresos_totales || 0
      },
      crecimiento: 0
    };
  }

  private crearDistribucionDesdeReporte(reporte: any): DistribucionSimple {
    const total = reporte.ingresos_totales || 0;
    return {
      membresias: { 
        monto: reporte.ingresos_membresias || 0, 
        porcentaje: total > 0 ? (reporte.ingresos_membresias / total) * 100 : 0 
      },
      propinas: { 
        monto: reporte.ingresos_propinas || 0, 
        porcentaje: total > 0 ? (reporte.ingresos_propinas / total) * 100 : 0 
      },
      contenido_exclusivo: { 
        monto: reporte.ingresos_contenido_exclusivo || 0, 
        porcentaje: total > 0 ? (reporte.ingresos_contenido_exclusivo / total) * 100 : 0 
      },
      otros: { 
        monto: reporte.ingresos_recompensas || 0, 
        porcentaje: total > 0 ? (reporte.ingresos_recompensas / total) * 100 : 0 
      }
    };
  }
}
