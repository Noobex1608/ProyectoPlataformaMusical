// src/modules/Colaboraciones/Colaboracion.ts
export interface Colaboracion {
  id?: string
  artista_id: string
  colaborador: string
  rol: string
  fecha: string // en formato ISO: 'YYYY-MM-DD'
}
