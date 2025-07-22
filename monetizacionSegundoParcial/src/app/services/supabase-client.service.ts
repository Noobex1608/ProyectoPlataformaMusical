import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, map, catchError, of } from 'rxjs';
import { supabase, MonetizacionTables } from '../supabase.service';
import type { User } from '@supabase/supabase-js';

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    nombre?: string;
    tipo_usuario?: string;
    biografia?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseClientService {
  private currentUserSubject = new BehaviorSubject<SupabaseUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeAuthListener();
  }

  private initializeAuthListener(): void {
    // Obtener usuario actual al inicializar
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      if (user) {
        this.currentUserSubject.next(user as SupabaseUser);
      }
    });

    // Escuchar cambios de autenticación
    supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        this.currentUserSubject.next(session.user as SupabaseUser);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  // ===============================================
  // MÉTODOS DE AUTENTICACIÓN
  // ===============================================

  login(email: string, password: string): Observable<any> {
    return from(supabase.auth.signInWithPassword({ email, password })).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      }),
      catchError(error => {
        console.error('Error en login:', error);
        throw error;
      })
    );
  }

  register(userData: {
    email: string;
    password: string;
    nombre: string;
    tipo_usuario: string;
    biografia?: string;
  }): Observable<any> {
    return from(supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          nombre: userData.nombre,
          tipo_usuario: userData.tipo_usuario,
          biografia: userData.biografia || ''
        }
      }
    })).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      }),
      catchError(error => {
        console.error('Error en registro:', error);
        throw error;
      })
    );
  }

  logout(): Observable<any> {
    return from(supabase.auth.signOut()).pipe(
      map(() => {
        this.currentUserSubject.next(null);
        return { success: true };
      }),
      catchError(error => {
        console.error('Error en logout:', error);
        return of({ success: false, error });
      })
    );
  }

  getCurrentUser(): SupabaseUser | null {
    return this.currentUserSubject.value;
  }

  // ===============================================
  // MÉTODOS CRUD GENÉRICOS
  // ===============================================

  // Obtener registros con filtros opcionales
  getRecords<T>(table: string, filters?: any): Observable<T[]> {
    let query = supabase.from(table).select('*');
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
    }

    return from(query).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data as T[];
      }),
      catchError(error => {
        console.error(`Error obteniendo registros de ${table}:`, error);
        return of([]);
      })
    );
  }

  // Obtener un registro por ID
  getRecordById<T>(table: string, id: number | string): Observable<T | null> {
    return from(supabase.from(table).select('*').eq('id', id).single()).pipe(
      map(response => {
        if (response.error) {
          if (response.error.code === 'PGRST116') {
            return null; // No encontrado
          }
          throw response.error;
        }
        return response.data as T;
      }),
      catchError(error => {
        console.error(`Error obteniendo registro ${id} de ${table}:`, error);
        return of(null);
      })
    );
  }

  // Crear un nuevo registro
  createRecord<T>(table: string, data: Partial<T>): Observable<T> {
    return from(supabase.from(table).insert(data).select().single()).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data as T;
      }),
      catchError(error => {
        console.error(`Error creando registro en ${table}:`, error);
        throw error;
      })
    );
  }

  // Actualizar un registro
  updateRecord<T>(table: string, id: number | string, data: Partial<T>): Observable<T> {
    return from(supabase.from(table).update(data).eq('id', id).select().single()).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data as T;
      }),
      catchError(error => {
        console.error(`Error actualizando registro ${id} en ${table}:`, error);
        throw error;
      })
    );
  }

  // Eliminar un registro
  deleteRecord(table: string, id: number | string): Observable<boolean> {
    return from(supabase.from(table).delete().eq('id', id)).pipe(
      map(response => {
        if (response.error) throw response.error;
        return true;
      }),
      catchError(error => {
        console.error(`Error eliminando registro ${id} de ${table}:`, error);
        return of(false);
      })
    );
  }

  // ===============================================
  // MÉTODOS ESPECÍFICOS PARA MONETIZACIÓN
  // ===============================================

  // Obtener artista por user_id
  getArtistaByUserId(userId: number): Observable<any> {
    return from(supabase.from(MonetizacionTables.ARTISTAS).select('*').eq('user_id', userId).single()).pipe(
      map(response => {
        if (response.error) {
          if (response.error.code === 'PGRST116') {
            return null;
          }
          throw response.error;
        }
        return response.data;
      }),
      catchError(error => {
        console.error('Error obteniendo artista:', error);
        return of(null);
      })
    );
  }

  // Obtener usuario por ID de autenticación
  getUsuarioByAuthId(authId: string): Observable<any> {
    return from(supabase.from(MonetizacionTables.USUARIOS).select('*').eq('auth_id', authId).single()).pipe(
      map(response => {
        if (response.error) {
          if (response.error.code === 'PGRST116') {
            return null;
          }
          throw response.error;
        }
        return response.data;
      }),
      catchError(error => {
        console.error('Error obteniendo usuario:', error);
        return of(null);
      })
    );
  }

  // Ejecutar consulta personalizada
  executeQuery<T = any>(query: string, params: any[] = []): Observable<T[]> {
    // Para consultas con parámetros, usaremos el cliente Supabase directamente
    if (params.length > 0) {
      // Crear consulta preparada simple (esto es básico, en producción usar prepared statements)
      let queryWithParams = query;
      params.forEach((param, index) => {
        const placeholder = `$${index + 1}`;
        if (typeof param === 'string') {
          queryWithParams = queryWithParams.replace(placeholder, `'${param.replace(/'/g, "''")}'`);
        } else {
          queryWithParams = queryWithParams.replace(placeholder, String(param));
        }
      });
      
      return from(supabase.rpc('execute_sql', { query: queryWithParams })).pipe(
        map(response => {
          if (response.error) throw response.error;
          return response.data || [];
        }),
        catchError(error => {
          console.error('Error ejecutando consulta con parámetros:', error);
          return of([]);
        })
      );
    }
    
    return from(supabase.rpc('execute_sql', { query })).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      }),
      catchError(error => {
        console.error('Error ejecutando consulta:', error);
        return of([]);
      })
    );
  }

  // ===============================================
  // MÉTODOS DE UTILIDAD
  // ===============================================

  // Verificar conectividad con Supabase
  checkConnection(): Observable<boolean> {
    return from(supabase.from(MonetizacionTables.USUARIOS).select('count', { count: 'exact', head: true })).pipe(
      map(response => {
        return !response.error;
      }),
      catchError(() => of(false))
    );
  }

  // Obtener información de la sesión actual
  getSession(): Observable<any> {
    return from(supabase.auth.getSession()).pipe(
      map(response => response.data.session),
      catchError(error => {
        console.error('Error obteniendo sesión:', error);
        return of(null);
      })
    );
  }
}
