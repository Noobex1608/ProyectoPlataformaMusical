import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript
export interface Usuario {
  id: string
  email: string
  nombre: string
  tipo_usuario: "artista" | "fan"
  avatar_url?: string
  biografia?: string
  fecha_registro: string
  activo: boolean
}

export interface Membresia {
  id: string
  artista_id: string
  fan_id: string
  tipo_membresia: "basica" | "premium" | "vip"
  precio: number
  fecha_inicio: string
  fecha_fin?: string
  activa: boolean
  beneficios?: string[]
}

export interface Transaccion {
  id: string
  usuario_id: string
  tipo_transaccion: "pago" | "retiro" | "reembolso"
  monto: number
  moneda: string
  estado: "pendiente" | "completada" | "fallida" | "cancelada"
  metodo_pago?: string
  referencia_externa?: string
  descripcion?: string
  fecha_transaccion: string
}

export interface Propina {
  id: string
  fan_id: string
  artista_id: string
  monto: number
  mensaje?: string
  publica: boolean
  fecha_propina: string
  transaccion_id?: string
}

export interface Recompensa {
  id: string
  usuario_id: string
  tipo_recompensa: string
  descripcion: string
  puntos_requeridos?: number
  monto_requerido?: number
  fecha_obtenida: string
  canjeada: boolean
  fecha_canje?: string
}

export interface ContratoDigital {
  id: string
  artista_id: string
  nombre_sello: string
  tipo_contrato: "distribucion" | "sello" | "management" | "publishing"
  porcentaje_artista: number
  porcentaje_sello: number
  fecha_inicio: string
  fecha_fin?: string
  terminos?: string
  estado: "activo" | "vencido" | "cancelado"
  fecha_creacion: string
}

export interface SistemaPuntos {
  id: string
  usuario_id: string
  puntos_totales: number
  puntos_disponibles: number
  nivel_fidelidad: "bronce" | "plata" | "oro" | "platino"
  fecha_actualizacion: string
}
