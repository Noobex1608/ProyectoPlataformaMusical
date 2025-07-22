import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { SupabaseClientService } from './supabase-client.service';
import { supabase, MonetizacionTables } from '../supabase.service';
import {
  ConfiguracionMonetizacion,
  ConfiguracionPrecios,
  MetodoPago,
  PoliticasMonetizacion,
  ConfiguracionAvanzada,
  ValidacionConfiguracion,
  HistorialConfiguracion,
  PlantillaConfiguracion
} from '../models/configuracion-monetizacion.model';

interface ConfiguracionSupabase {
  id?: number;
  artista_id: string;
  configuracion_general: any;
  configuracion_contenido: any;
  configuracion_pagos: any;
  configuracion_privacidad: any;
  fecha_actualizacion: string;
  created_at?: string;
}

interface MembresiaSupabase {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  artista_id: string;
  duracion_dias: number;
  activa: boolean;
  beneficios: any;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionMonetizacionSupabaseService {

  constructor(private supabaseClient: SupabaseClientService) {}

  // ===============================================
  // MÉTODOS PRINCIPALES DE CONFIGURACIÓN
  // ===============================================

  /**
   * Obtener configuración completa de monetización para un artista
   */
  obtenerConfiguracion(artistaId: string): Observable<ConfiguracionMonetizacion> {
    return forkJoin({
      configuracion: this.obtenerConfiguracionBase(artistaId),
      membresias: this.obtenerMembresiasArtista(artistaId)
    }).pipe(
      map(({ configuracion, membresias }) => {
        return this.mapearConfiguracionCompleta(artistaId, configuracion, membresias);
      }),
      catchError(error => {
        console.error('Error obteniendo configuración:', error);
        // Retornar configuración por defecto en caso de error
        return of(this.obtenerConfiguracionPorDefecto(artistaId));
      })
    );
  }

  /**
   * Guardar configuración completa de monetización
   */
  guardarConfiguracion(configuracion: ConfiguracionMonetizacion): Observable<ConfiguracionMonetizacion> {
    return forkJoin({
      configuracionBase: this.guardarConfiguracionBase(configuracion),
      membresias: this.guardarMembresias(configuracion)
    }).pipe(
      switchMap(() => this.obtenerConfiguracion(configuracion.artista_id)),
      catchError(error => {
        console.error('Error guardando configuración:', error);
        throw error;
      })
    );
  }

  /**
   * Actualizar solo una sección específica de la configuración
   */
  actualizarSeccion(artistaId: string, seccion: string, datos: any): Observable<boolean> {
    switch (seccion) {
      case 'precios':
        return this.actualizarConfiguracionPrecios(artistaId, datos);
      case 'metodos_pago':
        return this.actualizarMetodosPago(artistaId, datos);
      case 'politicas':
        return this.actualizarPoliticas(artistaId, datos);
      case 'avanzada':
        return this.actualizarConfiguracionAvanzada(artistaId, datos);
      default:
        return of(false);
    }
  }

  /**
   * Validar configuración antes de guardar
   */
  validarConfiguracion(configuracion: ConfiguracionMonetizacion): Observable<ValidacionConfiguracion> {
    return of(this.validarConfiguracionLocal(configuracion)).pipe(
      catchError(error => {
        console.error('Error validando configuración:', error);
        return of({
          valida: false,
          errores: [{ campo: 'general', mensaje: 'Error interno de validación', tipo: 'formato' as const }],
          advertencias: [],
          completitud: 0
        });
      })
    );
  }

  /**
   * Obtener plantillas predefinidas de configuración
   */
  obtenerPlantillas(): Observable<PlantillaConfiguracion[]> {
    // Por ahora retornamos plantillas estáticas, pero podrían venir de la BD
    const plantillas: PlantillaConfiguracion[] = [
      {
        id: 'principiante',
        nombre: 'Configuración Básica',
        descripcion: 'Ideal para artistas que empiezan con monetización',
        tipo: 'principiante',
        configuracion: this.obtenerPlantillaPrincipiante(),
        popular: true
      },
      {
        id: 'intermedio',
        nombre: 'Configuración Estándar',
        descripcion: 'Para artistas con audiencia establecida',
        tipo: 'intermedio',
        configuracion: this.obtenerPlantillaIntermedio(),
        popular: false
      },
      {
        id: 'avanzado',
        nombre: 'Configuración Premium',
        descripcion: 'Máxima personalización y funcionalidades',
        tipo: 'avanzado',
        configuracion: this.obtenerPlantillaAvanzado(),
        popular: false
      }
    ];

    return of(plantillas);
  }

  /**
   * Aplicar plantilla de configuración
   */
  aplicarPlantilla(artistaId: string, plantillaId: string): Observable<ConfiguracionMonetizacion> {
    return this.obtenerPlantillas().pipe(
      switchMap(plantillas => {
        const plantilla = plantillas.find(p => p.id === plantillaId);
        if (!plantilla) {
          throw new Error(`Plantilla ${plantillaId} no encontrada`);
        }

        const configuracion: ConfiguracionMonetizacion = {
          id: `config_${artistaId}`,
          artista_id: artistaId,
          configuracion_precios: plantilla.configuracion?.configuracion_precios || {
            membresias: {
              basica: {
                id: 'basica',
                nombre: 'Básica',
                precio_mensual: 5,
                precio_anual: 50,
                descuento_anual: 10,
                beneficios: ['Acceso a contenido básico'],
                activa: true
              },
              premium: {
                id: 'premium',
                nombre: 'Premium',
                precio_mensual: 10,
                precio_anual: 100,
                descuento_anual: 15,
                beneficios: ['Acceso a todo el contenido'],
                activa: true
              },
              vip: {
                id: 'vip',
                nombre: 'VIP',
                precio_mensual: 20,
                precio_anual: 200,
                descuento_anual: 20,
                beneficios: ['Acceso completo + beneficios exclusivos'],
                activa: true
              }
            },
            propinas: {
              sugeridas: [1, 5, 10, 20],
              minima: 1,
              maxima: 100,
              moneda: 'USD'
            },
            contenido_exclusivo: {
              precio_base: 5,
              descuentos: [],
              estrategia_precios: 'fijo'
            },
            recompensas: {
              puntos_por_dolar: 10,
              valor_punto: 0.01,
              bonificaciones: []
            }
          },
          metodos_pago: plantilla.configuracion?.metodos_pago || [],
          politicas: plantilla.configuracion?.politicas || {
            reembolsos: {
              periodo_dias: 7,
              tipos_permitidos: ['defecto_tecnico'],
              proceso_automatico: false,
              politica_texto: 'Política de reembolsos estándar'
            },
            suscripciones: {
              periodo_gracia_dias: 3,
              cancelacion_inmediata: false,
              renovacion_automatica: true,
              notificaciones_vencimiento: true
            },
            contenido: {
              acceso_perpetuo: false,
              descarga_permitida: false,
              limite_dispositivos: 3,
              drm_habilitado: true
            },
            fiscales: {
              incluir_impuestos: true,
              porcentaje_impuesto: 0,
              facturacion_automatica: true,
              datos_fiscales_requeridos: false
            }
          },
          configuracion_avanzada: plantilla.configuracion?.configuracion_avanzada || {
            notificaciones: {
              nuevas_suscripciones: true,
              pagos_recibidos: true,
              cancelaciones: true,
              problemas_pago: true,
              email_notificaciones: ''
            },
            analytics: {
              tracking_habilitado: true,
              metricas_publicas: false,
              webhook_eventos: []
            },
            integraciones: {},
            seguridad: {
              autenticacion_dos_factores: false,
              cifrado_datos: true,
              backup_automatico: true,
              auditoria_accesos: false
            }
          },
          fecha_actualizacion: new Date().toISOString(),
          activa: true
        };

        return this.guardarConfiguracion(configuracion);
      }),
      catchError(error => {
        console.error('Error aplicando plantilla:', error);
        throw error;
      })
    );
  }

  /**
   * Configurar método de pago específico
   */
  configurarMetodoPago(metodoPago: MetodoPago): Observable<boolean> {
    // Aquí se integraría con APIs de pago reales (Stripe, PayPal, etc.)
    return of(true).pipe(
      map(() => {
        metodoPago.configurado = true;
        metodoPago.fecha_configuracion = new Date().toISOString();
        return true;
      }),
      catchError(error => {
        console.error('Error configurando método de pago:', error);
        return of(false);
      })
    );
  }

  /**
   * Probar integración con servicio externo
   */
  probarIntegracion(tipo: string, configuracion: any): Observable<{ exito: boolean; mensaje: string }> {
    // Simulación de prueba de integración - en producción conectar con APIs reales
    return of(Math.random() > 0.2).pipe(
      map(exito => ({
        exito,
        mensaje: exito 
          ? `Integración con ${tipo} configurada correctamente`
          : `Error al conectar con ${tipo}. Verifica las credenciales.`
      })),
      catchError(error => of({
        exito: false,
        mensaje: `Error interno probando integración: ${error.message}`
      }))
    );
  }

  // ===============================================
  // MÉTODOS PRIVADOS DE ACCESO A DATOS
  // ===============================================

  private obtenerConfiguracionBase(artistaId: string): Observable<ConfiguracionSupabase | null> {
    return new Observable<ConfiguracionSupabase | null>(observer => {
      supabase
        .from(MonetizacionTables.CONFIGURACION_ARTISTA)
        .select('*')
        .eq('artista_id', artistaId)
        .single()
        .then(response => {
          if (response.error) {
            if (response.error.code === 'PGRST116') {
              // No existe configuración, retornar null
              observer.next(null);
            } else {
              observer.error(response.error);
            }
          } else {
            observer.next(response.data);
          }
          observer.complete();
        });
    });
  }

  private obtenerMembresiasArtista(artistaId: string): Observable<MembresiaSupabase[]> {
    return new Observable<MembresiaSupabase[]>(observer => {
      supabase
        .from(MonetizacionTables.MEMBRESIAS)
        .select('*')
        .eq('artista_id', artistaId)
        .order('created_at', { ascending: false })
        .then(response => {
          if (response.error) {
            observer.error(response.error);
          } else {
            observer.next(response.data || []);
          }
          observer.complete();
        });
    });
  }

  private guardarConfiguracionBase(configuracion: ConfiguracionMonetizacion): Observable<boolean> {
    const configSupabase: Omit<ConfiguracionSupabase, 'id' | 'created_at'> = {
      artista_id: configuracion.artista_id,
      configuracion_general: {
        propinas: configuracion.configuracion_precios.propinas,
        contenido_exclusivo: configuracion.configuracion_precios.contenido_exclusivo,
        recompensas: configuracion.configuracion_precios.recompensas
      },
      configuracion_pagos: {
        metodos_pago: configuracion.metodos_pago
      },
      configuracion_privacidad: {
        politicas: configuracion.politicas
      },
      configuracion_contenido: {
        configuracion_avanzada: configuracion.configuracion_avanzada
      },
      fecha_actualizacion: new Date().toISOString()
    };

    return new Observable<boolean>(observer => {
      supabase
        .from(MonetizacionTables.CONFIGURACION_ARTISTA)
        .upsert(configSupabase)
        .then(response => {
          if (response.error) {
            observer.error(response.error);
          } else {
            observer.next(true);
          }
          observer.complete();
        });
    });
  }

  private guardarMembresias(configuracion: ConfiguracionMonetizacion): Observable<boolean> {
    const membresias = [
      {
        nombre: configuracion.configuracion_precios.membresias.basica.nombre,
        descripcion: configuracion.configuracion_precios.membresias.basica.beneficios.join(', '),
        precio: configuracion.configuracion_precios.membresias.basica.precio_mensual,
        artista_id: configuracion.artista_id,
        duracion_dias: 30,
        activa: configuracion.configuracion_precios.membresias.basica.activa,
        beneficios: { 
          lista: configuracion.configuracion_precios.membresias.basica.beneficios,
          tipo: 'basica'
        }
      },
      {
        nombre: configuracion.configuracion_precios.membresias.premium.nombre,
        descripcion: configuracion.configuracion_precios.membresias.premium.beneficios.join(', '),
        precio: configuracion.configuracion_precios.membresias.premium.precio_mensual,
        artista_id: configuracion.artista_id,
        duracion_dias: 30,
        activa: configuracion.configuracion_precios.membresias.premium.activa,
        beneficios: { 
          lista: configuracion.configuracion_precios.membresias.premium.beneficios,
          tipo: 'premium'
        }
      },
      {
        nombre: configuracion.configuracion_precios.membresias.vip.nombre,
        descripcion: configuracion.configuracion_precios.membresias.vip.beneficios.join(', '),
        precio: configuracion.configuracion_precios.membresias.vip.precio_mensual,
        artista_id: configuracion.artista_id,
        duracion_dias: 30,
        activa: configuracion.configuracion_precios.membresias.vip.activa,
        beneficios: { 
          lista: configuracion.configuracion_precios.membresias.vip.beneficios,
          tipo: 'vip',
          limite_suscriptores: configuracion.configuracion_precios.membresias.vip.limite_suscriptores
        }
      }
    ];

    return new Observable<boolean>(observer => {
      // Primero eliminar membresías existentes
      supabase
        .from(MonetizacionTables.MEMBRESIAS)
        .delete()
        .eq('artista_id', configuracion.artista_id)
        .then(deleteResponse => {
          if (deleteResponse.error) {
            observer.error(deleteResponse.error);
            return;
          }

          // Luego insertar las nuevas membresías
          supabase
            .from(MonetizacionTables.MEMBRESIAS)
            .insert(membresias)
            .then(insertResponse => {
              if (insertResponse.error) {
                observer.error(insertResponse.error);
              } else {
                observer.next(true);
              }
              observer.complete();
            });
        });
    });
  }

  private actualizarConfiguracionPrecios(artistaId: string, datos: any): Observable<boolean> {
    return this.obtenerConfiguracionBase(artistaId).pipe(
      switchMap(config => {
        const configuracionActualizada = {
          ...config,
          configuracion_general: {
            ...(config?.configuracion_general || {}),
            propinas: datos.propinas,
            contenido_exclusivo: datos.contenido_exclusivo,
            recompensas: datos.recompensas
          },
          fecha_actualizacion: new Date().toISOString()
        };

        return new Observable<boolean>(observer => {
          supabase
            .from(MonetizacionTables.CONFIGURACION_ARTISTA)
            .upsert(configuracionActualizada)
            .then(response => {
              observer.next(!response.error);
              observer.complete();
            });
        });
      })
    );
  }

  private actualizarMetodosPago(artistaId: string, metodos: MetodoPago[]): Observable<boolean> {
    return this.obtenerConfiguracionBase(artistaId).pipe(
      switchMap(config => {
        const configuracionActualizada = {
          ...config,
          configuracion_pagos: {
            ...(config?.configuracion_pagos || {}),
            metodos_pago: metodos
          },
          fecha_actualizacion: new Date().toISOString()
        };

        return new Observable<boolean>(observer => {
          supabase
            .from(MonetizacionTables.CONFIGURACION_ARTISTA)
            .upsert(configuracionActualizada)
            .then(response => {
              observer.next(!response.error);
              observer.complete();
            });
        });
      })
    );
  }

  private actualizarPoliticas(artistaId: string, politicas: any): Observable<boolean> {
    return this.obtenerConfiguracionBase(artistaId).pipe(
      switchMap(config => {
        const configuracionActualizada = {
          ...config,
          configuracion_privacidad: {
            ...(config?.configuracion_privacidad || {}),
            politicas
          },
          fecha_actualizacion: new Date().toISOString()
        };

        return new Observable<boolean>(observer => {
          supabase
            .from(MonetizacionTables.CONFIGURACION_ARTISTA)
            .upsert(configuracionActualizada)
            .then(response => {
              observer.next(!response.error);
              observer.complete();
            });
        });
      })
    );
  }

  private actualizarConfiguracionAvanzada(artistaId: string, avanzada: any): Observable<boolean> {
    return this.obtenerConfiguracionBase(artistaId).pipe(
      switchMap(config => {
        const configuracionActualizada = {
          ...config,
          configuracion_contenido: {
            ...(config?.configuracion_contenido || {}),
            configuracion_avanzada: avanzada
          },
          fecha_actualizacion: new Date().toISOString()
        };

        return new Observable<boolean>(observer => {
          supabase
            .from(MonetizacionTables.CONFIGURACION_ARTISTA)
            .upsert(configuracionActualizada)
            .then(response => {
              observer.next(!response.error);
              observer.complete();
            });
        });
      })
    );
  }

  // ===============================================
  // MÉTODOS DE MAPEO Y TRANSFORMACIÓN
  // ===============================================

  private mapearConfiguracionCompleta(
    artistaId: string, 
    config: ConfiguracionSupabase | null, 
    membresias: MembresiaSupabase[]
  ): ConfiguracionMonetizacion {
    
    if (!config) {
      return this.obtenerConfiguracionPorDefecto(artistaId);
    }

    // Mapear membresías por tipo
    const membresiaBasica = membresias.find(m => m.beneficios?.tipo === 'basica');
    const membresiaPremium = membresias.find(m => m.beneficios?.tipo === 'premium');
    const membresiaVip = membresias.find(m => m.beneficios?.tipo === 'vip');

    return {
      id: `config_${artistaId}`,
      artista_id: artistaId,
      configuracion_precios: {
        membresias: {
          basica: {
            id: 'basica',
            nombre: membresiaBasica?.nombre || 'Seguidor',
            precio_mensual: membresiaBasica?.precio || 4.99,
            precio_anual: (membresiaBasica?.precio || 4.99) * 10, // 17% descuento aprox
            descuento_anual: 17,
            beneficios: membresiaBasica?.beneficios?.lista || ['Contenido exclusivo básico'],
            activa: membresiaBasica?.activa ?? true
          },
          premium: {
            id: 'premium',
            nombre: membresiaPremium?.nombre || 'Fan Premium',
            precio_mensual: membresiaPremium?.precio || 9.99,
            precio_anual: (membresiaPremium?.precio || 9.99) * 10,
            descuento_anual: 17,
            beneficios: membresiaPremium?.beneficios?.lista || ['Todo lo anterior', 'Acceso anticipado'],
            activa: membresiaPremium?.activa ?? true
          },
          vip: {
            id: 'vip',
            nombre: membresiaVip?.nombre || 'VIP Exclusivo',
            precio_mensual: membresiaVip?.precio || 19.99,
            precio_anual: (membresiaVip?.precio || 19.99) * 10,
            descuento_anual: 17,
            beneficios: membresiaVip?.beneficios?.lista || ['Todo lo anterior', 'Encuentros virtuales'],
            activa: membresiaVip?.activa ?? true,
            limite_suscriptores: membresiaVip?.beneficios?.limite_suscriptores || 100
          }
        },
        propinas: config.configuracion_general?.propinas || {
          sugeridas: [1, 5, 10, 25, 50, 100],
          minima: 1,
          maxima: 500,
          moneda: 'USD'
        },
        contenido_exclusivo: config.configuracion_general?.contenido_exclusivo || {
          precio_base: 2.99,
          descuentos: [],
          estrategia_precios: 'fijo'
        },
        recompensas: config.configuracion_general?.recompensas || {
          puntos_por_dolar: 10,
          valor_punto: 0.01,
          bonificaciones: []
        }
      },
      metodos_pago: config.configuracion_pagos?.metodos_pago || this.obtenerMetodosPagoPorDefecto(),
      politicas: config.configuracion_privacidad?.politicas || this.obtenerPoliticasPorDefecto(),
      configuracion_avanzada: config.configuracion_contenido?.configuracion_avanzada || this.obtenerConfiguracionAvanzadaPorDefecto(),
      fecha_actualizacion: config.fecha_actualizacion,
      activa: true
    };
  }

  private obtenerConfiguracionPorDefecto(artistaId: string): ConfiguracionMonetizacion {
    return {
      id: `config_${artistaId}`,
      artista_id: artistaId,
      configuracion_precios: {
        membresias: {
          basica: {
            id: 'basica',
            nombre: 'Seguidor',
            precio_mensual: 4.99,
            precio_anual: 49.99,
            descuento_anual: 17,
            beneficios: ['Contenido exclusivo básico'],
            activa: true
          },
          premium: {
            id: 'premium',
            nombre: 'Fan Premium',
            precio_mensual: 9.99,
            precio_anual: 99.99,
            descuento_anual: 17,
            beneficios: ['Todo lo anterior', 'Acceso anticipado'],
            activa: true
          },
          vip: {
            id: 'vip',
            nombre: 'VIP Exclusivo',
            precio_mensual: 19.99,
            precio_anual: 199.99,
            descuento_anual: 17,
            beneficios: ['Todo lo anterior', 'Encuentros virtuales'],
            activa: true,
            limite_suscriptores: 100
          }
        },
        propinas: {
          sugeridas: [1, 5, 10, 25, 50, 100],
          minima: 1,
          maxima: 500,
          moneda: 'USD'
        },
        contenido_exclusivo: {
          precio_base: 2.99,
          descuentos: [],
          estrategia_precios: 'fijo'
        },
        recompensas: {
          puntos_por_dolar: 10,
          valor_punto: 0.01,
          bonificaciones: []
        }
      },
      metodos_pago: this.obtenerMetodosPagoPorDefecto(),
      politicas: this.obtenerPoliticasPorDefecto(),
      configuracion_avanzada: this.obtenerConfiguracionAvanzadaPorDefecto(),
      fecha_actualizacion: new Date().toISOString(),
      activa: true
    };
  }

  private obtenerMetodosPagoPorDefecto(): MetodoPago[] {
    return [
      {
        id: 'stripe',
        tipo: 'tarjeta_credito',
        nombre: 'Stripe',
        proveedor: 'Stripe Inc.',
        configuracion: {},
        comision_porcentaje: 2.9,
        comision_fija: 0.30,
        monedas_soportadas: ['USD', 'EUR', 'MXN'],
        activo: false,
        configurado: false
      }
    ];
  }

  private obtenerPoliticasPorDefecto(): PoliticasMonetizacion {
    return {
      reembolsos: {
        periodo_dias: 14,
        tipos_permitidos: ['membresias', 'contenido_exclusivo'],
        proceso_automatico: false,
        politica_texto: 'Reembolsos disponibles dentro de 14 días.'
      },
      suscripciones: {
        periodo_gracia_dias: 3,
        cancelacion_inmediata: true,
        renovacion_automatica: true,
        notificaciones_vencimiento: true
      },
      contenido: {
        acceso_perpetuo: true,
        descarga_permitida: true,
        limite_dispositivos: 3,
        drm_habilitado: false
      },
      fiscales: {
        incluir_impuestos: true,
        porcentaje_impuesto: 8.5,
        facturacion_automatica: true,
        datos_fiscales_requeridos: false
      }
    };
  }

  private obtenerConfiguracionAvanzadaPorDefecto(): ConfiguracionAvanzada {
    return {
      notificaciones: {
        nuevas_suscripciones: true,
        pagos_recibidos: true,
        cancelaciones: true,
        problemas_pago: true,
        email_notificaciones: ''
      },
      analytics: {
        tracking_habilitado: true,
        metricas_publicas: false,
        webhook_eventos: ['pago_completado', 'suscripcion_nueva']
      },
      integraciones: {},
      seguridad: {
        autenticacion_dos_factores: false,
        cifrado_datos: true,
        backup_automatico: true,
        auditoria_accesos: false
      }
    };
  }

  // ===============================================
  // MÉTODOS DE PLANTILLAS
  // ===============================================

  private obtenerPlantillaPrincipiante(): Partial<ConfiguracionMonetizacion> {
    return {
      configuracion_precios: {
        membresias: {
          basica: {
            id: 'basica',
            nombre: 'Seguidor',
            precio_mensual: 2.99,
            precio_anual: 29.99,
            descuento_anual: 17,
            beneficios: ['Contenido exclusivo básico'],
            activa: true
          },
          premium: {
            id: 'premium',
            nombre: 'Fan Premium',
            precio_mensual: 7.99,
            precio_anual: 79.99,
            descuento_anual: 17,
            beneficios: ['Todo lo anterior', 'Acceso anticipado'],
            activa: false
          },
          vip: {
            id: 'vip',
            nombre: 'VIP Exclusivo',
            precio_mensual: 14.99,
            precio_anual: 149.99,
            descuento_anual: 17,
            beneficios: ['Todo lo anterior', 'Encuentros virtuales'],
            activa: false
          }
        },
        propinas: {
          sugeridas: [1, 3, 5, 10],
          minima: 1,
          maxima: 100,
          moneda: 'USD'
        },
        contenido_exclusivo: {
          precio_base: 1.99,
          descuentos: [],
          estrategia_precios: 'fijo'
        },
        recompensas: {
          puntos_por_dolar: 5,
          valor_punto: 0.02,
          bonificaciones: []
        }
      }
    };
  }

  private obtenerPlantillaIntermedio(): Partial<ConfiguracionMonetizacion> {
    return {
      configuracion_precios: {
        membresias: {
          basica: {
            id: 'basica',
            nombre: 'Seguidor',
            precio_mensual: 4.99,
            precio_anual: 49.99,
            descuento_anual: 17,
            beneficios: ['Contenido exclusivo', 'Sin anuncios'],
            activa: true
          },
          premium: {
            id: 'premium',
            nombre: 'Fan Premium',
            precio_mensual: 9.99,
            precio_anual: 99.99,
            descuento_anual: 17,
            beneficios: ['Todo lo anterior', 'Acceso anticipado', 'Descargas'],
            activa: true
          },
          vip: {
            id: 'vip',
            nombre: 'VIP Exclusivo',
            precio_mensual: 19.99,
            precio_anual: 199.99,
            descuento_anual: 17,
            beneficios: ['Todo lo anterior', 'Encuentros virtuales', 'Merchandise'],
            activa: true,
            limite_suscriptores: 100
          }
        },
        propinas: {
          sugeridas: [1, 5, 10, 25, 50],
          minima: 1,
          maxima: 250,
          moneda: 'USD'
        },
        contenido_exclusivo: {
          precio_base: 2.99,
          descuentos: [],
          estrategia_precios: 'fijo'
        },
        recompensas: {
          puntos_por_dolar: 10,
          valor_punto: 0.01,
          bonificaciones: []
        }
      }
    };
  }

  private obtenerPlantillaAvanzado(): Partial<ConfiguracionMonetizacion> {
    return {
      configuracion_precios: {
        membresias: {
          basica: {
            id: 'basica',
            nombre: 'Seguidor',
            precio_mensual: 6.99,
            precio_anual: 69.99,
            descuento_anual: 17,
            beneficios: ['Contenido exclusivo', 'Sin anuncios', 'Chat directo'],
            activa: true
          },
          premium: {
            id: 'premium',
            nombre: 'Fan Premium',
            precio_mensual: 14.99,
            precio_anual: 149.99,
            descuento_anual: 17,
            beneficios: ['Todo lo anterior', 'Acceso anticipado', 'Descargas', 'Video llamadas'],
            activa: true
          },
          vip: {
            id: 'vip',
            nombre: 'VIP Exclusivo',
            precio_mensual: 29.99,
            precio_anual: 299.99,
            descuento_anual: 17,
            beneficios: ['Todo lo anterior', 'Encuentros virtuales', 'Merchandise exclusivo', 'Créditos de voz'],
            activa: true,
            limite_suscriptores: 50
          }
        },
        propinas: {
          sugeridas: [5, 10, 25, 50, 100, 200],
          minima: 5,
          maxima: 1000,
          moneda: 'USD'
        },
        contenido_exclusivo: {
          precio_base: 4.99,
          descuentos: [],
          estrategia_precios: 'dinamico'
        },
        recompensas: {
          puntos_por_dolar: 15,
          valor_punto: 0.01,
          bonificaciones: []
        }
      }
    };
  }

  // ===============================================
  // MÉTODOS DE VALIDACIÓN
  // ===============================================

  private validarConfiguracionLocal(configuracion: ConfiguracionMonetizacion): ValidacionConfiguracion {
    const errores: any[] = [];
    const advertencias: any[] = [];

    // Validar precios
    if (configuracion.configuracion_precios.membresias.basica.precio_mensual <= 0) {
      errores.push({
        campo: 'precios.membresias.basica.precio_mensual',
        mensaje: 'El precio de membresía básica debe ser mayor a 0',
        tipo: 'rango'
      });
    }

    // Validar métodos de pago
    const metodosActivos = configuracion.metodos_pago.filter(m => m.activo);
    if (metodosActivos.length === 0) {
      errores.push({
        campo: 'metodos_pago',
        mensaje: 'Debe tener al menos un método de pago activo',
        tipo: 'requerido'
      });
    }

    // Validar políticas
    if (configuracion.politicas.reembolsos.periodo_dias < 0) {
      errores.push({
        campo: 'politicas.reembolsos.periodo_dias',
        mensaje: 'El período de reembolso no puede ser negativo',
        tipo: 'rango'
      });
    }

    // Calcular completitud (simplificado)
    const completitud = this.calcularCompletitud(configuracion);

    return {
      valida: errores.length === 0,
      errores,
      advertencias,
      completitud
    };
  }

  private calcularCompletitud(configuracion: ConfiguracionMonetizacion): number {
    let camposCompletos = 0;
    let totalCampos = 10;

    if (configuracion.configuracion_precios.membresias.basica.precio_mensual > 0) camposCompletos++;
    if (configuracion.configuracion_precios.membresias.premium.precio_mensual > 0) camposCompletos++;
    if (configuracion.configuracion_precios.propinas.sugeridas.length > 0) camposCompletos++;
    if (configuracion.metodos_pago.some(m => m.activo)) camposCompletos++;
    if (configuracion.politicas.reembolsos.periodo_dias > 0) camposCompletos++;
    if (configuracion.configuracion_avanzada.notificaciones.email_notificaciones) camposCompletos++;
    camposCompletos += 4; // Otros campos básicos

    return Math.round((camposCompletos / totalCampos) * 100);
  }
}
