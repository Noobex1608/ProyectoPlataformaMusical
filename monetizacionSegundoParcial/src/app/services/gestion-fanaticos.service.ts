import { Injectable } from '@angular/core';
import { Observable, forkJoin, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { supabase } from '../supabase.service';

export interface Fanatico {
  id: string;
  nombre: string;
  email: string;
  nivel: string;
  totalPropinas: number;
  ultimaInteraccion: Date;
  tipoSuscripcion: string | null;
  mesesSuscrito: number;
  accesosExclusivos: number;
}

export interface EstadisticasFanaticos {
  totalFanaticos: number;
  nuevosEsteMes: number;
  propinasTotales: number;
  fanaticosActivos: number;
  nivelPromedio: number;
}

export interface NotificacionFan {
  id?: string;
  artista_id: string;
  usuario_id: string;
  mensaje: string;
  fecha_envio: Date;
  tipo: 'promocion' | 'lanzamiento' | 'evento' | 'agradecimiento';
}

@Injectable({
  providedIn: 'root'
})
export class GestionFanaticosService {

  constructor() { }

  obtenerFanaticos(): Observable<Fanatico[]> {
    // Obtener datos de suscriptores activos (SIN JOIN)
    const suscriptores$ = from(
      supabase
        .from('suscripciones_usuario')
        .select('*')
        .eq('activa', true)
    );

    // Obtener todos los usuarios
    const usuarios$ = from(
      supabase
        .from('usuarios')
        .select('id, name, email, auth_id')
    );

    // Obtener datos de propinas (usando fan_id)
    const propinas$ = from(
      supabase
        .from('propinas')
        .select('fan_id, monto, fecha')
    );

    // Obtener accesos a contenido exclusivo
    const accesos$ = from(
      supabase
        .from('acceso_contenido')
        .select('usuario_id, fecha_acceso')
    );

    return forkJoin({
      suscriptores: suscriptores$,
      usuarios: usuarios$,
      propinas: propinas$,
      accesos: accesos$
    }).pipe(
      map(({ suscriptores, usuarios, propinas, accesos }) => {
        return this.procesarDatosFanaticos(
          suscriptores.data || [], 
          usuarios.data || [],
          propinas.data || [], 
          accesos.data || []
        );
      }),
      catchError(error => {
        console.error('Error al obtener fanáticos:', error);
        return of([]);
      })
    );
  }

  obtenerEstadisticas(): Observable<EstadisticasFanaticos> {
    // Usar la vista de estadísticas creada en la base de datos
    return from(
      supabase
        .from('estadisticas_fanaticos')
        .select('*')
        .single()
    ).pipe(
      map(response => {
        if (response.data) {
          return {
            totalFanaticos: response.data.total_fanaticos || 0,
            nuevosEsteMes: response.data.nuevos_este_mes || 0,
            propinasTotales: response.data.propinas_totales || 0,
            fanaticosActivos: response.data.fanaticos_activos || 0,
            nivelPromedio: response.data.nivel_promedio || 0
          };
        }
        return this.getEstadisticasVacias();
      }),
      catchError(error => {
        console.error('Error al obtener estadísticas:', error);
        return of(this.getEstadisticasVacias());
      })
    );
  }

  enviarNotificacion(notificacion: NotificacionFan): Observable<any> {
    return from(
      supabase
        .from('notificaciones_monetizacion')
        .insert([{
          artista_id: notificacion.artista_id,
          usuario_id: notificacion.usuario_id,
          mensaje: notificacion.mensaje,
          tipo: notificacion.tipo,
          fecha_envio: new Date().toISOString()
        }])
        .select()
        .single()
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error al enviar notificación:', error);
        return of(null);
      })
    );
  }

  calcularNivelFanatico(propinas: number, suscripciones: number, accesos: number): Observable<string> {
    // Usar la función de la base de datos para calcular el nivel
    return from(
      supabase.rpc('calcular_nivel_fanatico', {
        total_propinas: propinas,
        meses_suscrito: suscripciones,
        accesos_exclusivos: accesos
      })
    ).pipe(
      map(response => response.data || 'casual'),
      catchError(error => {
        console.error('Error al calcular nivel:', error);
        // Fallback al cálculo local si la función de DB falla
        return of(this.calcularNivelLocal(propinas, suscripciones, accesos));
      })
    );
  }

  private procesarDatosFanaticos(suscriptores: any[], usuarios: any[], propinas: any[], accesos: any[]): Fanatico[] {
    const fanaticosMap = new Map<string, Fanatico>();
    const usuariosMap = new Map<string, any>();

    // Crear mapa de usuarios para lookup rápido
    usuarios.forEach(user => {
      if (user.id) {
        usuariosMap.set(user.id.toString(), user);
      }
    });

    // Procesar suscriptores
    suscriptores.forEach(sub => {
      if (sub.usuario_id) {
        const usuarioId = sub.usuario_id.toString();
        const usuario = usuariosMap.get(usuarioId);
        
        if (usuario) {
          const existingFan = fanaticosMap.get(usuarioId) || {
            id: usuarioId,
            nombre: usuario.name || 'Usuario', 
            email: usuario.email || '',
            nivel: 'casual',
            totalPropinas: 0,
            ultimaInteraccion: new Date(sub.fecha_inicio),
            tipoSuscripcion: sub.tipo_suscripcion || 'basica',
            mesesSuscrito: this.calcularMesesSuscripcion(sub.fecha_inicio),
            accesosExclusivos: 0
          };

          fanaticosMap.set(usuarioId, existingFan);
        }
      }
    });

    // Agregar datos de propinas (usar fan_id en lugar de usuario_id)
    // Agregar datos de propinas (usar fan_id en lugar de usuario_id)
    propinas.forEach(propina => {
      const fan = fanaticosMap.get(propina.fan_id); // Cambiar de usuario_id a fan_id
      if (fan) {
        fan.totalPropinas += propina.monto;
        const fechaPropina = new Date(propina.fecha);
        if (fechaPropina > fan.ultimaInteraccion) {
          fan.ultimaInteraccion = fechaPropina;
        }
      }
    });

    // Agregar datos de accesos
    accesos.forEach(acceso => {
      const fan = fanaticosMap.get(acceso.usuario_id);
      if (fan) {
        fan.accesosExclusivos++;
        const fechaAcceso = new Date(acceso.fecha_acceso);
        if (fechaAcceso > fan.ultimaInteraccion) {
          fan.ultimaInteraccion = fechaAcceso;
        }
      }
    });

    // Calcular nivel para cada fanático
    const fanaticos = Array.from(fanaticosMap.values());
    fanaticos.forEach(fan => {
      fan.nivel = this.calcularNivelLocal(fan.totalPropinas, fan.mesesSuscrito, fan.accesosExclusivos);
    });

    return fanaticos;
  }

  private calcularMesesSuscripcion(fechaInicio: string): number {
    const inicio = new Date(fechaInicio);
    const ahora = new Date();
    const diffTime = Math.abs(ahora.getTime() - inicio.getTime());
    const diffMeses = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMeses;
  }

  private calcularNivelLocal(propinas: number, mesesSuscrito: number, accesos: number): string {
    const puntos = (propinas * 0.1) + (mesesSuscrito * 2) + (accesos * 1.5);
    
    if (puntos >= 50) return 'vip';
    if (puntos >= 25) return 'superfan';
    if (puntos >= 10) return 'regular';
    return 'casual';
  }

  private getEstadisticasVacias(): EstadisticasFanaticos {
    return {
      totalFanaticos: 0,
      nuevosEsteMes: 0,
      propinasTotales: 0,
      fanaticosActivos: 0,
      nivelPromedio: 0
    };
  }

  // Métodos adicionales para gestión dinámica
  obtenerFanaticosPorNivel(nivel: string): Observable<Fanatico[]> {
    return this.obtenerFanaticos().pipe(
      map(fanaticos => fanaticos.filter(f => f.nivel === nivel))
    );
  }

  obtenerTopFanaticos(limite: number = 10): Observable<Fanatico[]> {
    return this.obtenerFanaticos().pipe(
      map(fanaticos => 
        fanaticos
          .sort((a, b) => b.totalPropinas - a.totalPropinas)
          .slice(0, limite)
      )
    );
  }

  buscarFanaticos(termino: string): Observable<Fanatico[]> {
    return this.obtenerFanaticos().pipe(
      map(fanaticos => 
        fanaticos.filter(f => 
          f.nombre.toLowerCase().includes(termino.toLowerCase()) ||
          f.email.toLowerCase().includes(termino.toLowerCase())
        )
      )
    );
  }
}
