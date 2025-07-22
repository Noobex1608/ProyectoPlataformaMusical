export interface ConfiguracionMonetizacion {
  id: string;
  artista_id: string;
  configuracion_precios: ConfiguracionPrecios;
  metodos_pago: MetodoPago[];
  politicas: PoliticasMonetizacion;
  configuracion_avanzada: ConfiguracionAvanzada;
  fecha_actualizacion: string;
  activa: boolean;
}

export interface ConfiguracionPrecios {
  membresias: {
    basica: PrecioMembresia;
    premium: PrecioMembresia;
    vip: PrecioMembresia;
    personalizada?: PrecioMembresia[];
  };
  propinas: {
    sugeridas: number[];
    minima: number;
    maxima: number;
    moneda: string;
  };
  contenido_exclusivo: {
    precio_base: number;
    descuentos: DescuentoContenido[];
    estrategia_precios: 'fijo' | 'dinamico' | 'por_tiempo';
  };
  recompensas: {
    puntos_por_dolar: number;
    valor_punto: number;
    bonificaciones: BonificacionRecompensa[];
  };
}

export interface PrecioMembresia {
  id: string;
  nombre: string;
  precio_mensual: number;
  precio_anual: number;
  descuento_anual: number;
  beneficios: string[];
  activa: boolean;
  limite_suscriptores?: number;
}

export interface DescuentoContenido {
  tipo: 'primera_compra' | 'volumen' | 'fidelidad' | 'temporal';
  condicion: string;
  porcentaje: number;
  activo: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface BonificacionRecompensa {
  evento: 'registro' | 'primera_compra' | 'referido' | 'aniversario';
  puntos: number;
  descripcion: string;
  activa: boolean;
}

export interface MetodoPago {
  id: string;
  tipo: 'tarjeta_credito' | 'tarjeta_debito' | 'paypal' | 'stripe' | 'cripto' | 'transferencia';
  nombre: string;
  proveedor: string;
  configuracion: any; // JSON con datos específicos del proveedor
  comision_porcentaje: number;
  comision_fija: number;
  monedas_soportadas: string[];
  activo: boolean;
  configurado: boolean;
  fecha_configuracion?: string;
}

export interface PoliticasMonetizacion {
  reembolsos: {
    periodo_dias: number;
    tipos_permitidos: string[];
    proceso_automatico: boolean;
    politica_texto: string;
  };
  suscripciones: {
    periodo_gracia_dias: number;
    cancelacion_inmediata: boolean;
    renovacion_automatica: boolean;
    notificaciones_vencimiento: boolean;
  };
  contenido: {
    acceso_perpetuo: boolean;
    descarga_permitida: boolean;
    limite_dispositivos: number;
    drm_habilitado: boolean;
  };
  fiscales: {
    incluir_impuestos: boolean;
    porcentaje_impuesto: number;
    facturacion_automatica: boolean;
    datos_fiscales_requeridos: boolean;
  };
}

export interface ConfiguracionAvanzada {
  notificaciones: {
    nuevas_suscripciones: boolean;
    pagos_recibidos: boolean;
    cancelaciones: boolean;
    problemas_pago: boolean;
    email_notificaciones: string;
  };
  analytics: {
    tracking_habilitado: boolean;
    metricas_publicas: boolean;
    integracion_google_analytics?: string;
    webhook_eventos: string[];
  };
  integraciones: {
    mailchimp?: IntegracionMailchimp;
    discord?: IntegracionDiscord;
    spotify?: IntegracionSpotify;
    youtube?: IntegracionYoutube;
  };
  seguridad: {
    autenticacion_dos_factores: boolean;
    cifrado_datos: boolean;
    backup_automatico: boolean;
    auditoria_accesos: boolean;
  };
}

export interface IntegracionMailchimp {
  api_key: string;
  lista_suscriptores: string;
  automatizaciones: boolean;
  configurada: boolean;
}

export interface IntegracionDiscord {
  webhook_url: string;
  canal_notificaciones: string;
  roles_suscriptores: { [key: string]: string };
  configurada: boolean;
}

export interface IntegracionSpotify {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  sincronizar_releases: boolean;
  configurada: boolean;
}

export interface IntegracionYoutube {
  api_key: string;
  canal_id: string;
  monetizacion_automatica: boolean;
  configurada: boolean;
}

export interface PlantillaConfiguracion {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'principiante' | 'intermedio' | 'avanzado';
  configuracion: Partial<ConfiguracionMonetizacion>;
  popular: boolean;
}

export interface ValidacionConfiguracion {
  valida: boolean;
  errores: ErrorValidacion[];
  advertencias: AdvertenciaValidacion[];
  completitud: number; // 0-100%
}

export interface ErrorValidacion {
  campo: string;
  mensaje: string;
  tipo: 'requerido' | 'formato' | 'rango' | 'dependencia';
}

export interface AdvertenciaValidacion {
  campo: string;
  mensaje: string;
  impacto: 'bajo' | 'medio' | 'alto';
}

export interface HistorialConfiguracion {
  id: string;
  fecha: string;
  usuario: string;
  cambios: CambioConfiguracion[];
  razon: string;
}

export interface CambioConfiguracion {
  campo: string;
  valor_anterior: any;
  valor_nuevo: any;
  seccion: string;
}
