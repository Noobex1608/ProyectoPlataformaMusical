"use client"

import { useState } from "react"
import { AuthForm } from "@/components/auth/login-form"
import { DashboardMonetizacion } from "@/components/dashboard-monetizacion"
import { SubscriptionForm } from "@/components/payments/subscription-form"
import { TipForm } from "@/components/payments/tip-form"
import { WithdrawalForm } from "@/components/payments/withdrawal-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Heart, CreditCard, Banknote, BarChart3, LogOut } from "lucide-react"

interface User {
  id: string
  email: string
  nombre: string
  tipo_usuario: "artista" | "fan"
  saldo?: number
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<string>("dashboard")

  const handleLogin = (userData: User) => {
    // Simular saldo para artistas
    if (userData.tipo_usuario === "artista") {
      userData.saldo = 247.5
    }
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView("dashboard")
  }

  const handleSubscribe = (plan: string, paymentData: any) => {
    alert(`¡Suscripción ${plan} activada exitosamente! 🎉`)
    setCurrentView("dashboard")
  }

  const handleTip = (amount: number, message: string, paymentData: any) => {
    alert(`¡Propina de $${amount} enviada exitosamente! 💝`)
    setCurrentView("dashboard")
  }

  const handleWithdraw = (amount: number, bankData: any) => {
    if (user) {
      setUser({
        ...user,
        saldo: (user.saldo || 0) - amount,
      })
    }
  }

  // Si no hay usuario logueado, mostrar formulario de login
  if (!user) {
    return <AuthForm onLogin={handleLogin} />
  }

  // Artistas disponibles para suscripción/propinas
  const artistas = [
    { id: "1", nombre: "Luna Melodía", avatar: "/placeholder.svg?height=100&width=100" },
    { id: "2", nombre: "Ritmo Urbano", avatar: "/placeholder.svg?height=100&width=100" },
    { id: "3", nombre: "Acoustic Dreams", avatar: "/placeholder.svg?height=100&width=100" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold">MusicApp</h1>
                <p className="text-sm text-muted-foreground">Bienvenido, {user.nombre}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={user.tipo_usuario === "artista" ? "default" : "secondary"}>
                {user.tipo_usuario === "artista" ? "Artista" : "Fan"}
              </Badge>
              {user.tipo_usuario === "artista" && user.saldo !== undefined && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Saldo disponible</p>
                  <p className="font-bold text-green-600">${user.saldo.toFixed(2)}</p>
                </div>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            <Button
              variant={currentView === "dashboard" ? "default" : "ghost"}
              onClick={() => setCurrentView("dashboard")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>

            {user.tipo_usuario === "fan" && (
              <>
                <Button
                  variant={currentView === "subscribe" ? "default" : "ghost"}
                  onClick={() => setCurrentView("subscribe")}
                  className="rounded-none"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Suscripciones
                </Button>
                <Button
                  variant={currentView === "tip" ? "default" : "ghost"}
                  onClick={() => setCurrentView("tip")}
                  className="rounded-none"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Propinas
                </Button>
              </>
            )}

            {user.tipo_usuario === "artista" && (
              <Button
                variant={currentView === "withdraw" ? "default" : "ghost"}
                onClick={() => setCurrentView("withdraw")}
                className="rounded-none"
              >
                <Banknote className="h-4 w-4 mr-2" />
                Retirar Fondos
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="container mx-auto p-6">
        {currentView === "dashboard" && <DashboardMonetizacion />}

        {currentView === "subscribe" && user.tipo_usuario === "fan" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Suscríbete a tus artistas favoritos</h2>
              <p className="text-muted-foreground">Apoya a los artistas y obtén contenido exclusivo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {artistas.map((artista) => (
                <Card key={artista.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mb-4">
                      <Music className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle>{artista.nombre}</CardTitle>
                    <CardDescription>Artista independiente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setCurrentView("subscribe-form")
                        // En una app real, guardarías el artista seleccionado
                      }}
                    >
                      Ver Planes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === "subscribe-form" && <SubscriptionForm artista={artistas[0]} onSubscribe={handleSubscribe} />}

        {currentView === "tip" && user.tipo_usuario === "fan" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Enviar Propinas</h2>
              <p className="text-muted-foreground">Muestra tu apoyo con una propina directa</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {artistas.map((artista) => (
                <Card key={artista.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
                      <Heart className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle>{artista.nombre}</CardTitle>
                    <CardDescription>Enviar propina</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setCurrentView("tip-form")
                      }}
                    >
                      Enviar Propina
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === "tip-form" && <TipForm artista={artistas[0]} onTip={handleTip} />}

        {currentView === "withdraw" && user.tipo_usuario === "artista" && (
          <WithdrawalForm saldoDisponible={user.saldo || 0} onWithdraw={handleWithdraw} />
        )}
      </main>
    </div>
  )
}
