import { supabase } from '../../supabaseClient'
import { MetasArtistas } from './MetasArtistas'

export async function crearMeta(meta: MetasArtistas) {
  const { data, error } = await supabase
    .from('MetasArtistas')
    .insert([meta])

  if (error) throw error
  return data
}

export async function obtenerMetas(): Promise<MetasArtistas[]> {
  const { data, error } = await supabase
    .from('MetasArtistas')
    .select('*')

  if (error) throw error
  return data || []
}
