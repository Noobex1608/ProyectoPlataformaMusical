"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Check, Star, Crown } from "lucide-react"

interface SubscriptionFormProps {
  artista: {
    id: string
    nombre: string
    avatar?: string
  }
  onSubscribe: (plan: string, paymentData: any) => void
}

export function SubscriptionForm({ artista, onSubscribe }: SubscriptionFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const planes = [
    {
      id: "basica",
      nombre: "Básica",
      precio: 4.99,
      icon: Check,
      beneficios: ["Acceso a contenido exclusivo", "Comentarios prioritarios", "Badge de seguidor"],
    },
    {
      id: "premium",
      nombre: "Premium",
      precio: 9.99,
      icon: Star,
      popular: true,
      beneficios: [
        "Todo lo de Básica",
        "Chat directo con el artista",
        "Acceso anticipado a nuevas canciones",
        "Descuentos en merchandise",
      ],
    },
    {
      id: "vip",
      nombre: "VIP",
      precio: 19.99,
      icon: Crown,
      beneficios: [
        "Todo lo de Premium",
        "Videollamadas mensuales grupales",
        "Contenido detrás de cámaras",
        "Invitaciones a eventos privados",
        "Merchandise exclusivo gratis",
      ],
    },
  ]

  const handleSubscribe = async (formData: FormData) => {
    if (!selectedPlan) return

    setLoading(true)

    const paymentData = {
      cardNumber: formData.get("cardNumber"),
      expiryDate: formData.get("expiryDate"),
      cvv: formData.get("cvv"),
      cardName: formData.get("cardName"),
    }

    // Simular procesamiento de pago
    await new Promise((resolve) => setTimeout(resolve, 2000))

    onSubscribe(selectedPlan, paymentData)
    setLoading(false)
  }

  const selectedPlanData = planes.find((p) => p.id === selectedPlan)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Suscribirse a {artista.nombre}</h1>
        <p className="text-muted-foreground">Elige el plan que mejor se adapte a ti</p>
      </div>

      {/* Planes de suscripción */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planes.map((plan) => {
          const Icon = plan.icon
          return (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${
                selectedPlan === plan.id ? "ring-2 ring-purple-500 shadow-lg" : "hover:shadow-md"
              } ${plan.popular ? "border-purple-500" : ""}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader className="text-center">
                {plan.popular && <Badge className="w-fit mx-auto mb-2">Más Popular</Badge>}
                <Icon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <CardTitle>{plan.nombre}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.precio}
                  <span className="text-sm font-normal text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.beneficios.map((beneficio, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {beneficio}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Formulario de pago */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información de Pago
            </CardTitle>
            <CardDescription>
              Plan seleccionado: {selectedPlanData?.nombre} - ${selectedPlanData?.precio}/mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubscribe} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                  <Input id="cardName" name="cardName" placeholder="Juan Pérez" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número de tarjeta</Label>
                  <Input id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Fecha de vencimiento</Label>
                  <Input id="expiryDate" name="expiryDate" placeholder="MM/AA" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" name="cvv" placeholder="123" required />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg">Total mensual:</span>
                  <span className="text-2xl font-bold">${selectedPlanData?.precio}</span>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Procesando pago..." : `Suscribirse por $${selectedPlanData?.precio}/mes`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
