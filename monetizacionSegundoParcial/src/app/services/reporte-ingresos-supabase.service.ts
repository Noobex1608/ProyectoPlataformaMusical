import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { SupabaseClientService } from './supabase-client.service';
import { supabase, MonetizacionTables } from '../supabase.service';
import {
  ReporteIngresos,
  DetalleIngresosDiarios,
  EstadisticasIngresos,
  DistribucionIngresos,
  ProyeccionIngresos,
  ConfiguracionReporte
} from '../models/reporte-ingresos.model';

export interface FiltrosReporte {
  fechaInicio: string;
  fechaFin: string;
  tiposIngreso: string[];
  monedas?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReporteIngresosSupabaseService {

  constructor(private supabaseClient: SupabaseClientService) {}

  // ===============================================
  // MÉTODOS PRINCIPALES DE REPORTES
  // ===============================================

  /**
   * Obtener reporte completo de ingresos para un artista
   */
  obtenerReporteIngresos(artistaId: string, configuracion: ConfiguracionReporte): Observable<ReporteIngresos> {
    const filtros: FiltrosReporte = {
      fechaInicio: configuracion.fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      fechaFin: configuracion.fecha_fin || new Date().toISOString().split('T')[0],
      tiposIngreso: configuracion.filtros.fuentes_ingreso || ['membresias', 'propinas', 'contenido', 'recompensas']
    };

    return forkJoin({
      transacciones: this.obtenerTransaccionesDirectas(artistaId, filtros),
      propinas: this.obtenerPropinasDirectas(artistaId, filtros),
      membresias: this.obtenerIngresosMembresias(artistaId, filtros)
    }).pipe(
      map(({ transacciones, propinas, membresias }) => {
        // Calcular totales con tipos seguros
        const totalTransacciones = transacciones.reduce((sum: number, t: any) => sum + Number(t.monto_neto || 0), 0);
        const totalPropinas = propinas.reduce((sum: number, p: any) => sum + Number(p.monto_neto || 0), 0);
        const totalMembresias = membresias.reduce((sum: number, m: any) => sum + Number(m.precio_pagado || 0), 0);
        
        const ingresosTotales = totalTransacciones + totalPropinas + totalMembresias;
        const comisionesTotales = transacciones.reduce((sum: number, t: any) => sum + Number(t.monto_comision || 0), 0) + 
                                  propinas.reduce((sum: number, p: any) => sum + Number(p.comision || 0), 0);
        const ingresosNetos = ingresosTotales - comisionesTotales;

        return {
          id: `reporte_${artistaId}_${Date.now()}`,
          artista_id: artistaId,
          periodo: configuracion.tipo_periodo,
          fecha_inicio: configuracion.fecha_inicio || filtros.fechaInicio,
          fecha_fin: configuracion.fecha_fin || filtros.fechaFin,
          ingresos_totales: ingresosTotales,
          ingresos_membresias: totalMembresias,
          ingresos_propinas: totalPropinas,
          ingresos_contenido_exclusivo: totalTransacciones,
          ingresos_recompensas: 0,
          comisiones_plataforma: comisionesTotales,
          ingresos_netos: ingresosNetos,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as ReporteIngresos;
      }),
      catchError(error => {
        console.error('Error generando reporte de ingresos:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener estadísticas generales de ingresos
   */
  obtenerEstadisticasIngresos(artistaId: string, filtros: FiltrosReporte): Observable<EstadisticasIngresos> {
    return forkJoin({
      transacciones: this.obtenerTransaccionesDirectas(artistaId, filtros),
      propinas: this.obtenerPropinasDirectas(artistaId, filtros),
      membresias: this.obtenerIngresosMembresias(artistaId, filtros)
    }).pipe(
      map(({ transacciones, propinas, membresias }) => {
        // Calcular totales con tipos seguros
        const totalTransacciones = transacciones.reduce((sum: number, t: any) => sum + Number(t.monto_neto || 0), 0);
        const totalPropinas = propinas.reduce((sum: number, p: any) => sum + Number(p.monto_neto || 0), 0);
        const totalMembresias = membresias.reduce((sum: number, m: any) => sum + Number(m.precio_pagado || 0), 0);
        
        const ingresosTotales = totalTransacciones + totalPropinas + totalMembresias;
        const comisionesTotales = transacciones.reduce((sum: number, t: any) => sum + Number(t.monto_comision || 0), 0) + 
                                  propinas.reduce((sum: number, p: any) => sum + Number(p.comision || 0), 0);
        const ingresosNetos = ingresosTotales - comisionesTotales;

        // Calcular datos del mejor día desde propinas (ejemplo)
        const mejorDia = {
          fecha: new Date().toISOString().split('T')[0],
          ingresos_membresias: totalMembresias,
          ingresos_propinas: totalPropinas,
          ingresos_contenido: totalTransacciones,
          ingresos_recompensas: 0,
          total_dia: ingresosTotales,
          transacciones_count: transacciones.length + propinas.length + membresias.length
        };

        // Crear reportes para periodos actual y anterior (simplificado)
        const reporteActual: ReporteIngresos = {
          id: `actual_${artistaId}_${Date.now()}`,
          artista_id: artistaId,
          periodo: 'personalizado',
          fecha_inicio: filtros.fechaInicio,
          fecha_fin: filtros.fechaFin,
          ingresos_totales: ingresosTotales,
          ingresos_membresias: totalMembresias,
          ingresos_propinas: totalPropinas,
          ingresos_contenido_exclusivo: totalTransacciones,
          ingresos_recompensas: 0,
          comisiones_plataforma: comisionesTotales,
          ingresos_netos: ingresosNetos,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const reporteAnterior: ReporteIngresos = {
          ...reporteActual,
          id: `anterior_${artistaId}_${Date.now()}`,
          ingresos_totales: 0,
          ingresos_membresias: 0,
          ingresos_propinas: 0,
          ingresos_contenido_exclusivo: 0,
          ingresos_recompensas: 0,
          comisiones_plataforma: 0,
          ingresos_netos: 0
        };

        // Determinar fuente principal de ingresos
        const fuentes = [
          { tipo: 'membresias' as const, monto: totalMembresias },
          { tipo: 'propinas' as const, monto: totalPropinas },
          { tipo: 'contenido' as const, monto: totalTransacciones },
          { tipo: 'recompensas' as const, monto: 0 }
        ];
        
        const fuentePrincipal = fuentes.reduce((max, fuente) => 
          fuente.monto > max.monto ? fuente : max
        );

        return {
          periodo_actual: reporteActual,
          periodo_anterior: reporteAnterior,
          crecimiento_porcentual: 0, // Simplificado por ahora
          tendencia: 'estable' as const,
          promedio_diario: ingresosTotales / 30, // Simplificado
          dia_mayor_ingreso: mejorDia,
          fuente_principal: {
            tipo: fuentePrincipal.tipo,
            porcentaje: ingresosTotales > 0 ? (fuentePrincipal.monto / ingresosTotales) * 100 : 0,
            monto: fuentePrincipal.monto
          }
        };
      }),
      catchError(error => {
        console.error('Error calculando estadísticas:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener detalles diarios de ingresos
   */
  obtenerDetallesIngresosDiarios(artistaId: string, filtros: FiltrosReporte): Observable<DetalleIngresosDiarios[]> {
    return forkJoin({
      transacciones: this.obtenerTransaccionesDirectas(artistaId, filtros),
      propinas: this.obtenerPropinasDirectas(artistaId, filtros),
      membresias: this.obtenerIngresosMembresias(artistaId, filtros)
    }).pipe(
      map(({ transacciones, propinas, membresias }) => {
        const detallesPorDia = new Map<string, DetalleIngresosDiarios>();

        // Procesar transacciones
        transacciones.forEach((transaccion: any) => {
          const fecha = transaccion.fecha.split('T')[0];
          
          if (!detallesPorDia.has(fecha)) {
            detallesPorDia.set(fecha, {
              fecha,
              ingresos_membresias: 0,
              ingresos_propinas: 0,
              ingresos_contenido: 0,
              ingresos_recompensas: 0,
              total_dia: 0,
              transacciones_count: 0
            });
          }
          
          const detalle = detallesPorDia.get(fecha)!;
          detalle.ingresos_contenido += Number(transaccion.monto_neto || 0);
          detalle.transacciones_count++;
          detalle.total_dia += Number(transaccion.monto_neto || 0);
        });

        // Procesar propinas
        propinas.forEach((propina: any) => {
          const fecha = propina.fecha.split('T')[0];
          
          if (!detallesPorDia.has(fecha)) {
            detallesPorDia.set(fecha, {
              fecha,
              ingresos_membresias: 0,
              ingresos_propinas: 0,
              ingresos_contenido: 0,
              ingresos_recompensas: 0,
              total_dia: 0,
              transacciones_count: 0
            });
          }
          
          const detalle = detallesPorDia.get(fecha)!;
          detalle.ingresos_propinas += Number(propina.monto_neto || 0);
          detalle.transacciones_count++;
          detalle.total_dia += Number(propina.monto_neto || 0);
        });

        // Procesar membresías
        membresias.forEach((membresia: any) => {
          const fecha = membresia.fecha_inicio.split('T')[0];
          
          if (!detallesPorDia.has(fecha)) {
            detallesPorDia.set(fecha, {
              fecha,
              ingresos_membresias: 0,
              ingresos_propinas: 0,
              ingresos_contenido: 0,
              ingresos_recompensas: 0,
              total_dia: 0,
              transacciones_count: 0
            });
          }
          
          const detalle = detallesPorDia.get(fecha)!;
          detalle.ingresos_membresias += Number(membresia.precio_pagado || 0);
          detalle.transacciones_count++;
          detalle.total_dia += Number(membresia.precio_pagado || 0);
        });

        return Array.from(detallesPorDia.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
      }),
      catchError(error => {
        console.error('Error obteniendo detalles diarios:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener distribución de ingresos por fuente
   */
  obtenerDistribucionIngresos(artistaId: string, filtros: FiltrosReporte): Observable<DistribucionIngresos> {
    return this.obtenerTransaccionesArtista(artistaId, filtros).pipe(
      map(transacciones => {
        const distribucion = {
          membresias: { monto: 0, transacciones: 0, porcentaje: 0 },
          propinas: { monto: 0, transacciones: 0, porcentaje: 0 },
          contenido_exclusivo: { monto: 0, transacciones: 0, porcentaje: 0 },
          recompensas: { monto: 0, transacciones: 0, porcentaje: 0 }
        };

        let totalIngresos = 0;

        transacciones.forEach(transaccion => {
          const monto = parseFloat(transaccion.monto);
          totalIngresos += monto;

          if (distribucion[transaccion.tipo as keyof typeof distribucion]) {
            distribucion[transaccion.tipo as keyof typeof distribucion].monto += monto;
            distribucion[transaccion.tipo as keyof typeof distribucion].transacciones++;
          }
        });

        // Calcular porcentajes
        Object.keys(distribucion).forEach(key => {
          const fuente = distribucion[key as keyof typeof distribucion];
          fuente.porcentaje = totalIngresos > 0 ? (fuente.monto / totalIngresos) * 100 : 0;
        });

        return distribucion;
      }),
      catchError(error => {
        console.error('Error calculando distribución:', error);
        return of({
          membresias: { monto: 0, transacciones: 0, porcentaje: 0 },
          propinas: { monto: 0, transacciones: 0, porcentaje: 0 },
          contenido_exclusivo: { monto: 0, transacciones: 0, porcentaje: 0 },
          recompensas: { monto: 0, transacciones: 0, porcentaje: 0 }
        });
      })
    );
  }

  /**
   * Calcular proyecciones de ingresos
   */
  calcularProyecciones(artistaId: string, diasFuturos: number): Observable<ProyeccionIngresos> {
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 90); // Últimos 90 días para proyección

    const filtros: FiltrosReporte = {
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0],
      tiposIngreso: ['membresias', 'propinas', 'contenido_exclusivo', 'recompensas']
    };

    return this.obtenerDetallesIngresosDiarios(artistaId, filtros).pipe(
      map(detallesDiarios => {
        if (detallesDiarios.length === 0) {
          return {
            proximos_7_dias: 0,
            proximos_30_dias: 0,
            proximos_90_dias: 0,
            confianza: 'baja' as const,
            tendencia: 'estable' as const,
            factores: ['Datos insuficientes para proyección confiable']
          };
        }

        const promedioDiario = detallesDiarios.reduce((sum, dia) => sum + dia.total_dia, 0) / detallesDiarios.length;
        
        // Calcular tendencia (simple regresión lineal)
        const tendencia = this.calcularTendencia(detallesDiarios);
        const factorTendencia = Math.max(0.5, Math.min(1.5, 1 + tendencia / 100));

        const proyeccion7dias = promedioDiario * 7 * factorTendencia;
        const proyeccion30dias = promedioDiario * 30 * factorTendencia;
        const proyeccion90dias = promedioDiario * 90 * factorTendencia;

        const confianza = this.determinarConfianza(detallesDiarios, tendencia);
        const direccionTendencia = tendencia > 5 ? 'creciente' : tendencia < -5 ? 'decreciente' : 'estable';

        return {
          proximos_7_dias: Math.round(proyeccion7dias * 100) / 100,
          proximos_30_dias: Math.round(proyeccion30dias * 100) / 100,
          proximos_90_dias: Math.round(proyeccion90dias * 100) / 100,
          confianza,
          tendencia: direccionTendencia,
          factores: this.obtenerFactoresProyeccion(detallesDiarios, tendencia)
        };
      }),
      catchError(error => {
        console.error('Error calculando proyecciones:', error);
        return of({
          proximos_7_dias: 0,
          proximos_30_dias: 0,
          proximos_90_dias: 0,
          confianza: 'baja' as const,
          tendencia: 'estable' as const,
          factores: ['Error en el cálculo de proyecciones']
        });
      })
    );
  }

  // ===============================================
  // MÉTODOS DE EXPORTACIÓN
  // ===============================================

  /**
   * Exportar datos a CSV
   */
  exportarCSV(reporte: ReporteIngresos): void {
    const csvContent = this.generarContenidoCSV(reporte);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ingresos_${reporte.artista_id}_${reporte.fecha_inicio}_${reporte.fecha_fin}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ===============================================
  // MÉTODOS PRIVADOS DE UTILIDAD
  // ===============================================

  private obtenerTransaccionesArtista(artistaId: string, filtros: FiltrosReporte): Observable<any[]> {
    let query = supabase
      .from(MonetizacionTables.TRANSACCIONES)
      .select('*')
      .eq('artista_id', artistaId)
      .gte('fecha', filtros.fechaInicio)
      .lte('fecha', filtros.fechaFin);

    if (filtros.tiposIngreso.length > 0) {
      query = query.in('tipo', filtros.tiposIngreso);
    }

    return new Observable(observer => {
      query.then(response => {
        if (response.error) {
          observer.error(response.error);
        } else {
          observer.next(response.data || []);
          observer.complete();
        }
      });
    });
  }

  private obtenerTransaccionesPeriodoAnterior(artistaId: string, filtros: FiltrosReporte): Observable<any[]> {
    const fechaInicio = new Date(filtros.fechaInicio);
    const fechaFin = new Date(filtros.fechaFin);
    const diasPeriodo = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));

    const fechaInicioAnterior = new Date(fechaInicio);
    fechaInicioAnterior.setDate(fechaInicioAnterior.getDate() - diasPeriodo);
    
    const fechaFinAnterior = new Date(fechaInicio);
    fechaFinAnterior.setDate(fechaFinAnterior.getDate() - 1);

    const filtrosAnteriores: FiltrosReporte = {
      fechaInicio: fechaInicioAnterior.toISOString().split('T')[0],
      fechaFin: fechaFinAnterior.toISOString().split('T')[0],
      tiposIngreso: filtros.tiposIngreso
    };

    return this.obtenerTransaccionesArtista(artistaId, filtrosAnteriores);
  }

  private calcularIngresosTotales(transacciones: any[]): { total: number; neto: number; comisiones: number } {
    const resultado = { total: 0, neto: 0, comisiones: 0 };
    
    transacciones.forEach(transaccion => {
      resultado.total += parseFloat(transaccion.monto);
      resultado.neto += parseFloat(transaccion.monto_neto);
      resultado.comisiones += parseFloat(transaccion.monto_comision || '0');
    });

    return resultado;
  }

  private encontrarMejorDia(transacciones: any[]): { fecha: string; total_dia: number } {
    const ingresosPorDia = new Map<string, number>();

    transacciones.forEach(transaccion => {
      const fecha = transaccion.fecha.split('T')[0];
      const monto = parseFloat(transaccion.monto);
      ingresosPorDia.set(fecha, (ingresosPorDia.get(fecha) || 0) + monto);
    });

    let mejorFecha = '';
    let mejorTotal = 0;

    ingresosPorDia.forEach((total, fecha) => {
      if (total > mejorTotal) {
        mejorTotal = total;
        mejorFecha = fecha;
      }
    });

    return { fecha: mejorFecha, total_dia: mejorTotal };
  }

  private calcularPromedioDiario(transacciones: any[], filtros: FiltrosReporte): number {
    const fechaInicio = new Date(filtros.fechaInicio);
    const fechaFin = new Date(filtros.fechaFin);
    const diasPeriodo = Math.max(1, Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)));

    const totalIngresos = transacciones.reduce((sum, t) => sum + parseFloat(t.monto), 0);
    return totalIngresos / diasPeriodo;
  }

  private calcularTasaConversion(transacciones: any[]): number {
    // Implementación simplificada - en producción conectar con analytics
    return 0.15; // 15% tasa de conversión promedio
  }

  private calcularTendencia(detallesDiarios: DetalleIngresosDiarios[]): number {
    if (detallesDiarios.length < 2) return 0;

    const valores = detallesDiarios.map(d => d.total_dia);
    const n = valores.length;
    const sumX = n * (n - 1) / 2; // suma de índices 0, 1, 2, ...
    const sumY = valores.reduce((a, b) => a + b, 0);
    const sumXY = valores.reduce((sum, val, idx) => sum + val * idx, 0);
    const sumX2 = n * (n - 1) * (2 * n - 1) / 6; // suma de cuadrados de índices

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const promedio = sumY / n;

    return promedio > 0 ? (pendiente / promedio) * 100 : 0;
  }

  private determinarConfianza(detallesDiarios: DetalleIngresosDiarios[], tendencia: number): 'alta' | 'media' | 'baja' {
    const diasDatos = detallesDiarios.length;
    const variabilidad = this.calcularVariabilidad(detallesDiarios);

    if (diasDatos >= 30 && variabilidad < 0.5) return 'alta';
    if (diasDatos >= 14 && variabilidad < 1.0) return 'media';
    return 'baja';
  }

  private calcularVariabilidad(detallesDiarios: DetalleIngresosDiarios[]): number {
    if (detallesDiarios.length === 0) return 1;

    const valores = detallesDiarios.map(d => d.total_dia);
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    const varianza = valores.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / valores.length;
    const desviacion = Math.sqrt(varianza);

    return promedio > 0 ? desviacion / promedio : 1;
  }

  private obtenerFactoresProyeccion(detallesDiarios: DetalleIngresosDiarios[], tendencia: number): string[] {
    const factores = [
      `Basado en ${detallesDiarios.length} días de datos históricos`,
      `Tendencia ${tendencia > 0 ? 'positiva' : tendencia < 0 ? 'negativa' : 'estable'} del ${Math.abs(tendencia).toFixed(1)}%`
    ];

    const promedio = detallesDiarios.reduce((sum, d) => sum + d.total_dia, 0) / detallesDiarios.length;
    if (promedio > 100) factores.push('Ingresos consistentes superiores a $100 diarios');
    if (detallesDiarios.length >= 30) factores.push('Suficientes datos históricos para alta confianza');

    return factores;
  }

  private generarContenidoCSV(reporte: ReporteIngresos): string {
    const headers = [
      'Artista ID',
      'Período',
      'Fecha Inicio',
      'Fecha Fin',
      'Ingresos Totales',
      'Ingresos Membresías',
      'Ingresos Propinas', 
      'Contenido Exclusivo',
      'Recompensas',
      'Comisiones Plataforma',
      'Ingresos Netos'
    ];

    const fila = [
      reporte.artista_id,
      reporte.periodo,
      reporte.fecha_inicio,
      reporte.fecha_fin,
      reporte.ingresos_totales.toFixed(2),
      reporte.ingresos_membresias.toFixed(2),
      reporte.ingresos_propinas.toFixed(2),
      reporte.ingresos_contenido_exclusivo.toFixed(2),
      reporte.ingresos_recompensas.toFixed(2),
      reporte.comisiones_plataforma.toFixed(2),
      reporte.ingresos_netos.toFixed(2)
    ];

    const csvContent = [headers, fila]
      .map(row => row.join(','))
      .join('\n');

    return csvContent;
  }

  private calcularIngresosPorCategoria(transacciones: any[]): {
    membresias: number;
    propinas: number;
    contenido: number;
    recompensas: number;
  } {
    const resultado = {
      membresias: 0,
      propinas: 0,
      contenido: 0,
      recompensas: 0
    };

    transacciones.forEach(transaccion => {
      const monto = parseFloat(transaccion.monto || '0');
      const tipo = transaccion.tipo_transaccion || transaccion.tipo;

      switch (tipo) {
        case 'membresia':
        case 'suscripcion':
          resultado.membresias += monto;
          break;
        case 'propina':
        case 'tip':
          resultado.propinas += monto;
          break;
        case 'contenido_exclusivo':
        case 'contenido':
          resultado.contenido += monto;
          break;
        case 'recompensa':
        case 'reward':
          resultado.recompensas += monto;
          break;
      }
    });

    return resultado;
  }

  // ===============================================
  // MÉTODOS DIRECTOS PARA TABLAS REALES
  // ===============================================

  /**
   * Obtener transacciones directas de la tabla transacciones
   */
  private obtenerTransaccionesDirectas(artistaId: string, filtros: FiltrosReporte): Observable<any[]> {
    return new Observable(observer => {
      supabase
        .from('transacciones')
        .select('*')
        .eq('artista_id', artistaId)
        .gte('fecha', filtros.fechaInicio)
        .lte('fecha', filtros.fechaFin)
        .then(response => {
          if (response.error) {
            console.error('Error obteniendo transacciones:', response.error);
            observer.error(response.error);
          } else {
            observer.next(response.data || []);
            observer.complete();
          }
        });
    });
  }

  /**
   * Obtener propinas directas de la tabla propinas
   */
  private obtenerPropinasDirectas(artistaId: string, filtros: FiltrosReporte): Observable<any[]> {
    return new Observable(observer => {
      supabase
        .from('propinas')
        .select('*')
        .eq('artista_id', artistaId)
        .gte('fecha', filtros.fechaInicio)
        .lte('fecha', filtros.fechaFin)
        .then(response => {
          if (response.error) {
            console.error('Error obteniendo propinas:', response.error);
            observer.error(response.error);
          } else {
            observer.next(response.data || []);
            observer.complete();
          }
        });
    });
  }

  /**
   * Obtener ingresos de membresías desde suscripciones_usuario
   */
  private obtenerIngresosMembresias(artistaId: string, filtros: FiltrosReporte): Observable<any[]> {
    return new Observable(observer => {
      supabase
        .from('suscripciones_usuario')
        .select('*, membresias!inner(nombre, precio)')
        .eq('artista_id', artistaId)
        .gte('fecha_inicio', filtros.fechaInicio)
        .lte('fecha_inicio', filtros.fechaFin)
        .eq('activa', true)
        .then(response => {
          if (response.error) {
            console.error('Error obteniendo membresías:', response.error);
            observer.error(response.error);
          } else {
            observer.next(response.data || []);
            observer.complete();
          }
        });
    });
  }
}
