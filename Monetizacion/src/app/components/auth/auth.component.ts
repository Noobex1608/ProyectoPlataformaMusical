import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { SupabaseService } from "../../services/supabase.service"
import type { Router } from "@angular/router"

@Component({
  selector: "app-auth",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div class="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div class="p-6 text-center border-b">
          <i class="fas fa-music text-4xl text-purple-600 mb-4"></i>
          <h1 class="text-2xl font-bold text-gray-900">MusicApp</h1>
          <p class="text-gray-600">Plataforma de monetización musical</p>
        </div>

        <div class="p-6">
          <div class="flex mb-6">
            <button 
              (click)="activeTab = 'login'"
              [class]="'flex-1 py-2 px-4 text-center border-b-2 ' + (activeTab === 'login' ? 'border-purple-500 text-purple-600' : 'border-gray-200 text-gray-500')"
            >
              Iniciar Sesión
            </button>
            <button 
              (click)="activeTab = 'register'"
              [class]="'flex-1 py-2 px-4 text-center border-b-2 ' + (activeTab === 'register' ? 'border-purple-500 text-purple-600' : 'border-gray-200 text-gray-500')"
            >
              Registrarse
            </button>
          </div>

          <!-- Login Form -->
          <form *ngIf="activeTab === 'login'" [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="tu@email.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                formControlName="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
            </div>
            <button 
              type="submit" 
              [disabled]="loading || loginForm.invalid"
              class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
            </button>
          </form>

          <!-- Register Form -->
          <form *ngIf="activeTab === 'register'" [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input 
                type="text" 
                formControlName="nombre"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Tu nombre"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="tu@email.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                formControlName="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de cuenta</label>
              <select 
                formControlName="tipo_usuario"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecciona tu tipo de cuenta</option>
                <option value="fan">Fan - Escuchar y apoyar artistas</option>
                <option value="artista">Artista - Crear y monetizar música</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Biografía (opcional)</label>
              <textarea 
                formControlName="biografia"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Cuéntanos sobre ti..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              [disabled]="loading || registerForm.invalid"
              class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
            </button>
          </form>

          <div *ngIf="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuthComponent {
  activeTab: "login" | "register" = "login"
  loading = false
  error = ""

  loginForm: FormGroup
  registerForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })

    this.registerForm = this.fb.group({
      nombre: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      tipo_usuario: ["", [Validators.required]],
      biografia: [""],
    })
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.loading = true
      this.error = ""

      // Simulación de login (reemplazar con Supabase real)
      setTimeout(() => {
        const userData = {
          id: "1",
          email: this.loginForm.value.email,
          nombre: "Usuario Demo",
          tipo_usuario: "fan" as const,
          fecha_registro: new Date().toISOString(),
          activo: true,
        }

        this.supabaseService.setCurrentUser(userData)
        this.router.navigate(["/dashboard"])
        this.loading = false
      }, 1000)
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.loading = true
      this.error = ""

      // Simulación de registro
      setTimeout(() => {
        const userData = {
          id: Math.random().toString(),
          ...this.registerForm.value,
          fecha_registro: new Date().toISOString(),
          activo: true,
          saldo: this.registerForm.value.tipo_usuario === "artista" ? 0 : undefined,
        }

        this.supabaseService.setCurrentUser(userData)
        this.router.navigate(["/dashboard"])
        this.loading = false
      }, 1000)
    }
  }
}
