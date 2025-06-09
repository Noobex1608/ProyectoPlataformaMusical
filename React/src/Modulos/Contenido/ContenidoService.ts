import { supabase } from '../../supabaseClient'
import { Contenido } from './Contenido'

export async function crearContenido(contenido: Contenido) {
  const { data, error } = await supabase.from('Contenido').insert([contenido])
  if (error) throw error
  return data
}

export async function obtenerContenidos(): Promise<Contenido[]> {
  const { data, error } = await supabase.from('Contenido').select('*')
  if (error) throw error
  return data || []
}
