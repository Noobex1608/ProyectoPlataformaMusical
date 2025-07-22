// src/app/services/artista.service.ts
import { Injectable } from '@angular/core';
import { Observable, map, combineLatest, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SupabaseClientService } from './supabase-client.service';
import { Artista, ArtistaConEstadisticas, PerfilArtista } from '../models/artista.model';
import { Membresia } from '../models/membresia.model';

export interface ArtistaExplorar {
  id: string;
  nombre: string;
  genero?: string;
  descripcion?: string;
  imagen?: string;
  seguidores: string;
  canciones: number;
  rating: number;
  siguiendo: boolean;
  badge?: { tipo: string; texto: string };
  membresias: MembresiaDisplay[];
}

export interface MembresiaDisplay {
  nombre: string;
  precio: number;
  beneficios: string;
  popular?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ArtistaService {

  constructor(private supabaseClient: SupabaseClientService) {}

  /**
   * Obtiene todos los artistas con sus estadísticas para la vista de explorar
   */
  obtenerArtistasParaExplorar(fanId?: string): Observable<ArtistaExplorar[]> {
    console.log('🎯 Obteniendo artistas para explorar...');
    
    return combineLatest([
      this.obtenerArtistasConEstadisticas(),
      this.obtenerMembresiasPorArtista(),
      fanId ? this.obtenerSeguidoresDeFan(fanId) : of([])
    ]).pipe(
      map(([artistas, membresias, seguidores]) => {
        console.log('📊 Datos obtenidos:', { 
          artistas: artistas.length, 
          membresias: Object.keys(membresias).length,
          seguidores: seguidores.length 
        });

        return artistas.map(artista => {
          const artistaMembresias = membresias[artista.id] || [];
          const siguiendo = seguidores.some(s => s.artista_id === artista.id);
          
          return {
            id: artista.id,
            nombre: artista.nombre,
            genero: artista.genero || 'No especificado',
            descripcion: artista.descripcion || 'Artista musical',
            imagen: artista.imagen,
            seguidores: this.formatearNumero(artista.seguidores || 0),
            canciones: Math.floor(Math.random() * 50) + 10, // Placeholder hasta tener tabla de canciones
            rating: Number((4.0 + Math.random() * 1).toFixed(1)), // Placeholder hasta tener sistema de rating
            siguiendo,
            badge: this.generarBadge(artista),
            membresias: artistaMembresias.map(m => ({
              nombre: m.nombre,
              precio: m.precio,
              beneficios: this.procesarBeneficios(m.beneficios),
              popular: m.precio > 8 && m.precio < 15 // Lógica simple para marcar populares
            }))
          } as ArtistaExplorar;
        });
      }),
      catchError(error => {
        console.error('❌ Error obteniendo artistas para explorar:', error);
        // Retornar datos simulados en caso de error
        return of(this.obtenerDatosSimulados());
      })
    );
  }

  /**
   * Obtiene un artista específico por su ID
   */
  obtenerArtistaPorId(artistaId: string): Observable<Artista> {
    return this.supabaseClient.getRecords<Artista>('artistas', { id: artistaId }).pipe(
      map(artistas => artistas[0] || null),
      catchError(error => {
        console.error('❌ Error obteniendo artista por ID:', error);
        return of({
          id: artistaId,
          nombre: 'Artista desconocido',
          genero: '',
          descripcion: '',
          imagen: 'https://via.placeholder.com/80x80?text=No+Image',
          user_id: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Artista);
      })
    );
  }

  /**
   * Obtiene artistas con sus estadísticas desde las tablas artistas y perfil_artistas
   */
  private obtenerArtistasConEstadisticas(): Observable<ArtistaConEstadisticas[]> {
    console.log('🔍 Obteniendo artistas desde Supabase...');
    
    // Primero intentamos obtener artistas directamente
    return this.supabaseClient.getRecords<Artista>('artistas').pipe(
      map((artistas: Artista[]) => {
        console.log('📊 Artistas obtenidos:', artistas.length);
        
        // Convertimos a formato con estadísticas básicas
        return artistas.map(artista => ({
          ...artista,
          seguidores: Math.floor(Math.random() * 10000) + 100, // Simulado por ahora
          reproducciones: Math.floor(Math.random() * 100000) + 1000,
          likes: Math.floor(Math.random() * 5000) + 50
        } as ArtistaConEstadisticas));
      }),
      catchError(error => {
        console.error('❌ Error obteniendo artistas:', error);
        // Retornar datos simulados como fallback
        return of([
          {
            id: '1',
            user_id: 1,
            nombre: 'Luna Nocturna',
            genero: 'indie',
            descripcion: 'Música indie con toques electrónicos',
            imagen: undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seguidores: 2300,
            reproducciones: 45000,
            likes: 1200
          },
          {
            id: '2',
            user_id: 2,
            nombre: 'Beats Underground',
            genero: 'hip-hop',
            descripcion: 'Hip hop underground con beats únicos',
            imagen: undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seguidores: 5100,
            reproducciones: 67000,
            likes: 2800
          },
          {
            id: '3',
            user_id: 3,
            nombre: 'Electro Dreams',
            genero: 'electronic',
            descripcion: 'Música electrónica experimental',
            imagen: undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seguidores: 1800,
            reproducciones: 29000,
            likes: 950
          }
        ]);
      })
    );
  }

  /**
   * Obtiene todas las membresías agrupadas por artista
   */
  private obtenerMembresiasPorArtista(): Observable<Record<string, Membresia[]>> {
    console.log('🔍 Obteniendo membresías desde Supabase...');
    
    return this.supabaseClient.getRecords<Membresia>('membresias', { activa: true }).pipe(
      map((membresias: Membresia[]) => {
        console.log('💳 Membresías obtenidas:', membresias.length);
        
        const result: Record<string, Membresia[]> = {};
        
        membresias.forEach((membresia: any) => {
          if (!result[membresia.artista_id]) {
            result[membresia.artista_id] = [];
          }
          result[membresia.artista_id].push(membresia);
        });
        
        return result;
      }),
      catchError(error => {
        console.warn('⚠️ Error obteniendo membresías:', error);
        // Retornar membresías simuladas como fallback
        return of({
          '1': [
            { 
              id: 1, 
              artista_id: '1', 
              nombre: 'Básica', 
              precio: 4.99, 
              beneficios: { contenido_exclusivo: true, chat: false },
              activa: true,
              duracion_dias: 30,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { 
              id: 2, 
              artista_id: '1', 
              nombre: 'Premium', 
              precio: 9.99, 
              beneficios: { contenido_exclusivo: true, chat: true, videos: true },
              activa: true,
              duracion_dias: 30,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          '2': [
            { 
              id: 3, 
              artista_id: '2', 
              nombre: 'Fan Club', 
              precio: 7.99, 
              beneficios: { beats_exclusivos: true, merchandise: true },
              activa: true,
              duracion_dias: 30,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          '3': [
            { 
              id: 4, 
              artista_id: '3', 
              nombre: 'Basic', 
              precio: 5.99, 
              beneficios: { tracks_exclusivos: true, stems: true },
              activa: true,
              duracion_dias: 30,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { 
              id: 5, 
              artista_id: '3', 
              nombre: 'Pro', 
              precio: 12.99, 
              beneficios: { todo: true, masterclass: true, feedback: true },
              activa: true,
              duracion_dias: 30,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        });
      })
    );
  }

  /**
   * Obtiene los artistas que sigue un fan específico
   */
  private obtenerSeguidoresDeFan(fanId: string): Observable<any[]> {
    console.log('🔍 Obteniendo seguidores para fan:', fanId);
    
    // Verificar si fanId es un número válido
    const fanIdNumber = parseInt(fanId, 10);
    if (isNaN(fanIdNumber)) {
      console.warn('⚠️ fanId no es un número válido:', fanId, 'Usando datos simulados');
      return of([]);
    }
    
    return this.supabaseClient.getRecords<any>('seguidores', {
      follower_id: fanIdNumber // Convertir a número ya que es FK a usuarios
    }).pipe(
      map((seguidores: any[]) => {
        console.log('👥 Seguidores encontrados:', seguidores.length);
        return seguidores;
      }),
      catchError(error => {
        console.warn('⚠️ Error obteniendo seguidores:', error);
        return of([]);
      })
    );
  }  /**
   * Seguir o dejar de seguir a un artista
   */
  toggleSeguirArtista(fanId: string, artistaId: string): Observable<boolean> {
    console.log('🔄 Toggle seguir artista:', { fanId, artistaId });
    
    // Verificar si fanId es un número válido
    const fanIdNumber = parseInt(fanId, 10);
    if (isNaN(fanIdNumber)) {
      console.warn('⚠️ fanId no es un número válido:', fanId, 'No se puede seguir artista');
      return of(false);
    }
    
    // Primero verificar si ya sigue al artista
    return this.supabaseClient.getRecords<any>('seguidores', {
      follower_id: fanIdNumber, // Usar follower_id y convertir a número
      artista_id: artistaId
    }).pipe(
      map((seguidores: any[]) => {
        const seguidor = seguidores[0];
        
        if (seguidor) {
          // Ya existe relación, eliminar registro (dejar de seguir)
          this.supabaseClient.deleteRecord('seguidores', seguidor.id).subscribe();
          return false; // Ya no sigue
        } else {
          // Crear nueva relación (seguir)
          this.supabaseClient.createRecord<any>('seguidores', {
            follower_id: fanIdNumber, // Usar follower_id
            artista_id: artistaId
          }).subscribe();
          return true; // Ahora sigue
        }
      }),
      catchError(error => {
        console.error('❌ Error en toggle seguir:', error);
        return of(false);
      })
    );
  }

  /**
   * Filtrar artistas por criterios
   */
  filtrarArtistas(
    artistas: ArtistaExplorar[], 
    filtros: { genero?: string; precio?: string; popularidad?: string; busqueda?: string }
  ): ArtistaExplorar[] {
    return artistas.filter(artista => {
      // Filtro por género
      if (filtros.genero && filtros.genero !== '') {
        if (artista.genero?.toLowerCase() !== filtros.genero.toLowerCase()) {
          return false;
        }
      }

      // Filtro por precio (basado en membresías)
      if (filtros.precio && filtros.precio !== '') {
        const precioMinimo = artista.membresias.length > 0 
          ? Math.min(...artista.membresias.map(m => m.precio))
          : 0;
        
        switch (filtros.precio) {
          case 'gratis':
            if (precioMinimo > 0) return false;
            break;
          case 'barato':
            if (precioMinimo > 10) return false;
            break;
          case 'medio':
            if (precioMinimo < 10 || precioMinimo > 20) return false;
            break;
          case 'premium':
            if (precioMinimo < 20) return false;
            break;
        }
      }

      // Filtro por popularidad (basado en seguidores)
      if (filtros.popularidad && filtros.popularidad !== '') {
        const numeroSeguidores = this.convertirSeguidoresANumero(artista.seguidores);
        
        switch (filtros.popularidad) {
          case 'nuevo':
            if (numeroSeguidores > 1000) return false;
            break;
          case 'popular':
            if (numeroSeguidores < 1000 || numeroSeguidores > 10000) return false;
            break;
          case 'trending':
            if (numeroSeguidores < 10000) return false;
            break;
        }
      }

      // Filtro por búsqueda de texto
      if (filtros.busqueda && filtros.busqueda.trim() !== '') {
        const termino = filtros.busqueda.toLowerCase();
        const nombreCoincide = artista.nombre.toLowerCase().includes(termino);
        const generoCoincide = artista.genero?.toLowerCase().includes(termino);
        const descripcionCoincide = artista.descripcion?.toLowerCase().includes(termino);
        
        if (!nombreCoincide && !generoCoincide && !descripcionCoincide) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Procesa los beneficios de una membresía de forma segura
   */
  private procesarBeneficios(beneficios: any): string {
    try {
      if (!beneficios) {
        return 'Beneficios exclusivos';
      }

      if (typeof beneficios === 'string') {
        return beneficios;
      }

      if (typeof beneficios === 'object' && beneficios !== null) {
        const valores = Object.values(beneficios);
        if (valores.length > 0) {
          return valores.slice(0, 2).join(', ');
        }
      }

      return 'Beneficios exclusivos';
    } catch (error) {
      console.warn('⚠️ Error procesando beneficios:', error);
      return 'Beneficios exclusivos';
    }
  }

  // Métodos auxiliares
  private formatearNumero(numero: number): string {
    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(1) + 'M';
    } else if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'K';
    }
    return numero.toString();
  }

  private convertirSeguidoresANumero(seguidores: string): number {
    if (seguidores.includes('M')) {
      return parseFloat(seguidores.replace('M', '')) * 1000000;
    } else if (seguidores.includes('K')) {
      return parseFloat(seguidores.replace('K', '')) * 1000;
    }
    return parseInt(seguidores);
  }

  private generarBadge(artista: ArtistaConEstadisticas): { tipo: string; texto: string } | undefined {
    const seguidores = artista.seguidores || 0;
    const fechaCreacion = new Date(artista.created_at);
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    // Nuevo (creado en los últimos 30 días)
    if (fechaCreacion > hace30Dias) {
      return { tipo: 'new', texto: '✨ Nuevo' };
    }

    // Trending (muchos seguidores)
    if (seguidores > 10000) {
      return { tipo: 'trending', texto: '🔥 Trending' };
    }

    // Popular (seguidores moderados)
    if (seguidores > 1000) {
      return { tipo: 'popular', texto: '⭐ Popular' };
    }

    return undefined;
  }

  /**
   * Datos simulados para desarrollo/fallback
   */
  private obtenerDatosSimulados(): ArtistaExplorar[] {
    return [
      {
        id: '1',
        nombre: 'Luna Nocturna',
        genero: 'indie',
        descripcion: 'Música indie con toques electrónicos y letras profundas que conectan con el alma.',
        imagen: undefined,
        seguidores: '2.3K',
        canciones: 45,
        rating: 4.8,
        siguiendo: false,
        badge: { tipo: 'trending', texto: '🔥 Trending' },
        membresias: [
          { nombre: 'Básica', precio: 4.99, beneficios: 'Canciones exclusivas, wallpapers', popular: false },
          { nombre: 'Premium', precio: 9.99, beneficios: 'Todo lo básico + videos, chat directo', popular: true }
        ]
      },
      {
        id: '2',
        nombre: 'Beats Underground',
        genero: 'hip-hop',
        descripcion: 'Hip hop underground con beats únicos y flows innovadores desde la escena local.',
        imagen: undefined,
        seguidores: '5.1K',
        canciones: 67,
        rating: 4.6,
        siguiendo: true,
        badge: { tipo: 'popular', texto: '⭐ Popular' },
        membresias: [
          { nombre: 'Fan Club', precio: 7.99, beneficios: 'Beats exclusivos, merchandise', popular: true }
        ]
      }
    ];
  }
}
