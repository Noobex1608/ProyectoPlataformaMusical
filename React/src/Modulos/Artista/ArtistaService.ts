import { supabase } from '../../supabaseClient'
import { Artista } from './Artista'

export async function obtenerArtistas(): Promise<Artista[]> {
  const { data, error } = await supabase.from('Artista').select('*')
  if (error) throw error
  return data || []
}

export async function crearArtista(artista: Artista) {
  const { data, error } = await supabase.from('Artista').insert([artista])
  if (error) throw error
  return data
}
