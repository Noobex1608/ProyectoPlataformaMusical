export interface ReporteIngresos {
  id: string;
  artista_id: string;
  periodo: 'diario' | 'semanal' | 'mensual' | 'anual' | 'personalizado';
  fecha_inicio: string;
  fecha_fin: string;
  ingresos_totales: number;
  ingresos_membresias: number;
  ingresos_propinas: number;
  ingresos_contenido_exclusivo: number;
  ingresos_recompensas: number;
  comisiones_plataforma: number;
  ingresos_netos: number;
  created_at: string;
  updated_at: string;
}

export interface DetalleIngresosDiarios {
  fecha: string;
  ingresos_membresias: number;
  ingresos_propinas: number;
  ingresos_contenido: number;
  ingresos_recompensas: number;
  total_dia: number;
  transacciones_count: number;
}

export interface EstadisticasIngresos {
  periodo_actual: ReporteIngresos;
  periodo_anterior: ReporteIngresos;
  crecimiento_porcentual: number;
  tendencia: 'positiva' | 'negativa' | 'estable';
  promedio_diario: number;
  dia_mayor_ingreso: DetalleIngresosDiarios;
  fuente_principal: {
    tipo: 'membresias' | 'propinas' | 'contenido' | 'recompensas';
    porcentaje: number;
    monto: number;
  };
}

export interface ConfiguracionReporte {
  tipo_periodo: 'diario' | 'semanal' | 'mensual' | 'anual' | 'personalizado';
  fecha_inicio?: string;
  fecha_fin?: string;
  incluir_comisiones: boolean;
  agrupar_por: 'dia' | 'semana' | 'mes';
  filtros: {
    fuentes_ingreso: string[];
    monto_minimo?: number;
    monto_maximo?: number;
  };
}

export interface DatoGrafico {
  fecha: string;
  valor: number;
  categoria: string;
  color?: string;
}

export interface MetricasComparativas {
  actual: number;
  anterior: number;
  diferencia: number;
  porcentaje_cambio: number;
  es_positivo: boolean;
}

export interface DistribucionIngresos {
  membresias: {
    monto: number;
    porcentaje: number;
    transacciones: number;
  };
  propinas: {
    monto: number;
    porcentaje: number;
    transacciones: number;
  };
  contenido_exclusivo: {
    monto: number;
    porcentaje: number;
    transacciones: number;
  };
  recompensas: {
    monto: number;
    porcentaje: number;
    transacciones: number;
  };
}

export interface ProyeccionIngresos {
  proximos_7_dias: number;
  proximos_30_dias: number;
  proximos_90_dias: number;
  confianza: 'alta' | 'media' | 'baja';
  factores: string[];
}
