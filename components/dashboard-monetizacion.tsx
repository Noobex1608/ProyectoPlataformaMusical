"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Music, DollarSign, Heart, Gift, FileText, Star, TrendingUp, Users, CreditCard, Award } from "lucide-react"

interface Usuario {
  id: string
  nombre: string
  tipo_usuario: "artista" | "fan"
  email: string
}

interface Membresia {
  id: string
  artista_nombre: string
  fan_nombre: string
  tipo_membresia: string
  precio: number
  activa: boolean
  fecha_inicio: string
}

interface Transaccion {
  id: string
  usuario_nombre: string
  tipo_transaccion: string
  monto: number
  estado: string
  fecha_transaccion: string
}

interface Propina {
  id: string
  fan_nombre: string
  artista_nombre: string
  monto: number
  mensaje: string
  fecha_propina: string
}

export function DashboardMonetizacion() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [membresias, setMembresias] = useState<Membresia[]>([])
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [propinas, setPropinas] = useState<Propina[]>([])
  const [loading, setLoading] = useState(true)

  // Datos de ejemplo (en producción vendrían de Supabase)
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setUsuarios([
        { id: "1", nombre: "Luna Melodía", tipo_usuario: "artista", email: "luna@music.com" },
        { id: "2", nombre: "Ritmo Urbano", tipo_usuario: "artista", email: "ritmo@music.com" },
        { id: "3", nombre: "María González", tipo_usuario: "fan", email: "maria@fan.com" },
        { id: "4", nombre: "Carlos Rodríguez", tipo_usuario: "fan", email: "carlos@fan.com" },
      ])

      setMembresias([
        {
          id: "1",
          artista_nombre: "Luna Melodía",
          fan_nombre: "María González",
          tipo_membresia: "premium",
          precio: 9.99,
          activa: true,
          fecha_inicio: "2024-01-15",
        },
        {
          id: "2",
          artista_nombre: "Ritmo Urbano",
          fan_nombre: "Carlos Rodríguez",
          tipo_membresia: "vip",
          precio: 19.99,
          activa: true,
          fecha_inicio: "2024-02-01",
        },
      ])

      setTransacciones([
        {
          id: "1",
          usuario_nombre: "María González",
          tipo_transaccion: "pago",
          monto: 9.99,
          estado: "completada",
          fecha_transaccion: "2024-01-15",
        },
        {
          id: "2",
          usuario_nombre: "Luna Melodía",
          tipo_transaccion: "retiro",
          monto: 50.0,
          estado: "pendiente",
          fecha_transaccion: "2024-02-10",
        },
      ])

      setPropinas([
        {
          id: "1",
          fan_nombre: "María González",
          artista_nombre: "Luna Melodía",
          monto: 5.0,
          mensaje: "¡Excelente música! Sigue así",
          fecha_propina: "2024-02-05",
        },
      ])

      setLoading(false)
    }, 1000)
  }, [])

  const estadisticas = {
    ingresosTotales: transacciones
      .filter((t) => t.tipo_transaccion === "pago" && t.estado === "completada")
      .reduce((sum, t) => sum + t.monto, 0),
    membresíasActivas: membresias.filter((m) => m.activa).length,
    propinasTotales: propinas.reduce((sum, p) => sum + p.monto, 0),
    usuariosActivos: usuarios.length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Music className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900">Módulo de Monetización - MusicApp</h1>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estadisticas.ingresosTotales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membresías Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.membresíasActivas}</div>
            <p className="text-xs text-muted-foreground">+2 nuevas esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propinas Recibidas</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estadisticas.propinasTotales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+5.2% desde la semana pasada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.usuariosActivos}</div>
            <p className="text-xs text-muted-foreground">+12% crecimiento mensual</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="membresias" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="membresias">Membresías</TabsTrigger>
          <TabsTrigger value="transacciones">Transacciones</TabsTrigger>
          <TabsTrigger value="propinas">Propinas</TabsTrigger>
          <TabsTrigger value="recompensas">Recompensas</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="puntos">Puntos</TabsTrigger>
        </TabsList>

        {/* Tab Membresías */}
        <TabsContent value="membresias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Membresías
              </CardTitle>
              <CardDescription>Administra las suscripciones de fans a artistas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {membresias.map((membresia) => (
                  <div key={membresia.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{membresia.fan_nombre}</p>
                      <p className="text-sm text-muted-foreground">Suscrito a {membresia.artista_nombre}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={membresia.tipo_membresia === "vip" ? "default" : "secondary"}>
                          {membresia.tipo_membresia.toUpperCase()}
                        </Badge>
                        <Badge variant={membresia.activa ? "default" : "destructive"}>
                          {membresia.activa ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${membresia.precio}/mes</p>
                      <p className="text-sm text-muted-foreground">
                        Desde {new Date(membresia.fecha_inicio).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Transacciones */}
        <TabsContent value="transacciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Historial de Transacciones
              </CardTitle>
              <CardDescription>Pagos, retiros y movimientos financieros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transacciones.map((transaccion) => (
                  <div key={transaccion.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{transaccion.usuario_nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaccion.tipo_transaccion.charAt(0).toUpperCase() + transaccion.tipo_transaccion.slice(1)}
                      </p>
                      <Badge
                        variant={
                          transaccion.estado === "completada"
                            ? "default"
                            : transaccion.estado === "pendiente"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {transaccion.estado}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${transaccion.tipo_transaccion === "pago" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaccion.tipo_transaccion === "pago" ? "+" : "-"}${transaccion.monto.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaccion.fecha_transaccion).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Propinas */}
        <TabsContent value="propinas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Donaciones y Propinas
              </CardTitle>
              <CardDescription>Apoyo directo de fans a artistas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propinas.map((propina) => (
                  <div key={propina.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{propina.fan_nombre}</p>
                        <p className="text-sm text-muted-foreground">Para {propina.artista_nombre}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${propina.monto.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(propina.fecha_propina).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {propina.mensaje && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm italic">"{propina.mensaje}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Recompensas */}
        <TabsContent value="recompensas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Sistema de Recompensas
              </CardTitle>
              <CardDescription>Beneficios por membresías y propinas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-medium">Descuento VIP</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">20% de descuento en próxima membresía</p>
                  <Badge variant="secondary">50 puntos</Badge>
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium">Contenido Exclusivo</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Acceso a canciones no publicadas</p>
                  <Badge variant="secondary">100 puntos</Badge>
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Meet & Greet Virtual</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Videollamada privada con el artista</p>
                  <Badge variant="secondary">500 puntos</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Contratos */}
        <TabsContent value="contratos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contratos Digitales
              </CardTitle>
              <CardDescription>Acuerdos con sellos y distribuidores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Luna Melodía - Indie Records</h3>
                    <Badge variant="default">Activo</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo:</p>
                      <p>Distribución</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Porcentaje Artista:</p>
                      <p>70%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Inicio:</p>
                      <p>01/01/2024</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fin:</p>
                      <p>31/12/2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Puntos */}
        <TabsContent value="puntos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Sistema de Puntos de Fidelidad
              </CardTitle>
              <CardDescription>Programa de recompensas por actividad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">María González</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Puntos totales:</span>
                        <span className="font-medium">150</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Puntos disponibles:</span>
                        <span className="font-medium">100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Nivel:</span>
                        <Badge variant="secondary">Plata</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Carlos Rodríguez</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Puntos totales:</span>
                        <span className="font-medium">75</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Puntos disponibles:</span>
                        <span className="font-medium">75</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Nivel:</span>
                        <Badge variant="outline">Bronce</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
