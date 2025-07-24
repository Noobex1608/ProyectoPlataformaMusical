export interface Evento {
  id: string;
  artista_id: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  descripcion?: string;
  precio?: number;
  capacidad?: number;
  created_at?: string;
  updated_at?: string;
}

// Tipo para la base de datos (mantiene snake_case)
export interface EventoDB {
  id: string;
  artista_id: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  descripcion?: string;
  precio?: number;
  capacidad?: number;
  created_at: string;
  updated_at: string;
}
