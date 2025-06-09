import { supabase } from "./supabase"
import type { Usuario, Membresia, Transaccion, Propina, SistemaPuntos } from "./supabase"

// Funciones para Usuarios
export async function obtenerUsuarios() {
  const { data, error } = await supabase.from("usuarios").select("*").order("fecha_registro", { ascending: false })

  if (error) throw error
  return data as Usuario[]
}

export async function crearUsuario(usuario: Omit<Usuario, "id" | "fecha_registro">) {
  const { data, error } = await supabase.from("usuarios").insert([usuario]).select()

  if (error) throw error
  return data[0] as Usuario
}

// Funciones para Membresías
export async function obtenerMembresias() {
  const { data, error } = await supabase
    .from("membresias")
    .select(`
      *,
      artista:artista_id(nombre),
      fan:fan_id(nombre)
    `)
    .order("fecha_inicio", { ascending: false })

  if (error) throw error
  return data
}

export async function crearMembresia(membresia: Omit<Membresia, "id" | "fecha_inicio">) {
  const { data, error } = await supabase.from("membresias").insert([membresia]).select()

  if (error) throw error
  return data[0] as Membresia
}

// Funciones para Transacciones
export async function obtenerTransacciones() {
  const { data, error } = await supabase
    .from("transacciones")
    .select(`
      *,
      usuario:usuario_id(nombre)
    `)
    .order("fecha_transaccion", { ascending: false })

  if (error) throw error
  return data
}

export async function crearTransaccion(transaccion: Omit<Transaccion, "id" | "fecha_transaccion">) {
  const { data, error } = await supabase.from("transacciones").insert([transaccion]).select()

  if (error) throw error
  return data[0] as Transaccion
}

// Funciones para Propinas
export async function obtenerPropinas() {
  const { data, error } = await supabase
    .from("propinas")
    .select(`
      *,
      fan:fan_id(nombre),
      artista:artista_id(nombre)
    `)
    .order("fecha_propina", { ascending: false })

  if (error) throw error
  return data
}

export async function crearPropina(propina: Omit<Propina, "id" | "fecha_propina">) {
  const { data, error } = await supabase.from("propinas").insert([propina]).select()

  if (error) throw error
  return data[0] as Propina
}

// Funciones para Sistema de Puntos
export async function obtenerPuntos(usuarioId: string) {
  const { data, error } = await supabase.from("sistema_puntos").select("*").eq("usuario_id", usuarioId).single()

  if (error) throw error
  return data as SistemaPuntos
}

export async function actualizarPuntos(usuarioId: string, puntos: number, accion: string) {
  // Actualizar puntos
  const { error: updateError } = await supabase
    .from("sistema_puntos")
    .update({
      puntos_totales: puntos,
      puntos_disponibles: puntos,
      fecha_actualizacion: new Date().toISOString(),
    })
    .eq("usuario_id", usuarioId)

  if (updateError) throw updateError

  // Registrar en historial
  const { error: historyError } = await supabase.from("historial_puntos").insert([
    {
      usuario_id: usuarioId,
      puntos: puntos,
      tipo_accion: accion,
      descripcion: `Puntos ${accion}`,
    },
  ])

  if (historyError) throw historyError
}

// Funciones para Estadísticas
export async function obtenerEstadisticas() {
  const [membresias, transacciones, propinas, usuarios] = await Promise.all([
    obtenerMembresias(),
    obtenerTransacciones(),
    obtenerPropinas(),
    obtenerUsuarios(),
  ])

  const ingresosTotales =
    transacciones
      ?.filter((t) => t.tipo_transaccion === "pago" && t.estado === "completada")
      .reduce((sum, t) => sum + t.monto, 0) || 0

  const membresíasActivas = membresias?.filter((m) => m.activa).length || 0

  const propinasTotales = propinas?.reduce((sum, p) => sum + p.monto, 0) || 0

  const usuariosActivos = usuarios?.length || 0

  return {
    ingresosTotales,
    membresíasActivas,
    propinasTotales,
    usuariosActivos,
  }
}
