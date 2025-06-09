import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import type { SupabaseService } from "../../services/supabase.service"
import type { User, Membresia, Transaccion, Propina } from "../../models/user.model"
import type { Router } from "@angular/router"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center space-x-3">
              <i class="fas fa-music text-2xl text-purple-600"></i>
              <div>
                <h1 class="text-xl font-bold text-gray-900">MusicApp</h1>
                <p class="text-sm text-gray-600">Bienvenido, {{ currentUser?.nombre }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="px-3 py-1 text-xs font-medium rounded-full" 
                    [class]="currentUser?.tipo_usuario === 'artista' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                {{ currentUser?.tipo_usuario === 'artista' ? 'Artista' : 'Fan' }}
              </span>
              <div *ngIf="currentUser?.tipo_usuario === 'artista' && currentUser?.saldo !== undefined" class="text-right">
                <p class="text-xs text-gray-500">Saldo disponible</p>
                <p class="font-bold text-green-600">\${{ currentUser.saldo.toFixed(2) }}</p>
              </div>
              <button (click)="logout()" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-sign-out-alt"></i> Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex space-x-1">
            <button 
              (click)="activeTab = 'dashboard'"
              [class]="'px-4 py-3 text-sm font-medium border-b-2 ' + (activeTab === 'dashboard' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700')"
            >
              <i class="fas fa-chart-bar mr-2"></i>Dashboard
            </button>
            
            <button *ngIf="currentUser?.tipo_usuario === 'fan'"
              (click)="activeTab = 'suscripciones'"
              [class]="'px-4 py-3 text-sm font-medium border-b-2 ' + (activeTab === 'suscripciones' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700')"
            >
              <i class="fas fa-credit-card mr-2"></i>Suscripciones
            </button>
            
            <button *ngIf="currentUser?.tipo_usuario === 'fan'"
              (click)="activeTab = 'propinas'"
              [class]="'px-4 py-3 text-sm font-medium border-b-2 ' + (activeTab === 'propinas' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700')"
            >
              <i class="fas fa-heart mr-2"></i>Propinas
            </button>
            
            <button *ngIf="currentUser?.tipo_usuario === 'artista'"
              (click)="activeTab = 'retiros'"
              [class]="'px-4 py-3 text-sm font-medium border-b-2 ' + (activeTab === 'retiros' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700')"
            >
              <i class="fas fa-money-bill-wave mr-2"></i>Retirar Fondos
            </button>
          </div>
        </div>
      </nav>

      <!-- Content -->
      <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <!-- Dashboard Tab -->
        <div *ngIf="activeTab === 'dashboard'" class="space-y-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p class="text-2xl font-bold text-gray-900">\${{ estadisticas.ingresosTotales.toFixed(2) }}</p>
                </div>
                <i class="fas fa-dollar-sign text-2xl text-green-500"></i>
              </div>
              <p class="text-xs text-gray-500 mt-2">+20.1% desde el mes pasado</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Membresías Activas</p>
                  <p class="text-2xl font-bold text-gray-900">{{ estadisticas.membresiasActivas }}</p>
                </div>
                <i class="fas fa-users text-2xl text-blue-500"></i>
              </div>
              <p class="text-xs text-gray-500 mt-2">+2 nuevas esta semana</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Propinas Recibidas</p>
                  <p class="text-2xl font-bold text-gray-900">\${{ estadisticas.propinasTotales.toFixed(2) }}</p>
                </div>
                <i class="fas fa-heart text-2xl text-red-500"></i>
              </div>
              <p class="text-xs text-gray-500 mt-2">+5.2% desde la semana pasada</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p class="text-2xl font-bold text-gray-900">{{ estadisticas.usuariosActivos }}</p>
                </div>
                <i class="fas fa-chart-line text-2xl text-purple-500"></i>
              </div>
              <p class="text-xs text-gray-500 mt-2">+12% crecimiento mensual</p>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Memberships -->
            <div class="bg-white rounded-lg shadow">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Membresías Recientes</h3>
              </div>
              <div class="p-6">
                <div *ngFor="let membresia of membresias.slice(0, 3)" class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p class="font-medium text-gray-900">{{ membresia.fan_nombre }}</p>
                    <p class="text-sm text-gray-500">Suscrito a {{ membresia.artista_nombre }}</p>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [class]="membresia.tipo_membresia === 'vip' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                      {{ membresia.tipo_membresia.toUpperCase() }}
                    </span>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-gray-900">\${{ membresia.precio }}/mes</p>
                    <p class="text-sm text-gray-500">{{ membresia.fecha_inicio | date:'short' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Tips -->
            <div class="bg-white rounded-lg shadow">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Propinas Recientes</h3>
              </div>
              <div class="p-6">
                <div *ngFor="let propina of propinas.slice(0, 3)" class="py-3 border-b border-gray-100 last:border-b-0">
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <p class="font-medium text-gray-900">{{ propina.fan_nombre }}</p>
                      <p class="text-sm text-gray-500">Para {{ propina.artista_nombre }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-bold text-green-600">\${{ propina.monto.toFixed(2) }}</p>
                      <p class="text-sm text-gray-500">{{ propina.fecha_propina | date:'short' }}</p>
                    </div>
                  </div>
                  <div *ngIf="propina.mensaje" class="bg-gray-50 p-3 rounded-md">
                    <p class="text-sm italic text-gray-700">"{{ propina.mensaje }}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Suscripciones Tab -->
        <div *ngIf="activeTab === 'suscripciones'" class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900">Suscríbete a tus artistas favoritos</h2>
            <p class="text-gray-600">Apoya a los artistas y obtén contenido exclusivo</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div *ngFor="let artista of artistas" class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div class="p-6 text-center">
                <div class="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mb-4">
                  <i class="fas fa-music text-2xl text-white"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-900">{{ artista.nombre }}</h3>
                <p class="text-gray-600 mb-4">Artista independiente</p>
                <button (click)="navigateToSubscription(artista)" class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
                  Ver Planes
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Propinas Tab -->
        <div *ngIf="activeTab === 'propinas'" class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900">Enviar Propinas</h2>
            <p class="text-gray-600">Muestra tu apoyo con una propina directa</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div *ngFor="let artista of artistas" class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div class="p-6 text-center">
                <div class="w-20 h-20 mx-auto bg-gradient-to-br from-red-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
                  <i class="fas fa-heart text-2xl text-white"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-900">{{ artista.nombre }}</h3>
                <p class="text-gray-600 mb-4">Enviar propina</p>
                <button (click)="navigateToTip(artista)" class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
                  Enviar Propina
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Retiros Tab -->
        <div *ngIf="activeTab === 'retiros' && currentUser?.tipo_usuario === 'artista'" class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900">Retirar Fondos</h2>
            <p class="text-gray-600">Transfiere tus ganancias a tu cuenta bancaria</p>
          </div>

          <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded-lg shadow p-6 mb-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Saldo Disponible</h3>
              <div class="text-center">
                <div class="text-4xl font-bold text-green-600 mb-2">\${{ currentUser?.saldo?.toFixed(2) }}</div>
                <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Disponible para retiro</span>
              </div>
            </div>

            <button (click)="navigateToWithdrawal()" class="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 text-lg font-medium">
              <i class="fas fa-money-bill-wave mr-2"></i>
              Solicitar Retiro
            </button>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null
  activeTab = "dashboard"

  membresias: Membresia[] = []
  transacciones: Transaccion[] = []
  propinas: Propina[] = []

  estadisticas = {
    ingresosTotales: 0,
    membresiasActivas: 0,
    propinasTotales: 0,
    usuariosActivos: 0,
  }

  artistas = [
    { id: "1", nombre: "Luna Melodía" },
    { id: "2", nombre: "Ritmo Urbano" },
    { id: "3", nombre: "Acoustic Dreams" },
  ]

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.supabaseService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (!user) {
        this.router.navigate(["/auth"])
      }
    })

    this.loadData()
  }

  loadData() {
    // Datos de ejemplo (en producción vendrían de Supabase)
    this.membresias = [
      {
        id: "1",
        artista_id: "1",
        fan_id: "3",
        tipo_membresia: "premium",
        precio: 9.99,
        fecha_inicio: "2024-01-15",
        activa: true,
        artista_nombre: "Luna Melodía",
        fan_nombre: "María González",
      },
      {
        id: "2",
        artista_id: "2",
        fan_id: "4",
        tipo_membresia: "vip",
        precio: 19.99,
        fecha_inicio: "2024-02-01",
        activa: true,
        artista_nombre: "Ritmo Urbano",
        fan_nombre: "Carlos Rodríguez",
      },
    ]

    this.transacciones = [
      {
        id: "1",
        usuario_id: "3",
        tipo_transaccion: "pago",
        monto: 9.99,
        moneda: "USD",
        estado: "completada",
        fecha_transaccion: "2024-01-15",
        usuario_nombre: "María González",
      },
      {
        id: "2",
        usuario_id: "1",
        tipo_transaccion: "retiro",
        monto: 50.0,
        moneda: "USD",
        estado: "pendiente",
        fecha_transaccion: "2024-02-10",
        usuario_nombre: "Luna Melodía",
      },
    ]

    this.propinas = [
      {
        id: "1",
        fan_id: "3",
        artista_id: "1",
        monto: 5.0,
        mensaje: "¡Excelente música! Sigue así",
        publica: true,
        fecha_propina: "2024-02-05",
        fan_nombre: "María González",
        artista_nombre: "Luna Melodía",
      },
    ]

    this.calculateStats()
  }

  calculateStats() {
    this.estadisticas = {
      ingresosTotales: this.transacciones
        .filter((t) => t.tipo_transaccion === "pago" && t.estado === "completada")
        .reduce((sum, t) => sum + t.monto, 0),
      membresiasActivas: this.membresias.filter((m) => m.activa).length,
      propinasTotales: this.propinas.reduce((sum, p) => sum + p.monto, 0),
      usuariosActivos: 4,
    }
  }

  logout() {
    this.supabaseService.logout().subscribe(() => {
      this.router.navigate(["/auth"])
    })
  }

  navigateToSubscription(artista: any) {
    this.router.navigate(["/subscription"], { queryParams: { artistaId: artista.id } })
  }

  navigateToTip(artista: any) {
    this.router.navigate(["/tip"], { queryParams: { artistaId: artista.id } })
  }

  navigateToWithdrawal() {
    this.router.navigate(["/withdrawal"])
  }
}
