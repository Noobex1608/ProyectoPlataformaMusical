// src/modules/Colaboraciones/ColaboracionService.ts
import { supabase } from '../../supabaseClient'
import { Colaboracion } from './Colaboraciones'

export async function crearColaboracion(colab: Colaboracion) {
  const { data, error } = await supabase
    .from('Colaboraciones')
    .insert([colab])

  if (error) throw error
  return data
}

export async function obtenerColaboraciones(): Promise<Colaboracion[]> {
  const { data, error } = await supabase
    .from('Colaboraciones')
    .select('*')

  if (error) throw error
  return data || []
}
