import { supabase } from '../../supabaseClient'
import { Estadistica } from './Estadisticas'

export async function crearEstadistica(est: Estadistica) {
  const { data, error } = await supabase
    .from('Estadisticas')
    .insert([est])

  if (error) throw error
  return data
}

export async function obtenerEstadisticas(): Promise<Estadistica[]> {
  const { data, error } = await supabase
    .from('Estadisticas')
    .select('*')

  if (error) throw error
  return data || []
}
