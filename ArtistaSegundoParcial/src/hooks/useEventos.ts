import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { Evento, EventoDB } from '../types/Evento';
import { useArtistaActual } from './useArtistaActual';

export const useEventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { artista } = useArtistaActual();

  // Mapear datos de DB a formato del frontend
  const mapearEventoDBaEvento = (eventoDB: EventoDB): Evento => ({
    id: eventoDB.id,
    artista_id: eventoDB.artista_id,
    nombre: eventoDB.nombre,
    fecha: eventoDB.fecha,
    ubicacion: eventoDB.ubicacion,
    descripcion: eventoDB.descripcion,
    precio: eventoDB.precio,
    capacidad: eventoDB.capacidad,
    created_at: eventoDB.created_at,
    updated_at: eventoDB.updated_at
  });

  // Mapear datos del frontend a formato de DB
  const mapearEventoAEventoDB = (evento: Partial<Evento>): Partial<EventoDB> => {
    const eventoDB: Partial<EventoDB> = {};
    
    if (evento.id !== undefined) eventoDB.id = evento.id;
    if (evento.artista_id !== undefined) eventoDB.artista_id = evento.artista_id;
    if (evento.nombre !== undefined) eventoDB.nombre = evento.nombre;
    if (evento.fecha !== undefined) eventoDB.fecha = evento.fecha;
    if (evento.ubicacion !== undefined) eventoDB.ubicacion = evento.ubicacion;
    if (evento.descripcion !== undefined) eventoDB.descripcion = evento.descripcion;
    if (evento.precio !== undefined) eventoDB.precio = evento.precio;
    if (evento.capacidad !== undefined) eventoDB.capacidad = evento.capacidad;

    return eventoDB;
  };

  // Cargar todos los eventos (del artista actual si está logueado)
  const cargarEventos = async (artistaId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎪 Cargando eventos desde Supabase...');
      
      let query = supabase
        .from('eventos')
        .select('*')
        .order('fecha', { ascending: true });

      // Filtrar por artista si se proporciona un ID o si hay un artista actual
      const idArtista = artistaId || artista?.id;
      if (idArtista) {
        query = query.eq('artista_id', idArtista);
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        throw new Error(`Error cargando eventos: ${dbError.message}`);
      }

      // Mapear datos de DB a formato del frontend
      const eventosMapeados: Evento[] = (data || []).map(mapearEventoDBaEvento);

      setEventos(eventosMapeados);
      console.log(`✅ ${eventosMapeados.length} eventos cargados`);
      
    } catch (err: any) {
      console.error('❌ Error cargando eventos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo evento
  const crearEvento = async (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🆕 Creando nuevo evento:', evento.nombre);

      // Generar UUID para el evento
      const eventoId = crypto.randomUUID();

      // Mapear datos del frontend a formato de DB
      const eventoDB: Partial<EventoDB> = {
        id: eventoId,
        artista_id: evento.artista_id,
        nombre: evento.nombre,
        fecha: evento.fecha,
        ubicacion: evento.ubicacion,
        descripcion: evento.descripcion || undefined,
        precio: evento.precio || undefined,
        capacidad: evento.capacidad || undefined
      };

      const { data, error: dbError } = await supabase
        .from('eventos')
        .insert([eventoDB])
        .select()
        .single();

      if (dbError) {
        throw new Error(`Error creando evento: ${dbError.message}`);
      }

      console.log('✅ Evento creado exitosamente:', data.nombre);
      
      // Recargar eventos para actualizar la lista
      await cargarEventos();
      
      return mapearEventoDBaEvento(data);
    } catch (err: any) {
      console.error('❌ Error creando evento:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar evento existente
  const actualizarEvento = async (id: string, evento: Partial<Evento>) => {
    setLoading(true);
    setError(null);

    try {
      console.log('📝 Actualizando evento:', id);

      // Mapear datos del frontend a formato de DB
      const eventoDB = mapearEventoAEventoDB(evento);
      
      // Siempre actualizar timestamp
      eventoDB.updated_at = new Date().toISOString();

      const { data, error: dbError } = await supabase
        .from('eventos')
        .update(eventoDB)
        .eq('id', id)
        .select()
        .single();

      if (dbError) {
        throw new Error(`Error actualizando evento: ${dbError.message}`);
      }

      console.log('✅ Evento actualizado exitosamente');
      
      // Recargar eventos para actualizar la lista
      await cargarEventos();
      
      return mapearEventoDBaEvento(data);
    } catch (err: any) {
      console.error('❌ Error actualizando evento:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar evento
  const eliminarEvento = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🗑️ Eliminando evento:', id);

      const { error: dbError } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw new Error(`Error eliminando evento: ${dbError.message}`);
      }

      console.log('✅ Evento eliminado exitosamente');
      
      // Recargar eventos para actualizar la lista
      await cargarEventos();
      
    } catch (err: any) {
      console.error('❌ Error eliminando evento:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener un evento específico por ID
  const obtenerEvento = async (id: string): Promise<Evento | null> => {
    try {
      console.log('🔍 Obteniendo evento:', id);

      const { data, error: dbError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError) {
        if (dbError.code === 'PGRST116') {
          return null; // Evento no encontrado
        }
        throw new Error(`Error obteniendo evento: ${dbError.message}`);
      }

      return mapearEventoDBaEvento(data);
    } catch (err: any) {
      console.error('❌ Error obteniendo evento:', err);
      setError(err.message);
      return null;
    }
  };

  // Obtener eventos por rango de fechas
  const obtenerEventosPorFecha = async (fechaInicio: string, fechaFin: string, artistaId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📅 Obteniendo eventos por fecha:', fechaInicio, 'a', fechaFin);
      
      let query = supabase
        .from('eventos')
        .select('*')
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha', { ascending: true });

      const idArtista = artistaId || artista?.id;
      if (idArtista) {
        query = query.eq('artista_id', idArtista);
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        throw new Error(`Error obteniendo eventos por fecha: ${dbError.message}`);
      }

      const eventosMapeados = (data || []).map(mapearEventoDBaEvento);
      
      console.log(`✅ ${eventosMapeados.length} eventos encontrados en el rango de fechas`);
      return eventosMapeados;
      
    } catch (err: any) {
      console.error('❌ Error obteniendo eventos por fecha:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Cargar eventos automáticamente al montar el hook
  useEffect(() => {
    if (artista?.id) {
      cargarEventos(artista.id);
    }
  }, [artista?.id]);

  return {
    eventos,
    loading,
    error,
    cargarEventos,
    crearEvento,
    actualizarEvento,
    eliminarEvento,
    obtenerEvento,
    obtenerEventosPorFecha,
    refetch: cargarEventos
  };
};
