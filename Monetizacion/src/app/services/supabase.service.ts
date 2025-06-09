import { Injectable } from "@angular/core"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { type Observable, from, BehaviorSubject } from "rxjs"
import type { User, Membresia, Transaccion, Propina } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class SupabaseService {
  private supabase: SupabaseClient
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor() {
    this.supabase = createClient(
      "https://tu-proyecto.supabase.co", // Reemplaza con tu URL
      "tu-clave-anon", // Reemplaza con tu clave
    )
  }

  // Autenticación
  login(email: string, password: string): Observable<any> {
    return from(this.supabase.auth.signInWithPassword({ email, password }))
  }

  register(userData: any): Observable<any> {
    return from(
      this.supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nombre: userData.nombre,
            tipo_usuario: userData.tipo_usuario,
            biografia: userData.biografia,
          },
        },
      }),
    )
  }

  logout(): Observable<any> {
    this.currentUserSubject.next(null)
    return from(this.supabase.auth.signOut())
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user)
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }

  // Usuarios
  obtenerUsuarios(): Observable<User[]> {
    return from(
      this.supabase
        .from("usuarios")
        .select("*")
        .order("fecha_registro", { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error
          return data as User[]
        }),
    )
  }

  crearUsuario(usuario: Omit<User, "id" | "fecha_registro">): Observable<User> {
    return from(
      this.supabase
        .from("usuarios")
        .insert([usuario])
        .select()
        .then(({ data, error }) => {
          if (error) throw error
          return data[0] as User
        }),
    )
  }

  // Membresías
  obtenerMembresias(): Observable<Membresia[]> {
    return from(
      this.supabase
        .from("membresias")
        .select(`
          *,
          artista:artista_id(nombre),
          fan:fan_id(nombre)
        `)
        .order("fecha_inicio", { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error
          return data as Membresia[]
        }),
    )
  }

  crearMembresia(membresia: Omit<Membresia, "id" | "fecha_inicio">): Observable<Membresia> {
    return from(
      this.supabase
        .from("membresias")
        .insert([membresia])
        .select()
        .then(({ data, error }) => {
          if (error) throw error
          return data[0] as Membresia
        }),
    )
  }

  // Transacciones
  obtenerTransacciones(): Observable<Transaccion[]> {
    return from(
      this.supabase
        .from("transacciones")
        .select(`
          *,
          usuario:usuario_id(nombre)
        `)
        .order("fecha_transaccion", { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error
          return data as Transaccion[]
        }),
    )
  }

  crearTransaccion(transaccion: Omit<Transaccion, "id" | "fecha_transaccion">): Observable<Transaccion> {
    return from(
      this.supabase
        .from("transacciones")
        .insert([transaccion])
        .select()
        .then(({ data, error }) => {
          if (error) throw error
          return data[0] as Transaccion
        }),
    )
  }

  // Propinas
  obtenerPropinas(): Observable<Propina[]> {
    return from(
      this.supabase
        .from("propinas")
        .select(`
          *,
          fan:fan_id(nombre),
          artista:artista_id(nombre)
        `)
        .order("fecha_propina", { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error
          return data as Propina[]
        }),
    )
  }

  crearPropina(propina: Omit<Propina, "id" | "fecha_propina">): Observable<Propina> {
    return from(
      this.supabase
        .from("propinas")
        .insert([propina])
        .select()
        .then(({ data, error }) => {
          if (error) throw error
          return data[0] as Propina
        }),
    )
  }
}
