export interface User {
  id: string
  email: string
  nombre: string
  tipo_usuario: "artista" | "fan"
  avatar_url?: string
  biografia?: string
  fecha_registro: string
  activo: boolean
  saldo?: number
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
  artista_nombre?: string
  fan_nombre?: string
}

export interface Transaccion {
  id: string
  usuario_id: string
  tipo_transaccion: "pago" | "retiro" | "reembolso"
  monto: number
  moneda: string
  estado: "pendiente" | "completada" | "fallida" | "cancelada"
  metodo_pago?: string
  descripcion?: string
  fecha_transaccion: string
  usuario_nombre?: string
}

export interface Propina {
  id: string
  fan_id: string
  artista_id: string
  monto: number
  mensaje?: string
  publica: boolean
  fecha_propina: string
  fan_nombre?: string
  artista_nombre?: string
}

export interface PlanSuscripcion {
  id: string
  nombre: string
  precio: number
  beneficios: string[]
  popular?: boolean
}
