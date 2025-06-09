import { supabase } from '../../supabaseClient'
import { Evento } from './Eventos'

export async function crearEvento(evento: Evento) {
  const { data, error } = await supabase.from('Eventos').insert([evento])
  if (error) throw error
  return data
}

export async function obtenerEventos(): Promise<Evento[]> {
  const { data, error } = await supabase.from('Eventos').select('*')
  if (error) throw error
  return data || []
}
